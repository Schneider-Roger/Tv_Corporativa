const unidadesService = require("../services/unidades.service");

async function listarUnidades(req, res) {
  try {
    const rows = await unidadesService.listarUnidades();
    return res.status(200).json(rows);
  } catch (err) {
    console.error("Erro ao listar unidades:", {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });

    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Falha ao listar unidades.",
    });
  }
}

module.exports = {
  listarUnidades,
};
