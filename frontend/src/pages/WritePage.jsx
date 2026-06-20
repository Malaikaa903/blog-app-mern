import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

const categories = [
  { value: "technology", label: "💻 Technology", color: "#3B82F6" },
  { value: "lifestyle", label: "🌿 Lifestyle", color: "#10B981" },
  { value: "travel", label: "✈️ Travel", color: "#F59E0B" },
  { value: "food", label: "🍳 Food", color: "#EF4444" },
  { value: "business", label: "💼 Business", color: "#6366F1" },
];

const WritePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("technology");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [deleteImageFlag, setDeleteImageFlag] = useState(false);

  // Handle browser back/refresh with confirmation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  // Load post data if editing
  useEffect(() => {
    if (editId) {
      setIsEdit(true);
      const loadPost = async () => {
        try {
          const res = await API.get(`/posts/my-posts`);
          const post = res.data.find((p) => p._id === editId);
          if (post) {
            setTitle(post.title);
            setContent(post.content);
            setCategory(post.category);
            if (post.tags) {
              if (Array.isArray(post.tags)) {
                setTags(post.tags);
              } else if (typeof post.tags === "string") {
                try {
                  const parsed = JSON.parse(post.tags);
                  setTags(Array.isArray(parsed) ? parsed : []);
                } catch {
                  setTags(
                    post.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  );
                }
              }
            }
            if (post.coverImage) {
              setCoverPreview(post.coverImage);
            }
          }
        } catch (_err) {
          toast.error("Failed to load post");
        }
      };
      loadPost();
    }
  }, [editId]);

  // Track changes for unsaved warning
  useEffect(() => {
    if (isEdit) {
      setHasChanges(true);
    } else {
      setHasChanges(
        !!(title.trim() || content.trim() || coverImage || tags.length > 0),
      );
    }
  }, [title, content, category, tags, coverImage, isEdit]);

  // Update word count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [content]);

  // Compress image function
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Max dimensions for web optimization
          const maxWidth = 1200;
          const maxHeight = 630;

          // Calculate new dimensions maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with quality (0.7-0.8 for good balance)
          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            "image/jpeg",
            0.75, // 75% quality - good balance of size and quality
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (coverPreview) {
      setShowImageOptions(true);
    } else {
      document.getElementById("cover-input").click();
    }
  };

  const handleImageOption = (action) => {
    setShowImageOptions(false);
    if (action === "delete") {
      handleDeleteImage();
    } else if (action === "change") {
      document.getElementById("cover-input").click();
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size should be less than 10MB");
        return;
      }

      toast.loading("Compressing image...", { id: "compress" });

      try {
        // Compress the image
        const compressedFile = await compressImage(file);
        setCoverImage(compressedFile);
        setCoverPreview(URL.createObjectURL(compressedFile));
        setDeleteImageFlag(false);
        toast.success("Image uploaded successfully!", { id: "compress" });
      } catch (error) {
        toast.error("Failed to process image", { id: "compress" });
        console.error("Image compression error:", error);
      }
    }
  };

  const handleDeleteImage = () => {
    if (coverPreview) {
      if (coverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreview);
      }
      setCoverImage(null);
      setCoverPreview("");
      setDeleteImageFlag(true);
      toast.success("Cover image removed");
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().replace(/^#/, "");
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    } else if (tags.length >= 5) {
      toast.error("Maximum 5 tags allowed");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleBack = async () => {
    if (hasChanges) {
      const choice = window.confirm(
        "You have unsaved changes. Do you want to save as draft before leaving?",
      );
      if (choice) {
        await submitPost("draft");
        navigate(-1);
      } else {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  const submitPost = async (status) => {
    if (status === "published") {
      if (!title.trim()) {
        toast.error("Title is required!");
        return;
      }
      if (!content.trim()) {
        toast.error("Content is required!");
        return;
      }
    }

    const loadingToast = toast.loading(
      status === "published" ? "Publishing post..." : "Saving draft...",
    );

    if (status === "draft") setSavingDraft(true);
    else setLoading(true);

    try {
      const data = new FormData();
      data.append("title", title.trim() || "Untitled Draft");
      data.append("content", content || "");
      data.append("category", category);
      data.append("tags", JSON.stringify(tags));
      data.append("status", status);

      if (coverImage) {
        data.append("coverImage", coverImage);
      }

      if (deleteImageFlag) {
        data.append("deleteCoverImage", "true");
      }

      let response;
      if (isEdit) {
        response = await API.put(`/posts/${editId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000, // 30 second timeout
        });
        toast.success("Post updated! ✅", { id: loadingToast });
        setDeleteImageFlag(false);
      } else {
        response = await API.post("/posts", data, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        });
        toast.success(
          status === "published" ? "Post published! 🎉" : "Draft saved! 💾",
          { id: loadingToast },
        );
      }

      setHasChanges(false);

      if (status === "published") {
        navigate("/profile");
      } else {
        if (!isEdit) {
          setIsEdit(true);
          const postId = response?.data?.post?._id || response?.data?._id;
          if (postId) {
            navigate(`/write?edit=${postId}`, { replace: true });
          }
        }
        return response;
      }
    } catch (_err) {
      console.error("Error saving post:", _err);
      toast.error(_err?.response?.data?.message || "Failed to save post", {
        id: loadingToast,
      });
      throw _err;
    } finally {
      setSavingDraft(false);
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((c) => c.value === category);

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const popupStyle = {
    background: "white",
    borderRadius: "12px",
    padding: "24px",
    width: "320px",
    maxWidth: "90%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  };

  return (
    <div style={{ background: "#FAFBFC", minHeight: "100vh" }}>
      <Navbar />

      {showImageOptions && (
        <div style={overlayStyle} onClick={() => setShowImageOptions(false)}>
          <div style={popupStyle} onClick={(e) => e.stopPropagation()}>
            <h3
              style={{
                margin: "0 0 16px 0",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              Cover Image Options
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <button
                onClick={() => handleImageOption("change")}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  background: "white",
                  color: "#1F2937",
                  fontSize: "15px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#F9FAFB")}
                onMouseLeave={(e) => (e.target.style.background = "white")}
              >
                📷 Change Image
              </button>
              <button
                onClick={() => handleImageOption("delete")}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #FEE2E2",
                  background: "#FEF2F2",
                  color: "#DC2626",
                  fontSize: "15px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#FEE2E2")}
                onMouseLeave={(e) => (e.target.style.background = "#FEF2F2")}
              >
                🗑️ Delete Image
              </button>
              <button
                onClick={() => setShowImageOptions(false)}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "transparent",
                  color: "#6B7280",
                  fontSize: "14px",
                  cursor: "pointer",
                  marginTop: "8px",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          position: "sticky",
          top: "56px",
          zIndex: 50,
          background: "white",
          borderBottom: "1px solid #E5E7EB",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={handleBack}
            style={{
              background: "none",
              border: "none",
              color: "#6B7280",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: "500",
            }}
          >
            ← Back
          </button>
          {!isEdit && hasChanges && (
            <span style={{ fontSize: "12px", color: "#F59E0B" }}>
              ✏️ Unsaved changes
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => submitPost("draft")}
            disabled={savingDraft || loading}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "1px solid #D1D5DB",
              background: "white",
              color: "#374151",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
              opacity: savingDraft || loading ? 0.6 : 1,
            }}
          >
            {savingDraft ? "💾 Saving..." : "💾 Save Draft"}
          </button>
          <button
            onClick={() => submitPost("published")}
            disabled={loading || savingDraft}
            style={{
              padding: "8px 24px",
              borderRadius: "8px",
              border: "none",
              background: "#1A1A1A",
              color: "white",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
              opacity: loading || savingDraft ? 0.6 : 1,
            }}
          >
            {loading
              ? "⏳ Publishing..."
              : isEdit
                ? "📝 Update Post"
                : "🚀 Publish"}
          </button>
        </div>
      </div>

      <div
        style={{
          maxWidth: "900px",
          margin: "32px auto",
          padding: "32px 32px 32px",
        }}
      >
        <div
          onClick={handleImageClick}
          style={{
            width: "100%",
            height: "280px",
            borderRadius: "16px",
            border: "2px dashed #676767",
            background: coverPreview
              ? `url(${coverPreview}) center/cover`
              : "#F9FAFB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.3s ease",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {!coverPreview ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "12px",
                  opacity: 0.9,
                }}
              >
                📸
              </div>
              <p
                style={{
                  fontSize: "16px",
                  color: "#232425",
                  fontWeight: "500",
                }}
              >
                Click to upload a cover image
              </p>
              <p
                style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "4px" }}
              >
                Recommended: 1200 x 630 pixels • Max 10MB
              </p>
            </div>
          ) : (
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                right: "16px",
                background: "rgba(0,0,0,0.7)",
                color: "white",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Click to change
            </div>
          )}
        </div>
        <input
          id="cover-input"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }}
        />

        <div style={{ marginTop: "32px" }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Write a compelling title..."
            style={{
              width: "100%",
              fontSize: "32px",
              fontWeight: "700",
              border: "none",
              outline: "none",
              padding: "8px 0",
              background: "transparent",
              color: "#000000",
            }}
          />
          <div
            style={{
              fontSize: "13px",
              color: title.length > 60 ? "#EF4444" : "#9CA3AF",
              marginTop: "4px",
            }}
          >
            {title.length}/60 characters {title.length > 60 && "• Too long!"}
          </div>
        </div>

        <div style={{ marginTop: "24px" }}>
          <div
            style={{
              border: "2px solid #E5E7EB",
              borderRadius: "12px",
              padding: "24px",
              background: "white",
              transition: "border-color 0.3s ease",
              position: "relative",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your story..."
              style={{
                width: "100%",
                minHeight: "150px",
                fontSize: "18px",
                lineHeight: "1.8",
                border: "none",
                outline: "none",
                padding: "0",
                background: "transparent",
                color: "#1A1A1A",
                fontFamily: "Georgia, serif",
                resize: "vertical",
              }}
            />

            <div
              style={{
                marginTop: "16px",
                paddingTop: "12px",
                borderTop: "1px solid #F3F4F6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: "13px", color: "#9CA3AF" }}>
                {wordCount === 0 ? "Start writing..." : `${wordCount} words`}
              </div>
              {wordCount > 0 && wordCount < 50 && (
                <div
                  style={{
                    fontSize: "13px",
                    color: "#F59E0B",
                    fontWeight: "500",
                    background: "#FFFBEB",
                    padding: "4px 12px",
                    borderRadius: "6px",
                  }}
                >
                  💡 Try to write at least 50 words for better engagement
                </div>
              )}
              {wordCount >= 50 && (
                <div
                  style={{
                    fontSize: "13px",
                    color: "#10B981",
                    fontWeight: "500",
                    background: "#F0FDF4",
                    padding: "4px 12px",
                    borderRadius: "6px",
                  }}
                >
                  ✅ Good length
                </div>
              )}
            </div>
          </div>
        </div>

        <hr
          style={{
            margin: "32px 0",
            border: "none",
            borderTop: "1px solid #E5E7EB",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "32px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Category
            </label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                padding: "4px 0",
              }}
            >
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    border:
                      category === cat.value
                        ? "2px solid"
                        : "1px solid #D1D5DB",
                    background: category === cat.value ? cat.color : "white",
                    color: category === cat.value ? "white" : "#374151",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    borderColor: category === cat.value ? cat.color : "#D1D5DB",
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Tags{" "}
              <span style={{ fontWeight: "400", color: "#9CA3AF" }}>
                (max 5)
              </span>
            </label>
            <div
              style={{
                display: "flex",
                gap: "8px",
                border: "1px solid #D1D5DB",
                borderRadius: "8px",
                padding: "8px 12px",
                background: "white",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#F3F4F6",
                    padding: "4px 10px",
                    borderRadius: "16px",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#1F2937",
                  }}
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#9CA3AF",
                      cursor: "pointer",
                      fontSize: "14px",
                      padding: "0 2px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
              {tags.length < 5 && (
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add tag..."
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: "13px",
                    background: "transparent",
                    flex: 1,
                    minWidth: "80px",
                    padding: "4px 0",
                  }}
                />
              )}
            </div>
            <div
              style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "6px" }}
            >
              Press Enter or comma to add tag (without #)
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "40px",
            padding: "20px",
            background: "#F9FAFB",
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
          }}
        >
          <h3
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#6B7280",
              marginBottom: "12px",
            }}
          >
            📋 Post Summary
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              fontSize: "14px",
            }}
          >
            <div>
              <span style={{ color: "#6B7280" }}>Category:</span>{" "}
              <span style={{ fontWeight: "500" }}>
                {selectedCategory?.label}
              </span>
            </div>
            <div>
              <span style={{ color: "#6B7280" }}>Tags:</span>{" "}
              <span style={{ fontWeight: "500" }}>
                {tags.length > 0 ? tags.map((t) => `#${t}`).join(" ") : "None"}
              </span>
            </div>
            <div>
              <span style={{ color: "#6B7280" }}>Words:</span>{" "}
              <span style={{ fontWeight: "500" }}>{wordCount}</span>
            </div>
            <div>
              <span style={{ color: "#6B7280" }}>Status:</span>{" "}
              <span style={{ fontWeight: "500" }}>
                {isEdit ? "Editing" : "New Post"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritePage;
