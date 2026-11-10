import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(here, '..');

const dataDir = path.resolve(process.env.POCABIN_DATA_DIR || path.join(backendRoot, 'data'));

export const config = {
  port: Number(process.env.PORT || 4000),
  dataDir,
  dbFile: path.join(dataDir, 'pocabin.db'),
  uploadDir: path.join(dataDir, 'uploads'),
  /* Max size of one uploaded image, in megabytes. */
  maxUploadMb: Number(process.env.POCABIN_MAX_UPLOAD_MB || 15),
  /* Seed the demo binders on first boot (empty database). Set to "false" to disable. */
  seedDemo: process.env.POCABIN_SEED_DEMO !== 'false',
  /* Built frontend served in production (npm run build && npm start). */
  frontendDist: path.resolve(backendRoot, '..', 'frontend', 'dist'),
};
