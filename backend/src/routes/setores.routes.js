const express = require("express");
const router = express.Router();

const { listarSetores } = require("../controllers/setores.controller");

router.get("/", listarSetores);

module.exports = router;
