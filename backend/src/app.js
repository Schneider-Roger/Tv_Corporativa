// backend/src/app.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require('express-rate-limit');

const env = require("./config/env");

const healthRoutes = require("./routes/health.routes");
const setoresRoutes = require("./routes/setores.routes");
const playlistsRoutes = require("./routes/playlists.routes");
const devicesRoutes = require("./routes/devices.routes");
const midiasRoutes = require("./routes/midias.routes");
const unidadesRoutes = require("./routes/unidades.routes");  // Adicionado

const app = express();

// Rate limiting
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // 100 req/15min

// Logs simples (opcional)
if (env.LOG_REQUESTS) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// CORS
const corsOrigin = env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(",").map((s) => s.trim());
app.use(
  cors({
    origin: corsOrigin,
  })
);

app.use(express.json({ limit: `${env.MAX_UPLOAD_MB}mb` }));

// Servir uploads (mídias)
app.use("/uploads", express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));


// Rotas
app.use("/api/health", healthRoutes);
app.use("/api/setores", setoresRoutes);
app.use("/api/playlists", playlistsRoutes);
app.use("/api/devices", devicesRoutes);
app.use("/api/midias", midiasRoutes);
app.use("/api/unidades", unidadesRoutes);

// Servir arquivos estáticos do admin (depois das rotas da API)
app.use(express.static(path.join(__dirname, '../../admin/public')));

// 404 padrão
app.use((req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "Rota não encontrada.",
  });
});

module.exports = app;
