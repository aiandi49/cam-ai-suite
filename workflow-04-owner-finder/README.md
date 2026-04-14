# Workflow 04 — Owner Finder / Skip Trace Engine

> **Address in. Human contact out. What brokers spend hours doing manually — Pima Maps, AZ Corp Commission, LinkedIn, public web — this pipeline does in seconds.**

---

## 🎯 What This Does

CoStar often hits a dead end on owner info. An address shows the property but no real contact. This workflow chains together public data sources to drill all the way down to the actual human behind any LLC, trust, or entity — and builds a contact card ready for outreach or CRM import.

**The flow:**
1. Enter a property address (from CoStar or anywhere)
2. **Step 1 — Pima County GIS**: Lookup parcel number + legal entity name (LLC, trust, etc.)
3. **Step 2 — AZ Corporation Commission**: Search entity → get principals, statutory agent, mailing address, standing
4. **Step 3 — ATTOM Data**: Cross-reference ownership, sale history, mortgage data
5. **Step 4 — Web Intelligence**: Claude AI searches LinkedIn, Facebook, web for each principal
6. **Output**: Contact card with name, email, phone, LinkedIn, confidence score
7. One click: Add to CRM or draft outreach email

---

## 📁 Folder Structure

```
workflow-04-owner-finder/
├── src/
│   ├── gis/
│   │   ├── pima-maps.ts       # Pima County GIS API / scraper
│   │   └── parcel.ts          # Parse parcel data, extract entity name
│   ├── corp/
│   │   ├── az-corp.ts         # AZ Corporation Commission scraper
│   │   └── entity-parser.ts   # Parse principals, agents from corp data
│   ├── social/
│   │   ├── linkedin.ts        # LinkedIn profile finder (by name + company)
│   │   ├── web-search.ts      # General web search for person info
│   │   └── enricher.ts        # Combine all sources into contact card
│   ├── tracer/
│   │   ├── pipeline.ts        # Orchestrates all 4 steps in sequence
│   │   ├── scorer.ts          # Confidence scoring (0-100) for found contacts
│   │   └── attom.ts           # ATTOM Data API — ownership + history
│   └── utils/
│       ├── address-parser.ts  # Normalize addresses for different APIs
│       ├── entity-classifier.ts # Detect LLC vs Trust vs Individual
│       └── logger.ts
├── frontend/
│   ├── components/
│   │   ├── AddressSearch.tsx  # Address input + trace button
│   │   ├── PipelineView.tsx   # 3-column step-by-step trace view
│   │   ├── ParcelCard.tsx     # Pima Maps result display
│   │   ├── CorpCard.tsx       # AZ Corp Commission result display
│   │   ├── ContactCard.tsx    # Final contact with confidence score
│   │   ├── ConfidenceBar.tsx  # Visual confidence meter
│   │   └── OutreachDraftModal.tsx # Draft email to owner
│   ├── pages/
│   │   ├── OwnerFinder.tsx    # Main skip trace page
│   │   └── History.tsx        # Past traces with results
│   └── styles/
│       └── globals.css
├── tests/
│   ├── pima-maps.test.ts      # Test GIS lookups
│   ├── az-corp.test.ts        # Test Corp Commission scraper
│   └── pipeline.test.ts       # Full pipeline integration test
├── docs/
│   ├── data-sources.md        # Notes on each data source + limitations
│   ├── address-formats.md     # How Pima Maps needs addresses formatted
│   └── confidence-scoring.md  # How the 0-100 confidence score works
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | Claude AI — web intelligence, entity matching |
| `ATTOM_API_KEY` | ATTOM Data API — ownership + sale history |
| `ATTOM_BASE_URL` | https://api.gateway.attomdata.com |
| `PIMA_MAPS_URL` | Pima County GIS URL |
| `AZ_CORP_URL` | AZ Corp Commission base URL |
| `GOOGLE_MAPS_API_KEY` | For address geocoding / normalization |
| `GMAIL_CLIENT_ID` | For drafting + sending outreach emails |
| `GMAIL_CLIENT_SECRET` | Google OAuth |
| `GMAIL_REFRESH_TOKEN` | OAuth refresh token |
| `GMAIL_FROM_ADDRESS` | cam@cameronnorwoodcre.com |
| `PORT` | Default: `3004` |

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
| `POST` | `/api/trace` | Start a trace for an address → returns trace ID |
| `GET` | `/api/trace/:id` | Get trace results (poll until complete) |
| `GET` | `/api/trace/:id/contact` | Get final contact card |
| `POST` | `/api/trace/:id/crm` | Add contact to CRM |
| `POST` | `/api/trace/:id/draft` | Draft outreach email to owner |
| `GET` | `/api/history` | All past traces |
| `GET` | `/api/parcel?address=` | Raw parcel lookup (Pima Maps) |
| `GET` | `/api/corp?entity=` | Raw corp commission search |

---

## 🔗 Data Source Notes

### Pima County GIS (Pima Maps)
- URL: `https://www.assessor.pima.gov/`
- Address format quirks: No "N." or "S." — must spell out "North", "South"
- No punctuation in street names
- Returns: parcel number, legal description, entity name, lot size, zoning

### AZ Corporation Commission
- URL: `https://ecorp.azcc.gov/`
- Has CAPTCHA — may need Playwright with human-like behavior
- Returns: principals, statutory agent, registered address, standing, filing history

### ATTOM Data
- API: `https://api.gateway.attomdata.com/propertyapi/v1.0.0/`
- Needs API key ($250–300/mo for basic plan)
- Returns: owner name, sale history, mortgage data, assessed value

### LinkedIn / Web
- No official API — uses Claude AI to search and synthesize public info
- Cross-references name from AZ Corp with city + industry to find profiles
