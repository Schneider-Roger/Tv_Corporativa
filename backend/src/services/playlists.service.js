const db = require("../config/db");

function inferTipo(filename) {
  const f = String(filename || "").toLowerCase();
  if (f.endsWith(".png") || f.endsWith(".jpg") || f.endsWith(".jpeg") || f.endsWith(".webp") || f.endsWith(".gif")) return "image";
  if (f.endsWith(".mp4") || f.endsWith(".webm") || f.endsWith(".mov") || f.endsWith(".mkv")) return "video";
  if (f.endsWith(".pdf")) return "pdf";
  return "other";
}

async function listarPlaylists() {
  const sql = `
    SELECT
      p.id, p.nome, p.descricao, p.ativo, p.criado_em, p.atualizado_em,
      (SELECT COUNT(*) FROM playlist_itens i WHERE i.playlist_id = p.id) AS itens
    FROM playlists p
    ORDER BY p.nome ASC
  `;
  const [rows] = await db.query(sql);
  return rows;
}

async function criarPlaylist({ nome, descricao }) {
  const sql = `INSERT INTO playlists (nome, descricao) VALUES (?, ?)`;
  const [r] = await db.query(sql, [nome, descricao || null]);
  return { id: r.insertId, nome, descricao: descricao || null, ativo: 1 };
}

async function obterPlaylist(id) {
  const [pRows] = await db.query(
    `SELECT id, nome, descricao, ativo, criado_em, atualizado_em FROM playlists WHERE id = ?`,
    [id]
  );
  if (!pRows.length) return null;

  const [iRows] = await db.query(
    `SELECT id, playlist_id, filename, tipo, duracao_seg, ordem, criado_em
     FROM playlist_itens
     WHERE playlist_id = ?
     ORDER BY ordem ASC, id ASC`,
    [id]
  );

  return { ...pRows[0], itens: iRows };
}

async function excluirPlaylist(id) {
  const [r] = await db.query(`DELETE FROM playlists WHERE id = ?`, [id]);
  return r.affectedRows > 0;
}

async function adicionarItem(playlistId, { filename, duracao_seg }) {
  const tipo = inferTipo(filename);

  // próxima ordem
  const [maxRows] = await db.query(
    `SELECT COALESCE(MAX(ordem), 0) AS max_ordem FROM playlist_itens WHERE playlist_id = ?`,
    [playlistId]
  );
  const ordem = Number(maxRows[0].max_ordem) + 1;

  const dur = (tipo === "image" || tipo === "pdf")
    ? Math.max(1, Number(duracao_seg || 10))
    : null;

  const sql = `
    INSERT INTO playlist_itens (playlist_id, filename, tipo, duracao_seg, ordem)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [r] = await db.query(sql, [playlistId, filename, tipo, dur, ordem]);

  return { id: r.insertId, playlist_id: playlistId, filename, tipo, duracao_seg: dur, ordem };
}

async function removerItem(playlistId, itemId) {
  const [r] = await db.query(
    `DELETE FROM playlist_itens WHERE playlist_id = ? AND id = ?`,
    [playlistId, itemId]
  );
  return r.affectedRows > 0;
}

async function reorderItens(playlistId, idsEmOrdem) {
  // idsEmOrdem = [itemId1, itemId2, ...]
  if (!Array.isArray(idsEmOrdem) || idsEmOrdem.length === 0) return;

  // Atualiza ordem em transação
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    for (let i = 0; i < idsEmOrdem.length; i++) {
      const itemId = idsEmOrdem[i];
      const ordem = i + 1;
      await conn.query(
        `UPDATE playlist_itens SET ordem = ? WHERE playlist_id = ? AND id = ?`,
        [ordem, playlistId, itemId]
      );
    }

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

module.exports = {
  listarPlaylists,
  criarPlaylist,
  obterPlaylist,
  excluirPlaylist,
  adicionarItem,
  removerItem,
  reorderItens,
};
