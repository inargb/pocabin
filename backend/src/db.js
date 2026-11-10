import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

/*
 * Schema migrations, applied in order. Each entry runs once; the applied
 * version is tracked with SQLite's `user_version` pragma. Append new
 * migrations to the end — never edit one that has shipped.
 */
const MIGRATIONS = [
  `
  CREATE TABLE images (
    id            TEXT PRIMARY KEY,
    sha256        TEXT NOT NULL UNIQUE,
    mime          TEXT NOT NULL,
    ext           TEXT NOT NULL,
    size          INTEGER NOT NULL,
    original_name TEXT,
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE TABLE binders (
    id               TEXT PRIMARY KEY,
    name             TEXT NOT NULL,
    color_id         TEXT NOT NULL,
    grid_type        TEXT NOT NULL CHECK (grid_type IN ('1x1','2x2','3x3')),
    collection_type  TEXT NOT NULL,
    skin             TEXT NOT NULL,
    next_page_number INTEGER NOT NULL,
    position         INTEGER NOT NULL,
    created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE TABLE sheets (
    id         TEXT PRIMARY KEY,
    binder_id  TEXT NOT NULL REFERENCES binders(id) ON DELETE CASCADE,
    position   INTEGER NOT NULL,
    front_name TEXT NOT NULL,
    back_name  TEXT NOT NULL
  );
  CREATE INDEX sheets_binder ON sheets(binder_id, position);

  CREATE TABLE cards (
    id         TEXT PRIMARY KEY,
    sheet_id   TEXT NOT NULL REFERENCES sheets(id) ON DELETE CASCADE,
    face       TEXT NOT NULL CHECK (face IN ('front','back')),
    slot       INTEGER NOT NULL CHECK (slot >= 0),
    mode       TEXT NOT NULL DEFAULT 'image',
    image_id   TEXT REFERENCES images(id) ON DELETE SET NULL,
    color      TEXT,
    sleeve     TEXT NOT NULL DEFAULT '{}',
    status     TEXT,
    notes      TEXT NOT NULL DEFAULT '',
    meta       TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    UNIQUE (sheet_id, face, slot)
  );
  CREATE INDEX cards_image ON cards(image_id);
  `,
];

export function openDb(file) {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  migrate(db);
  return db;
}

function migrate(db) {
  const current = db.pragma('user_version', { simple: true });
  for (let v = current; v < MIGRATIONS.length; v++) {
    db.transaction(() => {
      db.exec(MIGRATIONS[v]);
      db.pragma(`user_version = ${v + 1}`);
    })();
  }
}
