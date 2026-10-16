/* POST /api/notificar-inspeccion -> envía el correo de solicitud de inspección a jokeys22@gmail.com.
   Body JSON: { codigo_hoja }. El vehículo y el código se leen de D1 (no se confía en el cliente).
   Requiere los secretos de Pages: RESEND_API_KEY y EMAIL_FROM (remitente verificado en Resend). */
import { respuestaJson, respuestaError, respuestaOpciones } from "../_shared/vehiculos.js";

const DESTINATARIO = "jokeys22@gmail.com";
const URL_PLATAFORMA = "https://mantenimiento.ciudad-futura.com/";

export async function onRequestOptions() {
  return respuestaOpciones();
}

export async function onRequestPost({ request, env }) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    return respuestaError("Servicio de correo no configurado (RESEND_API_KEY / EMAIL_FROM)", 503);
  }

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

  const idVehiculo = vehiculo ? vehiculo.id : inspeccion.vehiculo_id;
  const nombreVehiculo = vehiculo && vehiculo.nombre ? vehiculo.nombre : "Vehículo " + idVehiculo;
  const texto =
    "El departamento de logística solicita la inspección del vehículo " + idVehiculo + " - " + nombreVehiculo + ".\n" +
    "Ingresa a la siguiente dirección para poder acceder a la plataforma de mantenimiento para revisar esta solicitud de inspección de vehículo liviano: " +
    URL_PLATAFORMA;

  try {
    const respuesta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + env.RESEND_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [DESTINATARIO],
        subject: inspeccion.codigo_hoja,
        text: texto
      })
    });
    const datos = await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
      return respuestaError("El proveedor de correo rechazó el envío: " + ((datos && datos.message) || respuesta.status), 502);
    }
    return respuestaJson({ enviado: true, id: datos && datos.id, codigo_hoja: inspeccion.codigo_hoja });
  } catch (error) {
    return respuestaError("No se pudo contactar el servicio de correo: " + error.message, 502);
  }
}
