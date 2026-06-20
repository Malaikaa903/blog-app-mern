import { Link } from "react-router-dom";

const PostCard = ({ post }) => {
  const categoryColors = {
    technology: { bg: "#FFF1F2", color: "#F43F5E" },
    lifestyle: { bg: "#F0FDF4", color: "#16A34A" },
    travel: { bg: "#FFF7ED", color: "#EA580C" },
    food: { bg: "#FEF2F2", color: "#DC2626" },
    business: { bg: "#F0F9FF", color: "#0369A1" },
    other: { bg: "#F9FAFB", color: "#6B7280" },
  };
  const catStyle = categoryColors[post.category] || categoryColors.other;

  return (
    <Link to={`/post/${post.slug}`} className="post-card">
      {post.coverImage && (
        <img src={post.coverImage} alt={post.title} className="post-card-img" />
      )}
      <div className="post-card-body">
        <div>
          <span
            className="post-tag"
            style={{ background: catStyle.bg, color: catStyle.color }}
          >
            #{post.category}
          </span>
          {post.tags?.slice(0, 1).map((tag) => (
            <span key={tag} className="post-tag secondary">
              #{tag}
            </span>
          ))}
        </div>

        <h3 className="post-card-title">{post.title}</h3>
        <p className="post-card-excerpt">{post.excerpt}</p>

        <div className="post-card-footer">
          <div className="post-author-info">
            <div className="post-author-avatar">
              {post.author?.avatar ? (
                <img src={post.author.avatar} alt={post.author.name} />
              ) : (
                post.author?.name?.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p
                style={{ fontSize: "12px", fontWeight: 500, color: "#1A1A1A" }}
              >
                {post.author?.name}
              </p>
              <p style={{ fontSize: "11px", color: "#9CA3AF" }}>
                {new Date(post.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
          </div>
          <div className="post-reactions">
            <span className="post-reaction">❤️ {post.likes?.length || 0}</span>
            <span className="post-reaction">👁 {post.views || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
