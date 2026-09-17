import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Health from "./pages/Health";
import Medicine from "./pages/Medicine";
import Symptoms from "./pages/Symptoms";
import Caregiver from "./pages/Caregiver";
import HealthHistory from "./pages/HealthHistory";
import Appointments from "./pages/Appointments";
import Emergency from "./pages/Emergency";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./ProtectedRoute";

function ComingSoon({ title }) {
  return (
    <div className="page coming-soon">
      <div className="coming-icon">🚧</div>
      <h1>{title}</h1>
      <p>This feature is coming soon.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Patient */}

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Patient Routes */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/health"
          element={
            <ProtectedRoute>
              <Health />
            </ProtectedRoute>
          }
        />

        <Route
          path="/medicines"
          element={
            <ProtectedRoute>
              <Medicine />
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/symptoms"
          element={
            <ProtectedRoute>
              <Symptoms />
            </ProtectedRoute>
          }
        />

        <Route
          path="/emergency"
          element={
            <ProtectedRoute>
              <Emergency />
            </ProtectedRoute>
          }
        />

        <Route
          path="/caregiver"
          element={
            <ProtectedRoute>
              <Caregiver />
            </ProtectedRoute>
          }
        />

        <Route
          path="/health-history"
          element={
            <ProtectedRoute>
              <HealthHistory />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;