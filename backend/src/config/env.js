// backend/src/config/env.js
const path = require("path");
const dotenv = require("dotenv");

// Preferência: sempre carregar backend/.env (independente do diretório de execução)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Fallback (opcional): se você quiser suportar rodar em outros cwd com outro .env
// dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function required(name, value) {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new Error(`[ENV] Variável obrigatória ausente: ${name}`);
  }
  return value;
}

function toInt(name, value, fallback) {
  if (value === undefined || value === null || String(value).trim() === "") return fallback;
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`[ENV] ${name} deve ser um inteiro positivo. Recebido: ${value}`);
  }
  return n;
}

function toBool(value, fallback = false) {
  if (value === undefined || value === null || String(value).trim() === "") return fallback;
  return ["1", "true", "yes", "y", "on"].includes(String(value).toLowerCase());
}

function normalizeCorsOrigin(value) {
  if (!value || String(value).trim() === "") return "*";
  // permite múltiplas origens separadas por vírgula
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join(",");
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: toInt("PORT", process.env.PORT, 3000),
  APP_URL: process.env.APP_URL || "",

  DB_HOST: required("DB_HOST", process.env.DB_HOST),
  DB_USER: required("DB_USER", process.env.DB_USER),
  DB_PASS: process.env.DB_PASS || "",
  DB_NAME: required("DB_NAME", process.env.DB_NAME),
  DB_PORT: toInt("DB_PORT", process.env.DB_PORT, 3306),

  CORS_ORIGIN: normalizeCorsOrigin(process.env.CORS_ORIGIN) || "*",
  JWT_SECRET: process.env.JWT_SECRET || "",

  UPLOAD_DIR: process.env.UPLOAD_DIR || "uploads",
  MAX_UPLOAD_MB: toInt("MAX_UPLOAD_MB", process.env.MAX_UPLOAD_MB, 50),

  LOG_REQUESTS: toBool(process.env.LOG_REQUESTS, true),
};

if (env.NODE_ENV === "production") {
  required("JWT_SECRET", env.JWT_SECRET);
  if (env.CORS_ORIGIN === "*") {
    console.warn("[ENV] Aviso: CORS_ORIGIN está como '*'. Em produção, restrinja para seu domínio.");
  }
}

module.exports = env;
