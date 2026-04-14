# Workflow 05 — Off-Market Property Hunter

> **Buyer needs 2,000 SF on an acre but nothing's listed. Find every property that matches anyway. Trace the owner. Send the pitch. Get deals nobody else even knew existed.**

---

## 🎯 What This Does

When buyers have specific needs and nothing is listed, Cameron currently has no move. This workflow finds off-market properties by going directly to the source: tax parcel databases, county records, and zoning data — then uses Workflow 04 (Owner Finder) to get the contact, and fires a personalized pitch email.

**The flow:**
1. Enter buyer profile: property type, sq ft range, lot size, zoning, area, budget
2. System queries:
   - **Pima County Tax Parcel DB** — every property in Tucson with size + zoning
   - **Pima Maps GIS** — parcel shapes, lot sizes, ownership
   - **CoStar/Crexi** — filter out what's already listed (we want unlisted only)
3. Returns matching properties not currently on market
4. Plots on interactive map: 🔴 High Match, 🟡 Med Match, 🔵 Low Match
5. For each match: auto-runs WF04 skip trace → finds owner contact
6. Claude AI drafts personalized pitch email per owner:
   *"Hey Steve, I have a buyer looking for exactly what you've got at Coyote Dr..."*
7. Cameron reviews, clicks send. Bulk send option for full list.

---

## 📁 Folder Structure

```
workflow-05-off-market-hunter/
├── src/
│   ├── parcels/
│   │   ├── pima-parcels.ts    # Query Pima County parcel database
│   │   ├── zoning.ts          # Zoning code lookup + compatibility check
│   │   └── filter.ts          # Filter parcels by size, type, area, budget
│   ├── matcher/
│   │   ├── engine.ts          # Core matching engine — buyer profile vs parcels
│   │   ├── scorer.ts          # Hot/Med/Low match scoring
│   │   ├── deduper.ts         # Remove properties already listed on CoStar/Crexi
│   │   └── geo.ts             # Map bounds, radius search, neighborhood filter
│   ├── outreach/
│   │   ├── drafter.ts         # Claude AI — writes pitch email per owner
│   │   ├── sender.ts          # Gmail bulk sender with delay
│   │   └── tracker.ts         # Track responses
│   └── utils/
│       ├── costar-check.ts    # Check if parcel is currently listed on CoStar
│       ├── crexi-check.ts     # Check if parcel is currently listed on Crexi
│       ├── value-estimator.ts # Estimate property value from parcel data
│       └── logger.ts
├── frontend/
│   ├── components/
│   │   ├── BuyerProfileForm.tsx   # Buyer needs input form
│   │   ├── MapView.tsx            # Interactive map with colored markers
│   │   ├── ResultsPanel.tsx       # Scrollable list of matching properties
│   │   ├── PropertyResultCard.tsx # Card with match score + owner status
│   │   ├── OwnerStatus.tsx        # Shows trace progress per property
│   │   └── PitchDraftModal.tsx    # Review + send pitch email
│   ├── pages/
│   │   ├── Hunter.tsx             # Main off-market search page
│   │   ├── BuyerProfiles.tsx      # Saved buyer profiles
│   │   └── ActiveHunts.tsx        # All running searches
│   └── styles/
│       └── globals.css
├── tests/
│   ├── matcher.test.ts        # Test matching engine
│   ├── scorer.test.ts         # Test scoring algorithm
│   └── deduper.test.ts        # Test listed-property deduplication
├── docs/
│   ├── parcel-data.md         # Notes on Pima County parcel data format
│   ├── matching-algorithm.md  # How the scoring engine works
│   └── use-cases.md           # Real examples: developer outreach, land hunt, etc.
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | Claude AI — pitch email drafting, match reasoning |
| `COSTAR_API_KEY` | Check if property already listed |
| `COSTAR_API_SECRET` | CoStar API secret |
| `CREXI_API_KEY` | Check if property already listed on Crexi |
| `ATTOM_API_KEY` | Property value estimation, owner data |
| `GOOGLE_MAPS_API_KEY` | Map display, geocoding |
| `PIMA_MAPS_URL` | Pima County GIS |
| `GMAIL_CLIENT_ID` | Send pitch emails |
| `GMAIL_CLIENT_SECRET` | Google OAuth |
| `GMAIL_REFRESH_TOKEN` | OAuth refresh token |
| `GMAIL_FROM_ADDRESS` | cam@cameronnorwoodcre.com |
| `PORT` | Default: `3005` |

---

## 🛠️ Setup

```bash
npm install
cp .env.example .env
npm run dev
```

---

## 📡 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/buyers` | Create buyer profile |
| `GET` | `/api/buyers` | List all buyer profiles |
| `POST` | `/api/hunt` | Run off-market search for buyer |
| `GET` | `/api/hunt/:id` | Get hunt results |
| `GET` | `/api/hunt/:id/map` | GeoJSON for map display |
| `POST` | `/api/hunt/:id/trace-all` | Run WF04 skip trace on all matches |
| `POST` | `/api/properties/:id/pitch` | Draft + send pitch email to owner |
| `GET` | `/api/hunts` | All active + past hunts |

---

## 🧮 Matching Algorithm

Properties are scored against buyer profile:

| Factor | Weight |
|--------|--------|
| Square footage match (within 20%) | 30 pts |
| Lot size match | 20 pts |
| Zoning compatibility | 20 pts |
| Geography (within bounds) | 15 pts |
| Estimated value within budget | 15 pts |

**Score → Label:**
- 80–100: 🔴 High Match
- 50–79: 🟡 Med Match
- 20–49: 🔵 Low Match
- < 20: Excluded

---

## 📧 Pitch Email Template

Personalized per owner via Claude AI:

```
Subject: Potential buyer for your property at [Address]

Hi [Owner Name],

I'm a commercial real estate broker in Tucson and I have a buyer
who is specifically looking for a [type] property around [size] SF
in [neighborhood].

Your property at [Address] looks like it could be a great fit.
I'd love to chat for 5 minutes to see if there's any interest
in exploring a sale.

No pressure — just wanted to make sure the right people know
there's a serious buyer in the market.

[Calendar Link]

Cameron Norwood
[Phone] | [Email]
```

---

## 🗺️ Use Cases from the Transcript

1. **Buyer needs 2,000 SF building on an acre** — nothing listed → hunt finds 40–60 matching parcels, pitch sent to all owners
2. **Utah developer looking for vacant lots in Tucson** → filter by zoning (multifamily/mixed), vacant land only, send flyer + pitch
3. **Industrial buyer needs specific configuration** → parcel filter by I-1/I-2 zoning + lot size + building SF
