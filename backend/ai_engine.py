from statistics import mean


def analyze_health_reading(reading, previous_readings=None):
    """
    CARE360 AI-assisted health monitoring.

    This function detects unusual readings and changes from
    recent patient history. It does not diagnose diseases.
    """

    if previous_readings is None:
        previous_readings = []

    alerts = []

    # --------------------------------------------------
    # 1. Current reading checks
    # --------------------------------------------------

    # Heart rate monitoring
    if reading.heart_rate < 50 or reading.heart_rate > 120:
        alerts.append({
            "type": "heart_rate",
            "message": "Heart rate reading requires attention."
        })

    # Oxygen monitoring
    if reading.spo2 < 92:
        alerts.append({
            "type": "oxygen",
            "message": "Oxygen level reading requires attention."
        })

    # Blood pressure monitoring
    if reading.systolic_bp > 160 or reading.systolic_bp < 90:
        alerts.append({
            "type": "blood_pressure",
            "message": "Systolic blood pressure reading requires attention."
        })

    if reading.diastolic_bp > 100 or reading.diastolic_bp < 60:
        alerts.append({
            "type": "blood_pressure",
            "message": "Diastolic blood pressure reading requires attention."
        })

    # Temperature monitoring
    if reading.temperature < 95 or reading.temperature > 100.4:
        alerts.append({
            "type": "temperature",
            "message": "Temperature reading is outside the configured monitoring range."
        })

    # --------------------------------------------------
    # 2. Trend analysis
    # --------------------------------------------------

    if len(previous_readings) >= 2:

        recent_heart_rates = [
            r.heart_rate for r in previous_readings[:5]
        ]

        recent_spo2 = [
            r.spo2 for r in previous_readings[:5]
        ]

        average_heart_rate = mean(recent_heart_rates)
        average_spo2 = mean(recent_spo2)

        # Detect significant change from recent pattern
        if abs(reading.heart_rate - average_heart_rate) > 25:
            alerts.append({
                "type": "trend",
                "message": "Heart rate is noticeably different from recent readings."
            })

        if average_spo2 - reading.spo2 >= 3:
            alerts.append({
                "type": "trend",
                "message": "Oxygen level has decreased compared with recent readings."
            })

    # --------------------------------------------------
    # 3. Final monitoring status
    # --------------------------------------------------

    if alerts:
        status = "attention"
        summary = (
            "The latest reading is different from the configured "
            "monitoring range or recent pattern."
        )
    else:
        status = "normal"
        summary = (
            "The latest reading does not show an unusual pattern "
            "based on the current monitoring rules."
        )

    return {
        "status": status,
        "summary": summary,
        "alerts": alerts,
        "alert_count": len(alerts)
    }