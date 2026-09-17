from pydantic import BaseModel


# ============================================================
# HEALTH READING
# ============================================================

class HealthReadingCreate(BaseModel):
    patient_id: str
    heart_rate: float
    spo2: float
    systolic_bp: float
    diastolic_bp: float
    temperature: float


class HealthReadingResponse(BaseModel):
    id: int
    patient_id: str
    heart_rate: float
    spo2: float
    systolic_bp: float
    diastolic_bp: float
    temperature: float
    created_at: str


# ============================================================
# MEDICINES
# ============================================================

class MedicineCreate(BaseModel):
    patient_id: str
    medicine_name: str
    dosage: str
    time: str
    frequency: str = "Daily"


class MedicineStatusUpdate(BaseModel):
    status: str


# ============================================================
# DAILY SYMPTOM CHECK-IN
# ============================================================

class SymptomCheckinCreate(BaseModel):
    patient_id: str
    feeling: str
    symptoms: str
    severity: str
    notes: str = ""


# ============================================================
# APPOINTMENTS
# ============================================================

class AppointmentCreate(BaseModel):
    patient_id: str
    doctor_name: str
    appointment_date: str
    appointment_time: str
    hospital: str
    reason: str


class AppointmentStatusUpdate(BaseModel):
    status: str


# ============================================================
# EMERGENCY
# ============================================================

class EmergencyCreate(BaseModel):
    patient_id: str
    emergency_type: str = "SOS"


class EmergencyStatusUpdate(BaseModel):
    status: str


# ============================================================
# PATIENT REGISTRATION
# ============================================================

class PatientRegister(BaseModel):
    name: str
    age: int
    email: str
    phone: str
    password: str


# ============================================================
# PATIENT LOGIN
# ============================================================

class PatientLogin(BaseModel):
    email: str
    password: str