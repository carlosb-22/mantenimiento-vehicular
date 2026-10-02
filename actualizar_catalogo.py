"""actualizar_catalogo.py

Cruza el catalogo publicado en Cloudflare R2 con el archivo local
`vehiculos_empresa.json` y agrega/actualiza la propiedad "foto" de cada
vehiculo haciendo match por "id".

Estructura del catalogo remoto (detectada automaticamente):
    {
      "version": "1.0.4",
      "ultimaActualizacion": "...",
      "vehiculos": [ { "id": 8, "nombre": "...", "placa": "...",
                       "foto": "8_1.jpg", "activo": true }, ... ]
    }

La propiedad "foto" del catalogo trae solo el nombre del archivo; el
script lo convierte a URL absoluta usando BASE_FOTOS:
    https://pub-2cfd7537f6a24512a06e125f7dc77a43.r2.dev/vehiculos/<archivo>

Uso:
    python actualizar_catalogo.py
"""

import json
import sys
import urllib.error
import urllib.parse
import urllib.request

URL_CATALOGO = "https://pub-2cfd7537f6a24512a06e125f7dc77a43.r2.dev/catalogo/catalogo.json"
BASE_FOTOS = "https://pub-2cfd7537f6a24512a06e125f7dc77a43.r2.dev/vehiculos/"
ARCHIVO_LOCAL = "vehiculos_empresa.json"
ARCHIVO_RESPALDO = "vehiculos_empresa.backup.json"
CLAVE_VEHICULOS = "vehiculos"

VERIFICAR_FOTOS = True   # Hace HEAD a cada URL de foto y avisa si no existe
CREAR_RESPALDO = True    # Copia el archivo local antes de sobrescribirlo
TIMEOUT = 30


def configurar_salida():
    """Evita UnicodeEncodeError al imprimir acentos en consolas Windows."""
    try:
        sys.stdout.reconfigure(errors="replace")
    except (AttributeError, ValueError):
        pass


def descargar_json(url):
    """Descarga y parsea el JSON remoto."""
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as res:
        return json.loads(res.read().decode("utf-8"))


def foto_a_url(foto):
    """Convierte el valor del catalogo en URL utilizable ('8_1.jpg' -> URL)."""
    foto = str(foto).strip()
    if not foto:
        return None
    if foto.lower().startswith(("http://", "https://")):
        return foto
    return BASE_FOTOS + urllib.parse.quote(foto.lstrip("/"))


def normalizar_placa(placa):
    """Normaliza una placa para comparaciones tolerantes (mayusculas, sin simbolos)."""
    if placa is None:
        return ""
    limpia = "".join(c for c in str(placa).upper() if c.isalnum())
    return "" if limpia in ("", "SINPLACA") else limpia


def extraer_vehiculos_catalogo(nodo, mapa=None, mapa_placa=None):
    """Recorre la estructura del catalogo (plana o anidada) y devuelve los
    mapas id -> registro y placa_normalizada -> registro."""
    if mapa is None:
        mapa = {}
        mapa_placa = {}

    if isinstance(nodo, list):
        for item in nodo:
            extraer_vehiculos_catalogo(item, mapa, mapa_placa)
    elif isinstance(nodo, dict):
        if "id" in nodo:
            # Es un vehiculo: se registra y no se sigue anidando dentro de el
            registro = {
                "id": nodo.get("id"),
                "nombre": nodo.get("nombre"),
                "placa": nodo.get("placa"),
                "foto": nodo.get("foto"),
                "activo": nodo.get("activo", True),
            }
            mapa[str(registro["id"])] = registro
            placa = normalizar_placa(registro["placa"])
            if placa:
                mapa_placa[placa] = registro
        else:
            # Contenedor / envoltorio: se recorren sus valores internos
            for valor in nodo.values():
                if isinstance(valor, (list, dict)):
                    extraer_vehiculos_catalogo(valor, mapa, mapa_placa)
    return mapa, mapa_placa


def obtener_vehiculos_locales(datos):
    """Devuelve la lista de vehiculos (dicts) del archivo local, soportando
    lista raiz o dict envoltorio con metadatos escalares."""
    if isinstance(datos, list):
        return [v for v in datos if isinstance(v, dict)]
    if isinstance(datos, dict):
        if isinstance(datos.get(CLAVE_VEHICULOS), list):
            return [v for v in datos[CLAVE_VEHICULOS] if isinstance(v, dict)]
        # Diccionario indexado por id: { "6": {...}, "65": {...} }
        return [v for v in datos.values() if isinstance(v, dict)]
    return []


def insertar_foto(vehiculo, url):
    """Asigna la foto conservando el orden original de las claves; si la clave
    es nueva se coloca despues de 'placa' (o de 'nombre') por legibilidad."""
    if url is None:
        return
    if "foto" in vehiculo:
        vehiculo["foto"] = url
        return
    nuevas = {}
    insertada = False
    for clave, valor in vehiculo.items():
        nuevas[clave] = valor
        if not insertada and clave in ("placa", "nombre"):
            nuevas["foto"] = url
            insertada = True
    if not insertada:
        nuevas["foto"] = url
    vehiculo.clear()
    vehiculo.update(nuevas)


def verificar_url(url):
    """Comprueba con HEAD que la foto existe en R2."""
    req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as res:
            return res.status == 200, res.headers.get("Content-Type", "")
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, OSError) as e:
        return False, str(e)


def leer_local():
    """Lee el archivo local en binario (conserva CRLF) y devuelve
    (contenido_crudo, datos_parseados)."""
    with open(ARCHIVO_LOCAL, "rb") as f:
        crudo = f.read()
    contenido = crudo.decode("utf-8")
    return contenido, json.loads(contenido)


def guardar_local(datos):
    """Escribe el archivo local con indent=2 y saltos CRLF, sin BOM."""
    texto = json.dumps(datos, indent=2, ensure_ascii=False) + "\r\n"
    with open(ARCHIVO_LOCAL, "w", encoding="utf-8", newline="\r\n") as f:
        f.write(texto)


def cruzar(vehiculos, mapa_catalogo):
    """Aplica la foto a cada vehiculo local. Devuelve (procesados, sin_match)."""
    procesados, sin_match = [], []
    for vehiculo in vehiculos:
        v_id = str(vehiculo.get("id"))
        item = mapa_catalogo.get(v_id)
        if item and item.get("foto"):
            url = foto_a_url(item["foto"])
            accion = "actualizada" if "foto" in vehiculo else "agregada"
            insertar_foto(vehiculo, url)
            procesados.append({
                "id": v_id,
                "nombre": vehiculo.get("nombre") or item.get("nombre"),
                "placa": vehiculo.get("placa") or item.get("placa"),
                "foto": url,
                "accion": accion,
            })
        else:
            sin_match.append(vehiculo)
    return procesados, sin_match


def ordenar_por_id(lista):
    """Ordena ids numericos o alfanumericos de forma estable."""
    return sorted(lista, key=lambda x: (0, int(x)) if str(x).isdigit() else (1, str(x)))


def revisar_fotos(procesados):
    """Verifica cada URL aplicada contra R2. Devuelve las que no estan disponibles."""
    if not (VERIFICAR_FOTOS and procesados):
        return []
    print("Verificando disponibilidad de las fotos en R2...")
    faltantes = []
    for p in procesados:
        existe, detalle = verificar_url(p["foto"])
        p["estado"] = "OK" if existe else "NO DISPONIBLE"
        if not existe:
            faltantes.append((p["id"], p["foto"], detalle))
    print()
    return faltantes


def imprimir_resumen(vehiculos, procesados, sin_match, mapa_catalogo, mapa_placa, faltantes):
    """Imprime el resumen del cruce."""
    print(f"===== RESUMEN: {len(procesados)} de {len(vehiculos)} vehiculos cruzados =====")
    if procesados:
        print(f"{'ID':>5}  {'NOMBRE':<27} {'PLACA':<10} {'ACCION':<11} {'ESTADO':<13} FOTO")
        print("-" * 110)
        for p in ordenar_por_id(procesados):
            print(f"{p['id']:>5}  {str(p['nombre'])[:27]:<27} {str(p['placa'])[:10]:<10} "
                  f"{p['accion']:<11} {p.get('estado', '-'):<13} {p['foto']}")
        agregadas = sum(1 for p in procesados if p["accion"] == "agregada")
        print(f"\nAgregadas: {agregadas} | Actualizadas: {len(procesados) - agregadas} | "
              f"Sin coincidencia: {len(sin_match)}")

    if faltantes:
        print("\nADVERTENCIA: fotos referenciadas pero no disponibles en R2:")
        for f_id, url, detalle in faltantes:
            print(f"  id {f_id}: {url} -> {detalle}")

    if sin_match:
        print("\nVehiculos locales sin coincidencia por 'id' en el catalogo:")
        for v in sin_match:
            print(f"  id {v.get('id')}: {v.get('nombre')} ({v.get('placa')})")

    ids_locales = {str(v.get("id")) for v in vehiculos}
    solo_catalogo = [i for i in mapa_catalogo if i not in ids_locales]
    if solo_catalogo:
        detalle = ", ".join(f"{i} ({mapa_catalogo[i].get('nombre')})"
                            for i in ordenar_por_id(solo_catalogo))
        print(f"\nIDs del catalogo ausentes en {ARCHIVO_LOCAL}: {detalle}")

    # Sugerencias por placa (informativas: el match aplicado es por id)
    sugerencias = []
    for v in sin_match:
        placa = normalizar_placa(v.get("placa"))
        if placa and placa in mapa_placa:
            item = mapa_placa[placa]
            sugerencias.append((v.get("id"), v.get("nombre"), item.get("id"),
                                item.get("nombre"), foto_a_url(item.get("foto"))))
    if sugerencias:
        print("\nPosibles coincidencias por PLACA (no aplicadas, match por id):")
        for local_id, local_nombre, cat_id, cat_nombre, url in sugerencias:
            print(f"  local id {local_id} '{local_nombre}' ~ catalogo id {cat_id} "
                  f"'{cat_nombre}' -> {url}")


def ejecutar():
    print("Obteniendo catalogo desde Cloudflare R2...")
    try:
        catalogo = descargar_json(URL_CATALOGO)
    except Exception as e:
        print(f"Error al descargar el catalogo: {e}")
        return

    mapa_catalogo, mapa_placa = extraer_vehiculos_catalogo(catalogo)
    version = catalogo.get("version") if isinstance(catalogo, dict) else "(sin version)"
    print(f"Catalogo version {version}: {len(mapa_catalogo)} vehiculos detectados.")

    contenido, datos_locales = leer_local()
    if CREAR_RESPALDO:
        with open(ARCHIVO_RESPALDO, "wb") as f:
            f.write(contenido.encode("utf-8"))
        print(f"Respaldo creado: {ARCHIVO_RESPALDO}")

    vehiculos = obtener_vehiculos_locales(datos_locales)
    print(f"Vehiculos locales encontrados: {len(vehiculos)}\n")

    procesados, sin_match = cruzar(vehiculos, mapa_catalogo)
    faltantes = revisar_fotos(procesados)
    guardar_local(datos_locales)
    imprimir_resumen(vehiculos, procesados, sin_match, mapa_catalogo, mapa_placa, faltantes)
    print(f"\nProceso completado. Archivo actualizado: {ARCHIVO_LOCAL}")


if __name__ == "__main__":
    configurar_salida()
    ejecutar()