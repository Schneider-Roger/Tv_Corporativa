const db = require("../config/db");

async function listarSetores(req, res) {
  try {
    const [rows] = await db.query(
      `
      SELECT id, nome, descricao, ativo, criado_em, atualizado_em
      FROM setores
      ORDER BY nome ASC
      `
    );

    return res.json(rows);
  } catch (err) {
    console.error("Erro ao listar setores:", err);
    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Falha ao listar setores",
    });
  }
}

module.exports = { listarSetores };
