const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.post("/", async (request, response, next) => {
  const { username, name, password } = request.body;

  if (!username || !password || username.length < 3 || password.length < 3) {
    return response.status(400).json({
      error:
        "käyttäjätunnuksen sekä salasanan tulee olla olemassa ja vähintään 3 merkkiä pitkiä",
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  try {
    const savedUser = await user.save();
    response.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/", async (request, response) => {
  const users = await User.find({});
  console.log("Before populate:", users);
  const populatedUsers = await User.find({}).populate("blogs");
  console.log("After populate:", populatedUsers);
  response.json(populatedUsers);
});

module.exports = usersRouter;
