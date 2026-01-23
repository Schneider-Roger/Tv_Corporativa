// backend/src/routes/devices.routes.js
const express = require("express");
const router = express.Router();

const devicesController = require("../controllers/devices.controller");

// Listar
router.get("/", devicesController.listarDevices);

// Detalhe
router.get("/:id", devicesController.obterDevice);

// Criar
router.post("/", devicesController.criarDevice);

// Atualizar
router.put("/:id", devicesController.atualizarDevice);

// Ativar/Desativar
router.patch("/:id/ativo", devicesController.atualizarAtivo);

// Heartbeat (marcar online)
router.patch("/:id/heartbeat", devicesController.heartbeat);

// Remover
router.delete("/:id", devicesController.removerDevice);

module.exports = router;
