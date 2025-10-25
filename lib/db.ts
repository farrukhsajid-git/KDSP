import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'rsvp.db');
const db = new Database(dbPath);

// Create RSVP table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    number_of_guests INTEGER NOT NULL,
    rsvp_status TEXT NOT NULL,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export interface RSVPData {
  full_name: string;
  email: string;
  phone_number?: string;
  number_of_guests: number;
  rsvp_status: 'Yes' | 'No' | 'Maybe';
  message?: string;
}

export function insertRSVP(data: RSVPData) {
  const stmt = db.prepare(`
    INSERT INTO rsvps (full_name, email, phone_number, number_of_guests, rsvp_status, message)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(
    data.full_name,
    data.email,
    data.phone_number || null,
    data.number_of_guests,
    data.rsvp_status,
    data.message || null
  );
}

export function getAllRSVPs() {
  const stmt = db.prepare('SELECT * FROM rsvps ORDER BY created_at DESC');
  return stmt.all();
}

export default db;
