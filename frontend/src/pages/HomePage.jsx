import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

const categories = [
  { id: "all", label: "All", icon: "📰" },
  { id: "technology", label: "Technology", icon: "💻" },
  { id: "lifestyle", label: "Lifestyle", icon: "🌿" },
  { id: "travel", label: "Travel", icon: "✈️" },
  { id: "food", label: "Food", icon: "🍳" },
  { id: "business", label: "Business", icon: "💼" },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await API.get("/posts");

        let postsData = [];
        if (Array.isArray(res.data)) {
          postsData = res.data;
        } else if (res.data.posts && Array.isArray(res.data.posts)) {
          postsData = res.data.posts;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          postsData = res.data.data;
        }

        const publishedPosts = postsData.filter(
          (p) => p.status === "published",
        );
        setPosts(publishedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast.error("Failed to load posts");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Search functionality - only for dropdown suggestions
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const results = posts.filter(
      (post) =>
        post.title?.toLowerCase().includes(query) ||
        post.content?.toLowerCase().includes(query) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
        post.category?.toLowerCase().includes(query),
    );
    setSearchResults(results);
    setShowDropdown(true);
  }, [searchQuery, posts]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search submit - CLOSE DROPDOWN and show results
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setShowDropdown(false); // Close dropdown
      // Scroll to results
      setTimeout(() => {
        document.getElementById("results-section")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  // Handle search button click
  const handleSearchClick = () => {
    handleSearchSubmit();
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle post click from dropdown
  const handlePostClick = (slug) => {
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    navigate(`/post/${slug}`);
  };

  const filteredPosts =
    selectedCategory === "all"
      ? posts
      : posts.filter((p) => p.category === selectedCategory);

  // IMPORTANT: Show search results when searching, otherwise show filtered posts
  const displayPosts =
    searchQuery.trim() !== "" ? searchResults : filteredPosts;
  const featuredPosts = posts.slice(0, 3);

  return (
    <div style={{ background: "#FAFBFC", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          padding: "80px 24px 60px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.2,
              marginBottom: "16px",
            }}
          >
            Read. Write. <span style={{ color: "#818CF8" }}>Inspire.</span>
          </h1>
          <p
            style={{
              fontSize: "clamp(16px, 1.5vw, 20px)",
              color: "rgba(255,255,255,0.7)",
              marginBottom: "32px",
              maxWidth: "560px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.6,
            }}
          >
            A platform for thinkers and creators to share ideas that matter.
          </p>

          {/* Search Bar */}
          <div
            ref={searchRef}
            style={{
              maxWidth: "560px",
              margin: "0 auto",
              position: "relative",
              zIndex: 100,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "white",
                borderRadius: "12px",
                padding: "4px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              }}
            >
              <span
                style={{
                  padding: "0 12px",
                  fontSize: "18px",
                  color: "#9CA3AF",
                }}
              >
                🔍
              </span>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (searchQuery.trim() && searchResults.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                placeholder="Search stories, topics, or tags..."
                style={{
                  flex: 1,
                  padding: "12px 8px",
                  border: "none",
                  outline: "none",
                  fontSize: "14px",
                  color: "#1F2937",
                  background: "transparent",
                  fontFamily: "inherit",
                  minWidth: "0",
                }}
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  style={{
                    padding: "6px 12px",
                    border: "none",
                    background: "none",
                    color: "#9CA3AF",
                    cursor: "pointer",
                    fontSize: "16px",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#EF4444";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#9CA3AF";
                  }}
                >
                  ✕
                </button>
              )}
              <button
                onClick={handleSearchClick}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#4F46E5",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#4338CA";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#4F46E5";
                }}
              >
                Search
              </button>
            </div>

            {/* Search Suggestions Dropdown - Shows only when typing */}
            {showDropdown &&
              searchResults.length > 0 &&
              searchQuery.trim() !== "" && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    right: 0,
                    background: "white",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    padding: "8px",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
                    zIndex: 9999,
                    maxHeight: "300px",
                    overflowY: "auto",
                    animation: "slideDown 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      padding: "6px 12px",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#9CA3AF",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {searchResults.length} result
                    {searchResults.length > 1 ? "s" : ""} found
                  </div>
                  {searchResults.slice(0, 5).map((post) => (
                    <div
                      key={post._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "background 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#F3F4F6";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                      onClick={() => handlePostClick(post.slug)}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "6px",
                          background: post.coverImage
                            ? `url(${post.coverImage}) center/cover`
                            : "#EEF2FF",
                          flexShrink: 0,
                        }}
                      />
                      <div
                        style={{ flex: 1, textAlign: "left", minWidth: "0" }}
                      >
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            lineHeight: 1.3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {post.title}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6B7280",
                            marginTop: "2px",
                          }}
                        >
                          {post.category} • {post.author?.name}
                        </div>
                      </div>
                    </div>
                  ))}
                  {searchResults.length > 5 && (
                    <div
                      style={{
                        padding: "8px 12px",
                        fontSize: "13px",
                        color: "#4F46E5",
                        textAlign: "center",
                        borderTop: "1px solid #F3F4F6",
                        cursor: "pointer",
                        fontWeight: 500,
                        transition: "background 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#F3F4F6";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                      onClick={handleSearchSubmit}
                    >
                      View all {searchResults.length} results →
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div
        style={{
          position: "sticky",
          top: "64px",
          zIndex: 50,
          background: "white",
          borderBottom: "1px solid #E5E7EB",
          padding: "12px 16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            gap: "6px",
            overflowX: "auto",
            padding: "4px 0",
            flexWrap: "nowrap",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
          className="hide-scrollbar"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchQuery("");
                setSearchResults([]);
                setShowDropdown(false);
              }}
              style={{
                padding: "6px 16px",
                borderRadius: "20px",
                border:
                  selectedCategory === cat.id
                    ? "2px solid #4F46E5"
                    : "1px solid #E5E7EB",
                background: selectedCategory === cat.id ? "#EEF2FF" : "white",
                color: selectedCategory === cat.id ? "#4F46E5" : "#6B7280",
                fontSize: "13px",
                fontWeight: selectedCategory === cat.id ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                flexShrink: 0,
              }}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Posts - Hide when searching */}
      {!loading &&
        featuredPosts.length > 0 &&
        selectedCategory === "all" &&
        !searchQuery && (
          <div
            style={{
              maxWidth: "1200px",
              margin: "32px auto 0",
              padding: "0 16px",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#0F172A",
                marginBottom: "16px",
              }}
            >
              ⭐ Featured Stories
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {featuredPosts.map((post) => (
                <PostCard key={post._id} post={post} featured />
              ))}
            </div>
          </div>
        )}

      {/* All Posts - Shows search results when searching */}
      <div
        id="results-section"
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 16px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#0F172A",
            }}
          >
            {searchQuery ? (
              <>🔍 Search Results for "{searchQuery}"</>
            ) : selectedCategory === "all" ? (
              "📚 All Stories"
            ) : (
              <>
                {categories.find((c) => c.id === selectedCategory)?.icon}{" "}
                {categories.find((c) => c.id === selectedCategory)?.label}
              </>
            )}
          </h2>
          <span style={{ fontSize: "13px", color: "#6B7280" }}>
            {displayPosts.length} post{displayPosts.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                border: "3px solid #E5E7EB",
                borderTop: "3px solid #4F46E5",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            />
          </div>
        ) : displayPosts.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              background: "white",
              borderRadius: "12px",
              border: "1px solid #E5E7EB",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>
              {searchQuery ? "🔍" : "📝"}
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#0F172A" }}>
              {searchQuery
                ? `No stories found for "${searchQuery}"`
                : "No stories yet"}
            </h3>
            <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px" }}>
              {searchQuery
                ? "Try different keywords or browse all posts"
                : "Be the first to share!"}
            </p>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                style={{
                  marginTop: "16px",
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#4F46E5",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#4338CA";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#4F46E5";
                }}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {displayPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>

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
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

// Post Card Component
const PostCard = ({ post, featured = false }) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        border: "1px solid #E5E7EB",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.3s ease",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
      onClick={() => navigate(`/post/${post.slug}`)}
    >
      {post.coverImage && (
        <div
          style={{
            height: featured ? "200px" : "180px",
            background: `url(${post.coverImage}) center/cover`,
            flexShrink: 0,
          }}
        />
      )}
      <div
        style={{
          padding: "16px 20px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ marginBottom: "8px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#4F46E5",
              background: "#EEF2FF",
              padding: "2px 12px",
              borderRadius: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}
          >
            {post.category || "General"}
          </span>
        </div>
        <h3
          style={{
            fontSize: featured ? "18px" : "16px",
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
        <p
          style={{
            fontSize: "14px",
            color: "#6B7280",
            lineHeight: 1.6,
            display: "-webkit-box",
            WebkitLineClamp: featured ? 3 : 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            flex: 1,
            marginBottom: "12px",
          }}
        >
          {post.content?.substring(0, 120) || "No preview available"}...
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "12px",
            borderTop: "1px solid #F3F4F6",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: post.author?.avatar
                  ? `url(${post.author.avatar}) center/cover`
                  : "#4F46E5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 600,
                color: "white",
                flexShrink: 0,
              }}
            >
              {!post.author?.avatar &&
                post.author?.name?.charAt(0).toUpperCase()}
            </div>
            <span
              style={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}
            >
              {post.author?.name || "Unknown"}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              fontSize: "12px",
              color: "#9CA3AF",
            }}
          >
            <span>👁 {post.views || 0}</span>
            <span>❤️ {post.likes?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
