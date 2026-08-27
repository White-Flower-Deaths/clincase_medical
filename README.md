# ClinCase

ClinCase is a Next.js application for doctors and medical teams to manage patient information, clinical cases, referrals, transfers, casualty records, and billing.

> **Prototype notice:** This project was developed for a Smart India Hackathon prototype. It is not intended for professional or clinical use without appropriate testing, security review, privacy controls, and regulatory compliance.IT is made by MR.MAYANK NARULA and his team members from M.R.U.--NOT MEDICALY APPROVED--
> *The site is tested by Cursor agent , OpenAi codex and Github copilot.

## Tech stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Backend:** Next.js API routes
- **Authentication:** NextAuth.js credentials provider
- **Database:** PostgreSQL via Prisma ORM

## Quick start

```bash
npm install
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo login

| Field | Value |
| --- | --- |
| Email | `doctor@clincase.dev` |
| Password | `demo1234` |

## Features

- Doctor sign-in and protected routes
- Patient registry and search
- Guided seven-step case-taking wizard with draft autosave
- Patient history, vitals, examination, assessment, and plan
- Referral network and patient transfers
- Casualty severity tracking
- Billing records
- Printable case review

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production server |
| `npm run db:push` | Sync the Prisma schema to PostgreSQL |
| `npm run db:seed` | Load demo data |
| `npm run db:setup` | Push the schema and load demo data |

## Environment

Copy `.env.example` to `.env` and set:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
NEXTAUTH_SECRET="your-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Free public deployment

ClinCase can be deployed using Vercel and Neon:

1. Create a free PostgreSQL database at [Neon](https://neon.tech).
2. Push this project to a private GitHub repository.
3. Import the repository into [Vercel](https://vercel.com).
4. Add `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` as Vercel environment variables.
5. Set `NEXTAUTH_URL` to the deployed HTTPS URL.
6. Run `npm run db:push` once using the Neon database URL to create the tables.

Do not run `npm run db:seed` against a database containing real users or patient data; the seed script deletes existing users, patients, and cases. Replace the demo password before sharing the application.

## Screenshots

### Homepage

<img width="1920" height="1080" alt="ClinCase homepage" src="https://github.com/user-attachments/assets/c0a2414a-971e-45b0-9d6a-58169db7bbb7" />

### Dashboard

<img width="1920" height="1080" alt="ClinCase dashboard" src="https://github.com/user-attachments/assets/3cbfd4cd-3f3c-40c6-979b-d475bb46fcd7" />

### Doctor profile

<img width="1920" height="1080" alt="Screenshot 2026-08-28 032055" src="https://github.com/user-attachments/assets/299c2dd1-d363-4f40-8051-65f43b3026e3" />


### Referrals and transfers

<img width="1920" height="1080" alt="Referrals and transfers" src="https://github.com/user-attachments/assets/8e832321-f944-4022-a22f-1715e191b2e4" />

### Patient conditions

<img width="1920" height="1080" alt="Patient conditions" src="https://github.com/user-attachments/assets/255db198-288b-494b-9163-f508a2c396ad" />

### Billing status

<img width="1920" height="1080" alt="Billing status" src="https://github.com/user-attachments/assets/21a2b7ee-1a86-49a7-ac44-2569c30d4516" />

## License


workflow-alogorithm :
<img width="926" height="303" alt="Screenshot 2026-08-27 200421" src="https://github.com/user-attachments/assets/d9142b5d-dddb-4f5f-9314-484f7ed65f8c" />



