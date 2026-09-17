import { useEffect, useState } from "react";
import axios from "axios";

import {
  ArrowLeft,
  Calendar,
  Clock,
  UserRound,
  MapPin,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Appointments() {
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
  // APPOINTMENTS
  // ============================================================

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    doctor_name: "",
    appointment_date: "",
    appointment_time: "",
    hospital: "",
    reason: ""
  });

  // ============================================================
  // FETCH APPOINTMENTS
  // ============================================================

  const fetchAppointments = async () => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/appointments/${patientId}`
      );

      setAppointments(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchAppointments();
    }
  }, [patientId]);

  // ============================================================
  // FORM INPUT
  // ============================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ============================================================
  // ADD APPOINTMENT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientId) {
      setError("Please login before adding an appointment.");
      return;
    }

    try {
      setError("");

      await axios.post(
        `${API_URL}/appointments`,
        {
          patient_id: patientId,
          doctor_name: formData.doctor_name,
          appointment_date: formData.appointment_date,
          appointment_time: formData.appointment_time,
          hospital: formData.hospital,
          reason: formData.reason
        }
      );

      setFormData({
        doctor_name: "",
        appointment_date: "",
        appointment_time: "",
        hospital: "",
        reason: ""
      });

      setShowForm(false);

      await fetchAppointments();

    } catch (err) {
      console.error(err);
      setError("Unable to add appointment.");
    }
  };

  // ============================================================
  // UPDATE STATUS
  // ============================================================

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${API_URL}/appointments/${id}/status`,
        {
          status: status
        }
      );

      await fetchAppointments();

    } catch (err) {
      console.error(err);
      setError("Unable to update appointment.");
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const deleteAppointment = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this appointment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/appointments/${id}`
      );

      await fetchAppointments();

    } catch (err) {
      console.error(err);
      setError("Unable to delete appointment.");
    }
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "";

    const formatted = new Date(
      `${date}T00:00:00`
    );

    return formatted.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // ============================================================
  // FORMAT STATUS
  // ============================================================

  const getStatusClass = (status) => {
    if (status === "Completed") {
      return "appointment-status completed";
    }

    if (status === "Cancelled") {
      return "appointment-status cancelled";
    }

    return "appointment-status upcoming";
  };

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
          <h1>Appointments</h1>

          <p>
            Manage {user?.name || "patient"}'s doctor appointments
          </p>
        </div>

        <button
          className="header-action"
          onClick={fetchAppointments}
        >
          <RefreshCw size={20} />
          Refresh
        </button>

      </header>


      <main className="page-content">

        {/* BACK */}

        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>


        {/* ERROR */}

        {error && (
          <div className="appointment-error">

            <AlertTriangle size={24} />

            <p>{error}</p>

          </div>
        )}


        {/* ====================================================
            INTRO
        ==================================================== */}

        <section className="appointment-intro">

          <div className="appointment-intro-icon">
            <Calendar size={38} />
          </div>

          <div>

            <h2>
              Doctor Appointments
            </h2>

            <p>
              Keep track of upcoming medical appointments
              and important visits.
            </p>

          </div>

        </section>


        {/* ====================================================
            ADD BUTTON
        ==================================================== */}

        <div className="appointment-add-wrapper">

          <button
            className="appointment-add-button"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={24} />

            {showForm
              ? "Close Form"
              : "Add New Appointment"}
          </button>

        </div>


        {/* ====================================================
            ADD FORM
        ==================================================== */}

        {showForm && (

          <section className="appointment-form-card">

            <div className="appointment-form-header">

              <div>
                <h2>
                  Add Appointment
                </h2>

                <p>
                  Enter the details of the doctor visit.
                </p>
              </div>

            </div>


            <form onSubmit={handleSubmit}>

              <div className="appointment-form-grid">


                {/* DOCTOR */}

                <div className="appointment-field">

                  <label>
                    Doctor Name
                  </label>

                  <div className="appointment-input-wrapper">

                    <UserRound size={21} />

                    <input
                      type="text"
                      name="doctor_name"
                      value={formData.doctor_name}
                      onChange={handleChange}
                      placeholder="e.g. Dr. Sharma"
                      required
                    />

                  </div>

                </div>


                {/* HOSPITAL */}

                <div className="appointment-field">

                  <label>
                    Hospital / Clinic
                  </label>

                  <div className="appointment-input-wrapper">

                    <MapPin size={21} />

                    <input
                      type="text"
                      name="hospital"
                      value={formData.hospital}
                      onChange={handleChange}
                      placeholder="e.g. City Hospital"
                      required
                    />

                  </div>

                </div>


                {/* DATE */}

                <div className="appointment-field">

                  <label>
                    Appointment Date
                  </label>

                  <div className="appointment-input-wrapper">

                    <Calendar size={21} />

                    <input
                      type="date"
                      name="appointment_date"
                      value={formData.appointment_date}
                      onChange={handleChange}
                      required
                    />

                  </div>

                </div>


                {/* TIME */}

                <div className="appointment-field">

                  <label>
                    Appointment Time
                  </label>

                  <div className="appointment-input-wrapper">

                    <Clock size={21} />

                    <input
                      type="time"
                      name="appointment_time"
                      value={formData.appointment_time}
                      onChange={handleChange}
                      required
                    />

                  </div>

                </div>


                {/* REASON */}

                <div className="appointment-field appointment-full">

                  <label>
                    Reason for Visit
                  </label>

                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="e.g. Routine health check-up"
                    rows="3"
                    required
                  />

                </div>

              </div>


              <div className="appointment-form-actions">

                <button
                  type="button"
                  className="appointment-cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="appointment-save-button"
                >
                  <CheckCircle size={21} />
                  Save Appointment
                </button>

              </div>

            </form>

          </section>

        )}


        {/* ====================================================
            APPOINTMENTS
        ==================================================== */}

        <section className="appointments-section">

          <div className="section-heading">

            <div>

              <h2>
                Your Appointments
              </h2>

              <p>
                Upcoming and previous doctor visits
              </p>

            </div>

          </div>


          {loading ? (

            <div className="appointment-empty">

              <RefreshCw size={35} />

              <h3>
                Loading appointments...
              </h3>

              <p>
                Please wait.
              </p>

            </div>

          ) : appointments.length === 0 ? (

            <div className="appointment-empty">

              <Calendar size={45} />

              <h3>
                No Appointments
              </h3>

              <p>
                Add your first doctor appointment to
                keep track of medical visits.
              </p>

              <button
                className="appointment-empty-button"
                onClick={() => setShowForm(true)}
              >
                <Plus size={20} />
                Add Appointment
              </button>

            </div>

          ) : (

            <div className="appointment-list">

              {appointments.map((appointment) => (

                <div
                  className="appointment-card"
                  key={appointment.id}
                >

                  {/* CARD TOP */}

                  <div className="appointment-card-header">

                    <div className="appointment-doctor">

                      <div className="appointment-doctor-icon">
                        <UserRound size={28} />
                      </div>

                      <div>

                        <h3>
                          {appointment.doctor_name}
                        </h3>

                        <p>
                          {appointment.hospital}
                        </p>

                      </div>

                    </div>


                    <div
                      className={getStatusClass(
                        appointment.status
                      )}
                    >
                      {appointment.status}
                    </div>

                  </div>


                  {/* DATE / TIME */}

                  <div className="appointment-details">

                    <div className="appointment-detail">

                      <Calendar size={22} />

                      <div>

                        <span>
                          Date
                        </span>

                        <strong>
                          {formatDate(
                            appointment.appointment_date
                          )}
                        </strong>

                      </div>

                    </div>


                    <div className="appointment-detail">

                      <Clock size={22} />

                      <div>

                        <span>
                          Time
                        </span>

                        <strong>
                          {appointment.appointment_time}
                        </strong>

                      </div>

                    </div>

                  </div>


                  {/* REASON */}

                  <div className="appointment-reason">

                    <strong>
                      Reason for visit
                    </strong>

                    <p>
                      {appointment.reason}
                    </p>

                  </div>


                  {/* ACTIONS */}

                  {appointment.status === "Upcoming" && (

                    <div className="appointment-actions">

                      <button
                        className="appointment-complete"
                        onClick={() =>
                          updateStatus(
                            appointment.id,
                            "Completed"
                          )
                        }
                      >
                        <CheckCircle size={19} />
                        Mark Completed
                      </button>

                      <button
                        className="appointment-cancel"
                        onClick={() =>
                          updateStatus(
                            appointment.id,
                            "Cancelled"
                          )
                        }
                      >
                        <XCircle size={19} />
                        Cancel
                      </button>

                      <button
                        className="appointment-delete"
                        onClick={() =>
                          deleteAppointment(
                            appointment.id
                          )
                        }
                      >
                        <Trash2 size={19} />
                        Delete
                      </button>

                    </div>

                  )}

                </div>

              ))}

            </div>

          )}

        </section>


        {/* ====================================================
            SAFETY NOTE
        ==================================================== */}

        <section className="appointment-note">

          <AlertTriangle size={25} />

          <div>

            <h3>
              Appointment Reminder
            </h3>

            <p>
              CARE360 helps organize appointment
              information. Always follow the instructions
              provided by your healthcare professional.
            </p>

          </div>

        </section>

      </main>


      <footer className="app-footer">

        <p>
          CARE360 • Remote Patient Monitoring System
        </p>

      </footer>

    </div>
  );
}

export default Appointments;