const setoresService = require("../services/setores.service");

async function listarSetores(req, res) {
  try {
    const rows = await setoresService.listarSetores();
    return res.status(200).json(rows);
  } catch (err) {
    console.error("Erro ao listar setores:", {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });

    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Falha ao listar setores.",
    });
  }
}

module.exports = {
  listarSetores,
  async criarSetor(req, res) {
    try {
      const { nome, descricao, ativo } = req.body || {};
      if (!nome || String(nome).trim().length < 2) {
        return res.status(400).json({ error: "BAD_REQUEST", message: "Nome do setor é obrigatório." });
      }
      const setor = await setoresService.criarSetor({ nome: String(nome).trim(), descricao: descricao ? String(descricao).trim() : null, ativo: ativo ? 1 : 0 });
      return res.status(201).json(setor);
    } catch (err) {
      console.error("Erro ao criar setor:", err);
      return res.status(500).json({ error: "ERRO_INTERNO", message: "Falha ao criar setor." });
    }
  },
  async excluirSetor(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido." });
      const ok = await setoresService.excluirSetor(id);
      if (!ok) return res.status(404).json({ error: "NOT_FOUND", message: "Setor não encontrado." });
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("Erro ao excluir setor:", err);
      return res.status(500).json({ error: "ERRO_INTERNO", message: "Falha ao excluir setor." });
    }
  },
};
