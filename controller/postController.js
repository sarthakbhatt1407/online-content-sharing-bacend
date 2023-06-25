const Post = require("../models/post");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const User = require("../models/user");
const createNewPost = async (req, res, next) => {
  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let hrs = date.getHours();
  let min = date.getMinutes();
  let sec = date.getSeconds();
  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = "0" + month;
  }
  if (hrs < 10) {
    hrs = "0" + hrs;
  }

  if (hrs < 10) {
    hrs = "0" + hrs;
  }
  if (min < 10) {
    min = "0" + min;
  }
  if (sec < 10) {
    sec = "0" + sec;
  }
  const fullDate =
    year + "" + month + "" + day + " " + hrs + "" + min + "" + sec;
  let result;
  const image = req.file.path;
  try {
    const { title, desc, creator } = req.body;
    const createdPost = new Post({
      title,
      desc,
      image,
      comments: [],
      likes: [],
      creator,
      category: [],
      time: fullDate,
      likedByMe: false,
    });
    result = await createdPost.save();
  } catch (err) {
    fs.unlink(req.file.path, (err) => {});
    return res.status(400).json({ message: "Unable to post" });
  }
  res.status(201).json(result);
};

const getAllPosts = async (req, res, next) => {
  let re;
  try {
    re = await Post.find({});
  } catch (err) {
    return res.status(500).json({ message: "Unable to load" });
  }
  const reslt = await re.map((post) => post.toObject({ getters: true }));
  res.status(200).json(reslt);
};

const getPostByPostid = async (req, res, next) => {
  const id = req.params.id;
  let post;
  try {
    post = await Post.findById(id);
    if (!post) {
      throw new Error();
    }
  } catch (err) {
    return res.status(404).json({ message: "No Post Found" });
  }
  res.status(200).json({ post: post.toObject({ getters: true }) });
};
const getPostByUserId = async (req, res, next) => {
  const id = req.params.id;
  let post;
  try {
    post = await Post.find({ creator: id });
    if (!post) {
      throw new Error();
    }
  } catch (err) {
    return res.status(404).json({ message: "No Post Found" });
  }
  res
    .status(200)
    .json({ post: post.map((post) => post.toObject({ getters: true })) });
};

const deletePostById = async (req, res, next) => {
  const id = req.params.id;
  let result;
  try {
    result = await Post.findById(id);
  } catch (err) {
    return res.status(404).json({ message: "No Post Found" });
  }
  try {
    await result.deleteOne();
  } catch (err) {
    return res.status(404).json({ message: "Unable to delete post" });
  }
  res.status(201).json({ message: "Post deleted" });
};
const editPostByPostId = async (req, res, next) => {
  const id = req.params.id;
  const { title, desc, image, category } = req.body;
  let post;
  try {
    post = await Post.findById(id);
    if (!post) {
      throw new Error();
    }
  } catch (err) {
    return res.status(404).json({ message: "No Post Found" });
  }
  post.title = title;
  post.desc = desc;
  post.image = image;
  post.category = category;

  try {
    await post.save();
  } catch (err) {
    return res.status(500).json({ message: "Unable to update post" });
  }
  res.status(201).json(post);
};

// Comments

const AddCommentsOnPost = async (req, res, next) => {
  const id = req.params.id;
  let post;
  try {
    post = await Post.findById(id);
    if (!post) {
      throw new Error();
    }
  } catch (err) {
    return res.status(404).json({ message: "No Post Found" });
  }
  const { creator, msg } = req.body;
  post.comments.unshift({ creator, msg, id: uuidv4() });
  try {
    await post.save();
  } catch (err) {
    return res.status(500).json({ message: "Unable to Comment" });
  }
  res.status(200).json({ message: "Comment Posted" });
};

const deleteComment = async (req, res, next) => {
  const id = req.params.id;
  const cId = req.params.cId;

  let post;
  try {
    post = await Post.findById(id);
    if (!post) {
      throw new Error();
    }
  } catch (err) {
    return res.status(404).json({ message: "No Post Found" });
  }
  const updatedComments = post.comments.filter((comment) => {
    return comment.id !== cId;
  });
  post.comments = updatedComments;

  await post.save();

  res.status(200).json({ message: "Comment Deleted" });
};

// Like

const addLikesOnPost = async (req, res, next) => {
  const id = req.params.id;
  const { userId } = req.body;
  const urlTarget = req.params.action;
  let post;
  try {
    post = await Post.findById(id);
    if (!post) {
      throw new Error();
    }
  } catch (err) {
    return res.status(404).json({ message: "No Post Found" });
  }
  let likes = post.likes;
  const userFound = likes.find((u) => {
    return u.userId == userId;
  });
  if (userFound) {
    if (post.likes.length > 0) {
      if (urlTarget === "remove") {
        post.likedByMe = false;
        const updatedlikes = likes.filter((u) => {
          return u.userId != userId;
        });
        likes = updatedlikes;
        post.likes = likes;
      }
    }
  }

  if (!userFound) {
    if (urlTarget === "add") {
      const obj = {
        liked: true,
        userId: userId,
      };
      likes.push(obj);
      post.likedByMe = true;
    }
  }
  try {
    await post.save();
  } catch (err) {
    return res.status(500).json({ message: "Unable to Like" });
  }

  res.status(200).json({ message: "done" });
};

const addToFavoriteOrRemove = async (req, res, next) => {
  const id = req.params.id;
  const action = req.params.action;
  const userId = req.body.userId;
  let post;
  let user;
  try {
    post = await Post.findById(id);
    user = await User.findById(userId);
    if (!user || !post) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "No post Found" });
  }
  const likedPost = user.likedPost;
  const postFound = likedPost.find((post) => {
    return post.postId === id;
  });

  if (action === "add") {
    const obj = {
      postId: post.id,
    };
    user.likedPost.push(obj);
    try {
      user.save();
    } catch (error) {
      return res.status(400).json({ message: "Unable to like" });
    }
    return res.status(200).json({ message: "Added to favorites" });
  }
  if (action === "remove") {
    if (!postFound) {
      return res.status(200).json({ message: "No post found" });
    }
    const updateLikedPost = likedPost.filter((post) => {
      return post.postId != id;
    });
    user.likedPost = updateLikedPost;
    try {
      user.save();
    } catch (error) {
      return res.status(400).json({ message: "Unable to like" });
    }
    return res.status(200).json({ message: "Removed from favorites" });
  }
};

const postFoundOnFavorites = async (req, res, next) => {
  const { postId, userId } = req.params;
  let post;
  let user;
  try {
    post = await Post.findById(postId);
    user = await User.findById(userId);
    if (!user || !post) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "No post Found" });
  }
  const likedPost = user.likedPost;
  const postFound = likedPost.find((post) => {
    return post.postId === postId;
  });
  if (postFound) {
    return res.status(200).json({ postFound: true });
  } else {
    return res.status(200).json({ postFound: false });
  }
};

exports.createNewPost = createNewPost;
exports.getPostByPostid = getPostByPostid;
exports.getAllPosts = getAllPosts;
exports.getPostByUserId = getPostByUserId;
exports.deletePostById = deletePostById;
exports.AddCommentsOnPost = AddCommentsOnPost;
exports.deleteComment = deleteComment;
exports.addLikesOnPost = addLikesOnPost;
exports.editPostByPostId = editPostByPostId;
exports.addToFavoriteOrRemove = addToFavoriteOrRemove;
exports.postFoundOnFavorites = postFoundOnFavorites;
