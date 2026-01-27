
const db = require("../config/db");

async function listarSetores() {
  const [rows] = await db.query("SELECT * FROM setores ORDER BY nome ASC");
  return rows;
}

async function criarSetor({ nome, descricao, ativo }) {
  const sql = `INSERT INTO setores (nome, descricao, ativo) VALUES (?, ?, ?)`;
  const [r] = await db.query(sql, [nome, descricao || null, ativo ? 1 : 0]);
  return { id: r.insertId, nome, descricao, ativo };
}

module.exports = {
  listarSetores,
  criarSetor,
  async excluirSetor(id) {
    const [r] = await db.query('DELETE FROM setores WHERE id = ?', [id]);
    return r.affectedRows > 0;
  },
};
