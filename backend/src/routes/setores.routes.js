const express = require("express");
const router = express.Router();

const setoresController = require("../controllers/setores.controller");

// GET /api/setores
router.get("/", setoresController.listarSetores);

module.exports = router;
