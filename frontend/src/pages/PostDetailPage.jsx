import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const PostDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await API.get(`/posts/slug/${slug}`);
        setPost(res.data);
        setLikeCount(res.data.likes?.length || 0);
        if (user) {
          setLiked(res.data.likes?.includes(user._id));
        }
      } catch (_err) {
        toast.error("Post not found");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug, user]);

  const handleLike = async () => {
    if (!user) {
      toast.error("Please login to like posts");
      navigate("/login");
      return;
    }

    setIsLiking(true);
    try {
      const res = await API.put(`/posts/${post._id}/like`);
      setLiked(res.data.liked);
      setLikeCount(res.data.likes);
    } catch (_err) {
      toast.error("Failed to like post");
    } finally {
      setIsLiking(false);
    }
  };

  const handleSavePost = async () => {
    if (!user) {
      toast.error("Please login to save posts");
      navigate("/login");
      return;
    }

    setIsSaving(true);
    try {
      // Simulate saving - you can implement actual save API
      const savedPosts = JSON.parse(localStorage.getItem("savedPosts") || "[]");

      if (savedPosts.includes(post._id)) {
        // Remove from saved
        const updated = savedPosts.filter((id) => id !== post._id);
        localStorage.setItem("savedPosts", JSON.stringify(updated));
        toast.success("Post removed from saved!");
      } else {
        // Add to saved
        savedPosts.push(post._id);
        localStorage.setItem("savedPosts", JSON.stringify(savedPosts));
        toast.success("Post saved! 📚");
      }
    } catch (_err) {
      toast.error("Failed to save post");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPost = () => {
    try {
      const content = `
${post.title}

By: ${post.author?.name}
Category: ${post.category}
Published: ${new Date(post.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}

${post.content}

${post.tags?.length > 0 ? `Tags: ${post.tags.map((t) => `#${t}`).join(", ")}` : ""}

---
Saved from BlogSpace
      `.trim();

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${post.title.replace(/\s+/g, "_")}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Post downloaded! 💾");
    } catch (_err) {
      toast.error("Failed to download post");
    }
  };

  const categoryColors = {
    technology: { bg: "#EEF2FF", color: "#4F46E5", emoji: "💻" },
    lifestyle: { bg: "#F0FDF4", color: "#16A34A", emoji: "🌿" },
    travel: { bg: "#FFF7ED", color: "#EA580C", emoji: "✈️" },
    food: { bg: "#FEF2F2", color: "#DC2626", emoji: "🍳" },
    business: { bg: "#F0F9FF", color: "#0369A1", emoji: "💼" },
    other: { bg: "#F9FAFB", color: "#6B7280", emoji: "📌" },
  };

  if (loading) {
    return (
      <div style={{ background: "#FAFBFC", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #E5E7EB",
              borderTop: "3px solid #4F46E5",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          ></div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const catStyle = categoryColors[post.category] || categoryColors.other;
  const readingTime = Math.ceil(post.content.split(/\s+/).length / 200);
  const savedPosts = JSON.parse(localStorage.getItem("savedPosts") || "[]");
  const isSaved = savedPosts.includes(post._id);

  return (
    <div style={{ background: "#FAFBFC", minHeight: "100vh" }}>
      <Navbar />

      <article
        style={{ maxWidth: "820px", margin: "0 auto", padding: "32px 24px" }}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "white",
            border: "1px solid #E5E7EB",
            color: "#374151",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            padding: "25px 10px",
            borderRadius: "10px",
            transition: "all 0.2s ease",
            marginBottom: "28px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#F9FAFB";
            e.currentTarget.style.transform = "translateX(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
            e.currentTarget.style.transform = "translateX(0)";
          }}
        >
          ← Back
        </button>

        {/* Category Badge */}
        <div style={{ marginBottom: "16px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: 600,
              background: catStyle.bg,
              color: catStyle.color,
              padding: "6px 16px",
              borderRadius: "20px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <span>{catStyle.emoji}</span>
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 44px)",
            fontWeight: 800,
            color: "#0F172A",
            lineHeight: 1.2,
            marginBottom: "20px",
            letterSpacing: "-0.02em",
          }}
        >
          {post.title}
        </h1>

        {/* Author & Meta Info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "24px",
            borderBottom: "1px solid #E5E7EB",
            marginBottom: "32px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Link
              to={`/profile/${post.author?._id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: post.author?.avatar
                    ? `url(${post.author.avatar}) center/cover`
                    : "linear-gradient(135deg, #4F46E5, #7C3AED)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "white",
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                  boxShadow: "0 2px 8px rgba(79, 70, 229, 0.15)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {!post.author?.avatar &&
                  post.author?.name?.charAt(0).toUpperCase()}
              </div>
            </Link>
            <div>
              <Link
                to={`/profile/${post.author?._id}`}
                style={{ textDecoration: "none" }}
              >
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#0F172A",
                    marginBottom: "4px",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#4F46E5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#0F172A";
                  }}
                >
                  {post.author?.name}
                </p>
              </Link>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: "13px", color: "#6B7280" }}>
                  {new Date(post.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span style={{ fontSize: "13px", color: "#D1D5DB" }}>•</span>
                <span style={{ fontSize: "13px", color: "#6B7280" }}>
                  {readingTime} min read
                </span>
                <span style={{ fontSize: "13px", color: "#D1D5DB" }}>•</span>
                <span style={{ fontSize: "13px", color: "#6B7280" }}>
                  👁 {post.views || 0} views
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {/* Save Button */}
            <button
              onClick={handleSavePost}
              disabled={isSaving}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 18px",
                border: isSaved ? "2px solid #8B5CF6" : "2px solid #E5E7EB",
                borderRadius: "50px",
                background: isSaved ? "#F5F3FF" : "white",
                color: isSaved ? "#7C3AED" : "#6B7280",
                fontSize: "14px",
                fontWeight: 600,
                cursor: isSaving ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                opacity: isSaving ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.transform = "scale(1.05)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <span>{isSaved ? "📚" : "🔖"}</span>
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>

            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isLiking}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                border: liked ? "2px solid #EF4444" : "2px solid #E5E7EB",
                borderRadius: "50px",
                background: liked ? "#FEF2F2" : "white",
                color: liked ? "#EF4444" : "#6B7280",
                fontSize: "14px",
                fontWeight: 600,
                cursor: isLiking ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                opacity: isLiking ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLiking) {
                  e.currentTarget.style.transform = "scale(1.05)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <span style={{ fontSize: "18px" }}>{liked ? "❤️" : "🤍"}</span>
              <span>{likeCount}</span>
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownloadPost}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 16px",
                border: "2px solid #E5E7EB",
                borderRadius: "50px",
                background: "white",
                color: "#6B7280",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.borderColor = "#3B82F6";
                e.currentTarget.style.color = "#3B82F6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.color = "#6B7280";
              }}
            >
              <span>⬇️</span>
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div
            style={{
              width: "100%",
              height: "420px",
              borderRadius: "16px",
              overflow: "hidden",
              marginBottom: "36px",
              position: "relative",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background: `url(${post.coverImage}) center/cover`,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "40%",
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.3), transparent)",
              }}
            />
          </div>
        )}

        {/* Content with proper justification and readability */}
        <div
          style={{
            fontSize: "18px",
            lineHeight: 2,
            color: "#1F2937",
            whiteSpace: "pre-wrap",
            fontFamily: "'Georgia', 'Times New Roman', serif",
            letterSpacing: "0.01em",
            textAlign: "justify",
            textJustify: "inter-word",
            wordBreak: "break-word",
            padding: "0 4px",
          }}
        >
          {post.content}
        </div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "48px",
              paddingTop: "32px",
              borderTop: "1px solid #E5E7EB",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#6B7280",
                marginRight: "4px",
              }}
            >
              Tags:
            </span>
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/tag/${tag}`}
                style={{
                  fontSize: "13px",
                  padding: "6px 16px",
                  background: "#F3F4F6",
                  color: "#4B5563",
                  borderRadius: "20px",
                  textDecoration: "none",
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#4F46E5";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#F3F4F6";
                  e.currentTarget.style.color = "#4B5563";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Author Bio */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            padding: "28px",
            marginTop: "48px",
            background: "white",
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            alignItems: "flex-start",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: post.author?.avatar
                ? `url(${post.author.avatar}) center/cover`
                : "linear-gradient(135deg, #4F46E5, #7C3AED)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(79, 70, 229, 0.15)",
            }}
          >
            {!post.author?.avatar && post.author?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#0F172A",
                }}
              >
                {post.author?.name}
              </p>
              <Link
                to={`/profile/${post.author?._id}`}
                style={{
                  fontSize: "13px",
                  color: "#4F46E5",
                  fontWeight: 500,
                  textDecoration: "none",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#EEF2FF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                View Profile →
              </Link>
            </div>
            <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.7 }}>
              {post.author?.bio ||
                "A passionate writer sharing ideas and stories on BlogSpace."}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "32px",
            paddingTop: "24px",
            borderTop: "1px solid #E5E7EB",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{ fontSize: "14px", color: "#6B7280", fontWeight: 500 }}
            >
              Share this post:
            </span>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: post.title,
                    text: `Check out this post: ${post.title}`,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied to clipboard!");
                }
              }}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                background: "white",
                color: "#374151",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#F9FAFB";
                e.currentTarget.style.borderColor = "#4F46E5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.borderColor = "#E5E7EB";
              }}
            >
              📋 Copy Link
            </button>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleSavePost}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                background: isSaved ? "#F5F3FF" : "white",
                color: isSaved ? "#7C3AED" : "#374151",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {isSaved ? "📚 Saved" : "🔖 Save Post"}
            </button>
            <button
              onClick={handleDownloadPost}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                background: "white",
                color: "#374151",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#F0FDF4";
                e.currentTarget.style.borderColor = "#10B981";
                e.currentTarget.style.color = "#065F46";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.color = "#374151";
              }}
            >
              💾 Download Post
            </button>
          </div>
        </div>
      </article>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PostDetailPage;
