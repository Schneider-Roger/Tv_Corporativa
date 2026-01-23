const unidadesService = require("../services/unidades.service");

async function listarUnidades(req, res) {
  try {
    const rows = await unidadesService.listarUnidades();
    return res.status(200).json(rows);
  } catch (err) {
    console.error("Erro ao listar unidades:", {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });

    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Falha ao listar unidades.",
    });
  }
}

async function criarUnidade(req, res) {
  try {
    const { nome, cidade, tipo, setor_id, ativo } = req.body || {};

    if (!nome || String(nome).trim() === "") {
      return res.status(400).json({
        error: "VALIDACAO",
        message: "Nome é obrigatório.",
      });
    }

    const payload = {
      nome: String(nome).trim(),
      cidade: cidade ? String(cidade).trim() : null,
      tipo: tipo ? String(tipo).trim() : null,
      setor_id: setor_id ? Number(setor_id) : null,
      ativo: ativo !== undefined ? Boolean(ativo) : true,
    };

    const id = await unidadesService.criarUnidade(payload);
    return res.status(201).json({ id, message: "Unidade criada com sucesso." });
  } catch (err) {
    console.error("Erro ao criar unidade:", {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });

    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Falha ao criar unidade.",
    });
  }
}

module.exports = {
  listarUnidades,
  criarUnidade,
};
