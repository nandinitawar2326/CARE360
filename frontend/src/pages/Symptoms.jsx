import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  HeartPulse,
  Save,
  CheckCircle,
  CalendarDays
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Symptoms() {
  const navigate = useNavigate();

  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    feeling: "",
    symptoms: "",
    severity: "None",
    notes: ""
  });

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
  // FETCH PREVIOUS CHECK-INS
  // ============================================================

  const fetchCheckins = async () => {
    try {
      setLoading(true);

      const storedUser =
        localStorage.getItem("care360_user");

      if (!storedUser) {
        navigate("/login");
        return;
      }

      const loggedInUser = JSON.parse(storedUser);

      if (!loggedInUser.patient_id) {
        navigate("/login");
        return;
      }

      setUser(loggedInUser);

      const response = await axios.get(
        `${API_URL}/symptoms/${loggedInUser.patient_id}`
      );

      setCheckins(response.data);

    } catch (error) {
      console.error("Error fetching check-ins:", error);

      setMessage(
        "Unable to load previous check-ins."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLoggedInUser();
    fetchCheckins();
  }, []);

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));

    setMessage("");
  };

  // ============================================================
  // SAVE CHECK-IN
  // ============================================================

  const saveCheckin = async (event) => {
    event.preventDefault();

    if (!form.feeling) {
      setMessage(
        "Please select how you are feeling."
      );
      return;
    }

    if (!form.symptoms) {
      setMessage(
        "Please select your symptoms."
      );
      return;
    }

    const storedUser =
      localStorage.getItem("care360_user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    let loggedInUser;

    try {
      loggedInUser = JSON.parse(storedUser);
    } catch (error) {
      console.error("Invalid user data:", error);
      navigate("/login");
      return;
    }

    if (!loggedInUser.patient_id) {
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/symptoms`,
        {
          patient_id: loggedInUser.patient_id,
          feeling: form.feeling,
          symptoms: form.symptoms,
          severity: form.severity,
          notes: form.notes
        }
      );

      setMessage(
        "✓ Daily check-in saved successfully!"
      );

      setForm({
        feeling: "",
        symptoms: "",
        severity: "None",
        notes: ""
      });

      await fetchCheckins();

    } catch (error) {
      console.error(
        "Error saving check-in:",
        error
      );

      setMessage(
        "Unable to save check-in. Please check the CARE360 server."
      );
    }
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    return date.toLocaleString();
  };

  // ============================================================
  // USER INFORMATION
  // ============================================================

  const patientName =
    user?.name || "Patient";

  const patientAge =
    user?.age || "--";

  const patientId =
    user?.patient_id || "--";

  return (
    <div className="page">

      {/* ======================================================
          HEADER
          ====================================================== */}

      <header className="page-header">

        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={26} />
          <span>Back</span>
        </button>

        <div className="page-title">

          <HeartPulse size={34} />

          <h1>Daily Check-in</h1>

        </div>

      </header>


      {/* ======================================================
          PATIENT
          ====================================================== */}

      <section className="patient-banner">

        <div className="patient-avatar">
          👴
        </div>

        <div>

          <h2>{patientName}</h2>

          <p>
            Age {patientAge} • Patient ID: {patientId}
          </p>

        </div>

      </section>


      {/* ======================================================
          INTRODUCTION
          ====================================================== */}

      <section className="symptom-intro">

        <div className="symptom-intro-icon">
          ❤️
        </div>

        <div>

          <h2>
            How are you feeling today?
          </h2>

          <p>
            Tell CARE360 how you feel so your
            health journey can be monitored.
          </p>

        </div>

      </section>


      {/* ======================================================
          CHECK-IN FORM
          ====================================================== */}

      <section className="symptom-form-card">

        <div className="section-heading">

          <div className="section-icon">
            <HeartPulse size={30} />
          </div>

          <div>

            <h2>
              Today's Health Check-in
            </h2>

            <p>
              Please answer the questions below
            </p>

          </div>

        </div>


        <form onSubmit={saveCheckin}>

          {/* ==================================================
              FEELING
              ================================================== */}

          <div className="form-group">

            <label>
              😊 How are you feeling?
            </label>

            <div className="feeling-options">

              <button
                type="button"
                className={
                  form.feeling === "Very Good"
                    ? "feeling-option selected"
                    : "feeling-option"
                }
                onClick={() =>
                  setForm((previous) => ({
                    ...previous,
                    feeling: "Very Good"
                  }))
                }
              >
                😄
                <span>Very Good</span>
              </button>


              <button
                type="button"
                className={
                  form.feeling === "Good"
                    ? "feeling-option selected"
                    : "feeling-option"
                }
                onClick={() =>
                  setForm((previous) => ({
                    ...previous,
                    feeling: "Good"
                  }))
                }
              >
                🙂
                <span>Good</span>
              </button>


              <button
                type="button"
                className={
                  form.feeling === "Okay"
                    ? "feeling-option selected"
                    : "feeling-option"
                }
                onClick={() =>
                  setForm((previous) => ({
                    ...previous,
                    feeling: "Okay"
                  }))
                }
              >
                😐
                <span>Okay</span>
              </button>


              <button
                type="button"
                className={
                  form.feeling === "Not Good"
                    ? "feeling-option selected"
                    : "feeling-option"
                }
                onClick={() =>
                  setForm((previous) => ({
                    ...previous,
                    feeling: "Not Good"
                  }))
                }
              >
                😟
                <span>Not Good</span>
              </button>


              <button
                type="button"
                className={
                  form.feeling === "Very Bad"
                    ? "feeling-option selected"
                    : "feeling-option"
                }
                onClick={() =>
                  setForm((previous) => ({
                    ...previous,
                    feeling: "Very Bad"
                  }))
                }
              >
                😞
                <span>Very Bad</span>
              </button>

            </div>

          </div>


          {/* ==================================================
              SYMPTOMS
              ================================================== */}

          <div className="form-group">

            <label htmlFor="symptoms">
              🤒 What symptoms are you experiencing?
            </label>

            <select
              id="symptoms"
              name="symptoms"
              value={form.symptoms}
              onChange={handleChange}
            >

              <option value="">
                Select a symptom
              </option>

              <option value="None">
                None
              </option>

              <option value="Headache">
                Headache
              </option>

              <option value="Dizziness">
                Dizziness
              </option>

              <option value="Fatigue">
                Fatigue
              </option>

              <option value="Cough">
                Cough
              </option>

              <option value="Breathing Difficulty">
                Breathing Difficulty
              </option>

              <option value="Chest Discomfort">
                Chest Discomfort
              </option>

              <option value="Nausea">
                Nausea
              </option>

              <option value="Body Pain">
                Body Pain
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          {/* ==================================================
              SEVERITY
              ================================================== */}

          <div className="form-group">

            <label htmlFor="severity">
              📊 Symptom Severity
            </label>

            <select
              id="severity"
              name="severity"
              value={form.severity}
              onChange={handleChange}
            >

              <option value="None">
                None
              </option>

              <option value="Mild">
                Mild
              </option>

              <option value="Moderate">
                Moderate
              </option>

              <option value="Severe">
                Severe
              </option>

            </select>

          </div>


          {/* ==================================================
              NOTES
              ================================================== */}

          <div className="form-group">

            <label htmlFor="notes">
              📝 Additional Notes
            </label>

            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Tell us anything else you would like to record..."
              rows="5"
            />

          </div>


          {/* ==================================================
              MESSAGE
              ================================================== */}

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


          {/* ==================================================
              SAVE
              ================================================== */}

          <button
            type="submit"
            className="save-button"
          >

            <Save size={26} />

            Save Today's Check-in

          </button>

        </form>

      </section>


      {/* ======================================================
          PREVIOUS CHECK-INS
          ====================================================== */}

      <section className="checkin-history">

        <div className="section-heading">

          <div className="section-icon">
            <CalendarDays size={30} />
          </div>

          <div>

            <h2>
              Previous Check-ins
            </h2>

            <p>
              Your recent symptom history
            </p>

          </div>

        </div>


        {loading ? (

          <div className="checkin-empty">
            Loading check-ins...
          </div>

        ) : checkins.length === 0 ? (

          <div className="checkin-empty">

            <HeartPulse size={40} />

            <h3>
              No check-ins yet
            </h3>

            <p>
              Your saved daily check-ins
              will appear here.
            </p>

          </div>

        ) : (

          <div className="checkin-list">

            {checkins.map((checkin) => (

              <div
                className="checkin-card"
                key={checkin.id}
              >

                <div className="checkin-header">

                  <div>

                    <h3>

                      {checkin.feeling === "Very Good" && "😄"}
                      {checkin.feeling === "Good" && "🙂"}
                      {checkin.feeling === "Okay" && "😐"}
                      {checkin.feeling === "Not Good" && "😟"}
                      {checkin.feeling === "Very Bad" && "😞"}

                      {" "}

                      {checkin.feeling}

                    </h3>

                    <p>
                      {formatDate(
                        checkin.created_at
                      )}
                    </p>

                  </div>


                  <div
                    className={`severity-badge ${checkin.severity
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {checkin.severity}
                  </div>

                </div>


                <div className="checkin-details">

                  <p>

                    <strong>
                      Symptoms:
                    </strong>{" "}

                    {checkin.symptoms}

                  </p>


                  {checkin.notes && (

                    <p>

                      <strong>
                        Notes:
                      </strong>{" "}

                      {checkin.notes}

                    </p>

                  )}

                </div>


                <div className="checkin-saved">

                  <CheckCircle size={20} />

                  Check-in saved

                </div>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* ======================================================
          SAFETY NOTE
          ====================================================== */}

      <section className="safety-note">

        <div className="safety-icon">
          ℹ️
        </div>

        <div>

          <h3>
            Important Information
          </h3>

          <p>
            This check-in is designed to help
            track how you feel over time.
          </p>

          <p>
            It does not provide a medical diagnosis.
            If you have serious or worsening symptoms,
            contact a healthcare professional.
          </p>

        </div>

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

export default Symptoms;