const express = require("express");

const healthRoutes = require("./config/routes/health.routes"); // se já existir no seu projeto
const setoresRoutes = require("./routes/setores.routes");

const app = express();

app.use(express.json());

// Rotas
app.use("/health", healthRoutes);
app.use("/api/setores", setoresRoutes);

module.exports = app;
