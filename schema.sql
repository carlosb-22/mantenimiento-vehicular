-- Esquema de la base de datos D1 "mantenimiento-db"
-- Tabla principal de la flota de vehículos.
-- Ejecutar: npx wrangler d1 execute mantenimiento-db --file=./schema.sql --remote

CREATE TABLE IF NOT EXISTS vehiculos (
  id                INTEGER PRIMARY KEY,
  nombre            TEXT,
  marca             TEXT,
  modelo            TEXT,
  anio              INTEGER,
  color             TEXT,
  tipo              TEXT,
  asignado          TEXT,
  placa             TEXT UNIQUE,
  vin               TEXT,
  propietario       TEXT,
  proxima_revision  TEXT,
  polizaSeguro      TEXT,
  centroInspeccion  TEXT,
  modeloMotor       TEXT,
  serialMotor       TEXT,
  cilindrada        TEXT,
  potencia          TEXT,
  combustible       TEXT,
  tanqueCapacidad   TEXT,
  transmision       TEXT,
  direccion         TEXT,
  aceiteRecomendado TEXT,
  turbo             TEXT,
  voltaje           TEXT,
  bateriaAh         TEXT,
  cca               TEXT,
  fusiblePrincipal  TEXT,
  alternador        TEXT,
  starter           TEXT,
  foto              TEXT,
  estado_vehicular  TEXT,
  observaciones     TEXT
);

CREATE INDEX IF NOT EXISTS idx_vehiculos_estado ON vehiculos (estado_vehicular);
