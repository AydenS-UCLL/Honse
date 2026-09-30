# KBC Service Builder (hackathon frontend)

"Tell us about your life, and we assemble a service around it."

Frontend-only proof of concept. Kate is mocked in `src/services/kate.ts`: it maps a plain-language
request to a template, asks follow-up questions, and composes a pipeline **only from the vetted block
catalog** in `src/services/blocks.ts`. Swap `detectTemplate` / `composeBlocks` for an LLM or backend
call later; keep the rule that it can only return known block IDs.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000 (the mobile screens show in a phone frame on desktop).

## Routes

| Route | Screen |
| --- | --- |
| `/` | My services hub (suggestion, approvals, services on/off) |
| `/services/new` | Describe the service (text, fake voice, templates) |
| `/services/new/clarify` | Kate asks follow-up questions |
| `/services/new/build` | Composed pipeline, block library, block settings |
| `/services/new/dry-run` | Dry run on last 3 months, permissions, sign to turn on |
| `/services/[id]` | Service detail, stats, activity log, CSV export, edit, delete |
| `/approvals/[id]` | Approval request with before/after and signing |
| `/studio` | Desktop editor: library, flow, inspector, dry run |

## Demo script (2 minutes)

1. Hub → **Create a service** → type "Help me when I move" (or tap the mic) → **Build it**.
2. Answer Kate's questions → **Show my service**.
3. Tap **Update insurance addresses**: "Automatic" is blocked for contract changes.
4. **Add a block** → notice "Move money" is locked.
5. **Try it on my last 3 months** → **Sign to turn on** → activity log.
6. Back on the hub, open the orange approval → **Approve and sign**.
7. Desktop icon (top right) → `/studio` → edit Voucher saver, run a dry run, save.

## Security points built into the UI

- Kate can only compose from an allow-listed block catalog; blocks declare the data they use.
- Risk labels per block; contract changes and partner sharing can never be automatic.
- "Move money" is not available to services; Scam Pause and no-pay guards are locked on.
- Dry run before activation; every activation and change is signed (simulated itsme / SCA).
- Activity log per service with CSV export (audit trail).

## Structure

```
src/
  app/            routes (App Router)
  components/     ui/, blocks/, kate/
  layouts/        PhoneShell
  context/        ServicesContext (in-memory state)
  services/       blocks catalog, Kate mock, mock data
  types/          shared types
```

State is in memory: refreshing the page resets the demo.
