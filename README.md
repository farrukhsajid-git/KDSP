# KDSP RSVP Portal

A professional event RSVP portal built with Next.js, TypeScript, and SQLite.

## Features

- Modern, responsive UI with Tailwind CSS
- Full form validation (client and server-side)
- SQLite database for data persistence
- Type-safe with TypeScript
- RESTful API endpoint for RSVP submissions

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** SQLite (better-sqlite3)
- **Form Handling:** React Hooks

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
kdsp-rsvp-portal/
├── app/
│   ├── api/
│   │   └── rsvp/
│   │       └── route.ts       # API endpoint for RSVP submissions
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/
│   └── RSVPForm.tsx           # RSVP form component
├── lib/
│   └── db.ts                  # Database configuration and queries
├── public/                    # Static assets
└── rsvp.db                    # SQLite database (auto-generated)
```

## API Endpoints

### POST /api/rsvp

Submit a new RSVP.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone_number": "+1234567890",
  "number_of_guests": 2,
  "rsvp_status": "Yes",
  "message": "Looking forward to it!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "RSVP submitted successfully!",
  "id": 1
}
```

**Response (Error):**
```json
{
  "error": "Valid email is required"
}
```

## Database Schema

The SQLite database contains a single `rsvps` table:

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| full_name | TEXT | Guest's full name (required) |
| email | TEXT | Guest's email (required) |
| phone_number | TEXT | Guest's phone number (optional) |
| number_of_guests | INTEGER | Number of guests (required) |
| rsvp_status | TEXT | Yes/No/Maybe (required) |
| message | TEXT | Optional message (optional) |
| created_at | DATETIME | Timestamp (auto-generated) |

## Form Validation

- **Full Name:** Required, must not be empty
- **Email:** Required, must be valid email format
- **Phone Number:** Optional
- **Number of Guests:** Required, must be at least 1
- **RSVP Status:** Required, must be Yes/No/Maybe
- **Message:** Optional

## Building for Production

```bash
npm run build
npm start
```

## License

MIT
