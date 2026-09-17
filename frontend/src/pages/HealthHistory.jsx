import { useEffect, useState } from "react";
import axios from "axios";

import {
  ArrowLeft,
  Heart,
  Activity,
  Thermometer,
  Droplets,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function HealthHistory() {
  const navigate = useNavigate();

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
  // HEALTH HISTORY
  // ============================================================

  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH HEALTH HISTORY
  // ============================================================

  const fetchHistory = async () => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/health/${patientId}/history`
      );

      setReadings(response.data);

    } catch (err) {
      console.error(err);
      setError("Unable to load health history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchHistory();
    }
  }, [patientId]);

  // ============================================================
  // CHECK READING STATUS
  // ============================================================

  const getStatus = (reading) => {
    const issues = [];

    if (
      reading.heart_rate < 50 ||
      reading.heart_rate > 120
    ) {
      issues.push("Heart rate");
    }

    if (reading.spo2 < 92) {
      issues.push("Oxygen");
    }

    if (
      reading.systolic_bp < 90 ||
      reading.systolic_bp > 160 ||
      reading.diastolic_bp < 60 ||
      reading.diastolic_bp > 100
    ) {
      issues.push("Blood pressure");
    }

    if (
      reading.temperature < 95 ||
      reading.temperature > 100.4
    ) {
      issues.push("Temperature");
    }

    return issues;
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // ============================================================
  // CHART DATA
  // ============================================================

  const chartData = [...readings]
    .reverse()
    .map((reading, index) => ({
      name: `Reading ${index + 1}`,
      heart_rate: Number(reading.heart_rate),
      spo2: Number(reading.spo2),
      systolic: Number(reading.systolic_bp),
      diastolic: Number(reading.diastolic_bp),
      temperature: Number(reading.temperature)
    }));

  // ============================================================
  // SUMMARY COUNTS
  // ============================================================

  const normalReadings = readings.filter(
    (reading) => getStatus(reading).length === 0
  ).length;

  const attentionReadings = readings.filter(
    (reading) => getStatus(reading).length > 0
  ).length;

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="app-container">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="page-header">

        <div>
          <h1>Health History</h1>

          <p>
            Review {user?.name || "patient"}'s previous health readings
          </p>
        </div>

        <button
          className="header-action"
          onClick={fetchHistory}
        >
          <RefreshCw size={20} />
          Refresh
        </button>

      </header>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="page-content">

        {/* BACK BUTTON */}

        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>


        {/* ERROR */}

        {error && (
          <div className="caregiver-error">

            <AlertTriangle size={24} />

            <p>{error}</p>

          </div>
        )}


        {/* ====================================================
            INTRO
        ==================================================== */}

        <section className="history-intro">

          <div className="history-intro-icon">
            <Activity size={38} />
          </div>

          <div>

            <h2>Patient Health Trends</h2>

            <p>
              Previous readings help caregivers monitor
              changes in the patient's health over time.
            </p>

          </div>

        </section>


        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading ? (

          <div className="history-empty">

            <RefreshCw size={35} />

            <h3>
              Loading health history...
            </h3>

            <p>
              Please wait.
            </p>

          </div>

        ) : readings.length === 0 ? (

          /* ==================================================
             NO READINGS
          ================================================== */

          <div className="history-empty">

            <Activity size={40} />

            <h3>
              No Health Readings Yet
            </h3>

            <p>
              Add a health reading to start tracking
              patient trends.
            </p>

            <button
              className="primary-action"
              onClick={() => navigate("/health")}
            >
              Add Health Reading
            </button>

          </div>

        ) : (

          <>

            {/* =================================================
                SUMMARY
            ================================================= */}

            <section className="history-summary-grid">

              {/* TOTAL */}

              <div className="history-summary-card">

                <Heart size={30} />

                <div>

                  <p>Total Readings</p>

                  <h3>
                    {readings.length}
                  </h3>

                </div>

              </div>


              {/* NORMAL */}

              <div className="history-summary-card">

                <CheckCircle size={30} />

                <div>

                  <p>Normal Readings</p>

                  <h3>
                    {normalReadings}
                  </h3>

                </div>

              </div>


              {/* ATTENTION */}

              <div className="history-summary-card">

                <AlertTriangle size={30} />

                <div>

                  <p>Attention Needed</p>

                  <h3>
                    {attentionReadings}
                  </h3>

                </div>

              </div>

            </section>


            {/* =================================================
                HEALTH TRENDS
            ================================================= */}

            <section className="trends-section">

              <div className="section-heading">

                <h2>
                  Health Trends
                </h2>

                <p>
                  Track changes in vital signs over
                  recent readings
                </p>

              </div>


              <div className="trend-grid">


                {/* =================================================
                    HEART RATE CHART
                ================================================= */}

                <div className="trend-card">

                  <div className="trend-header">

                    <div className="trend-icon">
                      <Heart size={25} />
                    </div>

                    <div>

                      <h3>
                        Heart Rate
                      </h3>

                      <p>
                        Beats per minute
                      </p>

                    </div>

                  </div>


                  <ResponsiveContainer
                    width="100%"
                    height={250}
                  >

                    <LineChart data={chartData}>

                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="name"
                      />

                      <YAxis />

                      <Tooltip />

                      <Line
                        type="monotone"
                        dataKey="heart_rate"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        name="Heart Rate"
                      />

                    </LineChart>

                  </ResponsiveContainer>

                </div>


                {/* =================================================
                    SPO2 CHART
                ================================================= */}

                <div className="trend-card">

                  <div className="trend-header">

                    <div className="trend-icon">
                      <Droplets size={25} />
                    </div>

                    <div>

                      <h3>
                        Oxygen Level
                      </h3>

                      <p>
                        SpO₂ percentage
                      </p>

                    </div>

                  </div>


                  <ResponsiveContainer
                    width="100%"
                    height={250}
                  >

                    <LineChart data={chartData}>

                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="name"
                      />

                      <YAxis />

                      <Tooltip />

                      <Line
                        type="monotone"
                        dataKey="spo2"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        name="SpO₂"
                      />

                    </LineChart>

                  </ResponsiveContainer>

                </div>


                {/* =================================================
                    BLOOD PRESSURE CHART
                ================================================= */}

                <div className="trend-card">

                  <div className="trend-header">

                    <div className="trend-icon">
                      <Activity size={25} />
                    </div>

                    <div>

                      <h3>
                        Blood Pressure
                      </h3>

                      <p>
                        Systolic / Diastolic
                      </p>

                    </div>

                  </div>


                  <ResponsiveContainer
                    width="100%"
                    height={250}
                  >

                    <LineChart data={chartData}>

                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="name"
                      />

                      <YAxis />

                      <Tooltip />

                      <Line
                        type="monotone"
                        dataKey="systolic"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        name="Systolic"
                      />

                      <Line
                        type="monotone"
                        dataKey="diastolic"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        name="Diastolic"
                      />

                    </LineChart>

                  </ResponsiveContainer>

                </div>


                {/* =================================================
                    TEMPERATURE CHART
                ================================================= */}

                <div className="trend-card">

                  <div className="trend-header">

                    <div className="trend-icon">
                      <Thermometer size={25} />
                    </div>

                    <div>

                      <h3>
                        Temperature
                      </h3>

                      <p>
                        Degrees Fahrenheit
                      </p>

                    </div>

                  </div>


                  <ResponsiveContainer
                    width="100%"
                    height={250}
                  >

                    <LineChart data={chartData}>

                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="name"
                      />

                      <YAxis />

                      <Tooltip />

                      <Line
                        type="monotone"
                        dataKey="temperature"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        name="Temperature"
                      />

                    </LineChart>

                  </ResponsiveContainer>

                </div>

              </div>

            </section>


            {/* =================================================
                PREVIOUS READINGS
            ================================================= */}

            <section className="history-section">

              <div className="section-heading">

                <div>

                  <h2>
                    Previous Readings
                  </h2>

                  <p>
                    Most recent health measurements
                  </p>

                </div>

              </div>


              <div className="history-list">

                {readings.map((reading) => {

                  const issues = getStatus(reading);

                  const isNormal =
                    issues.length === 0;

                  return (

                    <div
                      className={`history-card ${
                        isNormal
                          ? "history-normal"
                          : "history-attention"
                      }`}
                      key={reading.id}
                    >

                      {/* =========================================
                          CARD HEADER
                      ========================================= */}

                      <div className="history-card-header">

                        <div>

                          <h3>
                            Health Reading #{reading.id}
                          </h3>

                          <p>
                            {formatDate(
                              reading.created_at
                            )}
                          </p>

                        </div>


                        <div
                          className={`history-status ${
                            isNormal
                              ? "status-normal"
                              : "status-attention"
                          }`}
                        >

                          {isNormal ? (

                            <>
                              <CheckCircle size={18} />
                              Normal
                            </>

                          ) : (

                            <>
                              <AlertTriangle size={18} />
                              Attention
                            </>

                          )}

                        </div>

                      </div>


                      {/* =========================================
                          VITALS
                      ========================================= */}

                      <div className="history-vitals">


                        {/* HEART RATE */}

                        <div className="history-vital">

                          <div className="history-vital-icon">
                            <Heart size={25} />
                          </div>

                          <div>

                            <p>
                              Heart Rate
                            </p>

                            <strong>
                              {reading.heart_rate}
                            </strong>

                            <span>
                              {" "}bpm
                            </span>

                          </div>

                        </div>


                        {/* OXYGEN */}

                        <div className="history-vital">

                          <div className="history-vital-icon">
                            <Droplets size={25} />
                          </div>

                          <div>

                            <p>
                              Oxygen
                            </p>

                            <strong>
                              {reading.spo2}
                            </strong>

                            <span>
                              {" "}%
                            </span>

                          </div>

                        </div>


                        {/* BLOOD PRESSURE */}

                        <div className="history-vital">

                          <div className="history-vital-icon">
                            <Activity size={25} />
                          </div>

                          <div>

                            <p>
                              Blood Pressure
                            </p>

                            <strong>
                              {reading.systolic_bp}/
                              {reading.diastolic_bp}
                            </strong>

                            <span>
                              {" "}mmHg
                            </span>

                          </div>

                        </div>


                        {/* TEMPERATURE */}

                        <div className="history-vital">

                          <div className="history-vital-icon">
                            <Thermometer size={25} />
                          </div>

                          <div>

                            <p>
                              Temperature
                            </p>

                            <strong>
                              {reading.temperature}
                            </strong>

                            <span>
                              {" "}°F
                            </span>

                          </div>

                        </div>

                      </div>


                      {/* =========================================
                          ATTENTION ALERT
                      ========================================= */}

                      {!isNormal && (

                        <div className="history-alert">

                          <AlertTriangle size={21} />

                          <div>

                            <strong>
                              Monitoring attention
                            </strong>

                            <p>

                              {issues.join(", ")} reading
                              {issues.length > 1
                                ? "s"
                                : ""}{" "}
                              require attention.

                            </p>

                          </div>

                        </div>

                      )}

                    </div>

                  );

                })}

              </div>

            </section>

          </>

        )}


        {/* ======================================================
            MONITORING NOTE
        ====================================================== */}

        <section className="history-note">

          <AlertTriangle size={25} />

          <div>

            <h3>
              Monitoring Information
            </h3>

            <p>
              CARE360 uses configured monitoring ranges
              to highlight unusual readings. These alerts
              are intended for monitoring support and are
              not a medical diagnosis.
            </p>

          </div>

        </section>

      </main>


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="app-footer">

        <p>
          CARE360 • Remote Patient Monitoring System
        </p>

      </footer>

    </div>
  );
}

export default HealthHistory;