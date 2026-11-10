/*
 * Reset the binders to the demo collection.
 *   npm run seed            (from the repo root)
 * Deletes every binder (and its cards) first. Stored images are kept.
 */
import { config } from './config.js';
import { createApp } from './app.js';
import { seedDemo } from './seed-data.js';

if (!process.argv.includes('--force')) {
  console.error('Refusing to reset without --force (this deletes every binder).');
  process.exit(1);
}

const { db, binders } = createApp({ ...config, seedDemo: false });
for (const b of binders.list()) binders.remove(b.id);
seedDemo(binders);
console.log(`Seeded ${binders.list().length} demo binders into ${config.dbFile}`);
db.close();
