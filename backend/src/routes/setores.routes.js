const express = require("express");
const router = express.Router();

const setoresController = require("../controllers/setores.controller");


// GET /api/setores
router.get("/", setoresController.listarSetores);

// POST /api/setores
router.post("/", setoresController.criarSetor);

// DELETE /api/setores/:id
router.delete('/:id', setoresController.excluirSetor);

module.exports = router;
