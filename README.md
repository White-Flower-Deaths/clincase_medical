# ClinCase — Patient Case Taking Software

Hackathon-ready clinical case-taking web app for doctors: register patients, complete guided multi-step case intake, and review printable case summaries.

## Tech stack

- **Frontend:** Next.js 14 (App Router), TypeScript, custom clinical UI
- **Backend:** Next.js API routes
- **Auth:** NextAuth.js (credentials)
- **Database:** PostgreSQL via Prisma ORM

## Quick start

```bash
cd clincase
npm install
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo login

| Field    | Value                 |
|----------|-----------------------|
| Email    | `doctor@clincase.dev` |
| Password | `demo1234`            |

## Features

- Brand landing page (**ClinCase**)
- Doctor sign-in with protected routes
- Dashboard with patient/case stats and recent activity
- Patient registry with search
- New patient registration
- 7-step case-taking wizard with draft autosave
  1. Chief complaint
  2. History of present illness
  3. Past & social history
  4. Medications & allergies
  5. Review of systems
  6. Vitals & examination
  7. Assessment & plan
- Case review view with print support
- Seeded demo doctor, 3 patients, 1 completed sample case

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run db:push` | Sync Prisma schema to PostgreSQL |
| `npm run db:seed` | Load demo data |
| `npm run db:setup` | Push schema + seed |

## Environment

Copy `.env.example` to `.env` (already set for local demo):

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Free public deployment

ClinCase can be deployed using Vercel and Neon:

1. Create a free PostgreSQL database at [Neon](https://neon.tech) and copy its pooled connection string.
2. Push this project to a private GitHub repository.
3. Import the repository into [Vercel](https://vercel.com).
4. Add `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` as Vercel environment variables. Set `NEXTAUTH_URL` to the deployed HTTPS URL.
5. Deploy, then run `npm run db:push` once with the Neon `DATABASE_URL` to create the tables.

Do not run `npm run db:seed` against a database containing real users or patient data; the seed script deletes existing users, patients, and cases. Replace the demo password before sharing the application.

## Project structure

```
clincase/
├── prisma/           # Schema + seed
├── src/
│   ├── app/          # Pages + API routes
│   ├── components/   # UI + case wizard
│   ├── lib/          # Prisma, auth, helpers
│   └── types/
├── .env.example
└── README.md
```

## Hackathon submission checklist

- [x] Full-stack app (UI + API + database)
- [x] Working auth and demo credentials
- [x] Seeded sample data for live demo
- [x] README with setup instructions
- [x] `.env.example` and `.gitignore`
- [x] One-command DB setup
- [ ] Zip the `clincase` folder **excluding** `node_modules` and `.next` (or include them if judges want offline install)
- [ ] Add 2–3 screenshots to this README under `docs/` if required by the portal

## Demo flow for judges

1. Open landing → **Start case taking**
2. Sign in with demo credentials
3. Dashboard → open a patient → **Start case**
4. Walk the wizard, save draft, complete case
5. Open case review → Print

## License

MIT — built for hackathon demonstration. Not for clinical production use or HIPAA-regulated PHI.
