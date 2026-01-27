const fs = require("fs");
const path = require("path");
const env = require("../config/env");

const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);

function resolveSafePath(filename) {
  const name = String(filename || "").trim();
  if (!name) {
    const e = new Error("Nome de arquivo inválido.");
    e.code = "INVALID_FILENAME";
    throw e;
  }

  // impede ../ e subpastas
  const base = path.basename(name);
  if (base !== name) {
    const e = new Error("Nome de arquivo inválido.");
    e.code = "INVALID_FILENAME";
    throw e;
  }

  const filePath = path.join(uploadDir, base);
  const resolved = path.resolve(filePath);

  // garante que permanece dentro de uploadDir
  if (!resolved.startsWith(uploadDir + path.sep)) {
    const e = new Error("Nome de arquivo inválido.");
    e.code = "INVALID_FILENAME";
    throw e;
  }

  return resolved;
}

async function listar() {
  try {
    const files = fs.readdirSync(uploadDir);

    const items = files
      .map((filename) => {
        const filePath = path.join(uploadDir, filename);

        // ignora se não for arquivo
        const stats = fs.statSync(filePath);
        if (!stats.isFile()) return null;

        const modifiedISO = stats.mtime.toISOString();

        return {
          filename,
          url: `/uploads/${filename}`,

          // campos "originais" (mantém)
          size: stats.size,
          modified: stats.mtime,

          // campos compatíveis com UI (novo)
          size_bytes: stats.size,
          modified_at: modifiedISO,
        };
      })
      .filter(Boolean);

    return items;
  } catch (err) {
    console.error("Erro ao listar mídias:", err);
    throw new Error("Falha ao listar arquivos.");
  }
}

async function getInfo(filename) {
  try {
    const filePath = resolveSafePath(filename);

    if (!fs.existsSync(filePath)) {
      const e = new Error("Arquivo não encontrado.");
      e.code = "NOT_FOUND";
      throw e;
    }

    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      const e = new Error("Arquivo não encontrado.");
      e.code = "NOT_FOUND";
      throw e;
    }

    const modifiedISO = stats.mtime.toISOString();

    return {
      filename,
      url: `/uploads/${filename}`,

      // campos "originais" (mantém)
      size: stats.size,
      modified: stats.mtime,

      // campos compatíveis com UI (novo)
      size_bytes: stats.size,
      modified_at: modifiedISO,
    };
  } catch (err) {
    // mantém rastreio no console, mas retorna erro controlado
    console.error("Erro ao obter info da mídia:", err);
    if (err && err.code) throw err;
    throw new Error("Falha ao obter informações do arquivo.");
  }
}

async function remover(filename) {
  const filePath = resolveSafePath(filename);

  if (!fs.existsSync(filePath)) {
    const e = new Error("Arquivo não encontrado.");
    e.code = "NOT_FOUND";
    throw e;
  }

  const stats = fs.statSync(filePath);
  if (!stats.isFile()) {
    const e = new Error("Arquivo não encontrado.");
    e.code = "NOT_FOUND";
    throw e;
  }

  fs.unlinkSync(filePath);
  return true;
}

module.exports = { listar, getInfo, remover };
