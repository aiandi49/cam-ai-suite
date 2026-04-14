# Workflow 01 — Search & Alert Engine

> **Every morning, for every client, run their search across CoStar, Crexi & LoopNet. Compare against yesterday. If something new hit — send the email and text. Zero manual effort.**

---

## 🎯 What This Does

Cameron has ~500 clients at any given time looking for commercial space in Tucson.
Right now he manually searches CoStar, exports a PDF, emails it, then texts the client.
This workflow eliminates all of that.

**The flow:**
1. Cron job fires at 4:00 AM daily
2. For each active client, pull their search parameters from the DB
3. Query CoStar API + Crexi API + LoopNet API simultaneously
4. Compare results against yesterday's snapshot (stored in DB)
5. If new properties found → generate branded email with property cards
6. Send email via G Suite SMTP
7. Send SMS via Twilio: "Hey [Name], 2 new spaces hit your search. Check your email."
8. Log everything to DB (what was sent, when, which properties)

---

## 📁 Folder Structure

```
workflow-01-search-engine/
├── src/
│   ├── api/
│   │   ├── costar.ts          # CoStar API client + search methods
│   │   ├── crexi.ts           # Crexi API client + search methods
│   │   ├── loopnet.ts         # LoopNet API client + search methods
│   │   └── index.ts           # Unified search across all 3 sources
│   ├── scheduler/
│   │   ├── cron.ts            # node-cron job — fires 4am daily
│   │   └── runner.ts          # Main job runner — loops all clients
│   ├── notifier/
│   │   ├── email.ts           # Gmail SMTP — builds + sends branded email
│   │   ├── sms.ts             # Twilio SMS sender
│   │   └── templates/
│   │       └── daily-alert.html  # Email HTML template
│   ├── db/
│   │   ├── client.ts          # Client CRUD operations
│   │   ├── property.ts        # Property CRUD + diff logic
│   │   └── search.ts          # Search snapshot save/compare
│   └── utils/
│       ├── diff.ts            # Compare yesterday vs today's results
│       ├── logger.ts          # Structured logging
│       └── dedup.ts           # Deduplicate properties across sources
├── frontend/
│   ├── components/
│   │   ├── ClientList.tsx     # Sidebar list of all clients
│   │   ├── ClientCard.tsx     # Individual client row with alert badge
│   │   ├── PropertyCard.tsx   # Listing card with photo, price, tags
│   │   ├── StatsBar.tsx       # Totals: matches, new today, emails sent
│   │   └── EmailPreview.tsx   # Preview email before sending
│   ├── pages/
│   │   ├── Dashboard.tsx      # Main view — client list + property feed
│   │   ├── AddClient.tsx      # Form to create new client profile
│   │   └── ClientDetail.tsx   # Full client history + all searches
│   └── styles/
│       └── globals.css
├── tests/
│   ├── api.test.ts            # Test CoStar/Crexi/LoopNet API calls
│   ├── diff.test.ts           # Test property diff logic
│   └── notifier.test.ts       # Test email/SMS sending (mock)
├── docs/
│   ├── api-setup.md           # How to get CoStar, Crexi, LoopNet API keys
│   └── flow-diagram.md        # Step-by-step flow diagram
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in all values.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `COSTAR_API_KEY` | CoStar Group API key (from your rep) |
| `COSTAR_API_SECRET` | CoStar API secret |
| `CREXI_API_KEY` | Crexi Pro API key (Settings → API) |
| `LOOPNET_API_KEY` | LoopNet API key (same as CoStar acct) |
| `GMAIL_CLIENT_ID` | Google OAuth 2.0 Client ID |
| `GMAIL_CLIENT_SECRET` | Google OAuth 2.0 Client Secret |
| `GMAIL_REFRESH_TOKEN` | OAuth refresh token |
| `GMAIL_FROM_ADDRESS` | cam@cameronnorwoodcre.com (or your G Suite) |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_FROM_NUMBER` | Your Twilio phone number (+15204440000) |
| `CRON_SCHEDULE` | Cron expression, default: `0 4 * * *` (4am daily) |
| `PORT` | API server port, default: `3001` |
| `NODE_ENV` | `development` or `production` |

---

## 🛠️ Setup

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env
# Fill in all values in .env

# Run database migrations (from repo root)
psql -U postgres -d cam_ai -f ../shared/db/schema.sql

# Start development server
npm run dev

# Run the scheduler once manually (test it)
npm run scheduler:run

# Start production
npm run build && npm start
```

---

## 📡 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/clients` | List all active clients |
| `POST` | `/api/clients` | Create new client profile |
| `PUT` | `/api/clients/:id` | Update client search params |
| `DELETE` | `/api/clients/:id` | Deactivate client |
| `GET` | `/api/clients/:id/searches` | Get search history for client |
| `POST` | `/api/search/run/:clientId` | Manually trigger search for one client |
| `POST` | `/api/search/run-all` | Manually trigger all client searches |
| `POST` | `/api/notify/:clientId` | Manually send email + SMS to client |
| `GET` | `/api/properties` | Browse all tracked properties |

---

## 🧠 Key Logic: Property Diff

The diff engine (`src/utils/diff.ts`) is the core of this workflow:

```
Yesterday's results: [A, B, C, D, E]
Today's results:     [A, B, C, D, E, F, G]

New properties = [F, G]  ← Only these get emailed
```

If nothing new → email still fires (weekly digest mode) saying:
*"Still hunting. 11 spaces match your criteria. Nothing new this week."*

---

## 📧 Email Template

Branded, mobile-responsive HTML email with:
- Cameron's branding header
- Client name + search summary
- Property cards: photo, address, sq ft, price, cross streets, Google Maps link
- "Book a Call" CTA button
- Footer with unsubscribe link

---

## 📅 Cron Schedule Options

| Frequency | Cron Expression |
|-----------|----------------|
| Daily at 4am | `0 4 * * *` |
| Daily at 7am | `0 7 * * *` |
| Weekdays only | `0 7 * * 1-5` |
| Weekly Monday | `0 8 * * 1` |

Set per-client in the `search_frequency` field.
