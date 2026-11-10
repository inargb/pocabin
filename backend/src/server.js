import { config } from './config.js';
import { createApp } from './app.js';

const { app, db } = createApp(config);

const server = app.listen(config.port, () => {
  console.log(`Pocabin API listening on http://localhost:${config.port} (data: ${config.dataDir})`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
