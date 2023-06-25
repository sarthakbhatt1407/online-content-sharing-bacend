const Place = require("../models/places");

const getPlaceByUserId = async (req, res, next) => {
  const id = req.params.uid;
  let place;
  try {
    place = await Place.find({ userId: id });
  } catch (err) {
    console.log("err");
    return next();
  }
  return res.json({
    place: place.map((place) => {
      return place.toObject({ getters: true });
    }),
  });
};
const getPlaceByPlaceId = async (req, res, next) => {
  const id = req.params.pid;
  let place;
  try {
    place = await Place.findById(id);
  } catch (err) {
    console.log("err");
    return next();
  }
  return res.json({ place: place.toObject({ getters: true }) });
};

const updatePlaceByPlaceID = async (req, res, next) => {
  const { title, city } = req.body;
  const id = req.params.pid;
  let place;
  try {
    place = await Place.findById(id);
  } catch (err) {
    console.log("err");
    return next();
  }
  place.title = title;
  place.city = city;
  let reslt;
  try {
    reslt = await place.save();
  } catch (err) {
    console.log(err);
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const id = req.params.pid;
  let place;
  try {
    place = await Place.findById(id);
  } catch (err) {
    console.log("err");
    return next();
  }
  try {
    await place.deleteOne();
  } catch (err) {
    console.log("Coldnt");
    return res.json({ message: "Coldnt find" });
  }
  return res.json({ message: "Deleted" });
};
const createNewPlace = async (req, res) => {
  const { userId, title, creator, city } = req.body;
  const createdPlace = new Place({
    userId,
    title,
    creator,
    city,
  });
  const reslt = await createdPlace.save();
  res.status(201).json(reslt);
};
const getAllPlaces = async (req, res) => {
  const places = await Place.find();
  res.json(places);
};

exports.getAllPlaces = getAllPlaces;
exports.getPlaceByUserId = getPlaceByUserId;
exports.getPlaceByPlaceId = getPlaceByPlaceId;
exports.createNewPlace = createNewPlace;
exports.updatePlaceByPlaceID = updatePlaceByPlaceID;
exports.deletePlace = deletePlace;
