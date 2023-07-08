const express = require("express");
const router = express.Router();
const usersController = require("../controller/userController");
const fileUpload = require("../middleware/fileUpload");

// user login, signup

router.post(
  "/signup",
  fileUpload.single("image"),
  usersController.userRegistration
);
router.post("/login", usersController.userLogin);
router.post("/forgot-password/email-verifier", usersController.emailVerifier);
router.post("/forgot-password/reset-password", usersController.passwordReseter);
router.get("/all-users", usersController.getAllUsers);
router.get("/:id/chats", usersController.getUserChatsById);
router.get("/:id", usersController.getUserByUserId);
router.post("/friend-request/send", usersController.friendRequestSender);
router.post("/friend-request/accept", usersController.friendRequestAccepter);
router.post("/friend-request/delete", usersController.pendingReqDeleter);
router.post("/message/send", usersController.messageSender);

module.exports = router;
