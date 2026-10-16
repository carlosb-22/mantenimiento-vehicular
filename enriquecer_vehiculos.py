import json
import urllib.request

URL_CATALOGO = "https://pub-2cfd7537f6a24512a06e125f7dc77a43.r2.dev/catalogo/catalogo.json"
ARCHIVO_LOCAL = "vehiculos_empresa.json"

def actualizar_vehiculos():
    # 1. Obtener catálogo remoto desde R2
    print("Descargando catálogo remoto desde Cloudflare R2...")
    req = urllib.request.Request(URL_CATALOGO, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        catalogo = json.loads(response.read().decode())

    # Mapear el catálogo por ID para búsqueda rápida
    # Asume que catalogo es una lista de objetos con campo "id" y "foto"
    mapa_catalogo = {}
    if isinstance(catalogo, list):
        for item in catalogo:
            item_id = str(item.get("id"))
            mapa_catalogo[item_id] = item.get("foto")
    elif isinstance(catalogo, dict):
        for key, item in catalogo.items():
            if isinstance(item, dict):
                mapa_catalogo[str(item.get("id", key))] = item.get("foto")

    # 2. Leer vehiculos_empresa.json local
    with open(ARCHIVO_LOCAL, "r", encoding="utf-8") as f:
        vehiculos = json.load(f)

    # 3. Cruzar los datos mediante 'id'
    actualizados = 0
    if isinstance(vehiculos, list):
        for vehiculo in vehiculos:
            v_id = str(vehiculo.get("id"))
            if v_id in mapa_catalogo and mapa_catalogo[v_id]:
                vehiculo["foto"] = mapa_catalogo[v_id]
                actualizados += 1
    elif isinstance(vehiculos, dict):
        for v_id, vehiculo in vehiculos.items():
            if str(v_id) in mapa_catalogo and mapa_catalogo[str(v_id)]:
                vehiculo["foto"] = mapa_catalogo[str(v_id)]
                actualizados += 1

    # 4. Guardar los cambios en el archivo local
    with open(ARCHIVO_LOCAL, "w", encoding="utf-8") as f:
        json.dump(vehiculos, f, indent=2, ensure_ascii=False)

    print(f"¡Éxito! Se actualizaron {actualizados} vehículos con su campo 'foto'.")

if __name__ == "__main__":
    actualizar_vehiculos()