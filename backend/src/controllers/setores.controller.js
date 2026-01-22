const setoresService = require("../services/setores.service");

async function listarSetores(req, res) {
  try {
    const rows = await setoresService.listarSetores();
    return res.status(200).json(rows);
  } catch (err) {
    console.error("Erro ao listar setores:", {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });

    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Falha ao listar setores.",
    });
  }
}

module.exports = {
  listarSetores,
};
