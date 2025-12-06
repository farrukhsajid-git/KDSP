import path from 'path';
import fs from 'fs';

// Type definitions
export interface RSVPData {
  full_name: string;
  email: string;
  phone_number?: string;
  number_of_guests: number;
  rsvp_status: 'Yes' | 'No' | 'Maybe';
  message?: string;
  interest_types: string[]; // Will be stored as JSON string
  referral_source: 'Friend' | 'Social' | 'Invite';
  receive_updates: boolean;
  donation_intent: string[]; // Will be stored as JSON string
  donation_value?: number | null;
  donation_custom?: number | null;
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
  interest_types: string; // JSON string in database
  referral_source: 'Friend' | 'Social' | 'Invite';
  receive_updates: number; // 0 or 1 in database
  donation_intent: string; // JSON string in database
  donation_value?: number | null;
  donation_custom?: number | null;
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

// Database abstraction
const DATABASE_URL = process.env.DATABASE_URL;
const usePostgres = !!DATABASE_URL;

console.log(`Using database: ${usePostgres ? 'PostgreSQL' : 'SQLite'}`);

// Declare function variables that will be assigned implementations
let insertRSVP: (data: RSVPData) => Promise<RSVPResponse>;
let getAllRSVPs: (sortBy?: string, order?: 'asc' | 'desc') => Promise<RSVPRecord[]>;
let getRSVPStats: () => Promise<{
  total: number;
  byStatus: Record<string, number>;
  byReferralSource: Record<string, number>;
  wantsUpdates: number;
}>;
let deleteRSVPs: (ids: number[]) => Promise<number>;

if (usePostgres) {
  // PostgreSQL implementation
  const { Pool } = require('pg');

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  // Initialize table
  (async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS rsvps (
          id SERIAL PRIMARY KEY,
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
          donation_intent TEXT,
          donation_value INTEGER,
          donation_custom REAL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('PostgreSQL table initialized');
    } catch (error) {
      console.error('Error initializing PostgreSQL table:', error);
    }
  })();

  // PostgreSQL functions
  insertRSVP = async function(data: RSVPData): Promise<RSVPResponse> {
    let referralId = generateReferralId();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      try {
        const result = await pool.query(
          `INSERT INTO rsvps (
            full_name, email, phone_number, number_of_guests, rsvp_status,
            message, referral_id, interest_types, referral_source, receive_updates,
            donation_intent, donation_value, donation_custom
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING id`,
          [
            data.full_name,
            data.email,
            data.phone_number || null,
            data.number_of_guests,
            data.rsvp_status,
            data.message || null,
            referralId,
            JSON.stringify(data.interest_types),
            data.referral_source,
            data.receive_updates ? 1 : 0,
            JSON.stringify(data.donation_intent),
            data.donation_value || null,
            data.donation_custom || null,
          ]
        );

        return {
          lastInsertRowid: result.rows[0].id,
          changes: 1,
          referral_id: referralId,
        };
      } catch (error: any) {
        if (error.code === '23505') { // Unique constraint violation
          referralId = generateReferralId();
          attempts++;
        } else {
          throw error;
        }
      }
    }

    throw new Error('Failed to generate unique referral ID after multiple attempts');
  };

  getAllRSVPs = async function(sortBy: string = 'created_at', order: 'asc' | 'desc' = 'desc'): Promise<RSVPRecord[]> {
    const allowedSortColumns = ['id', 'full_name', 'email', 'created_at', 'rsvp_status', 'referral_source'];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    const result = await pool.query(`SELECT * FROM rsvps ORDER BY ${sortColumn} ${sortOrder}`);
    return result.rows;
  };

  getRSVPStats = async function() {
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM rsvps');
    const total = parseInt(totalResult.rows[0].total);

    const statusResult = await pool.query(`
      SELECT rsvp_status, COUNT(*) as count
      FROM rsvps
      GROUP BY rsvp_status
    `);

    const referralResult = await pool.query(`
      SELECT referral_source, COUNT(*) as count
      FROM rsvps
      WHERE referral_source IS NOT NULL
      GROUP BY referral_source
    `);

    const updatesResult = await pool.query('SELECT COUNT(*) as count FROM rsvps WHERE receive_updates = 1');
    const wantsUpdates = parseInt(updatesResult.rows[0].count);

    return {
      total,
      byStatus: statusResult.rows.reduce((acc: any, curr: any) => {
        acc[curr.rsvp_status] = parseInt(curr.count);
        return acc;
      }, {}),
      byReferralSource: referralResult.rows.reduce((acc: any, curr: any) => {
        acc[curr.referral_source] = parseInt(curr.count);
        return acc;
      }, {}),
      wantsUpdates,
    };
  };

  deleteRSVPs = async function(ids: number[]): Promise<number> {
    if (!ids || ids.length === 0) {
      return 0;
    }

    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
    const result = await pool.query(`DELETE FROM rsvps WHERE id IN (${placeholders})`, ids);
    return result.rowCount || 0;
  };

} else {
  // SQLite implementation (for local development)
  const Database = require('better-sqlite3');

  const dataDir = process.env.NODE_ENV === 'production' && fs.existsSync('/app/data')
    ? '/app/data'
    : process.cwd();

  const dbPath = path.join(dataDir, 'rsvp.db');
  const db = new Database(dbPath);

  console.log(`SQLite database initialized at: ${dbPath}`);

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
      donation_intent TEXT,
      donation_value INTEGER,
      donation_custom REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // SQLite functions (wrapped to be async for consistency)
  insertRSVP = async function(data: RSVPData): Promise<RSVPResponse> {
    let referralId = generateReferralId();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      try {
        const stmt = db.prepare(`
          INSERT INTO rsvps (
            full_name, email, phone_number, number_of_guests, rsvp_status,
            message, referral_id, interest_types, referral_source, receive_updates,
            donation_intent, donation_value, donation_custom
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
          data.full_name,
          data.email,
          data.phone_number || null,
          data.number_of_guests,
          data.rsvp_status,
          data.message || null,
          referralId,
          JSON.stringify(data.interest_types),
          data.referral_source,
          data.receive_updates ? 1 : 0,
          JSON.stringify(data.donation_intent),
          data.donation_value || null,
          data.donation_custom || null
        );

        return {
          lastInsertRowid: result.lastInsertRowid,
          changes: result.changes,
          referral_id: referralId,
        };
      } catch (error: any) {
        if (error.message?.includes('UNIQUE constraint failed')) {
          referralId = generateReferralId();
          attempts++;
        } else {
          throw error;
        }
      }
    }

    throw new Error('Failed to generate unique referral ID after multiple attempts');
  };

  getAllRSVPs = async function(sortBy: string = 'created_at', order: 'asc' | 'desc' = 'desc'): Promise<RSVPRecord[]> {
    const allowedSortColumns = ['id', 'full_name', 'email', 'created_at', 'rsvp_status', 'referral_source'];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    const stmt = db.prepare(`SELECT * FROM rsvps ORDER BY ${sortColumn} ${sortOrder}`);
    return stmt.all() as RSVPRecord[];
  };

  getRSVPStats = async function() {
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
  };

  deleteRSVPs = async function(ids: number[]): Promise<number> {
    if (!ids || ids.length === 0) {
      return 0;
    }

    const placeholders = ids.map(() => '?').join(',');
    const stmt = db.prepare(`DELETE FROM rsvps WHERE id IN (${placeholders})`);
    const result = stmt.run(...ids);

    return result.changes;
  };
}

// Export the functions (now properly assigned)
export { insertRSVP, getAllRSVPs, getRSVPStats, deleteRSVPs };
