import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();
  const menuRef = useRef();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("published");
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || "");

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowAvatarMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const res = await API.get("/posts/my-posts");
        setPosts(res.data);
      } catch (_err) {
        toast.error("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };
    fetchMyPosts();
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarLoading(true);
    setShowAvatarMenu(false);
    try {
      const data = new FormData();
      data.append("avatar", file);
      const res = await API.put("/auth/avatar", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAvatar(res.data.avatar);
      login(
        { ...user, avatar: res.data.avatar },
        localStorage.getItem("token"),
      );
      toast.success("Profile picture updated! ✅");
    } catch (_err) {
      toast.error("Failed to update profile picture");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setAvatarLoading(true);
    setShowAvatarMenu(false);
    try {
      await API.put("/auth/avatar/remove");
      setAvatar("");
      login({ ...user, avatar: "" }, localStorage.getItem("token"));
      toast.success("Profile picture removed!");
    } catch (_err) {
      toast.error("Failed to remove profile picture");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/posts/${deleteId}`);
      setPosts(posts.filter((p) => p._id !== deleteId));
      toast.success("Post deleted!");
      setShowDeleteModal(false);
    } catch (_err) {
      toast.error("Failed to delete");
    }
  };

  const filteredPosts = posts.filter((p) =>
    activeTab === "published" ? p.status === "published" : p.status === "draft",
  );
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;

  return (
    <div className="page-wrap">
      <Navbar />

      {/* Dark Header with Gradient */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          padding: "32px 0",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="profile-layout">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              {/* Avatar with Menu */}
              <div style={{ position: "relative" }} ref={menuRef}>
                <div
                  onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    border: "3px solid rgba(255,255,255,0.15)",
                    overflow: "hidden",
                    cursor: "pointer",
                    background: avatar
                      ? `url(${avatar}) center/cover`
                      : "linear-gradient(135deg, #F43F5E, #EC4899)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "32px",
                    fontWeight: 700,
                    color: "white",
                    position: "relative",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.15)";
                  }}
                >
                  {!avatar && user?.name?.charAt(0).toUpperCase()}
                  {avatarLoading && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          border: "3px solid rgba(255,255,255,0.3)",
                          borderTop: "3px solid white",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      ></div>
                    </div>
                  )}
                </div>

                {/* Camera Badge */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "2px",
                    right: "2px",
                    width: "28px",
                    height: "28px",
                    background: "linear-gradient(135deg, #F43F5E, #EC4899)",
                    borderRadius: "50%",
                    border: "3px solid #0F172A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                  }}
                  onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  📷
                </div>

                {/* Avatar Dropdown Menu */}
                {showAvatarMenu && (
                  <div
                    style={{
                      position: "absolute",
                      top: "88px",
                      left: 0,
                      background: "white",
                      borderRadius: "12px",
                      border: "1px solid #E5E7EB",
                      padding: "6px",
                      zIndex: 100,
                      minWidth: "180px",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                      animation: "slideDown 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        padding: "8px 12px 4px",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#9CA3AF",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Profile Photo
                    </div>
                    <button
                      onClick={() => {
                        fileRef.current.click();
                        setShowAvatarMenu(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        width: "100%",
                        padding: "10px 12px",
                        border: "none",
                        background: "none",
                        fontSize: "14px",
                        color: "#374151",
                        cursor: "pointer",
                        borderRadius: "8px",
                        fontFamily: "inherit",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#F3F4F6";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "none";
                      }}
                    >
                      <span style={{ fontSize: "18px" }}>📸</span>
                      Change Photo
                    </button>
                    {avatar && (
                      <button
                        onClick={handleDeleteAvatar}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          width: "100%",
                          padding: "10px 12px",
                          border: "none",
                          background: "none",
                          fontSize: "14px",
                          color: "#EF4444",
                          cursor: "pointer",
                          borderRadius: "8px",
                          fontFamily: "inherit",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#FEF2F2";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "none";
                        }}
                      >
                        <span style={{ fontSize: "18px" }}>🗑️</span>
                        Remove Photo
                      </button>
                    )}
                  </div>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
              </div>

              <div>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "white",
                    marginBottom: "4px",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {user?.name}
                </h2>
                <p
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: "2px",
                  }}
                >
                  {user?.email}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>💡</span> Click photo to update or remove
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/write")}
                style={{
                  padding: "10px 24px",
                  borderRadius: "10px",
                  border: "none",
                  background: "white",
                  color: "#0F172A",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                ✍️ Write Post
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                style={{
                  padding: "10px 24px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-layout" style={{ padding: "24px" }}>
        {/* Stats - With Borders and Background */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {[
            { label: "Total Posts", value: posts.length, icon: "📄" },
            {
              label: "Total Views",
              value: totalViews.toLocaleString(),
              icon: "👁️",
            },
            { label: "Total Likes", value: totalLikes, icon: "❤️" },
            { label: "Drafts", value: draftCount, icon: "📝" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#F8FAFC",
                padding: "20px",
                borderRadius: "14px",
                border: "2px solid #E2E8F0",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
                e.currentTarget.style.borderColor = "#4F46E5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                e.currentTarget.style.borderColor = "#E2E8F0";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "4px",
                }}
              >
                <span style={{ fontSize: "24px" }}>{stat.icon}</span>
                <div
                  style={{
                    fontSize: "26px",
                    fontWeight: 700,
                    color: "#0F172A",
                  }}
                >
                  {stat.value}
                </div>
              </div>
              <div
                style={{ fontSize: "14px", color: "#64748B", fontWeight: 500 }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs - Enhanced */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            background: "#F1F5F9",
            borderRadius: "12px",
            padding: "4px",
            marginBottom: "20px",
          }}
        >
          {[
            { key: "published", label: `📰 Published (${publishedCount})` },
            { key: "draft", label: `📝 Drafts (${draftCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === tab.key ? "white" : "transparent",
                color: activeTab === tab.key ? "#0F172A" : "#64748B",
                fontSize: "14px",
                fontWeight: activeTab === tab.key ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow:
                  activeTab === tab.key ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Posts List - Clickable Now */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <div className="spinner"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "white",
              borderRadius: "16px",
              border: "2px solid #E2E8F0",
            }}
          >
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>
              {activeTab === "published" ? "📭" : "📝"}
            </div>
            <p
              style={{
                color: "#0F172A",
                fontWeight: 600,
                marginBottom: "8px",
                fontSize: "18px",
              }}
            >
              {activeTab === "published"
                ? "No published posts yet"
                : "No drafts saved"}
            </p>
            <p
              style={{
                color: "#64748B",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              {activeTab === "published"
                ? "Start writing your first post and share it with the world!"
                : "Save your work in progress and come back later."}
            </p>
            <button
              onClick={() => navigate("/write")}
              style={{
                padding: "12px 32px",
                borderRadius: "10px",
                border: "none",
                background: "#0F172A",
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              ✍️ Write a Post
            </button>
          </div>
        ) : (
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              border: "2px solid #E2E8F0",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            {filteredPosts.map((post, index) => (
              <div
                key={post._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "18px 24px",
                  borderBottom:
                    index === filteredPosts.length - 1
                      ? "none"
                      : "2px solid #F1F5F9",
                  transition: "all 0.2s ease",
                  background: index % 2 === 0 ? "white" : "#FAFBFC",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#F1F5F9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    index % 2 === 0 ? "white" : "#FAFBFC";
                }}
                // FIX: Click on the whole row to navigate to post
                onClick={() => navigate(`/post/${post.slug}`)}
              >
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "10px",
                    flexShrink: 0,
                    overflow: "hidden",
                    background: "#F1F5F9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "32px",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    "📄"
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "4px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        padding: "2px 12px",
                        borderRadius: "12px",
                        fontSize: "10px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.3px",
                        background:
                          post.status === "published" ? "#DCFCE7" : "#FEE2E2",
                        color:
                          post.status === "published" ? "#166534" : "#991B1B",
                        border:
                          "1px solid " +
                          (post.status === "published" ? "#BBF7D0" : "#FECACA"),
                      }}
                    >
                      {post.status}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#64748B",
                        textTransform: "capitalize",
                        fontWeight: 500,
                      }}
                    >
                      {post.category}
                    </span>
                    <span style={{ fontSize: "12px", color: "#CBD5E1" }}>
                      •
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748B" }}>
                      {new Date(post.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#0F172A",
                      marginBottom: "4px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {post.title}
                  </h3>
                  <div
                    style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}
                  >
                    <span style={{ fontSize: "12px", color: "#64748B" }}>
                      👁 {post.views || 0}
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748B" }}>
                      ❤️ {post.likes?.length || 0}
                    </span>
                    {post.tags?.length > 0 && (
                      <span style={{ fontSize: "12px", color: "#64748B" }}>
                        # {post.tags.slice(0, 2).join(" #")}
                        {post.tags.length > 2 && ` +${post.tags.length - 2}`}
                      </span>
                    )}
                  </div>
                </div>
                <div
                  style={{ display: "flex", gap: "6px", flexShrink: 0 }}
                  onClick={(e) => e.stopPropagation()} // Prevent row click when clicking buttons
                >
                  <button
                    onClick={() => navigate(`/post/${post.slug}`)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #E2E8F0",
                      background: "white",
                      fontSize: "16px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#F1F5F9";
                      e.currentTarget.style.borderColor = "#4F46E5";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "white";
                      e.currentTarget.style.borderColor = "#E2E8F0";
                    }}
                    title="View"
                  >
                    👁️
                  </button>
                  <button
                    onClick={() => navigate(`/write?edit=${post._id}`)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #E2E8F0",
                      background: "white",
                      fontSize: "16px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#F1F5F9";
                      e.currentTarget.style.borderColor = "#4F46E5";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "white";
                      e.currentTarget.style.borderColor = "#E2E8F0";
                    }}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => {
                      setDeleteId(post._id);
                      setShowDeleteModal(true);
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #E2E8F0",
                      background: "white",
                      fontSize: "16px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#FEF2F2";
                      e.currentTarget.style.borderColor = "#EF4444";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "white";
                      e.currentTarget.style.borderColor = "#E2E8F0";
                    }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "400px",
              width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              animation: "scaleIn 0.2s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                background: "#FEF2F2",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                margin: "0 auto 16px",
              }}
            >
              🗑️
            </div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#0F172A",
                textAlign: "center",
                marginBottom: "8px",
              }}
            >
              Delete Post?
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#64748B",
                textAlign: "center",
                marginBottom: "28px",
                lineHeight: 1.6,
              }}
            >
              This action cannot be undone. Are you sure you want to delete this
              post?
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px solid #E2E8F0",
                  background: "white",
                  color: "#0F172A",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#F1F5F9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#EF4444",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#DC2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#EF4444";
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add global styles for animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
