import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  AlertTriangle,
  Phone,
  ShieldAlert,
  UserRound,
  X,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Emergency() {
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
  // STATE
  // ============================================================

  const [showConfirm, setShowConfirm] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [sending, setSending] = useState(false);

  const emergencyNumber = "112";

  // Keep current prototype caregiver contact
  const caregiverName = "Anita Kumar";
  const caregiverNumber = "9876543210";

  // ============================================================
  // SEND SOS TO BACKEND
  // ============================================================

  const sendSOS = async () => {
    if (!patientId) {
      alert("Please login before activating emergency SOS.");
      return;
    }

    try {
      setSending(true);

      const response = await axios.post(
        `${API_URL}/emergency`,
        {
          patient_id: patientId,
          emergency_type: "SOS"
        }
      );

      console.log("SOS Response:", response.data);

      setShowConfirm(false);
      setAlertSent(true);

    } catch (error) {
      console.error("SOS Error:", error);

      alert(
        "Unable to activate emergency alert. Please call emergency services directly."
      );

    } finally {
      setSending(false);
    }
  };

  // ============================================================
  // CALL NUMBER
  // ============================================================

  const callNumber = (number) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="app-container emergency-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="page-header">

        <div>
          <h1>Emergency Help</h1>

          <p>
            Get immediate assistance when you need it
          </p>
        </div>

      </header>


      <main className="page-content">

        {/* ====================================================
            BACK
        ==================================================== */}

        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>


        {/* ====================================================
            EMERGENCY INTRO
        ==================================================== */}

        <section className="emergency-intro">

          <div className="emergency-intro-icon">
            <ShieldAlert size={42} />
          </div>

          <div>

            <h2>
              Need Emergency Assistance?
            </h2>

            <p>
              If you are experiencing an emergency,
              use the SOS button below to alert your
              emergency contact.
            </p>

          </div>

        </section>


        {/* ====================================================
            SOS BUTTON
        ==================================================== */}

        <section className="sos-section">

          <p className="sos-label">
            EMERGENCY SOS
          </p>

          <button
            className="sos-button"
            onClick={() => setShowConfirm(true)}
            aria-label="Emergency SOS"
          >

            <AlertTriangle size={58} />

            <span>
              SOS
            </span>

            <small>
              Tap for Emergency Help
            </small>

          </button>

          <p className="sos-description">
            Pressing SOS will activate the emergency
            alert process.
          </p>

        </section>


        {/* ====================================================
            ALERT SENT
        ==================================================== */}

        {alertSent && (

          <section className="sos-success">

            <div className="sos-success-icon">
              <CheckCircle size={35} />
            </div>

            <div>

              <h2>
                Emergency Alert Activated
              </h2>

              <p>
                Your emergency alert has been activated.
                Please contact emergency services if
                immediate medical assistance is required.
              </p>

            </div>

            <button
              className="sos-call-button"
              onClick={() =>
                callNumber(emergencyNumber)
              }
            >
              <Phone size={21} />
              Call Emergency Services ({emergencyNumber})
            </button>

          </section>

        )}


        {/* ====================================================
            EMERGENCY SERVICES
        ==================================================== */}

        <section className="emergency-contacts">

          <div className="section-heading">

            <h2>
              Emergency Contacts
            </h2>

            <p>
              Important contacts for emergency situations
            </p>

          </div>


          {/* 112 */}

          <div className="emergency-contact-card">

            <div className="emergency-contact-icon">
              <Phone size={27} />
            </div>

            <div className="emergency-contact-info">

              <h3>
                Emergency Services
              </h3>

              <p>
                National emergency number
              </p>

              <strong>
                {emergencyNumber}
              </strong>

            </div>

            <button
              className="contact-call-button"
              onClick={() =>
                callNumber(emergencyNumber)
              }
            >
              <Phone size={20} />
              Call
            </button>

          </div>


          {/* CAREGIVER */}

          <div className="emergency-contact-card">

            <div className="emergency-contact-icon caregiver">
              <UserRound size={27} />
            </div>

            <div className="emergency-contact-info">

              <h3>
                {caregiverName}
              </h3>

              <p>
                Primary caregiver
              </p>

              <strong>
                {caregiverNumber}
              </strong>

            </div>

            <button
              className="contact-call-button"
              onClick={() =>
                callNumber(caregiverNumber)
              }
            >
              <Phone size={20} />
              Call
            </button>

          </div>

        </section>


        {/* ====================================================
            EMERGENCY INSTRUCTIONS
        ==================================================== */}

        <section className="emergency-instructions">

          <div className="emergency-instruction-icon">
            <AlertTriangle size={27} />
          </div>

          <div>

            <h2>
              In an Emergency
            </h2>

            <ol>

              <li>
                Stay calm and move to a safe place.
              </li>

              <li>
                Press the SOS button if you need help.
              </li>

              <li>
                Contact emergency services for immediate
                medical assistance.
              </li>

              <li>
                Inform your caregiver or family member.
              </li>

            </ol>

          </div>

        </section>


        {/* ====================================================
            PROTOTYPE NOTE
        ==================================================== */}

        <section className="emergency-note">

          <AlertTriangle size={23} />

          <p>
            <strong>Prototype:</strong> CARE360's SOS
            interface demonstrates the emergency workflow.
            A production system would securely notify
            registered caregivers and emergency services
            through verified integrations.
          </p>

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


      {/* ======================================================
          SOS CONFIRMATION MODAL
      ====================================================== */}

      {showConfirm && (

        <div className="sos-modal-overlay">

          <div className="sos-modal">

            <button
              className="sos-modal-close"
              onClick={() => setShowConfirm(false)}
              aria-label="Close"
            >
              <X size={24} />
            </button>


            <div className="sos-modal-icon">
              <AlertTriangle size={40} />
            </div>


            <h2>
              Activate Emergency SOS?
            </h2>

            <p>
              This will activate the emergency alert
              workflow. Use SOS only when you need
              emergency assistance.
            </p>


            <div className="sos-modal-actions">

              <button
                className="sos-modal-cancel"
                onClick={() => setShowConfirm(false)}
                disabled={sending}
              >
                Cancel
              </button>

              <button
                className="sos-modal-confirm"
                onClick={sendSOS}
                disabled={sending}
              >

                <AlertTriangle size={20} />

                {sending
                  ? "Activating..."
                  : "Confirm SOS"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Emergency;