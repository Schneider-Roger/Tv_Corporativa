// backend/src/services/devices.service.js
const db = require("../config/db");

function toIntOrNull(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0) return null;
  return n;
}

function toTinyInt(v, fallback = null) {
  if (v === undefined || v === null || v === "") return fallback;
  if (typeof v === "boolean") return v ? 1 : 0;
  const s = String(v).toLowerCase().trim();
  if (["1", "true", "yes", "y", "on"].includes(s)) return 1;
  if (["0", "false", "no", "n", "off"].includes(s)) return 0;
  return fallback;
}

async function listar(params = {}) {
  const {
    q,
    ativo,
    unidade_id,
    setor_id,
    playlist_id,
    limit = 200,
    offset = 0,
  } = params;

  const where = [];
  const values = [];

  if (q && String(q).trim()) {
    where.push("(LOWER(nome) LIKE ? OR LOWER(device_key) LIKE ?)");
    const like = `%${String(q).toLowerCase().trim()}%`;
    values.push(like, like);
  }

  const ativoInt = toTinyInt(ativo, null);
  if (ativoInt !== null) {
    where.push("ativo = ?");
    values.push(ativoInt);
  }

  const un = toIntOrNull(unidade_id);
  if (un !== null) {
    where.push("unidade_id = ?");
    values.push(un);
  }

  const se = toIntOrNull(setor_id);
  if (se !== null) {
    where.push("setor_id = ?");
    values.push(se);
  }

  const pl = toIntOrNull(playlist_id);
  if (pl !== null) {
    where.push("playlist_id = ?");
    values.push(pl);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const lim = Math.min(Math.max(Number(limit) || 200, 1), 500);
  const off = Math.max(Number(offset) || 0, 0);

  const sql = `
    SELECT
      id, device_key, nome,
      unidade_id, setor_id, playlist_id,
      ativo, ultimo_heartbeat,
      criado_em, atualizado_em
    FROM devices
    ${whereSql}
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `;

  values.push(lim, off);

  const [rows] = await db.query(sql, values);
  return rows;
}

async function obterPorId(id) {
  const sql = `
    SELECT
      id, device_key, nome,
      unidade_id, setor_id, playlist_id,
      ativo, ultimo_heartbeat,
      criado_em, atualizado_em
    FROM devices
    WHERE id = ?
    LIMIT 1
  `;
  const [rows] = await db.query(sql, [id]);
  return rows[0] || null;
}

async function criar(data) {
  const sql = `
    INSERT INTO devices (device_key, nome, unidade_id, setor_id, playlist_id, ativo, ultimo_heartbeat)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const payload = [
    data.device_key,
    data.nome || null,
    data.unidade_id ?? null,
    data.setor_id ?? null,
    data.playlist_id ?? null,
    data.ativo ?? 1,
    data.ultimo_heartbeat ?? null,
  ];

  const [result] = await db.query(sql, payload);
  return result.insertId;
}

async function atualizar(id, data) {
  const sql = `
    UPDATE devices
    SET
      device_key = ?,
      nome = ?,
      unidade_id = ?,
      setor_id = ?,
      playlist_id = ?,
      ativo = ?
    WHERE id = ?
  `;

  const payload = [
    data.device_key,
    data.nome || null,
    data.unidade_id ?? null,
    data.setor_id ?? null,
    data.playlist_id ?? null,
    data.ativo ?? 1,
    id,
  ];

  const [result] = await db.query(sql, payload);
  return result.affectedRows;
}

async function atualizarAtivo(id, ativo) {
  const sql = `UPDATE devices SET ativo = ? WHERE id = ?`;
  const [result] = await db.query(sql, [ativo, id]);
  return result.affectedRows;
}

async function heartbeat(id) {
  const sql = `UPDATE devices SET ultimo_heartbeat = NOW() WHERE id = ?`;
  const [result] = await db.query(sql, [id]);
  return result.affectedRows;
}

async function remover(id) {
  const sql = `DELETE FROM devices WHERE id = ?`;
  const [result] = await db.query(sql, [id]);
  return result.affectedRows;
}

module.exports = {
  listar,
  obterPorId,
  criar,
  atualizar,
  atualizarAtivo,
  heartbeat,
  remover,
};
