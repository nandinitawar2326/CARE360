from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime

from database import Base


# ============================================================
# HEALTH READING
# ============================================================

class HealthReading(Base):
    __tablename__ = "health_readings"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    patient_id = Column(
        String,
        index=True,
        nullable=False
    )

    heart_rate = Column(
        Float,
        nullable=False
    )

    spo2 = Column(
        Float,
        nullable=False
    )

    systolic_bp = Column(
        Float,
        nullable=False
    )

    diastolic_bp = Column(
        Float,
        nullable=False
    )

    temperature = Column(
        Float,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ============================================================
# MEDICINE
# ============================================================

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    patient_id = Column(
        String,
        index=True,
        nullable=False
    )

    medicine_name = Column(
        String,
        nullable=False
    )

    dosage = Column(
        String,
        nullable=False
    )

    time = Column(
        String,
        nullable=False
    )

    frequency = Column(
        String,
        default="Daily"
    )

    status = Column(
        String,
        default="Pending"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ============================================================
# DAILY SYMPTOM CHECK-IN
# ============================================================

class SymptomCheckin(Base):
    __tablename__ = "symptom_checkins"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    patient_id = Column(
        String,
        index=True,
        nullable=False
    )

    feeling = Column(
        String,
        nullable=False
    )

    symptoms = Column(
        String,
        nullable=False
    )

    severity = Column(
        String,
        nullable=False
    )

    notes = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ============================================================
# APPOINTMENT
# ============================================================

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    patient_id = Column(
        String,
        index=True,
        nullable=False
    )

    doctor_name = Column(
        String,
        nullable=False
    )

    appointment_date = Column(
        String,
        nullable=False
    )

    appointment_time = Column(
        String,
        nullable=False
    )

    hospital = Column(
        String,
        nullable=False
    )

    reason = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        default="Upcoming"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # ============================================================
# EMERGENCY EVENT
# ============================================================

class EmergencyEvent(Base):
    __tablename__ = "emergency_events"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    patient_id = Column(
        String,
        index=True,
        nullable=False
    )

    emergency_type = Column(
        String,
        default="SOS"
    )

    status = Column(
        String,
        default="Active"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

   # ============================================================
# PATIENT
# ============================================================

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    name = Column(
        String,
        nullable=False
    )

    age = Column(
        Integer,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    phone = Column(
        String,
        nullable=False
    )

    password = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )