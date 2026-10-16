/* POST /api/notificar-inspeccion -> envía el correo de solicitud de inspección a jokeys22@gmail.com.
   Body JSON: { codigo_hoja }. El vehículo y el código se leen de D1 (no se confía en el cliente).
   Secretos/variables de Pages:
     - RESEND_API_KEY (secreto, obligatorio para enviar).
     - EMAIL_FROM (opcional). Si no existe se usa "Mantenimiento CISA <onboarding@resend.dev>".
   Errores del proveedor (remitente no permitido, API caída, sin clave, etc.) NO rompen la
   experiencia: se responden con 200 y { enviado: false, motivo }, porque la inspección ya quedó registrada en D1. */
import { respuestaJson, respuestaError, respuestaOpciones } from "../_shared/vehiculos.js";

const DESTINATARIO = "jokeys22@gmail.com";
const REMITENTE_POR_DEFECTO = "Mantenimiento CISA <onboarding@resend.dev>";
const URL_PLATAFORMA = "https://mantenimiento.ciudad-futura.com/";

export async function onRequestOptions() {
  return respuestaOpciones();
}

/* Respuesta no bloqueante: el cliente sigue su flujo y muestra el motivo como aviso */
function correoNoEnviado(codigoHoja, motivo) {
  return respuestaJson({ enviado: false, codigo_hoja: codigoHoja, motivo: motivo });
}

export async function onRequestPost({ request, env }) {
  let cuerpo;
  try {
    cuerpo = await request.json();
  } catch {
    return respuestaError("El cuerpo debe ser JSON válido", 400);
  }
  const codigoHoja = String((cuerpo && cuerpo.codigo_hoja) || "").trim();
  if (!codigoHoja) return respuestaError("codigo_hoja es obligatorio", 400);

  let inspeccion;
  let vehiculo;
  try {
    inspeccion = await env.mantenimiento_db
      .prepare("SELECT * FROM inspecciones WHERE codigo_hoja = ?")
      .bind(codigoHoja)
      .first();
    if (!inspeccion) return respuestaError("Inspección no encontrada", 404);
    vehiculo = await env.mantenimiento_db
      .prepare("SELECT id, nombre FROM vehiculos WHERE id = ?")
      .bind(inspeccion.vehiculo_id)
      .first();
  } catch (error) {
    return respuestaError("Error al leer la inspección: " + error.message, 500);
  }

  const codigoHojaRegistrado = inspeccion.codigo_hoja;
  if (!env.RESEND_API_KEY) {
    return correoNoEnviado(codigoHojaRegistrado, "Falta configurar RESEND_API_KEY en el proyecto");
  }

  const idVehiculo = vehiculo ? vehiculo.id : inspeccion.vehiculo_id;
  const nombreVehiculo = vehiculo && vehiculo.nombre ? vehiculo.nombre : "Vehículo " + idVehiculo;
  const texto =
    "El departamento de logística solicita la inspección del vehículo " + idVehiculo + " - " + nombreVehiculo + ".\n" +
    "Ingresa a la siguiente dirección para poder acceder a la plataforma de mantenimiento para revisar esta solicitud de inspección de vehículo liviano: " +
    URL_PLATAFORMA;
  const remitente = env.EMAIL_FROM || REMITENTE_POR_DEFECTO;

  try {
    const respuesta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + env.RESEND_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: remitente,
        to: [DESTINATARIO],
        subject: codigoHojaRegistrado,
        text: texto
      })
    });
    const datos = await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
      const detalle = (datos && (datos.message || datos.name)) || ("HTTP " + respuesta.status);
      return correoNoEnviado(codigoHojaRegistrado, "Resend rechazó el envío: " + detalle);
    }
    return respuestaJson({ enviado: true, id: datos && datos.id, codigo_hoja: codigoHojaRegistrado });
  } catch (error) {
    return correoNoEnviado(codigoHojaRegistrado, "No se pudo contactar Resend: " + error.message);
  }
}
