const express = require("express");
const router = express.Router();

const midiasController = require("../controllers/midias.controller");

// Lista arquivos
router.get("/", midiasController.listar);

// Upload (campo: "file")
router.post("/upload", midiasController.uploadSingle, midiasController.upload);

// Excluir arquivo (por nome)
router.delete("/:filename", midiasController.remover);

module.exports = router;
