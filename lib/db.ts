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
    profession_organization TEXT,
    interest_types TEXT,
    referral_source TEXT,
    receive_updates INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migration: Add new columns if they don't exist (for existing databases)
const migrations = [
  { column: 'referral_id', type: 'TEXT UNIQUE' },
  { column: 'profession_organization', type: 'TEXT' },
  { column: 'interest_types', type: 'TEXT' },
  { column: 'referral_source', type: 'TEXT' },
  { column: 'receive_updates', type: 'INTEGER' },
];

migrations.forEach(({ column, type }) => {
  try {
    db.exec(`ALTER TABLE rsvps ADD COLUMN ${column} ${type}`);
  } catch (error) {
    // Column already exists, ignore error
  }
});

export interface RSVPData {
  full_name: string;
  email: string;
  phone_number?: string;
  number_of_guests: number;
  rsvp_status: 'Yes' | 'No' | 'Maybe';
  message?: string;
  profession_organization: string;
  interest_types: string[]; // Will be stored as JSON string
  referral_source: 'Friend' | 'Social' | 'Invite';
  receive_updates: boolean;
}

export interface RSVPRecord {
  id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  number_of_guests: number;
  rsvp_status: 'Yes' | 'No' | 'Maybe';
  message?: string;
  referral_id: string;
  profession_organization: string;
  interest_types: string; // JSON string in database
  referral_source: 'Friend' | 'Social' | 'Invite';
  receive_updates: number; // 0 or 1 in database
  created_at: string;
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
        INSERT INTO rsvps (
          full_name,
          email,
          phone_number,
          number_of_guests,
          rsvp_status,
          message,
          referral_id,
          profession_organization,
          interest_types,
          referral_source,
          receive_updates
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        data.full_name,
        data.email,
        data.phone_number || null,
        data.number_of_guests,
        data.rsvp_status,
        data.message || null,
        referralId,
        data.profession_organization,
        JSON.stringify(data.interest_types),
        data.referral_source,
        data.receive_updates ? 1 : 0
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

export function getAllRSVPs(sortBy: string = 'created_at', order: 'asc' | 'desc' = 'desc'): RSVPRecord[] {
  // Whitelist allowed sort columns to prevent SQL injection
  const allowedSortColumns = ['id', 'full_name', 'email', 'created_at', 'rsvp_status', 'referral_source'];
  const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

  const stmt = db.prepare(`SELECT * FROM rsvps ORDER BY ${sortColumn} ${sortOrder}`);
  return stmt.all() as RSVPRecord[];
}

export function getRSVPStats() {
  const totalStmt = db.prepare('SELECT COUNT(*) as total FROM rsvps');
  const total = (totalStmt.get() as { total: number }).total;

  const statusStmt = db.prepare(`
    SELECT rsvp_status, COUNT(*) as count
    FROM rsvps
    GROUP BY rsvp_status
  `);
  const statusCounts = statusStmt.all() as Array<{ rsvp_status: string; count: number }>;

  const referralStmt = db.prepare(`
    SELECT referral_source, COUNT(*) as count
    FROM rsvps
    WHERE referral_source IS NOT NULL
    GROUP BY referral_source
  `);
  const referralCounts = referralStmt.all() as Array<{ referral_source: string; count: number }>;

  const updatesStmt = db.prepare('SELECT COUNT(*) as count FROM rsvps WHERE receive_updates = 1');
  const wantsUpdates = (updatesStmt.get() as { count: number }).count;

  return {
    total,
    byStatus: statusCounts.reduce((acc, curr) => {
      acc[curr.rsvp_status] = curr.count;
      return acc;
    }, {} as Record<string, number>),
    byReferralSource: referralCounts.reduce((acc, curr) => {
      acc[curr.referral_source] = curr.count;
      return acc;
    }, {} as Record<string, number>),
    wantsUpdates,
  };
}

export default db;
