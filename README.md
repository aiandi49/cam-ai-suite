# KAM×AI — Commercial Real Estate Automation Suite
### Cameron Norwood · Tucson, AZ

> **5 AI-powered workflows that eliminate the manual grind of commercial real estate brokerage.**
> Search. Report. Outreach. Trace. Hunt. All automated.

---

## 🗂️ Suite Overview

| # | Workflow | What It Does | Status |
|---|----------|-------------|--------|
| 01 | **Search & Alert Engine** | Daily property searches across CoStar, Crexi, LoopNet → email + SMS per client | 🔨 Phase 1 |
| 02 | **Branded Report Builder** | Generates beautiful PDF reports from search results — not CoStar boilerplate | 🔨 Phase 1 |
| 03 | **Tenant Outreach Engine** | Upload flyer → AI finds leads → personalized campaign fires automatically | 🔨 Phase 1 |
| 04 | **Owner Finder / Skip Trace** | Address → Pima Maps → AZ Corp → LinkedIn → contact card | 📋 Phase 2 |
| 05 | **Off-Market Hunter** | Buyer needs → parcel DB search → unlisted matches → pitch emails | 📋 Phase 2 |

---

## 📁 Monorepo Structure

```
cam-ai-suite/
├── workflow-01-search-engine/      # Daily client search + alert system
├── workflow-02-report-builder/     # Branded PDF report generator
├── workflow-03-outreach-engine/    # Flyer → leads → email campaign
├── workflow-04-owner-finder/       # Property owner skip trace pipeline
├── workflow-05-off-market-hunter/  # Off-market property prospector
├── shared/                         # Shared DB schemas, types, utilities
│   ├── db/                         # Postgres schema + migrations
│   ├── types/                      # TypeScript interfaces (Client, Property, etc.)
│   └── utils/                      # Shared helpers (email, SMS, logging)
└── docs/                           # Architecture diagrams, API docs
```

---

## 🔑 API Keys Required (Suite-Wide)

| Key | Used In | Where to Get |
|-----|---------|-------------|
| `COSTAR_API_KEY` | WF1, WF2 | CoStar Group — contact your rep |
| `CREXI_API_KEY` | WF1, WF2, WF3 | Crexi Pro account → API Settings |
| `LOOPNET_API_KEY` | WF1 | LoopNet — CoStar subsidiary, same account |
| `ANTHROPIC_API_KEY` | WF2, WF3, WF4, WF5 | console.anthropic.com |
| `GOOGLE_MAPS_API_KEY` | WF2, WF5 | console.cloud.google.com |
| `GMAIL_CLIENT_ID` | WF1, WF3 | Google Cloud Console → OAuth 2.0 |
| `GMAIL_CLIENT_SECRET` | WF1, WF3 | Google Cloud Console → OAuth 2.0 |
| `TWILIO_SID` | WF1 | twilio.com/console |
| `TWILIO_AUTH_TOKEN` | WF1 | twilio.com/console |
| `ATTOM_API_KEY` | WF4, WF5 | api.attomdata.com |

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/your-org/cam-ai-suite.git
cd cam-ai-suite

# Install all dependencies (run from root if using workspaces)
npm install

# Set up each workflow's .env (copy from .env.example)
cp workflow-01-search-engine/.env.example workflow-01-search-engine/.env
# ... repeat for each workflow

# Start Phase 1 workflows
cd workflow-01-search-engine && npm run dev
cd workflow-02-report-builder && npm run dev
cd workflow-03-outreach-engine && npm run dev
```

---

## 🗄️ Database

All workflows share a **PostgreSQL** database.
Schema lives in `shared/db/schema.sql`.
Run migrations with:
```bash
psql -U postgres -d cam_ai -f shared/db/schema.sql
```

---

## 📞 Contact

Cameron Norwood · Commercial Real Estate · Tucson, AZ
Built by: Lamar (AI & I)
