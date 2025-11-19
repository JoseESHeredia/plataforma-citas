import json
import uuid
from sheets_helper import get_gspread_client

# Cambia esto por el nombre EXACTO de tu Google Sheet
SHEET_NAME = "Plataforma_Citas_DB"

def lambda_handler(event, context):
    # Para pruebas desde Postman, AWS envía el body como string
    body = event.get("body", "{}")
    if isinstance(body, str):
        body = json.loads(body)

    # Datos esperados
    dni = body.get("dni")
    id_medico = body.get("id_medico")
    date = body.get("date")         # YYYY-MM-DD
    time = body.get("time")         # HH:MM

    if not dni or not id_medico or not date or not time:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Datos incompletos"})
        }

    # Construir fecha completa
    fecha_iso = f"{date}T{time}:00"

    # Conectar a Google Sheet
    client = get_gspread_client()
    sh = client.open(SHEET_NAME)
    ws = sh.worksheet("CITAS")

    # Generar ID único
    cita_id = str(uuid.uuid4())

    # Insertar fila
    ws.append_row([
        cita_id,
        dni,
        id_medico,
        fecha_iso,
        "confirmada",
        ""
    ])

    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "Cita creada correctamente",
            "id": cita_id
        })
    }
