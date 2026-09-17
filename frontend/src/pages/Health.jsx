import { useEffect, useState } from "react";
import axios from "axios";
import {
  Heart,
  Activity,
  Save,
  ArrowLeft,
  Info,
  Brain,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Health() {
  const navigate = useNavigate();
  const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  // ============================================================
  // LOGGED-IN USER
  // ============================================================

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("care360_user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error reading logged-in user:", error);
      }
    }
  }, []);

  const patientId = user?.patient_id;

  // ============================================================
  // HEALTH READING
  // ============================================================

  const [reading, setReading] = useState({
    heartRate: "",
    spo2: "",
    systolic: "",
    diastolic: "",
    temperature: ""
  });

  const [message, setMessage] = useState("");

  // ============================================================
  // AI ANALYSIS
  // ============================================================

  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);

  // ============================================================
  // GET AI HEALTH ANALYSIS
  // ============================================================

  const fetchAnalysis = async () => {
    if (!patientId) {
      setLoadingAnalysis(false);
      return;
    }

    try {
      setLoadingAnalysis(true);

      const response = await axios.get(
        `${API_URL}/health/${patientId}/analysis`
      );

      console.log("AI Analysis:", response.data);

      setAnalysis(response.data);
    } catch (error) {
      console.error("Error fetching AI analysis:", error);
      setAnalysis(null);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // ============================================================
  // LOAD AI ANALYSIS
  // ============================================================

  useEffect(() => {
    if (patientId) {
      fetchAnalysis();
    }
  }, [patientId]);

  // ============================================================
  // HANDLE FORM INPUT
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setReading((previous) => ({
      ...previous,
      [name]: value
    }));

    setMessage("");
  };

  // ============================================================
  // SAVE HEALTH READING
  // ============================================================

  const saveReading = async (event) => {
    event.preventDefault();

    if (
      !reading.heartRate ||
      !reading.spo2 ||
      !reading.systolic ||
      !reading.diastolic ||
      !reading.temperature
    ) {
      setMessage("Please enter all health readings.");
      return;
    }

    if (!patientId) {
      setMessage("Please login before saving health readings.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/health/readings`,
        {
          patient_id: patientId,
          heart_rate: Number(reading.heartRate),
          spo2: Number(reading.spo2),
          systolic_bp: Number(reading.systolic),
          diastolic_bp: Number(reading.diastolic),
          temperature: Number(reading.temperature)
        }
      );

      console.log("Backend response:", response.data);

      setMessage("✓ Health reading saved successfully!");

      setReading({
        heartRate: "",
        spo2: "",
        systolic: "",
        diastolic: "",
        temperature: ""
      });

      // Get fresh AI analysis after saving
      setTimeout(() => {
        fetchAnalysis();
      }, 300);

    } catch (error) {
      console.error("Error saving health reading:", error);

      setMessage(
        "Unable to save reading. Please check that the CARE360 server is running."
      );
    }
  };

  // ============================================================
  // GET ANALYSIS DETAILS
  // ============================================================

  const aiResult = analysis?.analysis;
  const latestReading = analysis?.latest_reading;

  return (
    <div className="page">

      {/* ================= HEADER ================= */}

      <header className="page-header">

        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={26} />
          <span>Back</span>
        </button>

        <div className="page-title">
          <Activity size={34} />
          <h1>My Health</h1>
        </div>

      </header>


      {/* ================= PATIENT BANNER ================= */}

      <section className="patient-banner">

        <div className="patient-avatar">
          👴
        </div>

        <div>
          <h2>
            {user?.name || "Patient"}
          </h2>

          <p>
            Age {user?.age || "--"} • Patient ID:{" "}
            {user?.patient_id || "--"}
          </p>
        </div>

      </section>


      {/* ================= AI HEALTH MONITORING ================= */}

      <section className="ai-monitor-card">

        <div className="ai-monitor-header">

          <div className="ai-monitor-title">

            <div className="ai-icon">
              <Brain size={30} />
            </div>

            <div>
              <h2>CARE360 Health Monitor</h2>

              <p>
                AI-assisted monitoring of your latest reading
              </p>
            </div>

          </div>

          <button
            className="refresh-ai-button"
            onClick={fetchAnalysis}
            disabled={loadingAnalysis}
          >
            <RefreshCw
              size={22}
              className={loadingAnalysis ? "spin" : ""}
            />

            Refresh
          </button>

        </div>


        {/* AI LOADING */}

        {loadingAnalysis && (
          <div className="ai-loading">
            <Activity size={25} />
            <span>Analyzing your latest health reading...</span>
          </div>
        )}


        {/* AI RESULT */}

        {!loadingAnalysis && aiResult && (

          <div className="ai-result">

            <div
              className={
                aiResult.status === "normal"
                  ? "health-status normal-status"
                  : "health-status attention-status"
              }
            >

              {aiResult.status === "normal" ? (
                <CheckCircle size={34} />
              ) : (
                <AlertTriangle size={34} />
              )}

              <div>

                <h3>
                  {aiResult.status === "normal"
                    ? "Normal Monitoring Status"
                    : "Attention Needed"}
                </h3>

                <p>
                  {aiResult.summary}
                </p>

              </div>

            </div>


            {/* ALERTS */}

            {aiResult.alerts &&
              aiResult.alerts.length > 0 && (

                <div className="ai-alert-list">

                  <h3>
                    Monitoring Alerts
                  </h3>

                  {aiResult.alerts.map(
                    (alert, index) => (

                      <div
                        className="ai-alert-item"
                        key={index}
                      >
                        <AlertTriangle size={22} />

                        <span>
                          {alert.message}
                        </span>
                      </div>

                    )
                  )}

                </div>

              )}


            {/* LATEST READING */}

            {latestReading && (

              <div className="latest-reading">

                <h3>
                  Latest Saved Reading
                </h3>

                <div className="latest-reading-grid">

                  <div>
                    <strong>
                      {latestReading.heart_rate}
                    </strong>

                    <span>
                      BPM
                    </span>

                    <small>
                      Heart Rate
                    </small>
                  </div>


                  <div>
                    <strong>
                      {latestReading.spo2}%
                    </strong>

                    <small>
                      Oxygen Level
                    </small>
                  </div>


                  <div>
                    <strong>
                      {latestReading.systolic_bp}/
                      {latestReading.diastolic_bp}
                    </strong>

                    <span>
                      mmHg
                    </span>

                    <small>
                      Blood Pressure
                    </small>
                  </div>


                  <div>
                    <strong>
                      {latestReading.temperature}°F
                    </strong>

                    <small>
                      Temperature
                    </small>
                  </div>

                </div>

              </div>

            )}

          </div>

        )}


        {/* NO DATA */}

        {!loadingAnalysis &&
          analysis?.status === "no_data" && (

            <div className="ai-no-data">

              <Brain size={30} />

              <p>
                No health readings are available yet.
                Save a reading to start monitoring.
              </p>

            </div>

          )}

      </section>


      {/* ================= INFORMATION BOX ================= */}

      <section className="info-box">

        <Info size={28} />

        <div>

          <h3>
            Enter Your Health Readings
          </h3>

          <p>
            Enter your latest health readings below.
            CARE360 will save them securely and help
            monitor changes over time.
          </p>

        </div>

      </section>


      {/* ================= HEALTH FORM ================= */}

      <section className="health-form-card">

        <div className="section-heading">

          <div className="section-icon">
            <Heart size={30} />
          </div>

          <div>

            <h2>
              Today's Health Reading
            </h2>

            <p>
              Enter your current readings
            </p>

          </div>

        </div>


        <form onSubmit={saveReading}>

          {/* HEART RATE */}

          <div className="form-group">

            <label htmlFor="heartRate">
              ❤️ Heart Rate
            </label>

            <div className="input-with-unit">

              <input
                id="heartRate"
                type="number"
                name="heartRate"
                value={reading.heartRate}
                onChange={handleChange}
                placeholder="Example: 78"
                min="30"
                max="220"
              />

              <span>
                BPM
              </span>

            </div>

            <small>
              Beats per minute
            </small>

          </div>


          {/* OXYGEN */}

          <div className="form-group">

            <label htmlFor="spo2">
              🫁 Oxygen Level
            </label>

            <div className="input-with-unit">

              <input
                id="spo2"
                type="number"
                name="spo2"
                value={reading.spo2}
                onChange={handleChange}
                placeholder="Example: 97"
                min="50"
                max="100"
                step="0.1"
              />

              <span>
                %
              </span>

            </div>

            <small>
              Blood oxygen level
            </small>

          </div>


          {/* BLOOD PRESSURE */}

          <div className="form-group">

            <label>
              🩸 Blood Pressure
            </label>

            <div className="blood-pressure-input">

              <div className="input-with-unit">

                <input
                  type="number"
                  name="systolic"
                  value={reading.systolic}
                  onChange={handleChange}
                  placeholder="128"
                  min="50"
                  max="250"
                />

                <span>
                  mmHg
                </span>

              </div>

              <span className="bp-separator">
                /
              </span>

              <div className="input-with-unit">

                <input
                  type="number"
                  name="diastolic"
                  value={reading.diastolic}
                  onChange={handleChange}
                  placeholder="82"
                  min="30"
                  max="150"
                />

                <span>
                  mmHg
                </span>

              </div>

            </div>

            <small>
              Enter systolic / diastolic pressure
            </small>

          </div>


          {/* TEMPERATURE */}

          <div className="form-group">

            <label htmlFor="temperature">
              🌡️ Body Temperature
            </label>

            <div className="input-with-unit">

              <input
                id="temperature"
                type="number"
                name="temperature"
                value={reading.temperature}
                onChange={handleChange}
                placeholder="Example: 98.4"
                min="80"
                max="110"
                step="0.1"
              />

              <span>
                °F
              </span>

            </div>

            <small>
              Enter temperature in Fahrenheit
            </small>

          </div>


          {/* MESSAGE */}

          {message && (

            <div
              className={
                message.startsWith("✓")
                  ? "success-message"
                  : "error-message"
              }
            >
              {message}
            </div>

          )}


          {/* SAVE */}

          <button
            type="submit"
            className="save-button"
          >
            <Save size={26} />

            Save Health Reading
          </button>

        </form>

      </section>


      {/* ================= SAFETY NOTE ================= */}

      <section className="safety-note">

        <div className="safety-icon">
          ℹ️
        </div>

        <div>

          <h3>
            Important Information
          </h3>

          <p>
            CARE360 is designed for health monitoring
            and assistance. It does not replace a doctor
            or provide a medical diagnosis.
          </p>

          <p>
            If you are concerned about a health reading
            or how you are feeling, contact your
            healthcare professional.
          </p>

        </div>

      </section>


      {/* ================= FOOTER ================= */}

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

export default Health;