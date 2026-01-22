// backend/src/server.js
const env = require("./config/env"); // importa e valida
const app = require("./app");

app.listen(env.PORT, () => {
  console.log(`Servidor rodando em http://localhost:${env.PORT} (${env.NODE_ENV})`);
});
