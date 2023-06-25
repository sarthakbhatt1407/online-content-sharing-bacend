const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const addNewUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  const hashedPass = await bcrypt.hash(password, 12);
  const createdUser = new User({ name, email, password: hashedPass });
  const reslt = await createdUser.save();
  res.status(201).json(createdUser);
};

const updateOrder = async (req, res, next) => {
  const id = req.params.id;
  let user;
  try {
    user = await User.findById(id);
  } catch (err) {
    console.log("err");
    return next();
  }
  const obj = { title: "laptop", quantity: 2, price: 20000 };
  user.orders.push(obj);
  const reslt = await user.save();
  res.status(201).json(user);
};
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    return next(err);
  }
  let passIsValid = false;
  passIsValid = await bcrypt.compare(password, user.password);
  let token;
  if (user && email == user.email && passIsValid) {
    token = jwt.sign({ userId: user.id, userEmail: email }, "secret_key", {
      expiresIn: "1h",
    });
    res.json({ user, message: "Logged In", token: token });
  } else {
    res.status(404).json({ message: "Invalid Input" });
  }
};
const emailVerifier = async (req, res, next) => {
  const { email, name } = req.body;
  const user = await User.findOne({ email: email });
  if (
    user &&
    user.email === email &&
    user.name.toLowerCase() === name.toLowerCase()
  ) {
    res.json({ verified: true });
  } else {
    res.json({ verified: false });
  }
};

const passwordReseter = async (req, res, next) => {
  const { email, password: newPassword } = req.body;
  const user = await User.findOne({ email: email });
  user.password = newPassword;
  await user.save();
  res.json({ message: "done" });
};

const getUsersAllOrder = async (req, res, next) => {
  const id = req.params.id;
  const rslt = await User.findById(id);
  res.json(rslt.orders);
};

const getAllUser = async (req, res, next) => {
  const allUsers = (await User.find({}, "-password")).map((user) => {
    return user.toObject({ getters: true });
  });
  res.json(allUsers);
};
exports.passwordReseter = passwordReseter;
exports.getUsersAllOrder = getUsersAllOrder;
exports.getAllUser = getAllUser;
exports.addNewUser = addNewUser;
exports.loginUser = loginUser;
exports.updateOrder = updateOrder;
exports.emailVerifier = emailVerifier;
