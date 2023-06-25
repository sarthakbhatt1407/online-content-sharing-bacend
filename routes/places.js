const express = require("express");
const router = express.Router();
const placeController = require("../controller/placeController");

router.get("/user/:uid", placeController.getPlaceByUserId);
router.get("/:pid", placeController.getPlaceByPlaceId);
router.patch("/:pid", placeController.updatePlaceByPlaceID);
router.delete("/:pid", placeController.deletePlace);
router.post("/", placeController.createNewPlace);
router.get("/", placeController.getAllPlaces);

module.exports = router;
