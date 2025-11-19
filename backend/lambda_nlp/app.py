import json
import boto3

def cargar_intents():
    with open("intents.json", "r", encoding="utf-8") as f:
        return json.load(f)

INTENTS = cargar_intents()

def detectar_intent(mensaje):
    mensaje_lower = mensaje.lower()
    for intent in INTENTS["intents"]:
        for kw in intent["keywords"]:
            if kw in mensaje_lower:
                return intent["name"]
    return "desconocido"

def lambda_handler(event, context):
    body = json.loads(event.get("body", "{}"))
    mensaje = body.get("mensaje", "")

    intent = detectar_intent(mensaje)

    # Respuesta básica inicial
    respuesta = ""

    if intent == "saludo":
        respuesta = "Hola, ¿en qué puedo ayudarte?"
    
    elif intent == "reservar_cita":
        respuesta = "Perfecto, para reservar una cita necesito tu DNI."
    
    elif intent == "cancelar_cita":
        respuesta = "Entiendo, ¿puedes indicarme tu DNI para cancelar la cita?"

    elif intent == "consultar_citas":
        respuesta = "Para consultar tus citas necesito tu DNI."

    elif intent == "informacion":
        respuesta = "La clínica atiende de lunes a viernes de 8am a 6pm."

    else:
        respuesta = "No entendí tu mensaje, ¿puedes repetirlo?"

    return {
        "statusCode": 200,
        "body": json.dumps({
            "intent": intent,
            "respuesta": respuesta
        })
    }
