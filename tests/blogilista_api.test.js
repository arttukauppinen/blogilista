const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const User = require("../models/user");
const Blog = require("../models/blog");
const helper = require("./test_helper");
const bcrypt = require("bcrypt");

const initialBlogs = [
  {
    title: "testiyksi",
    author: "testimies",
    url: "www.yksi.com",
    likes: 1,
  },
  {
    title: "testikaksi",
    author: "testinainen",
    url: "www.kaksi.fi",
    likes: 2,
  },
];

beforeEach(async () => {
  await Blog.deleteMany({});
  let blogObject = new Blog(initialBlogs[0]);
  await blogObject.save();
  blogObject = new Blog(initialBlogs[1]);
  await blogObject.save();
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all blogs are returned", async () => {
  const response = await api.get("/api/blogs");
  expect(response.body).toHaveLength(initialBlogs.length);
});

test("identifiying field name is id", async () => {
  const response = await api.get("/api/blogs");

  response.body.forEach((blog) => {
    expect(blog.id).toBeDefined();
  });
});

test("blog can be added and has correct content", async () => {
  const newBlog = {
    title: "testikolme",
    author: "testihenkilo",
    url: "www.kolme.com",
    likes: 3,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const response = await api.get("/api/blogs");

  const titles = response.body.map((r) => r.title);

  expect(response.body).toHaveLength(initialBlogs.length + 1);
  expect(titles).toContain("testikolme");
});

test("in case of likes property not being defined, it will default to 0", async () => {
  const newBlog = {
    title: "testinelja",
    author: "testihiiri",
    url: "www.nelja.com",
  };

  const response = await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  expect(response.body.likes).toBeDefined();
  expect(response.body.likes).toBe(0);
});

test("blog not containing title will result in errorcode 400 ", async () => {
  const newBlog = {
    author: "testaaja",
    url: "www.eiotsikkoa.com",
    likes: 4,
  };

  await api.post("/api/blogs").send(newBlog).expect(400);

  const response = await api.get("/api/blogs");

  expect(response.body).toHaveLength(initialBlogs.length);
});

test("blog not containing url will result in errorcode 400 ", async () => {
  const newBlog = {
    title: "puuttuva url",
    author: "testaaja",
    likes: 4,
  };

  await api.post("/api/blogs").send(newBlog).expect(400);

  const response = await api.get("/api/blogs");

  expect(response.body).toHaveLength(initialBlogs.length);
});

test("deleting a blog works sufficiently ", async () => {
  const newBlog = {
    title: "testikolme",
    author: "testihenkilo",
    url: "www.kolme.com",
    likes: 3,
  };

  const addedBlog = await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogsAtStart = await api.get("/api/blogs");

  await api.delete(`/api/blogs/${addedBlog.body.id}`).expect(204);

  const blogsAtEnd = await api.get("/api/blogs");

  expect(blogsAtEnd.body).toHaveLength(blogsAtStart.body.length - 1);

  const titles = blogsAtEnd.body.map((r) => r.title);

  expect(titles).not.toContain(newBlog.title);
});

test("updating a blog works sufficiently ", async () => {
  const blogsAtStart = await api.get("/api/blogs");
  const blogToUpdate = blogsAtStart.body[0];

  const updatedBlogData = {
    title: "new title",
    author: "new author",
    url: "www.new.com",
    likes: 69,
  };

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlogData)
    .expect(200);

  const blogsAtEnd = await api.get("/api/blogs");
  const updatedBlog = blogsAtEnd.body.find((b) => b.id === blogToUpdate.id);

  expect(updatedBlog.title).toBe(updatedBlogData.title);
  expect(updatedBlog.author).toBe(updatedBlogData.author);
  expect(updatedBlog.url).toBe(updatedBlogData.url);
  expect(updatedBlog.likes).toBe(updatedBlogData.likes);
});

describe("when there is initially one user at db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "salainen",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("expected `username` to be unique");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});

test("creation fails with proper statuscode and message if username is too short", async () => {
  const usersAtStart = await helper.usersInDb();

  const newUser = {
    username: "aa",
    name: "Matti Luukkainen",
    password: "salainen",
  };

  const result = await api
    .post("/api/users")
    .send(newUser)
    .expect(400)
    .expect("Content-Type", /application\/json/);

  expect(result.body.error).toContain(
    "käyttäjätunnuksen sekä salasanan tulee olla olemassa ja vähintään 3 merkkiä pitkiä"
  );

  const usersAtEnd = await helper.usersInDb();
  expect(usersAtEnd).toHaveLength(usersAtStart.length);
});

test("creation fails with proper statuscode and message if password is too short", async () => {
  const usersAtStart = await helper.usersInDb();

  const newUser = {
    username: "mluukkai",
    name: "Matti Luukkainen",
    password: "aa",
  };

  const result = await api
    .post("/api/users")
    .send(newUser)
    .expect(400)
    .expect("Content-Type", /application\/json/);

  expect(result.body.error).toContain(
    "käyttäjätunnuksen sekä salasanan tulee olla olemassa ja vähintään 3 merkkiä pitkiä"
  );

  const usersAtEnd = await helper.usersInDb();
  expect(usersAtEnd).toHaveLength(usersAtStart.length);
});

afterAll(() => {
  mongoose.connection.close();
});
