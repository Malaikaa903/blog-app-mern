import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/register", formData);
      toast.success("Account created! 🎉");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#FAFBFC",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* Left Panel - Hidden on mobile */}
      <div
        style={{
          flex: "0 0 50%",
          position: "relative",
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          overflow: "hidden",
        }}
        className="auth-left-panel"
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "-30%",
            right: "-20%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(79, 70, 229, 0.08)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            left: "-30%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(236, 72, 153, 0.06)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.03)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 2, maxWidth: "440px" }}>
          {/* Logo */}
          <div
            style={{
              fontSize: "32px",
              fontWeight: 800,
              color: "white",
              marginBottom: "24px",
              letterSpacing: "-0.5px",
            }}
          >
            BlogSpace
          </div>

          {/* Quote */}
          <div
            style={{
              position: "relative",
              padding: "24px 0",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                color: "rgba(255,255,255,0.1)",
                position: "absolute",
                top: "-8px",
                left: "-8px",
                fontFamily: "Georgia, serif",
              }}
            >
              "
            </div>
            <p
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "clamp(20px, 2.5vw, 28px)",
                color: "white",
                lineHeight: 1.6,
                marginBottom: "16px",
                fontStyle: "italic",
                paddingLeft: "20px",
              }}
            >
              Start your writing journey today.
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.4)",
                paddingLeft: "20px",
              }}
            >
              Join thousands of writers sharing their stories.
            </p>
          </div>

          {/* Features */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "40px",
              paddingTop: "32px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {[
              { icon: "✍️", text: "Write and publish your stories" },
              { icon: "📚", text: "Build your personal library" },
              { icon: "🌟", text: "Connect with like-minded creators" },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "14px",
                }}
              >
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "white",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "24px 0",
          }}
        >
          {/* Mobile Logo */}
          <div
            style={{
              display: "none",
              textAlign: "center",
              marginBottom: "32px",
            }}
            className="mobile-logo"
          >
            <div
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#0F172A",
                letterSpacing: "-0.5px",
              }}
            >
              BlogSpace
            </div>
          </div>

          {/* Header */}
          <div style={{ marginBottom: "32px" }}>
            <h1
              style={{
                fontSize: "clamp(28px, 3vw, 34px)",
                fontWeight: 700,
                color: "#0F172A",
                marginBottom: "8px",
                letterSpacing: "-0.5px",
              }}
            >
              Create account ✨
            </h1>
            <p
              style={{
                fontSize: "15px",
                color: "#64748B",
                lineHeight: 1.5,
              }}
            >
              Start your journey. It's free and easy.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Full Name */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#0F172A",
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Malaika Tabassum"
                required
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "2px solid #E2E8F0",
                  fontSize: "15px",
                  color: "#0F172A",
                  background: "#F8FAFC",
                  transition: "all 0.2s ease",
                  outline: "none",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#4F46E5";
                  e.currentTarget.style.background = "white";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E2E8F0";
                  e.currentTarget.style.background = "#F8FAFC";
                }}
              />
            </div>

            {/* Email */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#0F172A",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "2px solid #E2E8F0",
                  fontSize: "15px",
                  color: "#0F172A",
                  background: "#F8FAFC",
                  transition: "all 0.2s ease",
                  outline: "none",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#4F46E5";
                  e.currentTarget.style.background = "white";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E2E8F0";
                  e.currentTarget.style.background = "#F8FAFC";
                }}
              />
            </div>

            {/* Password */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#0F172A",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  style={{
                    width: "100%",
                    padding: "12px 48px 12px 16px",
                    borderRadius: "10px",
                    border: "2px solid #E2E8F0",
                    fontSize: "15px",
                    color: "#0F172A",
                    background: "#F8FAFC",
                    transition: "all 0.2s ease",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#4F46E5";
                    e.currentTarget.style.background = "white";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                    e.currentTarget.style.background = "#F8FAFC";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    fontSize: "20px",
                    cursor: "pointer",
                    color: "#94A3B8",
                    padding: "4px",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#4F46E5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#94A3B8";
                  }}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#94A3B8",
                  marginTop: "4px",
                }}
              >
                Must be at least 6 characters long
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                border: "none",
                background: "#0F172A",
                color: "white",
                fontSize: "16px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                marginTop: "4px",
                opacity: loading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "#1E293B";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(15,23,42,0.2)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "#0F172A";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      display: "inline-block",
                      width: "18px",
                      height: "18px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTop: "2px solid white",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Creating account...
                </>
              ) : (
                "Create Account →"
              )}
            </button>
          </form>

          {/* Footer */}
          <div
            style={{
              marginTop: "24px",
              textAlign: "center",
              fontSize: "14px",
              color: "#64748B",
            }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "#4F46E5",
                textDecoration: "none",
                fontWeight: 600,
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#4338CA";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#4F46E5";
              }}
            >
              Sign In →
            </Link>
          </div>

          {/* Trust Badge */}
          <div
            style={{
              textAlign: "center",
              marginTop: "32px",
              paddingTop: "24px",
              borderTop: "1px solid #F1F5F9",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                fontSize: "12px",
                color: "#94A3B8",
              }}
            >
              <span>🔒 Secure</span>
              <span>•</span>
              <span>💳 Free</span>
              <span>•</span>
              <span>🚀 Fast</span>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .auth-left-panel {
            display: none !important;
          }
          .mobile-logo {
            display: block !important;
          }
        }

        @media (min-width: 769px) {
          .mobile-logo {
            display: none !important;
          }
        }

        input {
          transition: all 0.2s ease;
        }

        button {
          transition: all 0.2s ease;
        }

        input[type="checkbox"] {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
