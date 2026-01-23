// backend/src/controllers/devices.controller.js
const devicesService = require("../services/devices.service");

function isValidDeviceKey(v) {
  const s = String(v || "").trim();
  if (!s) return false;
  if (s.length > 64) return false;
  // permite letras, números, hífen e underline
  return /^[a-zA-Z0-9_-]+$/.test(s);
}

function parseId(req) {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

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

async function listarDevices(req, res) {
  try {
    const rows = await devicesService.listar({
      q: req.query.q,
      ativo: req.query.ativo,
      unidade_id: req.query.unidade_id,
      setor_id: req.query.setor_id,
      playlist_id: req.query.playlist_id,
      limit: req.query.limit,
      offset: req.query.offset,
    });

    return res.status(200).json(rows);
  } catch (err) {
    console.error("Erro ao listar devices:", {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });

    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Falha ao listar devices.",
    });
  }
}

async function obterDevice(req, res) {
  try {
    const id = parseId(req);
    if (!id) {
      return res.status(400).json({ error: "VALIDACAO", message: "ID inválido." });
    }

    const device = await devicesService.obterPorId(id);
    if (!device) {
      return res.status(404).json({ error: "NAO_ENCONTRADO", message: "Device não encontrado." });
    }

    return res.status(200).json(device);
  } catch (err) {
    console.error("Erro ao obter device:", {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });

    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Falha ao obter device.",
    });
  }
}

async function criarDevice(req, res) {
  try {
    const { device_key, nome, unidade_id, setor_id, playlist_id, ativo } = req.body || {};

    if (!isValidDeviceKey(device_key)) {
      return res.status(400).json({
        error: "VALIDACAO",
        message: "device_key é obrigatório e deve conter apenas letras/números/underscore/hífen (até 64).",
      });
    }

    const payload = {
      device_key: String(device_key).trim(),
      nome: nome ? String(nome).trim() : null,
      unidade_id: toIntOrNull(unidade_id),
      setor_id: toIntOrNull(setor_id),
      playlist_id: toIntOrNull(playlist_id),
      ativo: toTinyInt(ativo, 1),
    };

    const id = await devicesService.criar(payload);
    const novo = await devicesService.obterPorId(id);

    return res.status(201).json(novo);
  } catch (err) {
    // Tratamento especial para UNIQUE(device_key)
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "DUPLICADO",
        message: "Já existe um device com este device_key.",
      });
    }

    console.error("Erro ao criar device:", {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });

    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Falha ao criar device.",
    });
  }
}

async function atualizarDevice(req, res) {
  try {
    const id = parseId(req);
    if (!id) {
      return res.status(400).json({ error: "VALIDACAO", message: "ID inválido." });
    }

    const existente = await devicesService.obterPorId(id);
    if (!existente) {
      return res.status(404).json({ error: "NAO_ENCONTRADO", message: "Device não encontrado." });
    }

    const { device_key, nome, unidade_id, setor_id, playlist_id, ativo } = req.body || {};

    if (!isValidDeviceKey(device_key)) {
      return res.status(400).json({
        error: "VALIDACAO",
        message: "device_key é obrigatório e deve conter apenas letras/números/underscore/hífen (até 64).",
      });
    }

    const payload = {
      device_key: String(device_key).trim(),
      nome: nome ? String(nome).trim() : null,
      unidade_id: toIntOrNull(unidade_id),
      setor_id: toIntOrNull(setor_id),
      playlist_id: toIntOrNull(playlist_id),
      ativo: toTinyInt(ativo, existente.ativo ?? 1),
    };

    const affected = await devicesService.atualizar(id, payload);
    if (!affected) {
      return res.status(500).json({ error: "ERRO_INTERNO", message: "Não foi possível atualizar." });
    }

    const atualizado = await devicesService.obterPorId(id);
    return res.status(200).json(atualizado);
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "DUPLICADO",
        message: "Já existe um device com este device_key.",
      });
    }

    console.error("Erro ao atualizar device:", {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });

    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Falha ao atualizar device.",
    });
  }
}

async function atualizarAtivo(req, res) {
  try {
    const id = parseId(req);
    if (!id) {
      return res.status(400).json({ error: "VALIDACAO", message: "ID inválido." });
    }

    const ativo = toTinyInt(req.body?.ativo, null);
    if (ativo === null) {
      return res.status(400).json({
        error: "VALIDACAO",
        message: "Campo 'ativo' é obrigatório (true/false ou 1/0).",
      });
    }

    const affected = await devicesService.atualizarAtivo(id, ativo);
    if (!affected) {
      return res.status(404).json({ error: "NAO_ENCONTRADO", message: "Device não encontrado." });
    }

    const atualizado = await devicesService.obterPorId(id);
    return res.status(200).json(atualizado);
  } catch (err) {
    console.error("Erro ao atualizar ativo:", {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });

    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Falha ao atualizar ativo.",
    });
  }
}

async function heartbeat(req, res) {
  try {
    const id = parseId(req);
    if (!id) {
      return res.status(400).json({ error: "VALIDACAO", message: "ID inválido." });
    }

    const affected = await devicesService.heartbeat(id);
    if (!affected) {
      return res.status(404).json({ error: "NAO_ENCONTRADO", message: "Device não encontrado." });
    }

    const atualizado = await devicesService.obterPorId(id);
    return res.status(200).json(atualizado);
  } catch (err) {
    console.error("Erro ao atualizar heartbeat:", {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });

    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Falha ao atualizar heartbeat.",
    });
  }
}

async function removerDevice(req, res) {
  try {
    const id = parseId(req);
    if (!id) {
      return res.status(400).json({ error: "VALIDACAO", message: "ID inválido." });
    }

    const affected = await devicesService.remover(id);
    if (!affected) {
      return res.status(404).json({ error: "NAO_ENCONTRADO", message: "Device não encontrado." });
    }

    return res.status(204).send();
  } catch (err) {
    console.error("Erro ao remover device:", {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });

    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Falha ao remover device.",
    });
  }
}

module.exports = {
  listarDevices,
  obterDevice,
  criarDevice,
  atualizarDevice,
  atualizarAtivo,
  heartbeat,
  removerDevice,
};
