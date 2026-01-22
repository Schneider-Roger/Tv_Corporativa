const db = require("../config/db");

async function listarSetores() {
  const sql = `
    SELECT id, nome, descricao, ativo, criado_em, atualizado_em
    FROM setores
    ORDER BY nome ASC
  `;
  const [rows] = await db.query(sql);
  return rows;
}

module.exports = { listarSetores };