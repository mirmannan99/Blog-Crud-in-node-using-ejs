const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const res = require("express/lib/response");

const homeStartingContent =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/blogDB", { useNewUrlParser: true });

const postSchema = {
  title: String,
  content: String,
};

const Post = mongoose.model("Post", postSchema);

//! home view render
app.get("/", function (req, res) {
  Post.find({}, function (err, posts) {
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts,
    });
  });
});

//! getting the compose view
app.get("/compose", function (req, res) {
  res.render("compose");
});

//! creating new blog
app.post("/compose", function (req, res) {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
  });

  post.save(function (err) {
    if (!err) {
      res.redirect("/");
    } else {
      console.log(err);
    }
  });
});

//! single view of a blog
app.get("/posts/:postId", function (req, res) {
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId }, function (err, post) {
    res.render("post", {
      title: post.title,
      content: post.content,
    });
  });
});

//! deleting the blog
app.get("/post-delete/:postId", function (req, res) {
  const requestedPostId = req.params.postId;

  Post.findByIdAndDelete(requestedPostId, (error, product) => {
    if (error) {
      return res.send({ error });
    }

    if (!product) {
      return res.send({ message: "No post Found" });
    }

    return res.redirect("/");
  });
});

//! getting the update view
app.get("/update/:postId", function (req, res) {
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId }, function (err, post) {
    res.render("update", {
      id: requestedPostId,
      title: post.title,
      content: post.content,
    });
  });
});

//! updating blog
app.post("/update", function (req, res) {
  const postId = req.body.postId;

  Post.findByIdAndUpdate(
    postId,
    {
      title: req.body.postTitle,
      content: req.body.postBody,
    },
    {
      new: true,
    }
  ).then(() => {
    res.redirect("/");
  });
});

//! port listen
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
