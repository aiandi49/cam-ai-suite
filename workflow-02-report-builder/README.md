# Workflow 02 — Branded Report Builder

> **No more CoStar boilerplate PDFs. Enter client params, hit generate. Out comes a beautiful, branded report that actually makes Cameron look different from every other broker sending the same thing.**

---

## 🎯 What This Does

CoStar's built-in reports all look identical. Cameron currently:
1. Runs a search manually
2. Clicks "Create Report" in CoStar
3. Types in the client name, search params, description
4. Waits for it to load
5. Downloads the PDF
6. Emails it

This workflow replaces all of that with a single form → one click → beautiful branded PDF.

**The flow:**
1. Cameron (or the system) enters client name + search parameters
2. System hits CoStar + Crexi APIs for matching properties
3. For each property: pulls photos, gets Google Maps link, pulls traffic count
4. Claude AI writes a plain-English summary for each property
5. HTML template renders everything into a branded report
6. Headless browser (Puppeteer) converts HTML → PDF
7. PDF saved to storage (Dropbox or Google Drive)
8. Optionally: email it directly to client from this screen

---

## 📁 Folder Structure

```
workflow-02-report-builder/
├── src/
│   ├── api/
│   │   ├── costar.ts          # Pull properties from CoStar
│   │   ├── crexi.ts           # Pull properties from Crexi
│   │   ├── maps.ts            # Google Maps static image + link generator
│   │   └── traffic.ts         # Traffic count lookup
│   ├── generator/
│   │   ├── pdf.ts             # Puppeteer HTML-to-PDF conversion
│   │   ├── report.ts          # Main report builder — orchestrates everything
│   │   └── ai-summaries.ts    # Claude AI plain-English property descriptions
│   ├── templates/
│   │   ├── report.hbs         # Handlebars HTML template (the report design)
│   │   ├── cover.hbs          # Cover page template
│   │   └── property-card.hbs  # Individual property card template
│   └── utils/
│       ├── storage.ts         # Save PDFs to Dropbox / Google Drive
│       ├── formatter.ts       # Format currency, sqft, dates
│       └── logger.ts
├── frontend/
│   ├── components/
│   │   ├── ReportForm.tsx     # Left panel: client + search param inputs
│   │   ├── ReportPreview.tsx  # Right panel: live HTML preview
│   │   ├── PropertyCard.tsx   # Individual property in preview
│   │   ├── CoverPage.tsx      # Report cover preview
│   │   └── SendModal.tsx      # Email report to client modal
│   ├── pages/
│   │   ├── Builder.tsx        # Main report builder page
│   │   └── History.tsx        # Past reports list
│   └── styles/
│       └── globals.css
├── assets/
│   └── report-templates/
│       └── cam-norwood-brand.css   # Brand CSS for PDF reports
├── tests/
│   ├── generator.test.ts      # Test report generation
│   └── pdf.test.ts            # Test PDF output
├── docs/
│   ├── template-guide.md      # How to customize the report template
│   └── branding.md            # Brand guidelines for reports
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `COSTAR_API_KEY` | CoStar Group API key |
| `COSTAR_API_SECRET` | CoStar API secret |
| `CREXI_API_KEY` | Crexi Pro API key |
| `ANTHROPIC_API_KEY` | Claude AI — for plain-English property summaries |
| `GOOGLE_MAPS_API_KEY` | Static maps + links per property |
| `GMAIL_CLIENT_ID` | For sending reports by email |
| `GMAIL_CLIENT_SECRET` | Google OAuth |
| `GMAIL_REFRESH_TOKEN` | OAuth refresh token |
| `GMAIL_FROM_ADDRESS` | cam@cameronnorwoodcre.com |
| `STORAGE_PROVIDER` | `dropbox` or `gdrive` |
| `DROPBOX_ACCESS_TOKEN` | If using Dropbox |
| `GDRIVE_FOLDER_ID` | If using Google Drive |
| `PORT` | Default: `3002` |

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
| `POST` | `/api/reports/generate` | Generate a new report |
| `GET` | `/api/reports` | List all past reports |
| `GET` | `/api/reports/:id` | Get single report + PDF URL |
| `POST` | `/api/reports/:id/send` | Email report to client |
| `DELETE` | `/api/reports/:id` | Delete report |
| `GET` | `/api/reports/:id/preview` | Get HTML preview |

---

## 🎨 Report Contents (per property)

Each property card includes:
- **Photo** (from API or placeholder)
- **Address** + cross street
- **Square footage** breakdown (e.g., "6,960 SF available — can be split into 2×3,480")
- **Asking rate** (monthly AND per sq ft explained in plain English)
- **Year built**
- **Traffic count** (vehicles/day)
- **Parking ratio**
- **Sprinklered** yes/no
- **Google Maps link** (clickable in email)
- **AI-written plain English summary** ("This end-cap retail space sits on one of Tucson's busiest corridors with 52,000 daily drivers...")

---

## 🤖 AI Summary Prompt

The `ai-summaries.ts` module sends each property to Claude with this prompt:

```
You are a commercial real estate expert writing for a non-expert client.
In 2-3 sentences, describe this property in plain English.
Highlight the most important selling points.
Avoid jargon. Be specific and honest.

Property data: [JSON]
Client looking for: [search params]
```
