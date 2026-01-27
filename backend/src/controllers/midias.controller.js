const path = require("path");
const multer = require("multer");
const env = require("../config/env");
const midiasService = require("../services/midias.service");

// Pasta de upload (relativa ao backend)
const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);

// Storage com nome seguro e único
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const base = path
      .basename(file.originalname || "arquivo", ext)
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    cb(null, `${base || "midia"}-${unique}${ext}`);
  },
});

// Filtro: aceitar imagens e vídeos comuns
function fileFilter(req, file, cb) {
  const mime = String(file.mimetype || "").toLowerCase();
  const ok =
    mime.startsWith("image/") ||
    mime.startsWith("video/") ||
    mime === "application/pdf"; // opcional

  if (!ok) {
    return cb(new Error("Tipo de arquivo não permitido. Envie imagem ou vídeo."));
  }
  cb(null, true);
}

const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_UPLOAD_MB * 1024 * 1024,
  },
}).single("file");

async function listar(req, res) {
  try {
    const items = await midiasService.listar();
    return res.status(200).json(items);
  } catch (err) {
    console.error("Erro ao listar mídias:", err);
    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Falha ao listar mídias.",
    });
  }
}

async function upload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "ARQUIVO_OBRIGATORIO",
        message: "Envie um arquivo no campo 'file'.",
      });
    }

    const item = await midiasService.getInfo(req.file.filename);
    return res.status(201).json(item);
  } catch (err) {
    console.error("Erro no upload:", err);
    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Falha ao realizar upload.",
    });
  }
}

async function remover(req, res) {
  
  try {
    const filename = req.params.filename;
    await midiasService.remover(filename);
    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err && err.code === "INVALID_FILENAME") {
    return res.status(400).json({
      error: "INVALID_FILENAME",
      message: "Nome de arquivo inválido.",
    });
  }

    if (err && err.code === "NOT_FOUND") {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "Arquivo não encontrado.",
      });
    }

    console.error("Erro ao remover mídia:", err);
    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Falha ao remover mídia.",
    });
  }
}

module.exports = {
  uploadSingle,
  listar,
  upload,
  remover,
};
