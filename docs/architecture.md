# KAM×AI Suite — Architecture Overview

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      KAM×AI SUITE                           │
├──────────────┬──────────────┬──────────────┬───────────────┤
│  WF1 :3001   │  WF2 :3002   │  WF3 :3003   │  WF4 :3004   │
│  Search &    │  Report      │  Outreach    │  Owner        │
│  Alert       │  Builder     │  Engine      │  Finder       │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬────────┘
       │              │              │              │
       └──────────────┴──────────────┴──────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   PostgreSQL DB    │
                    │   (Shared Schema)  │
                    └─────────┬─────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
     ┌──────▼──────┐  ┌───────▼──────┐  ┌──────▼──────┐
     │  CoStar API  │  │  Crexi API   │  │ LoopNet API │
     └─────────────┘  └──────────────┘  └─────────────┘

External Services:
  - Anthropic (Claude AI) — WF2, WF3, WF4, WF5
  - Google Maps API — WF2, WF5
  - Gmail / G Suite — WF1, WF2, WF3, WF5
  - Twilio SMS — WF1
  - ATTOM Data — WF4, WF5
  - Pima County GIS — WF4, WF5
  - AZ Corporation Commission — WF4
  - RE Daily News (scrape) — WF3
```

## Inter-Workflow Communication

WF5 calls WF4's API to trace property owners:
```
WF5 match found → POST http://localhost:3004/api/trace → WF4 pipeline → contact card returned
```

## Deployment

Each workflow is independently deployable:
- Development: run each on its own port locally
- Production: Docker containers, nginx reverse proxy, or deploy to Railway/Render
- Database: single Postgres instance shared by all 5

## Database

All workflows share `cam_ai` PostgreSQL database.
Schema: `shared/db/schema.sql`
Each workflow connects via its own `DATABASE_URL`.
