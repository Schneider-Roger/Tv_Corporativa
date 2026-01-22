const express = require("express");
const router = express.Router();

// Placeholder (ainda não implementado)
router.get("/", (req, res) => {
  return res.status(501).json({
    error: "NOT_IMPLEMENTED",
    message: "Rotas de devices ainda não foram implementadas.",
  });
});

module.exports = router;

