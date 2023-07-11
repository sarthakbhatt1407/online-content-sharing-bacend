const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};
const userRegistration = async (req, res, next) => {
  const { name, email, password, friends, chats, likedPost, pendingRequest } =
    req.body;
  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();
  const image = req.file.path;
  const hashedPass = await bcrypt.hash(password, 12);
  let user = await User.findOne({ email: email });
  if (user && user.email === email) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
    return res.status(400).json({ message: "Email already exists." });
  } else {
    const createdUser = new User({
      name,
      email,
      password: hashedPass,
      friends: [],
      chats: [],
      likedPost: [],
      pendingRequest: [],
      image,
      userSince: months[month] + " " + year,
    });
    if (!validateEmail(email)) {
      return res.status(404).json({ message: "Invalid Email" });
    }
    try {
      await createdUser.save();
    } catch (err) {
      return res.status(403).json({ message: "Unable to register user." });
    }
    res.status(201).json({ message: "Sign up successful.." });
  }
};

const userLogin = async (req, res, next) => {
  const { email, password } = req.body;
  let user;
  let passIsValid = false;
  if (!validateEmail(email)) {
    return res.status(404).json({ message: "Invalid Email" });
  }
  try {
    user = await User.findOne({ email: email });
    if (!user) {
      throw new Error();
    }
  } catch (err) {
    return res.status(404).json({ message: "Invalid Credentials" });
  }

  passIsValid = await bcrypt.compare(password, user.password);
  if (user && email === user.email && passIsValid) {
    token = jwt.sign({ userId: user.id, userEmail: email }, "secret_key");

    user.password = "Keep Guessing";
    res.json({
      user: {
        name: user.name,
        email: user.email,
        id: user.id,
        image: user.image,
      },
      message: "Logged In",
      isloggedIn: true,
      token: token,
    });
  } else {
    res.status(404).json({ message: "Invalid Credentials" });
  }
};

const getUserByUserId = async (req, res, next) => {
  const id = req.body.id || req.params.id;
  let user;
  try {
    user = await User.findById(id);
    if (!user) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "User Not Found" });
  }
  res.status(200).json({
    name: user.name,
    image: user.image,
    userId: user.id,
    friends: user.friends,
    userSince: user.userSince,
    pendingRequest: user.pendingRequest,
    likedPost: user.likedPost,
  });
};
const getUserChatsById = async (req, res, next) => {
  const id = req.params.id;
  let user;
  try {
    user = await User.findById(id);
    if (!user) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "User Not Found" });
  }
  res.status(200).json({
    chats: user.chats,
  });
};
const emailVerifier = async (req, res, next) => {
  const { email } = req.body;
  let user;
  try {
    user = await User.findOne({ email: email });
    if (!user) {
      throw new Error();
    }
  } catch (err) {
    return res.status(404).json({ message: "User Not Found" });
  }
  if (user && user.email === email) {
    return res.status(200).json({ emailVerified: true });
  }
};

const passwordReseter = async (req, res, next) => {
  const { email, password } = req.body;
  let user;
  try {
    user = await User.findOne({ email: email });
    if (!user) {
      throw new Error();
    }
  } catch (err) {
    return res.status(404).json({ message: "User Not Found" });
  }
  const hashedPass = await bcrypt.hash(password, 12);
  user.password = hashedPass;
  try {
    await user.save();
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Unable to change password ! Please try again later." });
  }
  res.status(201).json({ message: "Password Changed" });
};

const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
    if (!users) {
      throw new Error();
    }
  } catch (err) {
    return res.status(404).json({ message: "No Users FOund" });
  }
  users = users.map((user) => {
    return user.toObject({ getters: true });
  });
  res.status(200).json(users);
};

const friendRequestSender = async (req, res, next) => {
  const { userBy, userTo } = req.body;
  let userByInfo;
  let userToInfo;
  try {
    userByInfo = await User.findById(userBy);
    userToInfo = await User.findById(userTo);
    if (!userByInfo && !userToInfo) {
      throw new Error();
    }
  } catch (err) {
    return res.status(404).json({ message: "Unable to send request" });
  }
  const obj = {
    name: userByInfo.name,
    image: userByInfo.image,
    id: userByInfo.id,
  };
  const pendingRequest = userToInfo.pendingRequest;
  const alreadySent = pendingRequest.find((user) => {
    return user.id === userBy;
  });
  if (alreadySent) {
    return res.status(404).json({ message: "Already Sent" });
  }
  userToInfo.pendingRequest.push(obj);
  try {
    await userToInfo.save();
  } catch (error) {
    return res.status(404).json({ message: "Unable to send request" });
  }
  res.status(200).json({ message: "Friend Request Sent" });
};

const friendRequestAccepter = async (req, res, next) => {
  const { userId, pendingReqId } = req.body;
  let user;
  let pendingReqUser;
  try {
    user = await User.findById(userId);
    pendingReqUser = await User.findById(pendingReqId);
    if (!user && !pendingReqUser) {
      throw new Error();
    }
  } catch (error) {
    return res.status(400).json({ message: "Unable to accept" });
  }
  const pendingReqObj = user.pendingRequest.find((u) => {
    return u.id === pendingReqId;
  });
  if (!pendingReqObj) {
    return res.status(403).json({ message: "Bad request" });
  }
  const updatedPendingReq = user.pendingRequest.filter((u) => {
    return u.id != pendingReqId;
  });
  if (!updatedPendingReq) {
    return res.status(404).json({ message: "No Request Found" });
  }
  user.pendingRequest = updatedPendingReq;
  const userObj = {
    name: user.name,
    image: user.image,
    id: user.id,
  };
  user.friends.push(pendingReqObj);
  pendingReqUser.friends.push(userObj);
  try {
    await user.save();
    await pendingReqUser.save();
  } catch (error) {
    return res.status(400).json({ message: "Unable to accept" });
  }
  res.status(200).json({ message: "You are now friends" });
};

const messageSender = async (req, res, next) => {
  const { sender, to, msg } = req.body;

  let userSending, userTo;
  try {
    userSending = await User.findById(sender);
    userTo = await User.findById(to);
    if (!userSending && !userTo) {
      throw new Error();
    }
  } catch (error) {
    return res.status(400).json({ message: "Unable to Send" });
  }
  const obj = {
    msg: msg,
    id: sender,
    name: userSending.name,
    image: userSending.image,
  };

  let userSendingChats = userSending.chats;
  let userToChats = userTo.chats;
  if (userSendingChats.length === 0) {
    userSendingChats = [];
    userSendingChats.push({});
    userSendingChats[0][to] = [];
    userSendingChats[0][to].push(obj);
  } else {
    const arr = userSendingChats[0][to];
    if (!arr) {
      userSendingChats[0][to] = [];
      userSendingChats[0][to].push(obj);
    } else {
      arr.push(obj);
      userSendingChats[0][to] = arr;
    }
  }
  if (userToChats.length === 0) {
    userToChats = [];
    userToChats.push({});
    userToChats[0][sender] = [];
    userToChats[0][sender].push(obj);
  } else {
    const arr = userToChats[0][sender];
    if (!arr) {
      userToChats[0][sender] = [];
      userToChats[0][sender].push(obj);
    } else {
      arr.push(obj);
      userToChats[0][sender] = arr;
    }
  }
  userSending.chats = userSendingChats;
  userTo.chats = userToChats;
  userSending.markModified("chats");
  userTo.markModified("chats");
  try {
    await userSending.save();
    await userTo.save();
  } catch (error) {
    return res.status(400).json({ message: "Unable to Send" });
  }
  res.status(201).json({ message: "Msg Sent" });
};

const pendingReqDeleter = async (req, res, next) => {
  const { userId, pendingReqId } = req.body;
  let user;
  try {
    user = await User.findById(userId);
    if (!user) {
      throw new Error();
    }
  } catch (error) {
    return res.status(400).json({ message: "Unable to accept" });
  }
  const updatedPendingReq = user.pendingRequest.filter((user) => {
    return user.id != pendingReqId;
  });
  user.pendingRequest = updatedPendingReq;
  try {
    await user.save();
  } catch (error) {
    return res.status(400).json({ message: "Unable to Send" });
  }
  res
    .status(200)
    .json({ message: "Request Deleted", pendingRequest: user.pendingRequest });
};

const friendVerifier = async (req, res, next) => {
  const { myUserId, userId } = req.body;
  let user;
  try {
    user = await User.findById(myUserId);
    if (!user) {
      throw new Error();
    }
  } catch (error) {
    return res.status(400).json({ message: "Unable to find user" });
  }
  const friends = user.friends;
  const isFriend = friends.find((user) => {
    return user.id === userId;
  });
  if (isFriend) {
    res.status(200).json({ isFriend: true });
  } else {
    res.status(200).json({ isFriend: false });
  }
};

exports.userRegistration = userRegistration;
exports.userLogin = userLogin;
exports.emailVerifier = emailVerifier;
exports.passwordReseter = passwordReseter;
exports.getAllUsers = getAllUsers;
exports.friendRequestSender = friendRequestSender;
exports.friendRequestAccepter = friendRequestAccepter;
exports.messageSender = messageSender;
exports.getUserByUserId = getUserByUserId;
exports.getUserChatsById = getUserChatsById;
exports.pendingReqDeleter = pendingReqDeleter;
exports.friendVerifier = friendVerifier;
