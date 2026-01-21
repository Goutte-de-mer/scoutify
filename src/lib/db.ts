import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'app.db');

// Singleton pour éviter les connexions multiples
let db: Database.Database | null = null;

export function getDb() {
  if (!db) {
    db = new Database(dbPath, { verbose: console.log });
    // Activer les clés étrangères
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}