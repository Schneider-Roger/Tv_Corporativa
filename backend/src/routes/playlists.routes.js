const express = require("express");
const router = express.Router();

const playlistsController = require("../controllers/playlists.controller");

// playlists
router.get("/", playlistsController.listar);
router.post("/", playlistsController.criar);
router.get("/:id", playlistsController.obter);
router.delete("/:id", playlistsController.excluir);

// itens
router.post("/:id/itens", playlistsController.adicionarItem);
router.delete("/:id/itens/:itemId", playlistsController.removerItem);
router.put("/:id/itens/reorder", playlistsController.reorder);

module.exports = router;
