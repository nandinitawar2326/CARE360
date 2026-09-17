import { useState } from "react";
import axios from "axios";
import { Lock, Mail, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/login`,
        formData
      );

      console.log("Login successful:", response.data);

      // Store logged-in patient information
      localStorage.setItem(
        "care360_user",
        JSON.stringify(response.data)
      );

      // Go to patient dashboard
      navigate("/");

    } catch (err) {
      console.error("Login error:", err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError(
          "Unable to login. Please check your backend connection."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* =====================================================
          CARE360 LOGO
      ===================================================== */}

      <div className="auth-logo">

        <img
          src="/care360-logo.png"
          alt="CARE360 Logo"
          className="auth-logo-image"
        />

        <div className="auth-logo-text">
          <h1>CARE360</h1>
          <p>Remote Patient Monitoring</p>
        </div>

      </div>


      {/* =====================================================
          LOGIN CARD
      ===================================================== */}

      <div className="auth-card">

        <div className="auth-header">

          <h2>Welcome Back</h2>

          <p>
            Login to access your CARE360 health dashboard
          </p>

        </div>


        {/* ERROR */}

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}


        {/* FORM */}

        <form onSubmit={handleLogin}>

          {/* EMAIL */}

          <div className="auth-input-group">

            <label>
              Email Address
            </label>

            <div className="auth-input-wrapper">

              <Mail size={20} />

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />

            </div>

          </div>


          {/* PASSWORD */}

          <div className="auth-input-group">

            <label>
              Password
            </label>

            <div className="auth-input-wrapper">

              <Lock size={20} />

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />

            </div>

          </div>


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >

            <LogIn size={20} />

            {loading ? "Logging in..." : "Login"}

          </button>

        </form>


        {/* REGISTER */}

        <div className="auth-footer">

          <p>
            Don't have an account?
          </p>

          <Link to="/register">
            Create an account
          </Link>

        </div>

      </div>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <p className="auth-page-footer">
        CARE360 • Helping families care for their loved ones
      </p>

    </div>
  );
}

export default Login;