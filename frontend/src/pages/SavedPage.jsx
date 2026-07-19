import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const SavedPage = () => {
  const navigate = useNavigate();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const res = await API.get("/auth/saved-posts");
        setSavedPosts(res.data);
      } catch (_err) {
        toast.error("Failed to load saved posts");
      } finally {
        setLoading(false);
      }
    };
    fetchSavedPosts();
  }, []);

  const handleRemoveSaved = async (postId) => {
    setRemovingId(postId);
    try {
      await API.put(`/auth/save/${postId}`);
      setSavedPosts(savedPosts.filter((post) => post._id !== postId));
      toast.success("Post removed from saved!");
    } catch (_err) {
      toast.error("Failed to remove post");
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear all saved posts?")) {
      try {
        await Promise.all(
          savedPosts.map((post) => API.put(`/auth/save/${post._id}`)),
        );
        setSavedPosts([]);
        toast.success("All saved posts cleared!");
      } catch (_err) {
        toast.error("Failed to clear saved posts");
      }
    }
  };

  return (
    <div style={{ background: "#FAFBFC", minHeight: "100vh" }}>
      <Navbar />
      <div
        style={{ maxWidth: "820px", margin: "0 auto", padding: "60px 30px" }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "#0F172A",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "4px",
              }}
            >
              <span>📚</span>
              Saved Posts
              {savedPosts.length > 0 && (
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "white",
                    background: "#4F46E5",
                    padding: "2px 12px",
                    borderRadius: "20px",
                    marginLeft: "8px",
                  }}
                >
                  {savedPosts.length}
                </span>
              )}
            </h1>
            <p style={{ fontSize: "14px", color: "#6B7280" }}>
              {savedPosts.length > 0
                ? `You have ${savedPosts.length} saved post${savedPosts.length > 1 ? "s" : ""}`
                : "No saved posts yet"}
            </p>
          </div>

          {savedPosts.length > 0 && (
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleClearAll}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #EF4444",
                  background: "white",
                  color: "#EF4444",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                🗑️ Clear All
              </button>
              <button
                onClick={() => navigate("/")}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#1A1A1A",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Browse More
              </button>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
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
        )}

        {/* Empty State */}
        {!loading && savedPosts.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              background: "white",
              borderRadius: "16px",
              border: "1px solid #E5E7EB",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🔖</div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#0F172A",
                marginBottom: "8px",
              }}
            >
              No Saved Posts
            </h2>
            <p
              style={{
                color: "#6B7280",
                fontSize: "15px",
                marginBottom: "24px",
                lineHeight: 1.7,
                maxWidth: "400px",
                margin: "0 auto 24px",
              }}
            >
              Start saving your favorite posts to read later!
            </p>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "12px 32px",
                borderRadius: "10px",
                border: "none",
                background: "#1A1A1A",
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              📖 Browse Posts
            </button>
          </div>
        )}

        {/* Saved Posts Grid */}
        {!loading && savedPosts.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "20px",
            }}
          >
            {savedPosts.map((post) => (
              <div
                key={post._id}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {post.coverImage && (
                  <div
                    style={{
                      height: "180px",
                      background: `url(${post.coverImage}) center/cover`,
                    }}
                  ></div>
                )}

                <div style={{ padding: "16px 20px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#4F46E5",
                        background: "#EEF2FF",
                        padding: "3px 12px",
                        borderRadius: "12px",
                        textTransform: "uppercase",
                      }}
                    >
                      {post.category || "General"}
                    </span>
                    <span style={{ fontSize: "11px", color: "#9CA3AF" }}>
                      {new Date(post.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <Link
                    to={`/post/${post.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#0F172A",
                        marginBottom: "8px",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {post.title}
                    </h3>
                  </Link>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      fontSize: "12px",
                      color: "#6B7280",
                      marginBottom: "12px",
                    }}
                  >
                    <span>👤 {post.author?.name || "Unknown"}</span>
                    <span>•</span>
                    <span>👁 {post.views || 0}</span>
                    <span>•</span>
                    <span>❤️ {post.likes?.length || 0}</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      paddingTop: "12px",
                      borderTop: "1px solid #F3F4F6",
                    }}
                  >
                    <Link
                      to={`/post/${post.slug}`}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "6px",
                        border: "none",
                        background: "#4F46E5",
                        color: "white",
                        fontSize: "13px",
                        fontWeight: 500,
                        textAlign: "center",
                        textDecoration: "none",
                      }}
                    >
                      📖 Read
                    </Link>
                    <button
                      onClick={() => handleRemoveSaved(post._id)}
                      disabled={removingId === post._id}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "6px",
                        border: "1px solid #EF4444",
                        background: "white",
                        color: "#EF4444",
                        fontSize: "13px",
                        fontWeight: 500,
                        cursor: "pointer",
                        opacity: removingId === post._id ? 0.6 : 1,
                      }}
                    >
                      {removingId === post._id ? "⏳" : "🗑️"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SavedPage;
