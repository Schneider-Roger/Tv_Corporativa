// backend/src/server.js
const env = require("./config/env"); // importa e valida
const app = require("./app");

// Handler global para erros não tratados
process.on('uncaughtException', (err) => {
  console.error('Erro não tratado (uncaughtException):', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejeitada não tratada (unhandledRejection):', reason);
  process.exit(1);
});

app.listen(env.PORT, () => {
  console.log(`Servidor rodando em http://localhost:${env.PORT} (${env.NODE_ENV})`);
});
