# Workflow 03 — Tenant Outreach Engine

> **Upload a listing flyer. AI reads it. Finds everyone who leased a similar space in the last 5 years. Drafts a personalized email to each one. You click send. Done.**

---

## 🎯 What This Does

Cameron has ~50 active listings. For each one, he needs to find tenants who might want that space. Right now this is impossible to do at scale. This workflow automates it entirely.

**The flow:**
1. Cameron uploads a listing flyer (PDF or image)
2. Claude AI vision reads the flyer → extracts: address, property type, square footage, price, target tenant profile
3. System crawls public lease data sources:
   - **RE Daily News** (local Tucson lease database, weekly reports)
   - **Crexi** public lease comps
   - **CoStar** lease comps (via API)
   - **RE² AI** (re2.ai) for additional contact enrichment
4. Finds every tenant who leased a similar space (same sq ft range, same type) in the last 1–5 years
5. Builds a scored lead list: Hot / Warm / Cold
6. Claude AI drafts a personalized email per lead:
   *"Hey Maria, I saw that Santos Bakery leased 2,400 SF on Grant Rd in 2022. I have a 2,800 SF retail space on Broadway that might be a great next step..."*
7. Cameron reviews drafts, clicks Launch Campaign
8. Emails fire from G Suite, responses tracked in dashboard

---

## 📁 Folder Structure

```
workflow-03-outreach-engine/
├── src/
│   ├── extractor/
│   │   ├── flyer.ts           # Claude AI vision — reads flyer, extracts property data
│   │   └── profile.ts         # Builds target tenant profile from extracted data
│   ├── crawler/
│   │   ├── re-daily-news.ts   # Scrapes RealEstateDailyNews.com lease reports
│   │   ├── crexi-comps.ts     # Crexi lease comp API or scraper
│   │   ├── costar-comps.ts    # CoStar lease comp API
│   │   └── scheduler.ts       # Keeps lease DB fresh (runs nightly)
│   ├── leads/
│   │   ├── builder.ts         # Matches lease data against listing profile
│   │   ├── scorer.ts          # Hot/Warm/Cold scoring algorithm
│   │   ├── enricher.ts        # Find email, phone, LinkedIn per lead
│   │   └── dedup.ts           # Remove duplicate leads across sources
│   ├── campaigns/
│   │   ├── drafter.ts         # Claude AI — writes personalized email per lead
│   │   ├── sender.ts          # Gmail SMTP campaign sender
│   │   ├── tracker.ts         # Track opens, responses, categorize replies
│   │   └── templates/
│   │       └── outreach.hbs   # Base email template
│   └── utils/
│       ├── fileUpload.ts      # Handle flyer upload (PDF/image)
│       ├── storage.ts         # Store uploaded flyers
│       └── logger.ts
├── frontend/
│   ├── components/
│   │   ├── FlyerUpload.tsx    # Drag & drop upload zone
│   │   ├── ExtractedProfile.tsx # Shows what AI extracted from flyer
│   │   ├── LeadList.tsx       # Scrollable list of leads with scoring
│   │   ├── LeadCard.tsx       # Individual lead with draft preview
│   │   ├── CampaignDashboard.tsx # Sent/response tracking
│   │   └── EmailDraftModal.tsx # Review + edit email draft before send
│   ├── pages/
│   │   ├── NewCampaign.tsx    # Upload flyer + review leads
│   │   ├── Campaigns.tsx      # All campaigns list
│   │   └── CampaignDetail.tsx # Individual campaign stats
│   └── styles/
│       └── globals.css
├── assets/
│   └── flyers/                # Uploaded flyers stored here (gitignored)
│       └── .gitkeep
├── tests/
│   ├── extractor.test.ts      # Test AI flyer extraction
│   ├── scorer.test.ts         # Test lead scoring
│   └── crawler.test.ts        # Test RE Daily News scraper
├── docs/
│   ├── lead-scoring.md        # How Hot/Warm/Cold is calculated
│   └── crawler-guide.md       # Notes on scraping RE Daily News
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | Claude AI — flyer reading + email drafting |
| `CREXI_API_KEY` | Crexi lease comps |
| `COSTAR_API_KEY` | CoStar lease comps |
| `RE2_API_KEY` | RE² AI (re2.ai) for contact enrichment |
| `GMAIL_CLIENT_ID` | Google OAuth |
| `GMAIL_CLIENT_SECRET` | Google OAuth |
| `GMAIL_REFRESH_TOKEN` | OAuth refresh token |
| `GMAIL_FROM_ADDRESS` | cam@cameronnorwoodcre.com |
| `RE_DAILY_NEWS_URL` | Base URL for RE Daily News site |
| `UPLOAD_DIR` | Where to store uploaded flyers |
| `MAX_LEADS_PER_CAMPAIGN` | Cap leads per campaign (default: 500) |
| `PORT` | Default: `3003` |

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
| `POST` | `/api/flyers/upload` | Upload listing flyer → returns extracted profile |
| `POST` | `/api/campaigns` | Create new campaign from flyer + params |
| `GET` | `/api/campaigns` | List all campaigns |
| `GET` | `/api/campaigns/:id` | Get campaign + leads |
| `GET` | `/api/campaigns/:id/leads` | Get lead list for campaign |
| `PUT` | `/api/leads/:id/draft` | Edit email draft for a lead |
| `POST` | `/api/campaigns/:id/launch` | Send all emails in campaign |
| `POST` | `/api/campaigns/:id/launch-selected` | Send to selected leads only |
| `GET` | `/api/campaigns/:id/stats` | Open/response stats |

---

## 🤖 Claude AI Roles in This Workflow

**Role 1: Flyer Reader (Vision)**
```
Prompt: "Read this commercial real estate listing flyer.
Extract: address, property type, sq footage, price, parking,
target tenant type, and any notable features.
Return JSON only."
```

**Role 2: Email Drafter**
```
Prompt: "You are Cameron Norwood, a commercial real estate broker in Tucson.
Write a short, genuine outreach email to [Lead Name] at [Company].
They leased [X] SF on [Street] in [Year].
You have a [Property Type] space at [Address] that might be a fit.
Keep it under 100 words. Conversational, not salesy.
Include: flyer attachment mention, calendar link placeholder."
```

---

## 📊 Lead Scoring Algorithm

| Score | Criteria |
|-------|---------|
| 🔥 **Hot** | Lease expires within 12 months AND size matches within 20% |
| 🟡 **Warm** | Lease within 3 years AND size matches within 40% |
| 🔵 **Cold** | Older lease OR size mismatch > 40% |

Lease expiry estimated as: `lease_date + 5 years` (standard commercial term)
