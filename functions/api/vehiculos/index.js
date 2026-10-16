/* GET /api/vehiculos  -> lista completa desde D1
   POST /api/vehiculos -> alta (JSON o multipart con foto opcional). Requiere Authorization: Bearer <API_TOKEN> */
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

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.mantenimiento_db
      .prepare("SELECT * FROM vehiculos ORDER BY id")
      .all();
    return respuestaJson({ total: results.length, vehiculos: results.map(filaAApi) });
  } catch (error) {
    return respuestaError("Error al leer vehiculos: " + error.message, 500);
  }
}

export async function onRequestPost({ request, env }) {
  const acceso = comprobarToken(request, env);
  if (acceso) return respuestaError(acceso.mensaje, acceso.estado);

  let entrada;
  let campos;
  try {
    entrada = await leerEntrada(request);
    campos = prepararCampos(entrada.datos);
    if (!campos.nombre) throw new Error("El campo nombre es obligatorio");
    if (entrada.archivo) validarArchivo(entrada.archivo);
  } catch (error) {
    return respuestaError(error.message, 400);
  }

  const idEntrada = entrada.datos.id;
  if (idEntrada !== undefined && idEntrada !== null && idEntrada !== "") {
    const id = parsearId(idEntrada);
    if (id === null) return respuestaError("id debe ser un entero positivo", 400);
    campos.id = id;
  }

  const columnas = Object.keys(campos);
  const sql = "INSERT INTO vehiculos (" + columnas.join(", ") + ") VALUES (" +
    columnas.map(() => "?").join(", ") + ")";

  let idNuevo;
  try {
    const resultado = await env.mantenimiento_db
      .prepare(sql)
      .bind(...columnas.map((columna) => campos[columna]))
      .run();
    idNuevo = resultado.meta.last_row_id;
  } catch (error) {
    if (/UNIQUE constraint failed/i.test(error.message)) {
      return respuestaError("Ya existe un vehiculo con esa placa o id", 409);
    }
    return respuestaError("Error al insertar vehiculo: " + error.message, 500);
  }

  try {
    if (entrada.archivo) {
      const url = await guardarFoto(env, idNuevo, entrada.archivo);
      await env.mantenimiento_db
        .prepare("UPDATE vehiculos SET foto = ? WHERE id = ?")
        .bind(url, idNuevo)
        .run();
    }
    return respuestaJson(filaAApi(await obtenerFila(env, idNuevo)), 201);
  } catch (error) {
    return respuestaError("Vehiculo creado (id " + idNuevo + ") pero fallo la foto: " + error.message, 500);
  }
}
