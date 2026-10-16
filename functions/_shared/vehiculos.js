/* Utilidades compartidas de la API de vehiculos (Pages Functions + D1 + R2).
   Este archivo no exporta handlers onRequest*, por lo que no crea rutas propias. */

export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
};

/* Base publica del bucket R2 donde se guardan las fotos (vehiculos/<archivo>) */
export const BASE_FOTOS_PUBLICA = "https://pub-2cfd7537f6a24512a06e125f7dc77a43.r2.dev/vehiculos/";

/* [columna en D1, campo que usa la SPA en index.html]
   La API traduce en ambos sentidos, por lo que el frontend mantiene sus mapeos. */
const CAMPOS = [
  ["id", "id"],
  ["nombre", "nombre"],
  ["marca", "marca"],
  ["modelo", "modelo"],
  ["anio", "anio"],
  ["color", "color"],
  ["tipo", "tipo"],
  ["asignado", "asignado"],
  ["placa", "placa"],
  ["vin", "vin"],
  ["propietario", "propietario"],
  ["proxima_revision", "proxima_revision"],
  ["estado_vehicular", "estado-vehicular"],
  ["foto", "foto"],
  ["polizaSeguro", "poliza"],
  ["centroInspeccion", "centroInspeccion"],
  ["modeloMotor", "modeloMotor"],
  ["serialMotor", "codigoMotor"],
  ["cilindrada", "cilindrada"],
  ["potencia", "potencia"],
  ["combustible", "combustible"],
  ["tanqueCapacidad", "capacidadTanqueGal"],
  ["transmision", "transmision"],
  ["direccion", "sistemaDireccion"],
  ["aceiteRecomendado", "aceite"],
  ["turbo", "turbo"],
  ["voltaje", "voltaje"],
  ["bateriaAh", "bateria"],
  ["cca", "cca"],
  ["fusiblePrincipal", "fusible"],
  ["alternador", "voltajeAlternador"],
  ["starter", "motorArranque"],
  ["observaciones", "observaciones"]
];

const COLUMNA_POR_CAMPO = Object.fromEntries(CAMPOS.map(([columna, campo]) => [campo, columna]));

const TIPOS_FOTO = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

export function respuestaJson(datos, estado = 200) {
  return new Response(JSON.stringify(datos), {
    status: estado,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

export function respuestaError(mensaje, estado) {
  return respuestaJson({ error: mensaje }, estado);
}

export function respuestaOpciones() {
  return new Response(null, { status: 204, headers: CORS });
}

/* Fila de D1 -> objeto con los nombres de campo de la SPA */
export function filaAApi(fila) {
  if (!fila) return null;
  const salida = {};
  for (const [columna, campo] of CAMPOS) {
    salida[campo] = fila[columna] === undefined ? null : fila[columna];
  }
  return salida;
}

/* Devuelve null si el token es valido, o { estado, mensaje } si no lo es */
export function comprobarToken(request, env) {
  if (!env.API_TOKEN) return { estado: 503, mensaje: "API_TOKEN no esta configurado en el proyecto" };
  const cabecera = request.headers.get("Authorization") || "";
  const esperado = "Bearer " + env.API_TOKEN;
  if (cabecera.length !== esperado.length) return { estado: 401, mensaje: "No autorizado" };
  let diferencias = 0;
  for (let i = 0; i < esperado.length; i++) {
    diferencias |= cabecera.charCodeAt(i) ^ esperado.charCodeAt(i);
  }
  return diferencias === 0 ? null : { estado: 401, mensaje: "No autorizado" };
}

/* Lee el cuerpo: JSON (application/json) o formulario (multipart/form-data con archivo opcional "foto") */
export async function leerEntrada(request) {
  const tipo = request.headers.get("Content-Type") || "";
  if (tipo.includes("multipart/form-data")) {
    const formulario = await request.formData();
    const datos = {};
    for (const [clave, valor] of formulario.entries()) {
      if (typeof valor === "string") datos[clave] = valor;
    }
    const archivo = formulario.get("foto");
    const tieneArchivo = archivo && typeof archivo !== "string" && archivo.size > 0;
    return { datos, archivo: tieneArchivo ? archivo : null };
  }
  if (tipo.includes("application/json")) {
    const cuerpo = await request.json();
    if (!cuerpo || typeof cuerpo !== "object" || Array.isArray(cuerpo)) {
      throw new Error("El cuerpo JSON debe ser un objeto");
    }
    return { datos: cuerpo, archivo: null };
  }
  throw new Error("Content-Type no soportado (usa application/json o multipart/form-data)");
}

/* Campos de la SPA -> columnas de D1 con su valor normalizado */
export function prepararCampos(datos) {
  const campos = {};
  for (const [campo, valor] of Object.entries(datos)) {
    if (campo === "id" || valor === undefined) continue;
    const columna = COLUMNA_POR_CAMPO[campo];
    if (!columna) throw new Error("Campo no permitido: " + campo);
    let normalizado;
    if (valor === null || (typeof valor === "string" && valor.trim() === "")) {
      normalizado = null;
    } else if (typeof valor === "boolean") {
      normalizado = valor ? "S\u00ed" : "No";
    } else if (columna === "anio") {
      normalizado = Number.parseInt(valor, 10);
      if (!Number.isInteger(normalizado)) throw new Error("anio debe ser un entero");
    } else {
      normalizado = String(valor);
    }
    campos[columna] = normalizado;
  }
  return campos;
}

export function validarArchivo(archivo) {
  if (!TIPOS_FOTO[archivo.type]) {
    throw new Error("Formato de imagen no permitido (usa JPG, PNG o WEBP)");
  }
}

/* Sube la foto a R2 como vehiculos/<id>.<ext> y devuelve su URL publica */
export async function guardarFoto(env, id, archivo) {
  validarArchivo(archivo);
  const nombre = id + "." + TIPOS_FOTO[archivo.type];
  await env.FOTOS.put("vehiculos/" + nombre, await archivo.arrayBuffer(), {
    httpMetadata: { contentType: archivo.type }
  });
  return BASE_FOTOS_PUBLICA + nombre;
}

export function obtenerFila(env, id) {
  return env.mantenimiento_db.prepare("SELECT * FROM vehiculos WHERE id = ?").bind(id).first();
}

export function parsearId(valor) {
  const id = Number.parseInt(valor, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}
