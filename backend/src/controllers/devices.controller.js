const devicesService = require("../services/devices.service");

async function listar(req, res) {
  try {
    const result = await devicesService.listar();
    return res.status(200).json(result);
  } catch (err) {
    if (err?.code === "NOT_IMPLEMENTED") {
      return res.status(501).json({
        error: "NOT_IMPLEMENTED",
        message: "Rotas de devices ainda não foram implementadas.",
      });
    }

    console.error("Erro ao listar devices:", err);
    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Falha ao listar devices.",
    });
  }
}

module.exports = { listar };
