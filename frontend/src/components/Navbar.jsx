import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    toast.success("Logged out!");
    navigate("/login");
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="navbar">
        <Link to="/" className="navbar-logo">
          BlogSpace
        </Link>

        <div className="navbar-links">
          {[
            { path: "/", label: "Home" },
            { path: "/write", label: "Write" },
            { path: "/saved", label: "Saved" },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`navbar-link ${isActive(item.path) ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user ? (
            <>
              <Link to="/profile" className="navbar-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
              </Link>
              <span
                style={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}
              >
                {user.name?.split(" ")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="btn-ghost"
                style={{ padding: "6px 14px", fontSize: "12px" }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  fontSize: "13px",
                  color: "#6B7280",
                  textDecoration: "none",
                  padding: "6px 12px",
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-black"
                style={{
                  textDecoration: "none",
                  padding: "7px 16px",
                }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navbar */}
      <nav className="mobile-nav">
        {[
          { path: "/", label: "Home", icon: "🏠" },
          { path: "/write", label: "Write", icon: "✍️" },
          { path: "/saved", label: "Saved", icon: "🔖" },
          { path: user ? "/profile" : "/login", label: "Profile", icon: "👤" },
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`mobile-nav-item ${isActive(item.path) ? "active" : ""}`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
};

export default Navbar;
