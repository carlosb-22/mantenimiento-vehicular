/* POST /api/inspecciones -> registra una solicitud de inspección pre-viaje en D1.
   Body JSON: { vehiculo_id, ubicacion, usuario_solicitante }
   La secuencia se calcula en el mismo INSERT (MAX + 1) para evitar duplicados.
   Valores por defecto: administrador='sin definir', id_mecanico='sin definir',
   estado_hoja='solicitada', porcentaje=NULL. */
import { respuestaJson, respuestaError, respuestaOpciones, parsearId, obtenerFila } from "../_shared/vehiculos.js";

const UBICACIONES = ["E", "U", "T", "C"];

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

  const vehiculoId = parsearId(cuerpo && cuerpo.vehiculo_id);
  if (vehiculoId === null) return respuestaError("vehiculo_id debe ser un entero positivo", 400);

  const ubicacion = String((cuerpo && cuerpo.ubicacion) || "E").trim().toUpperCase();
  if (!UBICACIONES.includes(ubicacion)) return respuestaError("ubicacion inválida (E, U, T o C)", 400);

  const usuario = String((cuerpo && cuerpo.usuario_solicitante) || "").trim();
  if (!usuario) return respuestaError("usuario_solicitante es obligatorio", 400);

  try {
    const vehiculo = await obtenerFila(env, vehiculoId);
    if (!vehiculo) return respuestaError("Vehículo no encontrado", 404);

    const idTresDigitos = String(vehiculoId).padStart(3, "0");
    // Secuencia calculada dentro del propio INSERT: evita duplicados por envíos simultáneos.
    const secuenciaSql = "(SELECT COALESCE(MAX(secuencia), 0) + 1 FROM inspecciones)";
    const resultado = await env.mantenimiento_db
      .prepare(
        "INSERT INTO inspecciones (vehiculo_id, codigo_hoja, ubicacion, secuencia, usuario_solicitante, administrador, id_mecanico, estado_hoja, porcentaje) " +
        "VALUES (?, 'HI V VL ' || ? || ' ' || ? || ' ' || printf('%07d', " + secuenciaSql + "), ?, " + secuenciaSql + ", ?, 'sin definir', 'sin definir', 'solicitada', NULL)"
      )
      .bind(vehiculoId, ubicacion, idTresDigitos, ubicacion, usuario)
      .run();

    const id = resultado.meta.last_row_id;
    const fila = await env.mantenimiento_db
      .prepare("SELECT * FROM inspecciones WHERE id = ?")
      .bind(id)
      .first();
    return respuestaJson(fila, 201);
  } catch (error) {
    if (/UNIQUE constraint failed/i.test(error.message)) {
      return respuestaError("Conflicto de código de hoja, intenta nuevamente", 409);
    }
    return respuestaError("Error al registrar la inspección: " + error.message, 500);
  }
}
