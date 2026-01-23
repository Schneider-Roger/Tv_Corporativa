const express = require("express");
const router = express.Router();

const unidadesController = require("../controllers/unidades.controller");

// GET /api/unidades
router.get("/", unidadesController.listarUnidades);

// POST /api/unidades
router.post("/", unidadesController.criarUnidade);

// DELETE /api/unidades/:id
router.delete("/:id", unidadesController.deletarUnidade);

module.exports = router;
