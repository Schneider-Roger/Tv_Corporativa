const db = require("../config/db");

async function listarUnidades() {
  const sql = `
    SELECT id, nome, descricao, ativo, criado_em, atualizado_em
    FROM unidades
    ORDER BY nome ASC
  `;
  const [rows] = await db.query(sql);
  return rows;
}

module.exports = { listarUnidades };