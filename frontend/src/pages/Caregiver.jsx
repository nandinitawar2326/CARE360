import { useEffect, useState } from "react";
import axios from "axios";
import {
  UserRound,
  Heart,
  Activity,
  Droplets,
  Thermometer,
  Pill,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  Siren
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Caregiver() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [emergencyAlerts, setEmergencyAlerts] = useState([]);

  // ============================================================
  // GET LOGGED-IN USER
  // ============================================================

  const getLoggedInUser = () => {
    const storedUser = localStorage.getItem("care360_user");

    if (!storedUser) {
      navigate("/login");
      return null;
    }

    try {
      const loggedInUser = JSON.parse(storedUser);

      if (!loggedInUser?.patient_id) {
        console.error("Patient ID not found.");
        localStorage.removeItem("care360_user");
        navigate("/login");
        return null;
      }

      return loggedInUser;
    } catch (error) {
      console.error("Invalid login data:", error);
      localStorage.removeItem("care360_user");
      navigate("/login");
      return null;
    }
  };

  // ============================================================
  // FETCH CAREGIVER DASHBOARD
  // ============================================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const loggedInUser = getLoggedInUser();

      if (!loggedInUser) {
        return;
      }

      const patientId = loggedInUser.patient_id;

      console.log("Logged-in Patient ID:", patientId);

      const response = await axios.get(
        `${API_URL}/caregiver/${patientId}`
      );

      console.log("Caregiver Dashboard:", response.data);

      setData(response.data);
    } catch (err) {
      console.error("Caregiver dashboard error:", err);

      setError(
        "Unable to load caregiver information. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FETCH EMERGENCY ALERTS
  // ============================================================

  const fetchEmergencyAlerts = async () => {
    try {
      const loggedInUser = getLoggedInUser();

      if (!loggedInUser) {
        return;
      }

      const patientId = loggedInUser.patient_id;

      console.log("Fetching emergency alerts for:", patientId);

      const response = await axios.get(
        `${API_URL}/emergency/${patientId}`
      );

      console.log("Emergency Alerts:", response.data);

      setEmergencyAlerts(response.data);
    } catch (err) {
      console.error("Emergency alert error:", err);
    }
  };

  // ============================================================
  // RESOLVE EMERGENCY
  // ============================================================

  const resolveEmergency = async (emergencyId) => {
    try {
      await axios.put(
        `${API_URL}/emergency/${emergencyId}/status`,
        {
          status: "Resolved"
        }
      );

      // Refresh emergency alerts
      await fetchEmergencyAlerts();

      alert("Emergency alert marked as resolved.");
    } catch (err) {
      console.error("Failed to resolve emergency:", err);

      alert("Unable to update emergency status.");
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchDashboard();
    fetchEmergencyAlerts();
  }, []);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="page">
        <div className="loading-screen">
          <Activity size={40} />

          <h2>Loading caregiver dashboard...</h2>

          <p>Please wait a moment.</p>
        </div>
      </div>
    );
  }

  const patient = data?.patient;
  const health = data?.latest_health;
  const symptoms = data?.recent_symptoms || [];
  const medicines = data?.medicines || [];

  const hasHealth = !!health;

  // ============================================================
  // ACTIVE EMERGENCIES
  // ============================================================

  const activeEmergencies = emergencyAlerts.filter(
    (alert) => alert.status === "Active"
  );

  return (
    <div className="page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="main-header">

        <div className="brand">

          <div className="brand-icon">
            ❤️
          </div>

          <div>
            <h1>CARE360</h1>

            <span>
              Caregiver Dashboard
            </span>
          </div>

        </div>

        <button
          className="refresh-button"
          onClick={() => {
            fetchDashboard();
            fetchEmergencyAlerts();
          }}
        >
          <RefreshCw size={22} />
          Refresh
        </button>

      </header>


      {/* ======================================================
          BACK BUTTON
      ====================================================== */}

      <button
        className="back-button"
        onClick={() => navigate("/")}
      >
        <ArrowLeft size={22} />
        Back to Home
      </button>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="caregiver-error">
          <AlertTriangle size={25} />

          <p>{error}</p>
        </div>
      )}


      {/* ======================================================
          ACTIVE SOS EMERGENCY
      ====================================================== */}

      {activeEmergencies.length > 0 && (
        <section className="caregiver-emergency-alert">

          <div className="emergency-alert-content">

            <div className="emergency-alert-icon">
              <Siren size={42} />
            </div>

            <div className="emergency-alert-info">

              <h2>
                🚨 Active Emergency Alert
              </h2>

              <p>
                {patient?.name || "Patient"} has activated
                an SOS emergency alert.
              </p>

              <p className="emergency-alert-time">
                Please check on the patient immediately.
              </p>

            </div>

          </div>


          <div className="emergency-alert-list">

            {activeEmergencies.map((alert) => (

              <div
                className="emergency-alert-item"
                key={alert.id}
              >

                <div>

                  <strong>
                    SOS Emergency
                  </strong>

                  <p>
                    Alert ID: #{alert.id}
                  </p>

                  <small>
                    {alert.created_at
                      ? new Date(
                          alert.created_at
                        ).toLocaleString()
                      : "Time unavailable"}
                  </small>

                </div>

                <button
                  className="resolve-emergency-button"
                  onClick={() =>
                    resolveEmergency(alert.id)
                  }
                >
                  <CheckCircle size={20} />
                  Mark as Resolved
                </button>

              </div>

            ))}

          </div>

        </section>
      )}


      {/* ======================================================
          NO ACTIVE EMERGENCY
      ====================================================== */}

      {activeEmergencies.length === 0 && (
        <section className="caregiver-safe-card">

          <div className="caregiver-safe-icon">
            <CheckCircle size={32} />
          </div>

          <div>
            <h2>No Active Emergency</h2>

            <p>
              There are currently no active SOS alerts for this patient.
            </p>
          </div>

        </section>
      )}


      {/* ======================================================
          PATIENT PROFILE
      ====================================================== */}

      <section className="caregiver-patient-card">

        <div className="caregiver-patient-icon">
          <UserRound size={42} />
        </div>

        <div>

          <p className="caregiver-label">
            Patient
          </p>

          <h2>
            {patient?.name || "Patient"}
          </h2>

          <p>
            Patient ID: {patient?.patient_id || "N/A"} • Age:{" "}
            {patient?.age || "N/A"}
          </p>

        </div>

      </section>


      {/* ======================================================
          LATEST VITALS
      ====================================================== */}

      <section>

        <div className="section-title-row">

          <div>

            <h2>Latest Health Status</h2>

            <p>
              Most recent patient health readings
            </p>

          </div>

        </div>


        {!hasHealth ? (

          <div className="caregiver-empty">

            <Activity size={35} />

            <h3>No health reading available</h3>

            <p>
              Add a health reading to monitor the patient.
            </p>

          </div>

        ) : (

          <div className="caregiver-vitals-grid">

            {/* HEART RATE */}

            <div className="caregiver-vital-card">

              <div className="caregiver-vital-icon">
                <Heart size={30} />
              </div>

              <div>

                <p>Heart Rate</p>

                <h3>
                  {health.heart_rate}
                  <span> BPM</span>
                </h3>

                <small>
                  Latest reading
                </small>

              </div>

            </div>


            {/* SPO2 */}

            <div className="caregiver-vital-card">

              <div className="caregiver-vital-icon">
                <Droplets size={30} />
              </div>

              <div>

                <p>Oxygen Level</p>

                <h3>
                  {health.spo2}
                  <span> %</span>
                </h3>

                <small>
                  Latest reading
                </small>

              </div>

            </div>


            {/* BLOOD PRESSURE */}

            <div className="caregiver-vital-card">

              <div className="caregiver-vital-icon">
                <Activity size={30} />
              </div>

              <div>

                <p>Blood Pressure</p>

                <h3>
                  {health.systolic_bp} /{" "}
                  {health.diastolic_bp}
                </h3>

                <small>
                  Latest reading
                </small>

              </div>

            </div>


            {/* TEMPERATURE */}

            <div className="caregiver-vital-card">

              <div className="caregiver-vital-icon">
                <Thermometer size={30} />
              </div>

              <div>

                <p>Temperature</p>

                <h3>
                  {health.temperature}
                  <span> °F</span>
                </h3>

                <small>
                  Latest reading
                </small>

              </div>

            </div>

          </div>

        )}

      </section>


      {/* ======================================================
          MONITORING STATUS
      ====================================================== */}

      <section className="caregiver-status-card">

        <div className="caregiver-status-icon">

          {hasHealth ? (
            <CheckCircle size={32} />
          ) : (
            <AlertTriangle size={32} />
          )}

        </div>

        <div>

          <h2>
            Monitoring Status
          </h2>

          <p>
            {hasHealth
              ? "The patient's latest health reading is available for monitoring."
              : "No recent health reading is available."}
          </p>

        </div>

      </section>


      {/* ======================================================
          RECENT SYMPTOM CHECK-INS
      ====================================================== */}

      <section>

        <div className="section-title-row">

          <div>

            <h2>Recent Symptom Check-ins</h2>

            <p>
              Latest updates reported by the patient
            </p>

          </div>

        </div>


        {symptoms.length === 0 ? (

          <div className="caregiver-empty">

            <CheckCircle size={35} />

            <h3>No symptom check-ins yet</h3>

            <p>
              The patient has not submitted a daily check-in.
            </p>

          </div>

        ) : (

          <div className="caregiver-list">

            {symptoms.map((symptom, index) => (

              <div
                className="caregiver-list-card"
                key={index}
              >

                <div className="caregiver-list-header">

                  <div>

                    <h3>
                      Feeling: {symptom.feeling}
                    </h3>

                    <p>
                      {new Date(
                        symptom.created_at
                      ).toLocaleString()}
                    </p>

                  </div>

                  <span
                    className={`severity-badge ${
                      symptom.severity?.toLowerCase()
                    }`}
                  >
                    {symptom.severity}
                  </span>

                </div>

                <div className="caregiver-detail">

                  <strong>
                    Symptoms:
                  </strong>

                  <span>
                    {symptom.symptoms}
                  </span>

                </div>

                {symptom.notes && (
                  <div className="caregiver-detail">

                    <strong>
                      Notes:
                    </strong>

                    <span>
                      {symptom.notes}
                    </span>

                  </div>
                )}

              </div>

            ))}

          </div>

        )}

      </section>


      {/* ======================================================
          MEDICATION STATUS
      ====================================================== */}

      <section>

        <div className="section-title-row">

          <div>

            <h2>Medication Status</h2>

            <p>
              Patient's medicine schedule and adherence
            </p>

          </div>

        </div>


        {medicines.length === 0 ? (

          <div className="caregiver-empty">

            <Pill size={35} />

            <h3>No medicines added</h3>

            <p>
              Add medicines from the patient dashboard.
            </p>

          </div>

        ) : (

          <div className="caregiver-medicine-list">

            {medicines.map((medicine) => (

              <div
                className="caregiver-medicine-card"
                key={medicine.id}
              >

                <div className="caregiver-medicine-icon">
                  <Pill size={28} />
                </div>

                <div className="caregiver-medicine-info">

                  <h3>
                    {medicine.medicine_name}
                  </h3>

                  <p>
                    {medicine.dosage} •{" "}
                    {medicine.time}
                  </p>

                  <small>
                    {medicine.frequency}
                  </small>

                </div>

                <span
                  className={`medicine-status ${medicine.status?.toLowerCase()}`}
                >
                  {medicine.status}
                </span>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* ======================================================
          QUICK ACTIONS
      ====================================================== */}

      <section>

        <div className="section-title-row">

          <div>

            <h2>Caregiver Actions</h2>

            <p>
              Quickly access important patient information
            </p>

          </div>

        </div>


        <div className="caregiver-actions">

          <button
            onClick={() => navigate("/health-history")}
          >

            <Activity size={26} />

            <strong>
              View Health History
            </strong>

            <p>
              Review previous health readings and trends
            </p>

          </button>


          <button
            onClick={() => navigate("/medicines")}
          >

            <Pill size={28} />

            <span>
              Manage Medicines
            </span>

          </button>


          <button
            onClick={() => navigate("/symptoms")}
          >

            <Heart size={28} />

            <span>
              View Daily Check-ins
            </span>

          </button>

        </div>

      </section>


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="footer">

        <p>
          CARE360 • Caregiver Dashboard
        </p>

        <p>
          Helping families care for their loved ones
        </p>

      </footer>

    </div>
  );
}

export default Caregiver;