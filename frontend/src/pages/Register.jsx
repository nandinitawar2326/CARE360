import { useState } from "react";
import axios from "axios";
import {
  UserRound,
  Mail,
  Phone,
  Lock,
  UserPlus
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    email: "",
    phone: "",
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

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/register`,
        {
          name: formData.name,
          age: Number(formData.age),
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        }
      );

      console.log(
        "Registration successful:",
        response.data
      );

      alert(
        `Registration successful!\nYour Patient ID is ${response.data.patient_id}`
      );

      navigate("/login");

    } catch (err) {
      console.error("Registration error:", err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError(
          "Unable to register. Please check your backend connection."
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
          REGISTER CARD
      ===================================================== */}

      <div className="auth-card">

        <div className="auth-header">

          <h2>Create Account</h2>

          <p>
            Register to start using your CARE360 health dashboard
          </p>

        </div>


        {/* ERROR */}

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}


        <form onSubmit={handleRegister}>

          {/* NAME */}

          <div className="auth-input-group">

            <label>
              Full Name
            </label>

            <div className="auth-input-wrapper">

              <UserRound size={20} />

              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />

            </div>

          </div>


          {/* AGE */}

          <div className="auth-input-group">

            <label>
              Age
            </label>

            <div className="auth-input-wrapper">

              <UserRound size={20} />

              <input
                type="number"
                name="age"
                placeholder="Enter your age"
                min="1"
                max="120"
                value={formData.age}
                onChange={handleChange}
                required
              />

            </div>

          </div>


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


          {/* PHONE */}

          <div className="auth-input-group">

            <label>
              Phone Number
            </label>

            <div className="auth-input-wrapper">

              <Phone size={20} />

              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
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
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                minLength="6"
                required
              />

            </div>

          </div>


          {/* REGISTER BUTTON */}

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >

            <UserPlus size={20} />

            {loading
              ? "Creating Account..."
              : "Create Account"}

          </button>

        </form>


        {/* LOGIN */}

        <div className="auth-footer">

          <p>
            Already have an account?
          </p>

          <Link to="/login">
            Login
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

export default Register;