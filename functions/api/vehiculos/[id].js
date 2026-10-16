/* GET /api/vehiculos/:id -> ficha completa de un vehiculo desde D1
   PUT /api/vehiculos/:id -> actualiza campos (parcial), estado_vehicular, observaciones y/o foto.
                             Requiere Authorization: Bearer <API_TOKEN> */
import {
  respuestaJson,
  respuestaError,
  respuestaOpciones,
  filaAApi,
  comprobarToken,
  leerEntrada,
  prepararCampos,
  validarArchivo,
  guardarFoto,
  obtenerFila,
  parsearId
} from "../../_shared/vehiculos.js";

export async function onRequestOptions() {
  return respuestaOpciones();
}

export async function onRequestGet({ env, params }) {
  const id = parsearId(params.id);
  if (id === null) return respuestaError("id debe ser un entero positivo", 400);
  try {
    const fila = await obtenerFila(env, id);
    if (!fila) return respuestaError("Vehiculo no encontrado", 404);
    return respuestaJson(filaAApi(fila));
  } catch (error) {
    return respuestaError("Error al leer vehiculo: " + error.message, 500);
  }
}

export async function onRequestPut({ request, env, params }) {
  const acceso = comprobarToken(request, env);
  if (acceso) return respuestaError(acceso.mensaje, acceso.estado);

  const id = parsearId(params.id);
  if (id === null) return respuestaError("id debe ser un entero positivo", 400);

  let entrada;
  let campos;
  try {
    entrada = await leerEntrada(request);
    campos = prepararCampos(entrada.datos);
    if (entrada.archivo) validarArchivo(entrada.archivo);
  } catch (error) {
    return respuestaError(error.message, 400);
  }

  if (Object.keys(campos).length === 0 && !entrada.archivo) {
    return respuestaError("No hay campos para actualizar", 400);
  }

  try {
    if (!(await obtenerFila(env, id))) return respuestaError("Vehiculo no encontrado", 404);

    if (entrada.archivo) {
      campos.foto = await guardarFoto(env, id, entrada.archivo);
    }

    const columnas = Object.keys(campos);
    if (columnas.length > 0) {
      const sql = "UPDATE vehiculos SET " + columnas.map((c) => c + " = ?").join(", ") + " WHERE id = ?";
      await env.mantenimiento_db
        .prepare(sql)
        .bind(...columnas.map((columna) => campos[columna]), id)
        .run();
    }
    return respuestaJson(filaAApi(await obtenerFila(env, id)));
  } catch (error) {
    if (/UNIQUE constraint failed/i.test(error.message)) {
      return respuestaError("Ya existe otro vehiculo con esa placa", 409);
    }
    return respuestaError("Error al actualizar vehiculo: " + error.message, 500);
  }
}
