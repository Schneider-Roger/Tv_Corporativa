const express = require("express");
const router = express.Router();

const unidadesController = require("../controllers/unidades.controller");

// GET /api/unidades
router.get("/", unidadesController.listarUnidades);

// POST /api/unidades
router.post("/", unidadesController.criarUnidade);

module.exports = router;
