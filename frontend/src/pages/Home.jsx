import { useEffect, useState } from "react";
import axios from "axios";
import {
  Heart,
  Pill,
  Droplets,
  Calendar,
  AlertTriangle,
  Volume2,
  ChevronRight,
  Activity,
  UserRound,
  Settings,
  Brain,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const [healthData, setHealthData] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // ============================================================
  // VOICE ASSISTANCE
  // ============================================================

  const speak = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const speech = new SpeechSynthesisUtterance(text);
      speech.rate = 0.9;
      speech.pitch = 1;

      window.speechSynthesis.speak(speech);
    }
  };

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

      if (!loggedInUser.patient_id) {
        console.error("Patient ID not found.");
        localStorage.removeItem("care360_user");
        navigate("/login");
        return null;
      }

      setUser(loggedInUser);

      return loggedInUser;
    } catch (error) {
      console.error("Invalid login data:", error);

      localStorage.removeItem("care360_user");
      navigate("/login");

      return null;
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem("care360_user");
    setUser(null);
    navigate("/login");
  };

  // ============================================================
  // FETCH LATEST HEALTH DATA + AI ANALYSIS
  // ============================================================

  const fetchHealthData = async () => {
    try {
      setLoading(true);

      const loggedInUser = getLoggedInUser();

      if (!loggedInUser) {
        return;
      }

      const patientId = loggedInUser.patient_id;

      const [healthResponse, aiResponse] = await Promise.all([
        axios.get(
          `${API_URL}/health/${patientId}/latest`
        ),

        axios.get(
          `${API_URL}/health/${patientId}/analysis`
        )
      ]);

      console.log("Latest Health:", healthResponse.data);
      console.log("AI Analysis:", aiResponse.data);

      setHealthData(healthResponse.data);
      setAiData(aiResponse.data);

    } catch (error) {
      console.error(
        "Unable to fetch health information:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  // ============================================================
  // HEALTH STATUS
  // ============================================================

  const getVitalStatus = (type, value) => {
    if (value === undefined || value === null) {
      return "Unknown";
    }

    if (type === "heartRate") {
      return value >= 50 && value <= 120
        ? "Normal"
        : "Attention";
    }

    if (type === "spo2") {
      return value >= 92
        ? "Normal"
        : "Attention";
    }

    if (type === "systolic") {
      return value >= 90 && value <= 160
        ? "Normal"
        : "Attention";
    }

    if (type === "diastolic") {
      return value >= 60 && value <= 100
        ? "Normal"
        : "Attention";
    }

    if (type === "temperature") {
      return value >= 95 && value <= 100.4
        ? "Normal"
        : "Attention";
    }

    return "Unknown";
  };

  // ============================================================
  // AI STATUS
  // ============================================================

  const rawAiStatus = aiData?.analysis?.status;

  const aiStatus =
    typeof rawAiStatus === "object"
      ? rawAiStatus?.type || "no_data"
      : rawAiStatus || "no_data";


  // ============================================================
  // AI SUMMARY
  // ============================================================

  const rawAiSummary = aiData?.analysis?.summary;

  const aiSummary =
    typeof rawAiSummary === "object"
      ? rawAiSummary?.message ||
        "No health analysis available yet."
      : rawAiSummary ||
        "No health analysis available yet.";

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loading) {
    return (
      <div className="page">

        <div className="loading-screen">

          <Activity size={40} />

          <h2>
            Loading your health information...
          </h2>

          <p>
            Please wait a moment.
          </p>

        </div>

      </div>
    );
  }

  // ============================================================
  // HEALTH VALUES
  // ============================================================

  const heartRate = healthData?.heart_rate;
  const spo2 = healthData?.spo2;
  const systolic = healthData?.systolic_bp;
  const diastolic = healthData?.diastolic_bp;
  const temperature = healthData?.temperature;

  // ============================================================
  // USER INFORMATION
  // ============================================================

  const patientName = user?.name || "Patient";

  const firstName =
    patientName.split(" ")[0] || "Patient";

  const patientId =
    user?.patient_id || "";

  return (
    <div className="page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="main-header">

        <div className="brand">

          <img
            src="/care360-logo.png"
            alt="CARE360 Logo"
            className="care360-logo"
          />

          <div>

            <h1>
              CARE360
            </h1>

            <span>
              Your Health Companion
            </span>

          </div>

        </div>


        <div className="header-actions">

          <button
            className="voice-button"
            onClick={() =>
              speak(
                `Welcome to CARE360, ${firstName}. Your health information is ready.`
              )
            }
          >

            <Volume2 size={24} />

            <span>
              Voice Help
            </span>

          </button>


          <button
            className="profile-button"
            onClick={() =>
              speak(
                `Your profile. Patient name is ${patientName}. Patient ID is ${patientId}.`
              )
            }
          >

            <UserRound size={28} />

          </button>

          <button
            className="login-register-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* ======================================================
          WELCOME
      ====================================================== */}

      <section className="welcome-section">

        <div>

          <p className="welcome-label">
            Good Morning
          </p>

          <h2>
            {firstName} 👋
          </h2>

          <p>
            How are you feeling today?
          </p>

          <p>
            Patient ID: <strong>{patientId}</strong>
          </p>

        </div>


        <div className="feeling-buttons">

          <button
            onClick={() =>
              speak(
                "You are feeling good today."
              )
            }
          >

            😊

            <span>
              Good
            </span>

          </button>


          <button
            onClick={() =>
              speak(
                "You are feeling okay today."
              )
            }
          >

            😐

            <span>
              Okay
            </span>

          </button>


          <button
            onClick={() =>
              speak(
                "You are not feeling well today."
              )
            }
          >

            😟

            <span>
              Not Well
            </span>

          </button>

        </div>

      </section>


      {/* ======================================================
          HEALTH MONITORING
      ====================================================== */}

      <section>

        <div className="section-title-row">

          <div>

            <h2>
              Health Monitoring
            </h2>

            <p>
              Your latest health readings
            </p>

          </div>


          <button
            className="refresh-button"
            onClick={fetchHealthData}
          >

            <Activity size={22} />

            Refresh

          </button>

        </div>


        <div className="health-cards">

          {/* HEART RATE */}

          <div className="health-card">

            <div className="health-card-icon heart-icon">
              ❤️
            </div>

            <div>

              <p>
                Heart Rate
              </p>

              <h3>
                {heartRate ?? "--"}{" "}
                <span>
                  BPM
                </span>
              </h3>

              <small
                className={
                  getVitalStatus(
                    "heartRate",
                    heartRate
                  ) === "Normal"
                    ? "status-normal"
                    : "status-attention"
                }
              >

                ●{" "}

                {getVitalStatus(
                  "heartRate",
                  heartRate
                )}

              </small>

            </div>

          </div>


          {/* OXYGEN */}

          <div className="health-card">

            <div className="health-card-icon oxygen-icon">
              🫁
            </div>

            <div>

              <p>
                Oxygen Level
              </p>

              <h3>
                {spo2 ?? "--"}{" "}
                <span>
                  %
                </span>
              </h3>

              <small
                className={
                  getVitalStatus(
                    "spo2",
                    spo2
                  ) === "Normal"
                    ? "status-normal"
                    : "status-attention"
                }
              >

                ●{" "}

                {getVitalStatus(
                  "spo2",
                  spo2
                )}

              </small>

            </div>

          </div>


          {/* BLOOD PRESSURE */}

          <div className="health-card">

            <div className="health-card-icon bp-icon">
              🩺
            </div>

            <div>

              <p>
                Blood Pressure
              </p>

              <h3>
                {systolic ?? "--"} /{" "}
                {diastolic ?? "--"}
              </h3>

              <small
                className={
                  getVitalStatus(
                    "systolic",
                    systolic
                  ) === "Normal" &&
                  getVitalStatus(
                    "diastolic",
                    diastolic
                  ) === "Normal"
                    ? "status-normal"
                    : "status-attention"
                }
              >

                ●{" "}

                {getVitalStatus(
                  "systolic",
                  systolic
                ) === "Normal" &&
                getVitalStatus(
                  "diastolic",
                  diastolic
                ) === "Normal"
                  ? "Normal"
                  : "Attention"}

              </small>

            </div>

          </div>


          {/* TEMPERATURE */}

          <div className="health-card">

            <div className="health-card-icon temp-icon">
              🌡️
            </div>

            <div>

              <p>
                Temperature
              </p>

              <h3>
                {temperature ?? "--"}{" "}
                <span>
                  °F
                </span>
              </h3>

              <small
                className={
                  getVitalStatus(
                    "temperature",
                    temperature
                  ) === "Normal"
                    ? "status-normal"
                    : "status-attention"
                }
              >

                ●{" "}

                {getVitalStatus(
                  "temperature",
                  temperature
                )}

              </small>

            </div>

          </div>

        </div>


        {/* ADD READING */}

        <button
          className="primary-action"
          onClick={() =>
            navigate("/health")
          }
        >

          <Activity size={24} />

          Add Health Reading

          <ChevronRight size={24} />

        </button>

      </section>


      {/* ======================================================
          AI HEALTH MONITOR
      ====================================================== */}

      <section className="home-ai-card">

        <div className="home-ai-header">

          <div className="home-ai-title">

            <div className="home-ai-icon">
              <Brain size={30} />
            </div>

            <div>

              <h2>
                CARE360 AI Health Monitor
              </h2>

              <p>
                AI-assisted monitoring of your latest reading
              </p>

            </div>

          </div>

        </div>


        <div
          className={
            aiStatus === "normal"
              ? "home-ai-status home-ai-normal"
              : aiStatus === "attention"
              ? "home-ai-status home-ai-attention"
              : "home-ai-status"
          }
        >

          {aiStatus === "normal" ? (
            <CheckCircle size={30} />
          ) : (
            <AlertTriangle size={30} />
          )}


          <div>

            <h3>

              {aiStatus === "normal"
                ? "Normal Monitoring Status"
                : aiStatus === "attention"
                ? "Attention Needed"
                : "No Analysis Available"}

            </h3>


            <p>
              {aiSummary}
            </p>

          </div>

        </div>


        {aiData?.analysis?.alerts?.length > 0 && (

          <div className="home-ai-alerts">

            <h3>
              Monitoring Alerts
            </h3>


            {aiData.analysis.alerts.map(
              (alert, index) => (

                <div
                  className="home-ai-alert"
                  key={index}
                >

                  <AlertTriangle size={20} />

                  <span>

                    {typeof alert === "object"
                      ? alert.message
                      : alert}

                  </span>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* ======================================================
          TODAY'S CARE
      ====================================================== */}

      <section>

        <div className="section-title-row">

          <div>

            <h2>
              Today's Care
            </h2>

            <p>
              Don't forget these important tasks
            </p>

          </div>

        </div>


        <div className="care-grid">

          {/* MEDICINES */}

          <button
            className="care-card"
            onClick={() =>
              navigate("/medicines")
            }
          >

            <div className="care-icon medicine-icon">

              <Pill size={30} />

            </div>

            <div>

              <h3>
                Medicines
              </h3>

              <p>
                Check today's medicines
              </p>

            </div>

            <ChevronRight size={25} />

          </button>


          {/* WATER */}

          <button
            className="care-card"
            onClick={() =>
              speak(
                "Remember to drink enough water today."
              )
            }
          >

            <div className="care-icon water-icon">

              <Droplets size={30} />

            </div>

            <div>

              <h3>
                Drink Water
              </h3>

              <p>
                Stay hydrated today
              </p>

            </div>

            <ChevronRight size={25} />

          </button>


          {/* APPOINTMENTS */}

          <button
            className="care-card"
            onClick={() =>
              navigate("/appointments")
            }
          >

            <div className="care-icon appointment-icon">

              <Calendar size={30} />

            </div>

            <div>

              <h3>
                Appointments
              </h3>

              <p>
                Check upcoming visits
              </p>

            </div>

            <ChevronRight size={25} />

          </button>

        </div>

      </section>


      {/* ======================================================
          HEALTH ALERTS
      ====================================================== */}

      <section className="alert-card">

        <div className="alert-icon">

          <AlertTriangle size={30} />

        </div>


        <div>

          <h3>
            Health Alerts
          </h3>


          {aiStatus === "attention" ? (

            <p>
              CARE360 detected one or more readings
              that require attention.
            </p>

          ) : (

            <p>
              No active monitoring alerts.
              Your latest reading does not show an
              unusual pattern.
            </p>

          )}

        </div>


        <button
          onClick={() =>
            navigate("/health")
          }
        >

          View Health

          <ChevronRight size={22} />

        </button>

      </section>


      {/* ======================================================
          QUICK ACCESS
      ====================================================== */}

      <section>

        <div className="section-title-row">

          <div>

            <h2>
              Quick Access
            </h2>

          </div>

        </div>


        <div className="quick-grid">

          {/* DAILY CHECK-IN */}

          <button
            onClick={() =>
              navigate("/symptoms")
            }
          >

            <span
              style={{
                fontSize: "32px"
              }}
            >
              😊
            </span>

            <span>
              Daily Check-in
            </span>

          </button>


          {/* VOICE ASSISTANCE */}

          <button
            onClick={() =>
              speak(
                "Voice assistance is available. You can use the Voice Help button to hear information."
              )
            }
          >

            <Volume2 size={28} />

            <span>
              Voice Assistance
            </span>

          </button>


          {/* ACCESSIBILITY */}

          <button
            className="accessibility-toggle"
            aria-label="Accessibility options"
            onClick={() =>
              speak(
                "Accessibility options can make CARE360 easier to use."
              )
            }
          >

            <Settings size={28} />

            <span>
              Accessibility
            </span>

          </button>


          {/* CAREGIVER */}

          <button
            onClick={() =>
              navigate("/caregiver")
            }
          >

            <UserRound size={28} />

            <span>
              Caregiver
            </span>

          </button>

        </div>

      </section>


      {/* ======================================================
          SOS
      ====================================================== */}

      <section className="sos-section">

        <button
          className="sos-button"
          onClick={() =>
            navigate("/emergency")
          }
        >

          🆘

          <span>
            Emergency / SOS
          </span>

        </button>

        <p>
          Use this button when you need emergency assistance.
        </p>

      </section>


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="footer">

        <p>
          CARE360 • Remote Patient Monitoring
        </p>

        <p>
          Helping families care for their loved ones
        </p>

      </footer>

    </div>
  );
}

export default Home;