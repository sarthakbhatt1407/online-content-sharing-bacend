const express = require("express");
const router = express.Router();
const postController = require("../controller/postController");
const fileUpload = require("../middleware/fileUpload");

// Post
router.post("/", fileUpload.single("image"), postController.createNewPost);
router.get("/", postController.getAllPosts);
router.get("/:id", postController.getPostByPostid);
router.get("/user/:id", postController.getPostByUserId);
router.delete("/:id", postController.deletePostById);
router.patch("/:id", postController.editPostByPostId);

// Comments
router.patch("/:id/comments/add", postController.AddCommentsOnPost);
router.delete("/:id/comments/delete/:cId", postController.deleteComment);

// Likes
router.post("/:id/likes/:action", postController.addLikesOnPost);

// favorite
router.post("/:id/favorite/:action", postController.addToFavoriteOrRemove);
router.get(
  "/:postId/:userId/favorite/check",
  postController.postFoundOnFavorites
);

module.exports = router;
