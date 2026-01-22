const fs = require("fs");
const path = require("path");
const env = require("../config/env");

const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);

async function listar() {
  try {
    const files = fs.readdirSync(uploadDir);
    const items = files.map((filename) => {
      const filePath = path.join(uploadDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        modified: stats.mtime,
        url: `/uploads/${filename}`,
      };
    });
    return items;
  } catch (err) {
    console.error("Erro ao listar mídias:", err);
    throw new Error("Falha ao listar arquivos.");
  }
}

async function getInfo(filename) {
  try {
    const filePath = path.join(uploadDir, filename);
    if (!fs.existsSync(filePath)) {
      throw new Error("Arquivo não encontrado.");
    }
    const stats = fs.statSync(filePath);
    return {
      filename,
      size: stats.size,
      modified: stats.mtime,
      url: `/uploads/${filename}`,
    };
  } catch (err) {
    console.error("Erro ao obter info da mídia:", err);
    throw new Error("Falha ao obter informações do arquivo.");
  }
}

module.exports = { listar, getInfo };