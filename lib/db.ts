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
    referral_id TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Add referral_id column if it doesn't exist (for existing databases)
try {
  db.exec(`ALTER TABLE rsvps ADD COLUMN referral_id TEXT UNIQUE`);
} catch (error) {
  // Column already exists, ignore error
}

export interface RSVPData {
  full_name: string;
  email: string;
  phone_number?: string;
  number_of_guests: number;
  rsvp_status: 'Yes' | 'No' | 'Maybe';
  message?: string;
}

export interface RSVPResponse {
  lastInsertRowid: number | bigint;
  changes: number;
  referral_id: string;
}

// Generate unique referral ID
function generateReferralId(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar-looking characters
  let code = '';

  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `KDSP-${year}-${code}`;
}

export function insertRSVP(data: RSVPData): RSVPResponse {
  let referralId = generateReferralId();
  let attempts = 0;
  const maxAttempts = 10;

  // Ensure unique referral ID
  while (attempts < maxAttempts) {
    try {
      const stmt = db.prepare(`
        INSERT INTO rsvps (full_name, email, phone_number, number_of_guests, rsvp_status, message, referral_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        data.full_name,
        data.email,
        data.phone_number || null,
        data.number_of_guests,
        data.rsvp_status,
        data.message || null,
        referralId
      );

      return {
        lastInsertRowid: result.lastInsertRowid,
        changes: result.changes,
        referral_id: referralId,
      };
    } catch (error: any) {
      // If duplicate referral_id, generate a new one and retry
      if (error.message?.includes('UNIQUE constraint failed')) {
        referralId = generateReferralId();
        attempts++;
      } else {
        throw error;
      }
    }
  }

  throw new Error('Failed to generate unique referral ID after multiple attempts');
}

export function getAllRSVPs() {
  const stmt = db.prepare('SELECT * FROM rsvps ORDER BY created_at DESC');
  return stmt.all();
}

export default db;
