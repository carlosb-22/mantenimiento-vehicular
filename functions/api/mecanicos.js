/* GET /api/mecanicos -> lista de mecánicos activos con el conteo de inspecciones livianas asignadas.
   El vínculo se hace por mecanicos.id = inspecciones.id_mecanico (texto), que es el valor que usa
   el campo id_mecanico de la tabla inspecciones. Se cuentan solo las inspecciones no cerradas por defecto
   no: se cuentan todas las asignadas (cualquier estado_hoja), según la especificación. */
import { respuestaJson, respuestaError, respuestaOpciones } from "../_shared/vehiculos.js";

export async function onRequestOptions() {
  return respuestaOpciones();
}

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.mantenimiento_db
      .prepare(
        "SELECT m.id, m.identidad, m.nombre_mecanico, m.foto_mecanico, m.puesto, m.empresa, m.activo, " +
        "(SELECT COUNT(*) FROM inspecciones i WHERE i.id_mecanico = CAST(m.id AS TEXT) " +
        "OR i.id_mecanico = m.identidad) AS inspecciones_asignadas " +
        "FROM mecanicos m WHERE m.activo = 1 ORDER BY m.id"
      )
      .all();
    const mecanicos = results.map((fila) => ({
      id: fila.id,
      identidad: fila.identidad,
      nombre_mecanico: fila.nombre_mecanico,
      foto_mecanico: fila.foto_mecanico,
      puesto: fila.puesto,
      empresa: fila.empresa,
      inspecciones_asignadas: Number(fila.inspecciones_asignadas) || 0
    }));
    return respuestaJson({ total: mecanicos.length, mecanicos: mecanicos });
  } catch (error) {
    return respuestaError("Error al leer mecánicos: " + error.message, 500);
  }
}
