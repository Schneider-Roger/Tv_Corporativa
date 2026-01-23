const db = require("../config/db");

async function listarUnidades() {
  const sql = `
    SELECT u.id, u.nome, u.cidade, u.tipo, u.setor_id, s.nome AS setor_nome, u.ativo, u.criado_em, u.atualizado_em
    FROM unidades u
    LEFT JOIN setores s ON u.setor_id = s.id
    ORDER BY u.nome ASC
  `;
  const [rows] = await db.query(sql);
  return rows;
}

async function criarUnidade(payload) {
  const { nome, cidade, tipo, setor_id, ativo } = payload;
  const sql = `
    INSERT INTO unidades (nome, cidade, tipo, setor_id, ativo, criado_em, atualizado_em)
    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
  `;
  const [result] = await db.query(sql, [nome, cidade || null, tipo || null, setor_id || null, ativo ? 1 : 0]);
  return result.insertId;
}

async function deletarUnidade(id) {
  const sql = `DELETE FROM unidades WHERE id = ?`;
  const [result] = await db.query(sql, [id]);
  return result.affectedRows > 0;
}

module.exports = { listarUnidades, criarUnidade, deletarUnidade };