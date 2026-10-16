/* GET /api/kilometrajes -> proxy same-origin del API externo de kilometrajes.
   El origen usa http:// y no envia cabeceras CORS, por lo que el navegador
   (pagina servida por HTTPS) no puede consumirlo directamente. */

const URL_ORIGEN = "http://logistica.arrayanhn.com:3004/api/public/kilometrajes-actuales";

const CABECERAS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400"
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CABECERAS });
}

export async function onRequestGet() {
  try {
    const respuesta = await fetch(URL_ORIGEN, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000)
    });
    if (!respuesta.ok) {
      return new Response(JSON.stringify({ error: "Origen HTTP " + respuesta.status }), {
        status: 502,
        headers: { ...CABECERAS, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
      });
    }
    const cuerpo = await respuesta.text();
    return new Response(cuerpo, {
      status: 200,
      headers: { ...CABECERAS, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "No se pudo consultar kilometrajes: " + error.message }), {
      status: 502,
      headers: { ...CABECERAS, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
    });
  }
}
