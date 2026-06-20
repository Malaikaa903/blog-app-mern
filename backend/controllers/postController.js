const Post = require("../models/Post");
const cloudinary = require("../config/cloudinary");

// Get all published posts (public)
const getPosts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 6 } = req.query;

    let filter = { status: "published" };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .populate("author", "name avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      posts,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single post by slug (public)
const getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).populate(
      "author",
      "name avatar bio",
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my posts (private)
const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, folder = "blog-app") => {
  return new Promise((resolve, reject) => {
    const b64 = Buffer.from(buffer).toString("base64");
    const dataURI = `data:image/jpeg;base64,${b64}`;

    cloudinary.uploader.upload(
      dataURI,
      {
        folder: folder,
        // Let Cloudinary handle the optimization
        transformation: [
          { width: 1200, height: 630, crop: "limit" },
          { quality: "auto:good" },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
  });
};

// Create post (private)
const createPost = async (req, res) => {
  try {
    const { title, content, category, tags, status } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    let coverImage = "";

    console.log("File received:", req.file ? "Yes" : "No");

    if (req.file) {
      try {
        // Upload directly to Cloudinary without sharp
        const result = await uploadToCloudinary(req.file.buffer);
        coverImage = result.secure_url;
        console.log("Cloudinary URL:", coverImage);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        // Continue without image if upload fails
      }
    }

    // Parse tags - handle both string and array
    let parsedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        parsedTags = tags;
      } else if (typeof tags === "string") {
        try {
          // Try to parse as JSON
          parsedTags = JSON.parse(tags);
          if (!Array.isArray(parsedTags)) {
            parsedTags = [parsedTags];
          }
        } catch {
          // If not JSON, split by comma
          parsedTags = tags
            .split(",")
            .map((t) => t.trim().replace(/^#/, ""))
            .filter(Boolean);
        }
      }
    }

    const post = await Post.create({
      title,
      content,
      category,
      tags: parsedTags,
      status: status || "draft",
      coverImage,
      author: req.user._id,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update post (private)
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updateData = {
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      status: req.body.status,
    };

    // Handle tags
    if (req.body.tags) {
      let parsedTags = [];
      if (Array.isArray(req.body.tags)) {
        parsedTags = req.body.tags;
      } else if (typeof req.body.tags === "string") {
        try {
          parsedTags = JSON.parse(req.body.tags);
          if (!Array.isArray(parsedTags)) {
            parsedTags = [parsedTags];
          }
        } catch {
          parsedTags = req.body.tags
            .split(",")
            .map((t) => t.trim().replace(/^#/, ""))
            .filter(Boolean);
        }
      }
      updateData.tags = parsedTags;
    }

    // Check if user wants to delete image
    if (req.body.deleteCoverImage === "true") {
      // Delete from Cloudinary if exists
      if (post.coverImage) {
        try {
          // Extract public ID correctly from Cloudinary URL

          const urlParts = post.coverImage.split("/");
          // Find the index of 'upload' and get everything after it
          const uploadIndex = urlParts.indexOf("upload");
          if (uploadIndex !== -1) {
            // Get the path after 'upload' (includes version number and folder)
            const pathAfterUpload = urlParts.slice(uploadIndex + 1).join("/");
            // Remove version number (v1234567890/) and get the rest
            const pathParts = pathAfterUpload.split("/");
            // If first part starts with 'v', remove it
            const startIndex = pathParts[0].startsWith("v") ? 1 : 0;
            const publicId = pathParts
              .slice(startIndex)
              .join("/")
              .split(".")[0];
            // Full public ID with folder
            const fullPublicId = `blog-app/${publicId}`;

            console.log("Deleting Cloudinary image:", fullPublicId);
            await cloudinary.uploader.destroy(fullPublicId);
          }
        } catch (error) {
          console.error("Error deleting from Cloudinary:", error);
        }
      }
      updateData.coverImage = "";
    }
    // Upload new image if provided
    else if (req.file) {
      try {
        // Delete old image from Cloudinary if exists
        if (post.coverImage) {
          try {
            // Extract public ID correctly from Cloudinary URL
            const urlParts = post.coverImage.split("/");
            const uploadIndex = urlParts.indexOf("upload");
            if (uploadIndex !== -1) {
              const pathAfterUpload = urlParts.slice(uploadIndex + 1).join("/");
              const pathParts = pathAfterUpload.split("/");
              const startIndex = pathParts[0].startsWith("v") ? 1 : 0;
              const publicId = pathParts
                .slice(startIndex)
                .join("/")
                .split(".")[0];
              const fullPublicId = `blog-app/${publicId}`;

              console.log("Deleting old Cloudinary image:", fullPublicId);
              await cloudinary.uploader.destroy(fullPublicId);
            }
          } catch (error) {
            console.error("Error deleting old image:", error);
          }
        }

        const result = await uploadToCloudinary(req.file.buffer);
        updateData.coverImage = result.secure_url;
        console.log("New image uploaded:", result.secure_url);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
      }
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete post (private)
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete image from Cloudinary if exists
    if (post.coverImage) {
      try {
        // Extract public ID correctly from Cloudinary URL
        const urlParts = post.coverImage.split("/");
        const uploadIndex = urlParts.indexOf("upload");
        if (uploadIndex !== -1) {
          const pathAfterUpload = urlParts.slice(uploadIndex + 1).join("/");
          const pathParts = pathAfterUpload.split("/");
          const startIndex = pathParts[0].startsWith("v") ? 1 : 0;
          const publicId = pathParts.slice(startIndex).join("/").split(".")[0];
          const fullPublicId = `blog-app/${publicId}`;

          console.log("Deleting Cloudinary image:", fullPublicId);
          await cloudinary.uploader.destroy(fullPublicId);
        }
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like/Unlike post (private)
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.includes(req.user._id);

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== req.user._id.toString(),
      );
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.status(200).json({ likes: post.likes.length, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPosts,
  getPostBySlug,
  getMyPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
};
