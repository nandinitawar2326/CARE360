from fastapi import FastAPI, Depends, HTTPException
import hashlib
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from schemas import (
    HealthReadingCreate,
    MedicineCreate,
    MedicineStatusUpdate,
    SymptomCheckinCreate,
     AppointmentCreate,
    AppointmentStatusUpdate,
    EmergencyCreate,
    EmergencyStatusUpdate,
    PatientRegister,
    PatientLogin
)
from models import HealthReading, Medicine, SymptomCheckin, Appointment, EmergencyEvent, Patient
from ai_engine import analyze_health_reading

def hash_password(password: str):
    return hashlib.sha256(
        password.encode("utf-8")
    ).hexdigest()


# ============================================================
# DATABASE
# ============================================================

# Create all database tables
Base.metadata.create_all(bind=engine)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="CARE360 API",
    description="Remote Patient Monitoring System",
    version="1.0.0"
)
# ============================================================
# CORS
# ============================================================


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "CARE360 API is running"
    }


# ============================================================
# CREATE HEALTH READING
# ============================================================

@app.post("/health/readings")
def create_health_reading(
    reading: HealthReadingCreate,
    db: Session = Depends(get_db)
):

    new_reading = HealthReading(
        patient_id=reading.patient_id,
        heart_rate=reading.heart_rate,
        spo2=reading.spo2,
        systolic_bp=reading.systolic_bp,
        diastolic_bp=reading.diastolic_bp,
        temperature=reading.temperature
    )

    db.add(new_reading)
    db.commit()
    db.refresh(new_reading)

    return {
        "message": "Health reading saved successfully",
        "reading_id": new_reading.id
    }


# ============================================================
# GET ALL HEALTH READINGS
# ============================================================

@app.get("/health/{patient_id}")
def get_health_readings(
    patient_id: str,
    db: Session = Depends(get_db)
):

    readings = (
        db.query(HealthReading)
        .filter(
            HealthReading.patient_id == patient_id
        )
        .order_by(
            HealthReading.created_at.desc()
        )
        .all()
    )

    return readings


# ============================================================
# GET LATEST HEALTH READING
# ============================================================

@app.get("/health/{patient_id}/latest")
def get_latest_reading(
    patient_id: str,
    db: Session = Depends(get_db)
):

    reading = (
        db.query(HealthReading)
        .filter(
            HealthReading.patient_id == patient_id
        )
        .order_by(
            HealthReading.created_at.desc()
        )
        .first()
    )

    if not reading:
        return {
            "message": "No health readings found"
        }

    return {
        "id": reading.id,
        "patient_id": reading.patient_id,
        "heart_rate": reading.heart_rate,
        "spo2": reading.spo2,
        "systolic_bp": reading.systolic_bp,
        "diastolic_bp": reading.diastolic_bp,
        "temperature": reading.temperature,
        "created_at": reading.created_at
    }


# ============================================================
# AI HEALTH ANALYSIS
# ============================================================

@app.get("/health/{patient_id}/analysis")
def analyze_patient_health(
    patient_id: str,
    db: Session = Depends(get_db)
):

    # Get all readings for this patient
    readings = (
        db.query(HealthReading)
        .filter(
            HealthReading.patient_id == patient_id
        )
        .order_by(
            HealthReading.created_at.desc()
        )
        .all()
    )

    # No data available
    if not readings:
        return {
            "patient_id": patient_id,
            "status": "no_data",
            "message": "No health readings available for analysis."
        }

    # Latest reading
    latest_reading = readings[0]

    # Older readings
    previous_readings = readings[1:]

    # Send readings to AI monitoring engine
    analysis = analyze_health_reading(
        latest_reading,
        previous_readings
    )

    return {
        "patient_id": patient_id,

        "latest_reading": {
            "id": latest_reading.id,
            "heart_rate": latest_reading.heart_rate,
            "spo2": latest_reading.spo2,
            "systolic_bp": latest_reading.systolic_bp,
            "diastolic_bp": latest_reading.diastolic_bp,
            "temperature": latest_reading.temperature,
            "created_at": latest_reading.created_at
        },

        "analysis": analysis
    }

# ============================================================
# MEDICINES
# ============================================================

@app.post("/medicines")
def add_medicine(
    medicine: MedicineCreate,
    db: Session = Depends(get_db)
):

    new_medicine = Medicine(
        patient_id=medicine.patient_id,
        medicine_name=medicine.medicine_name,
        dosage=medicine.dosage,
        time=medicine.time,
        frequency=medicine.frequency,
        status="Pending"
    )

    db.add(new_medicine)
    db.commit()
    db.refresh(new_medicine)

    return {
        "message": "Medicine added successfully",
        "medicine_id": new_medicine.id
    }


@app.get("/medicines/{patient_id}")
def get_medicines(
    patient_id: str,
    db: Session = Depends(get_db)
):

    medicines = (
        db.query(Medicine)
        .filter(
            Medicine.patient_id == patient_id
        )
        .order_by(Medicine.time.asc())
        .all()
    )

    return medicines


@app.put("/medicines/{medicine_id}/status")
def update_medicine_status(
    medicine_id: int,
    status_data: MedicineStatusUpdate,
    db: Session = Depends(get_db)
):

    medicine = (
        db.query(Medicine)
        .filter(Medicine.id == medicine_id)
        .first()
    )

    if not medicine:
        return {
            "message": "Medicine not found"
        }

    medicine.status = status_data.status

    db.commit()
    db.refresh(medicine)

    return {
        "message": "Medicine status updated",
        "medicine_id": medicine.id,
        "status": medicine.status
    }


@app.delete("/medicines/{medicine_id}")
def delete_medicine(
    medicine_id: int,
    db: Session = Depends(get_db)
):

    medicine = (
        db.query(Medicine)
        .filter(Medicine.id == medicine_id)
        .first()
    )

    if not medicine:
        return {
            "message": "Medicine not found"
        }

    db.delete(medicine)
    db.commit()

    return {
        "message": "Medicine deleted successfully"
    }

# ============================================================
# DAILY SYMPTOM CHECK-IN
# ============================================================

@app.post("/symptoms")
def create_symptom_checkin(
    checkin: SymptomCheckinCreate,
    db: Session = Depends(get_db)
):

    new_checkin = SymptomCheckin(
        patient_id=checkin.patient_id,
        feeling=checkin.feeling,
        symptoms=checkin.symptoms,
        severity=checkin.severity,
        notes=checkin.notes
    )

    db.add(new_checkin)
    db.commit()
    db.refresh(new_checkin)

    return {
        "message": "Daily check-in saved successfully",
        "checkin_id": new_checkin.id
    }


@app.get("/symptoms/{patient_id}")
def get_symptom_checkins(
    patient_id: str,
    db: Session = Depends(get_db)
):

    checkins = (
        db.query(SymptomCheckin)
        .filter(
            SymptomCheckin.patient_id == patient_id
        )
        .order_by(
            SymptomCheckin.created_at.desc()
        )
        .all()
    )

    return checkins

# ============================================================
# CAREGIVER DASHBOARD
# ============================================================

@app.get("/caregiver/{patient_id}")
def get_caregiver_dashboard(
    patient_id: str,
    db: Session = Depends(get_db)
):
    # Get patient information
    patient = (
        db.query(Patient)
        .filter(Patient.patient_id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # Latest health reading
    latest_health = (
        db.query(HealthReading)
        .filter(HealthReading.patient_id == patient_id)
        .order_by(HealthReading.created_at.desc())
        .first()
    )

    # Recent symptom check-ins
    recent_symptoms = (
        db.query(SymptomCheckin)
        .filter(SymptomCheckin.patient_id == patient_id)
        .order_by(SymptomCheckin.created_at.desc())
        .limit(5)
        .all()
    )

    # Medicines
    medicines = (
        db.query(Medicine)
        .filter(Medicine.patient_id == patient_id)
        .order_by(Medicine.created_at.desc())
        .all()
    )

    return {
        "patient": {
            "patient_id": patient.patient_id,
            "name": patient.name,
            "age": patient.age
        },

        "latest_health": (
            {
                "heart_rate": latest_health.heart_rate,
                "spo2": latest_health.spo2,
                "systolic_bp": latest_health.systolic_bp,
                "diastolic_bp": latest_health.diastolic_bp,
                "temperature": latest_health.temperature,
                "created_at": str(latest_health.created_at)
            }
            if latest_health
            else None
        ),

        "recent_symptoms": [
            {
                "feeling": symptom.feeling,
                "symptoms": symptom.symptoms,
                "severity": symptom.severity,
                "notes": symptom.notes,
                "created_at": str(symptom.created_at)
            }
            for symptom in recent_symptoms
        ],

        "medicines": [
            {
                "id": medicine.id,
                "medicine_name": medicine.medicine_name,
                "dosage": medicine.dosage,
                "time": medicine.time,
                "frequency": medicine.frequency,
                "status": medicine.status
            }
            for medicine in medicines
        ]
    }

# ============================================================
# HEALTH HISTORY
# ============================================================

@app.get("/health/{patient_id}/history")
def get_health_history(
    patient_id: str,
    db: Session = Depends(get_db)
):
    readings = (
        db.query(HealthReading)
        .filter(HealthReading.patient_id == patient_id)
        .order_by(HealthReading.created_at.desc())
        .limit(20)
        .all()
    )

    return [
        {
            "id": reading.id,
            "heart_rate": reading.heart_rate,
            "spo2": reading.spo2,
            "systolic_bp": reading.systolic_bp,
            "diastolic_bp": reading.diastolic_bp,
            "temperature": reading.temperature,
            "created_at": str(reading.created_at)
        }
        for reading in readings
    ]

# ============================================================
# APPOINTMENTS
# ============================================================

@app.post("/appointments")
def create_appointment(
    appointment: AppointmentCreate,
    db: Session = Depends(get_db)
):
    new_appointment = Appointment(
        patient_id=appointment.patient_id,
        doctor_name=appointment.doctor_name,
        appointment_date=appointment.appointment_date,
        appointment_time=appointment.appointment_time,
        hospital=appointment.hospital,
        reason=appointment.reason,
        status="Upcoming"
    )

    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)

    return {
        "message": "Appointment added successfully",
        "appointment_id": new_appointment.id
    }


@app.get("/appointments/{patient_id}")
def get_appointments(
    patient_id: str,
    db: Session = Depends(get_db)
):
    appointments = (
        db.query(Appointment)
        .filter(
            Appointment.patient_id == patient_id
        )
        .order_by(
            Appointment.appointment_date.asc(),
            Appointment.appointment_time.asc()
        )
        .all()
    )

    return [
        {
            "id": appointment.id,
            "doctor_name": appointment.doctor_name,
            "appointment_date": appointment.appointment_date,
            "appointment_time": appointment.appointment_time,
            "hospital": appointment.hospital,
            "reason": appointment.reason,
            "status": appointment.status
        }
        for appointment in appointments
    ]


@app.put("/appointments/{appointment_id}/status")
def update_appointment_status(
    appointment_id: int,
    update: AppointmentStatusUpdate,
    db: Session = Depends(get_db)
):
    appointment = (
        db.query(Appointment)
        .filter(Appointment.id == appointment_id)
        .first()
    )

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found"
        )

    appointment.status = update.status

    db.commit()
    db.refresh(appointment)

    return {
        "message": "Appointment status updated successfully"
    }


@app.delete("/appointments/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db)
):
    appointment = (
        db.query(Appointment)
        .filter(Appointment.id == appointment_id)
        .first()
    )

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found"
        )

    db.delete(appointment)
    db.commit()

    return {
        "message": "Appointment deleted successfully"
    }

# ============================================================
# EMERGENCY / SOS
# ============================================================

@app.post("/emergency")
def create_emergency(
    emergency: EmergencyCreate,
    db: Session = Depends(get_db)
):
    new_emergency = EmergencyEvent(
        patient_id=emergency.patient_id,
        emergency_type=emergency.emergency_type,
        status="Active"
    )

    db.add(new_emergency)
    db.commit()
    db.refresh(new_emergency)

    return {
        "message": "Emergency alert activated",
        "emergency_id": new_emergency.id,
        "status": new_emergency.status
    }


@app.get("/emergency/{patient_id}")
def get_emergency_events(
    patient_id: str,
    db: Session = Depends(get_db)
):
    emergencies = (
        db.query(EmergencyEvent)
        .filter(
            EmergencyEvent.patient_id == patient_id
        )
        .order_by(
            EmergencyEvent.created_at.desc()
        )
        .limit(10)
        .all()
    )

    return [
        {
            "id": emergency.id,
            "patient_id": emergency.patient_id,
            "emergency_type": emergency.emergency_type,
            "status": emergency.status,
            "created_at": str(emergency.created_at)
        }
        for emergency in emergencies
    ]


@app.put("/emergency/{emergency_id}/status")
def update_emergency_status(
    emergency_id: int,
    update: EmergencyStatusUpdate,
    db: Session = Depends(get_db)
):
    emergency = (
        db.query(EmergencyEvent)
        .filter(
            EmergencyEvent.id == emergency_id
        )
        .first()
    )

    if not emergency:
        raise HTTPException(
            status_code=404,
            detail="Emergency event not found"
        )

    emergency.status = update.status

    db.commit()
    db.refresh(emergency)

    return {
        "message": "Emergency status updated",
        "status": emergency.status
    }

@app.post("/register")
def register_patient(
    patient: PatientRegister,
    db: Session = Depends(get_db)
):
    existing_patient = (
        db.query(Patient)
        .filter(Patient.email == patient.email)
        .first()
    )

    if existing_patient:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Generate patient ID
    last_patient = (
        db.query(Patient)
        .order_by(Patient.id.desc())
        .first()
    )

    if last_patient:
        number = last_patient.id + 1
    else:
        number = 1

    patient_id = f"P{number:03d}"

    password = hash_password(patient.password)

    new_patient = Patient(
        patient_id=patient_id,
        name=patient.name,
        age=patient.age,
        email=patient.email,
        phone=patient.phone,
        password=hash_password(patient.password)
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return {
        "message": "Registration successful",
        "patient_id": new_patient.patient_id,
        "name": new_patient.name,
        "email": new_patient.email
    }

@app.post("/login")
def login_patient(
    patient: PatientLogin,
    db: Session = Depends(get_db)
):
    existing_patient = (
        db.query(Patient)
        .filter(Patient.email == patient.email)
        .first()
    )

    if not existing_patient:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if hash_password(patient.password) != existing_patient.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "message": "Login successful",
        "patient_id": existing_patient.patient_id,
        "name": existing_patient.name,
        "age": existing_patient.age,
        "email": existing_patient.email,
        "phone": existing_patient.phone
    }