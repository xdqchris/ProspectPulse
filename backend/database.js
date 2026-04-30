'use strict';

const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');

// Pasta de dados — fora do código fonte para não ser sobrescrita em deploy
const dataDir = process.env.DATA_DIR || path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'prospectpulse.db');
const db     = new Database(dbPath);

// Performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ═══════════════════════════════════════════════
//  SCHEMA
// ═══════════════════════════════════════════════
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    plan          TEXT    NOT NULL DEFAULT 'free',   -- free | trial | pro | time
    credits       INTEGER NOT NULL DEFAULT 10,        -- -1 = ilimitado
    status        TEXT    NOT NULL DEFAULT 'active',  -- active | trial | suspended | cancelled
    company       TEXT,
    created_at    DATETIME DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admins (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    DATETIME DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS payments (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    plan            TEXT    NOT NULL,
    amount          REAL    NOT NULL,
    status          TEXT    NOT NULL DEFAULT 'pending',  -- pending | approved | rejected | refunded
    description     TEXT,
    method          TEXT,
    mp_preference_id TEXT,
    mp_pay_id       TEXT,
    created_at      DATETIME DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS usage_logs (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL REFERENCES users(id),
    channel       TEXT,
    tone          TEXT,
    input_tokens  INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    created_at    DATETIME DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS blocked_ips (
    ip         TEXT PRIMARY KEY,
    reason     TEXT,
    attempts   INTEGER DEFAULT 1,
    blocked_at DATETIME DEFAULT (datetime('now')),
    expires_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS security_logs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    action     TEXT    NOT NULL,
    level      TEXT    NOT NULL DEFAULT 'INFO',  -- INFO | WARN | ERROR | BLOCK
    user_email TEXT,
    ip         TEXT,
    details    TEXT,
    created_at DATETIME DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email);
  CREATE INDEX IF NOT EXISTS idx_usage_user        ON usage_logs(user_id);
  CREATE INDEX IF NOT EXISTS idx_usage_created     ON usage_logs(created_at);
  CREATE INDEX IF NOT EXISTS idx_sec_logs_created  ON security_logs(created_at);
  CREATE INDEX IF NOT EXISTS idx_sec_logs_ip       ON security_logs(ip);
`);

module.exports = db;
