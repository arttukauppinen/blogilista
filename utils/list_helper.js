const dummy = (blogs) => {
    return 1
}
const totalLikes = (blogs) => {
    let total = 0;
    for (let i = 0; i < blogs.length; i++) {
        total += blogs[i].likes;
    }
    return total;
}
const favouriteBlog = (blogs) => {
    let favourite = blogs[0];
    for (let i = 1; i < blogs.length; i++) {
        if (blogs[i].likes > favourite.likes) {
            favourite = blogs[i];
        }
    }
    return {
        title: favourite.title,
        author: favourite.author,
        likes: favourite.likes
    };
}

const mostBlogs = (blogs) => {
    let authors = {};

    for (let i = 0; i < blogs.length; i++) {
        if (authors[blogs[i].author] === undefined) {
            authors[blogs[i].author] = 1;
        } else {
            authors[blogs[i].author]++;
        }
    }

    console.log(authors)

    let most = Object.keys(authors)[0]
    let amount = authors[most]

    for (let author in authors) {
        if (authors[author] > amount) {
            most = author;
            amount = authors[author];
        }
    }

    return {
        author: most,
        blogs: amount
    }
}

const mostLikes = (blogs) => {
    let authors = {};

    for (let i = 0; i < blogs.length; i++) {
        if (authors[blogs[i].author] === undefined) {
            authors[blogs[i].author] = blogs[i].likes;
        } else {
            authors[blogs[i].author] = authors[blogs[i].author] + blogs[i].likes;
        }
    }

    console.log(authors)

    let most = Object.keys(authors)[0]
    let amount = authors[most]

    for (let author in authors) {
        if (authors[author] > amount) {
            most = author;
            amount = authors[author];
        }
    }

    return {
        author: most,
        likes: amount
    }
}
  module.exports = {
    dummy,
    totalLikes,
    favouriteBlog,
    mostBlogs,
    mostLikes,
  }