import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Pill,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Medicine() {
  const navigate = useNavigate();
  const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
  // MEDICINE COUNTS
  // ============================================================

  const takenCount = medicines.filter(
    (medicine) => medicine.status === "Taken"
  ).length;

  const missedCount = medicines.filter(
    (medicine) => medicine.status === "Missed"
  ).length;

  const pendingCount = medicines.filter(
    (medicine) => medicine.status === "Pending"
  ).length;

  const totalCount = medicines.length;

  const adherence =
    totalCount > 0
      ? Math.round((takenCount / totalCount) * 100)
      : 0;

  // ============================================================
  // FETCH MEDICINES
  // ============================================================

  const fetchMedicines = async () => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/medicines/${patientId}`
      );

      setMedicines(response.data);
    } catch (error) {
      console.error("Error fetching medicines:", error);

      setMessage(
        "Unable to load medicines. Please check that the CARE360 server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchMedicines();
    }
  }, [patientId]);

  // ============================================================
  // FORM
  // ============================================================

  const [form, setForm] = useState({
    medicine_name: "",
    dosage: "",
    time: "",
    frequency: "Daily"
  });

  // ============================================================
  // FORM HANDLING
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
  // ADD MEDICINE
  // ============================================================

  const addMedicine = async (event) => {
    event.preventDefault();

    if (
      !form.medicine_name ||
      !form.dosage ||
      !form.time
    ) {
      setMessage("Please fill all medicine details.");
      return;
    }

    if (!patientId) {
      setMessage("Please login before adding a medicine.");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/medicines`,
        {
          patient_id: patientId,
          medicine_name: form.medicine_name,
          dosage: form.dosage,
          time: form.time,
          frequency: form.frequency
        }
      );

      setMessage("✓ Medicine added successfully!");

      setForm({
        medicine_name: "",
        dosage: "",
        time: "",
        frequency: "Daily"
      });

      await fetchMedicines();

    } catch (error) {
      console.error("Error adding medicine:", error);

      setMessage(
        "Unable to add medicine. Please check the CARE360 server."
      );
    }
  };

  // ============================================================
  // UPDATE STATUS
  // ============================================================

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${API_URL}/medicines/${id}/status`,
        {
          status: status
        }
      );

      setMessage(
        status === "Taken"
          ? "✓ Medicine marked as Taken."
          : "Medicine marked as Missed."
      );

      await fetchMedicines();

    } catch (error) {
      console.error("Error updating medicine:", error);

      setMessage(
        "Unable to update medicine status."
      );
    }
  };

  // ============================================================
  // DELETE MEDICINE
  // ============================================================

  const deleteMedicine = async (id) => {
    try {
      await axios.delete(
        `${API_URL}/medicines/${id}`
      );

      setMessage("✓ Medicine deleted successfully.");

      await fetchMedicines();

    } catch (error) {
      console.error("Error deleting medicine:", error);

      setMessage(
        "Unable to delete medicine."
      );
    }
  };

  // ============================================================
  // PAGE
  // ============================================================

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
          <Pill size={34} />
          <h1>My Medicines</h1>
        </div>

      </header>


      {/* ======================================================
          PATIENT BANNER
          ====================================================== */}

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


      {/* ======================================================
          ADD MEDICINE
          ====================================================== */}

      <section className="medicine-form-card">

        <div className="section-heading">

          <div className="section-icon">
            <Plus size={30} />
          </div>

          <div>
            <h2>Add Medicine</h2>
            <p>
              Enter your medicine schedule
            </p>
          </div>

        </div>


        <form onSubmit={addMedicine}>

          {/* MEDICINE NAME */}

          <div className="form-group">

            <label htmlFor="medicine_name">
              💊 Medicine Name
            </label>

            <input
              id="medicine_name"
              type="text"
              name="medicine_name"
              value={form.medicine_name}
              onChange={handleChange}
              placeholder="Example: Paracetamol"
            />

          </div>


          {/* DOSAGE */}

          <div className="form-group">

            <label htmlFor="dosage">
              💊 Dosage
            </label>

            <input
              id="dosage"
              type="text"
              name="dosage"
              value={form.dosage}
              onChange={handleChange}
              placeholder="Example: 1 tablet"
            />

          </div>


          {/* TIME */}

          <div className="form-group">

            <label htmlFor="time">
              ⏰ Time
            </label>

            <input
              id="time"
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
            />

          </div>


          {/* FREQUENCY */}

          <div className="form-group">

            <label htmlFor="frequency">
              🔄 Frequency
            </label>

            <select
              id="frequency"
              name="frequency"
              value={form.frequency}
              onChange={handleChange}
            >

              <option value="Daily">
                Daily
              </option>

              <option value="Twice Daily">
                Twice Daily
              </option>

              <option value="Weekly">
                Weekly
              </option>

              <option value="As Needed">
                As Needed
              </option>

            </select>

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


          {/* ADD BUTTON */}

          <button
            type="submit"
            className="save-button"
          >

            <Plus size={26} />

            Add Medicine

          </button>

        </form>

      </section>


      {/* ======================================================
          MEDICINE SUMMARY
          ====================================================== */}

      <section className="medicine-summary">

        {/* TOTAL */}

        <div className="medicine-summary-card">

          <div className="summary-number">
            {totalCount}
          </div>

          <div>
            <strong>Total</strong>
            <span>Medicines</span>
          </div>

        </div>


        {/* TAKEN */}

        <div className="medicine-summary-card">

          <div className="summary-number">
            {takenCount}
          </div>

          <div>
            <strong>Taken</strong>
            <span>Today</span>
          </div>

        </div>


        {/* PENDING */}

        <div className="medicine-summary-card">

          <div className="summary-number">
            {pendingCount}
          </div>

          <div>
            <strong>Pending</strong>
            <span>Today</span>
          </div>

        </div>


        {/* MISSED */}

        <div className="medicine-summary-card">

          <div className="summary-number">
            {missedCount}
          </div>

          <div>
            <strong>Missed</strong>
            <span>Today</span>
          </div>

        </div>

      </section>


      {/* ======================================================
          MEDICATION ADHERENCE
          ====================================================== */}

      <section className="adherence-card">

        <div>

          <h2>
            💊 Medication Adherence
          </h2>

          <p>
            Today's medicines taken
          </p>

        </div>


        <div className="adherence-value">
          {adherence}%
        </div>


        <div className="adherence-bar">

          <div
            className="adherence-progress"
            style={{
              width: `${adherence}%`
            }}
          />

        </div>

      </section>


      {/* ======================================================
          MEDICINE LIST
          ====================================================== */}

      <section className="medicine-list-section">

        <div className="section-heading">

          <div className="section-icon">
            <Pill size={30} />
          </div>

          <div>
            <h2>
              Today's Medicines
            </h2>

            <p>
              Track your medicine schedule
            </p>
          </div>

        </div>


        {/* LOADING */}

        {loading && (

          <div className="medicine-empty">

            <Clock size={32} />

            <p>
              Loading medicines...
            </p>

          </div>

        )}


        {/* NO MEDICINES */}

        {!loading && medicines.length === 0 && (

          <div className="medicine-empty">

            <Pill size={40} />

            <h3>
              No medicines added yet
            </h3>

            <p>
              Add your first medicine
              using the form above.
            </p>

          </div>

        )}


        {/* MEDICINES */}

        {!loading && medicines.length > 0 && (

          <div className="medicine-list">

            {medicines.map((medicine) => (

              <div
                className="medicine-card"
                key={medicine.id}
              >

                {/* MEDICINE INFORMATION */}

                <div className="medicine-main">

                  <div className="medicine-icon">
                    💊
                  </div>


                  <div className="medicine-info">

                    <h3>
                      {medicine.medicine_name}
                    </h3>

                    <p>
                      {medicine.dosage}
                    </p>


                    <div className="medicine-details">

                      <span>
                        <Clock size={18} />

                        {medicine.time}
                      </span>


                      <span>
                        🔄 {medicine.frequency}
                      </span>

                    </div>

                  </div>

                </div>


                {/* STATUS + BUTTONS */}

                <div className="medicine-actions">

                  {/* STATUS */}

                  <div
                    className={
                      medicine.status === "Taken"
                        ? "medicine-status taken"
                        : medicine.status === "Missed"
                        ? "medicine-status missed"
                        : "medicine-status pending"
                    }
                  >

                    {medicine.status}

                  </div>


                  {/* ACTION BUTTONS */}

                  <div className="medicine-buttons">

                    <button
                      type="button"
                      className="taken-button"
                      onClick={() =>
                        updateStatus(
                          medicine.id,
                          "Taken"
                        )
                      }
                    >

                      <CheckCircle size={22} />

                      Taken

                    </button>


                    <button
                      type="button"
                      className="missed-button"
                      onClick={() =>
                        updateStatus(
                          medicine.id,
                          "Missed"
                        )
                      }
                    >

                      <XCircle size={22} />

                      Missed

                    </button>


                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        deleteMedicine(
                          medicine.id
                        )
                      }
                    >

                      <Trash2 size={22} />

                      Delete

                    </button>

                  </div>

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
            Medicine Safety
          </h3>

          <p>
            Take medicines only according
            to the instructions provided by
            your healthcare professional.
          </p>

          <p>
            CARE360 helps you remember and
            track medicines but does not
            prescribe medicines.
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

export default Medicine;