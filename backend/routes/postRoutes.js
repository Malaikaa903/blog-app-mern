const express = require("express");
const router = express.Router();
const {
  getPosts,
  getPostBySlug,
  getMyPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
} = require("../controllers/postController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Public routes
router.get("/", getPosts);
router.get("/slug/:slug", getPostBySlug);

// Private routes
router.get("/my-posts", protect, getMyPosts);
router.post("/", protect, upload.single("coverImage"), createPost);
router.put("/:id", protect, upload.single("coverImage"), updatePost);
router.delete("/:id", protect, deletePost);
router.put("/:id/like", protect, likePost);

module.exports = router;
