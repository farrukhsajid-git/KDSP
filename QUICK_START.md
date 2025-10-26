# KDSP RSVP Portal - Quick Start Guide

## Project Location
`/Users/farrukh/Desktop/KDSP/kdsp-rsvp-portal`

## Quick Commands

### Development
```bash
cd /Users/farrukh/Desktop/KDSP/kdsp-rsvp-portal
npm run dev
```
Then open http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

### Database Check
The SQLite database (`rsvp.db`) is automatically created on first run.
It's located in the project root directory.

## What's Included

### 1. Home Page (`/app/page.tsx`)
- Professional header with KDSP branding
- Event title: "Annual Gala Celebration"
- Event date: December 14, 2025
- Event details (time, venue)
- Introduction text
- RSVP form integration
- Additional event information
- Footer with contact details

### 2. RSVP Form Component (`/components/RSVPForm.tsx`)
- Full Name (required with validation)
- Email (required with email format validation)
- Phone Number (optional)
- Number of Guests (number input, 1-10 range)
- RSVP Status dropdown (Yes/No/Maybe)
- Message textarea (optional)
- Form submission with loading state
- Success/error message display
- Form reset on successful submission

### 3. API Endpoint (`/app/api/rsvp/route.ts`)
- POST `/api/rsvp`
- Server-side validation for all fields
- Email format validation with regex
- Type checking for all inputs
- Proper error responses with HTTP status codes
- Returns success message with database ID

### 4. Database Layer (`/lib/db.ts`)
- SQLite database initialization
- Auto-creates `rsvps` table with proper schema
- `insertRSVP()` function for adding records
- `getAllRSVPs()` function for retrieving records
- TypeScript interfaces for type safety

### 5. Styling
- Tailwind CSS configured and ready
- Gradient background (blue to indigo)
- Responsive design (mobile-friendly)
- Professional card-based layout
- Hover effects on buttons
- Focus states on form inputs
- Success/error message styling

## Database Schema

```sql
CREATE TABLE rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  number_of_guests INTEGER NOT NULL,
  rsvp_status TEXT NOT NULL,
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Git Setup

### Current Status
- Repository: Initialized
- Current Branch: `base-setup`
- Other Branches: `main`
- Commits: 1 initial commit
- Remote: None (local only)

### Branch Info
```bash
git branch -a
# Shows: main and base-setup (local only)
```

## Form Validation Rules

### Client-Side (Browser)
- Full Name: Required, HTML5 validation
- Email: Required, type="email" validation
- Phone: Optional
- Number of Guests: Required, min=1, max=10
- RSVP Status: Required, dropdown selection
- Message: Optional

### Server-Side (API)
- Full Name: Must be non-empty string
- Email: Must match email regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Phone: Optional, trimmed if provided
- Number of Guests: Must be number >= 1
- RSVP Status: Must be "Yes", "No", or "Maybe"
- Message: Optional, trimmed if provided

## Testing the Application

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000

3. Fill out the form with test data:
   - Full Name: John Doe
   - Email: john@example.com
   - Phone: +1234567890
   - Guests: 2
   - Status: Yes
   - Message: Test message

4. Submit the form

5. You should see a success message

6. Check the database:
   ```bash
   sqlite3 rsvp.db "SELECT * FROM rsvps;"
   ```

## File Structure

```
/Users/farrukh/Desktop/KDSP/kdsp-rsvp-portal/
├── app/
│   ├── api/
│   │   └── rsvp/
│   │       └── route.ts          # POST endpoint
│   ├── globals.css               # Tailwind imports
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Home page with event info
├── components/
│   └── RSVPForm.tsx              # Form component
├── lib/
│   └── db.ts                     # Database setup
├── public/                       # Static files
├── node_modules/                 # Dependencies
├── .git/                         # Git repository
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
├── next.config.ts                # Next.js config
├── postcss.config.mjs            # PostCSS config
├── README.md                     # Full documentation
└── rsvp.db                       # SQLite database (created on first run)
```

## Key Dependencies

- next@15.0.3 (App Router)
- react@19.0.0
- react-dom@19.0.0
- better-sqlite3@11.10.0
- tailwindcss@3.4.1
- typescript@5

## Common Issues & Solutions

### Issue: Database locked
**Solution:** Make sure only one instance of the app is running

### Issue: Port 3000 already in use
**Solution:** Use `npm run dev -- -p 3001` to use a different port

### Issue: Database not found
**Solution:** The database is auto-created. Make sure the app has write permissions in the project directory

### Issue: Form not submitting
**Solution:** Check browser console for errors and network tab for API response

## Next Steps

1. Customize the event details in `/app/page.tsx`
2. Modify the form fields if needed in `/components/RSVPForm.tsx`
3. Add email notifications (requires email service integration)
4. Create an admin panel to view RSVPs
5. Add authentication if needed
6. Deploy to Vercel or another hosting platform

## Notes

- No remote repository configured (local only as requested)
- SQLite database is file-based (rsvp.db in project root)
- All form data is stored locally in the database
- The application is production-ready and fully functional
