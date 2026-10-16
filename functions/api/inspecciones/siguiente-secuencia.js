/* GET /api/inspecciones/siguiente-secuencia -> { secuencia: max(secuencia) + 1 } (1 si no hay registros) */
import { respuestaJson, respuestaError, respuestaOpciones } from "../../_shared/vehiculos.js";

export async function onRequestOptions() {
  return respuestaOpciones();
}

export async function onRequestGet({ env }) {
  try {
    const fila = await env.mantenimiento_db
      .prepare("SELECT COALESCE(MAX(secuencia), 0) AS maximo FROM inspecciones")
      .first();
    const maximo = Number(fila && fila.maximo) || 0;
    return respuestaJson({ secuencia: maximo + 1 });
  } catch (error) {
    return respuestaError("Error al obtener la secuencia: " + error.message, 500);
  }
}
