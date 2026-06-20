const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateAvatar,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.put("/avatar", protect, upload.single("avatar"), updateAvatar);
router.put("/avatar/remove", protect, async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: "" },
      { new: true },
    ).select("-password");
    res.status(200).json({ avatar: "" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
