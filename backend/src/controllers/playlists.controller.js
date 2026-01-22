const playlistsService = require("../services/playlists.service");

function badRequest(res, message) {
  return res.status(400).json({ error: "BAD_REQUEST", message });
}

async function listar(req, res) {
  try {
    const rows = await playlistsService.listarPlaylists();
    return res.status(200).json(rows);
  } catch (err) {
    console.error("Erro ao listar playlists:", err);
    return res.status(500).json({ error: "ERRO_INTERNO", message: "Falha ao listar playlists." });
  }
}

async function criar(req, res) {
  try {
    const { nome, descricao } = req.body || {};
    const n = String(nome || "").trim();
    if (!n || n.length > 100) return badRequest(res, "Nome inválido (1-100 caracteres).");
    const d = descricao ? String(descricao).trim() : null;
    if (d && d.length > 500) return badRequest(res, "Descrição muito longa (máx. 500 caracteres).");

    const created = await playlistsService.criarPlaylist({ nome: n, descricao: d });
    return res.status(201).json(created);
  } catch (err) {
    // duplicidade de nome
    if (err && err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "DUPLICATE", message: "Já existe uma playlist com esse nome." });
    }

    console.error("Erro ao criar playlist:", err);
    return res.status(500).json({ error: "ERRO_INTERNO", message: "Falha ao criar playlist." });
  }
}

async function obter(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return badRequest(res, "ID inválido.");

    const p = await playlistsService.obterPlaylist(id);
    if (!p) return res.status(404).json({ error: "NOT_FOUND", message: "Playlist não encontrada." });

    return res.status(200).json(p);
  } catch (err) {
    console.error("Erro ao obter playlist:", err);
    return res.status(500).json({ error: "ERRO_INTERNO", message: "Falha ao obter playlist." });
  }
}

async function excluir(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return badRequest(res, "ID inválido.");

    const ok = await playlistsService.excluirPlaylist(id);
    if (!ok) return res.status(404).json({ error: "NOT_FOUND", message: "Playlist não encontrada." });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Erro ao excluir playlist:", err);
    return res.status(500).json({ error: "ERRO_INTERNO", message: "Falha ao excluir playlist." });
  }
}

async function adicionarItem(req, res) {
  try {
    const playlistId = Number(req.params.id);
    if (!Number.isFinite(playlistId)) return badRequest(res, "ID inválido.");

    const { filename, duracao_seg } = req.body || {};
    const f = String(filename || "").trim();
    if (!f) return badRequest(res, "Informe o filename da mídia.");

    // confirma playlist existe
    const p = await playlistsService.obterPlaylist(playlistId);
    if (!p) return res.status(404).json({ error: "NOT_FOUND", message: "Playlist não encontrada." });

    const item = await playlistsService.adicionarItem(playlistId, { filename: f, duracao_seg });
    return res.status(201).json(item);
  } catch (err) {
    console.error("Erro ao adicionar item:", err);
    return res.status(500).json({ error: "ERRO_INTERNO", message: "Falha ao adicionar item." });
  }
}

async function removerItem(req, res) {
  try {
    const playlistId = Number(req.params.id);
    const itemId = Number(req.params.itemId);
    if (!Number.isFinite(playlistId) || !Number.isFinite(itemId)) return badRequest(res, "ID inválido.");

    const ok = await playlistsService.removerItem(playlistId, itemId);
    if (!ok) return res.status(404).json({ error: "NOT_FOUND", message: "Item não encontrado." });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Erro ao remover item:", err);
    return res.status(500).json({ error: "ERRO_INTERNO", message: "Falha ao remover item." });
  }
}

async function reorder(req, res) {
  try {
    const playlistId = Number(req.params.id);
    if (!Number.isFinite(playlistId)) return badRequest(res, "ID inválido.");

    const { order } = req.body || {};
    if (!Array.isArray(order) || order.length === 0) return badRequest(res, "Informe 'order' como array de IDs.");

    await playlistsService.reorderItens(playlistId, order.map(Number));
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Erro ao reordenar itens:", err);
    return res.status(500).json({ error: "ERRO_INTERNO", message: "Falha ao reordenar itens." });
  }
}

module.exports = {
  listar,
  criar,
  obter,
  excluir,
  adicionarItem,
  removerItem,
  reorder,
};
