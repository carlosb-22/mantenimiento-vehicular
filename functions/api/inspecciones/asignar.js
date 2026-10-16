/* POST /api/inspecciones/asignar -> asigna un mecánico a una inspección en D1.
   Body JSON: { inspeccion_id, id_mecanico, administrador }
   - id_mecanico: id numérico del mecánico (se guarda como texto en inspecciones.id_mecanico).
   - administrador: nombre del administrador que asigna. Se VALIDA en el servidor contra la lista
     de administradores; el cliente no puede elegir un nombre arbitrario.
   - estado_hoja pasa a 'asignada' (la hoja deja de contarse como pendiente). */
import { respuestaJson, respuestaError, respuestaOpciones, parsearId } from "../../_shared/vehiculos.js";

const ADMINISTRADORES = ["Roger Fernando", "Yoana Pereira"];

export async function onRequestOptions() {
  return respuestaOpciones();
}

export async function onRequestPost({ request, env }) {
  let cuerpo;
  try {
    cuerpo = await request.json();
  } catch {
    return respuestaError("El cuerpo debe ser JSON válido", 400);
  }

  const inspeccionId = parsearId(cuerpo && cuerpo.inspeccion_id);
  if (inspeccionId === null) return respuestaError("inspeccion_id debe ser un entero positivo", 400);

  const mecanicoId = parsearId(cuerpo && cuerpo.id_mecanico);
  if (mecanicoId === null) return respuestaError("id_mecanico debe ser un entero positivo", 400);

  const administrador = String((cuerpo && cuerpo.administrador) || "").trim();
  if (!ADMINISTRADORES.includes(administrador)) {
    return respuestaError("administrador no autorizado para asignar inspecciones", 403);
  }

  try {
    const mecanico = await env.mantenimiento_db
      .prepare("SELECT id, nombre_mecanico FROM mecanicos WHERE id = ? AND activo = 1")
      .bind(mecanicoId)
      .first();
    if (!mecanico) return respuestaError("Mecánico no encontrado o inactivo", 404);

    const actualizacion = await env.mantenimiento_db
      .prepare(
        "UPDATE inspecciones SET id_mecanico = ?, administrador = ?, estado_hoja = 'asignada' WHERE id = ?"
      )
      .bind(String(mecanico.id), administrador, inspeccionId)
      .run();
    if (!actualizacion.meta || actualizacion.meta.changes === 0) {
      return respuestaError("Inspección no encontrada", 404);
    }

    const fila = await env.mantenimiento_db
      .prepare(
        "SELECT i.*, m.nombre_mecanico AS mecanico_nombre FROM inspecciones i " +
        "LEFT JOIN mecanicos m ON m.id = CAST(i.id_mecanico AS INTEGER) WHERE i.id = ?"
      )
      .bind(inspeccionId)
      .first();
    return respuestaJson(fila);
  } catch (error) {
    return respuestaError("Error al asignar la inspección: " + error.message, 500);
  }
}
