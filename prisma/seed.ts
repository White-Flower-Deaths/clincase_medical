import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.case.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("demo1234", 10);

  const doctor = await prisma.user.create({
    data: {
      name: "Dr. Priya Sharma",
      email: "doctor@clincase.dev",
      passwordHash,
      phone: "+91 90000 11111",
      specialty: "General Medicine",
      role: "doctor",
    },
  });

  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        mrn: "MRN-1001",
        firstName: "Rahul",
        lastName: "Mehta",
        age: 42,
        sex: "Male",
        phone: "+91 98765 43210",
        email: "rahul.mehta@email.com",
        address: "12 Lake View Rd, Pune",
      },
    }),
    prisma.patient.create({
      data: {
        mrn: "MRN-1002",
        firstName: "Ananya",
        lastName: "Iyer",
        age: 29,
        sex: "Female",
        phone: "+91 91234 56789",
        email: "ananya.iyer@email.com",
        address: "88 MG Road, Bengaluru",
      },
    }),
    prisma.patient.create({
      data: {
        mrn: "MRN-1003",
        firstName: "Omar",
        lastName: "Khan",
        age: 61,
        sex: "Male",
        phone: "+91 99887 76655",
        address: "4 Civil Lines, Lucknow",
        notes: "Prefers morning appointments",
      },
    }),
  ]);

  await prisma.case.create({
    data: {
      patientId: patients[0].id,
      doctorId: doctor.id,
      status: "completed",
      chiefComplaint: "Chest discomfort for 2 days",
      hpi: "42-year-old male with intermittent left-sided chest discomfort for 2 days, worse on exertion, associated with mild dyspnea. No radiation to arm. No syncope. Pain rated 4/10.",
      pastHistory: "Hypertension (2019). No prior MI or CAD workup.",
      surgicalHistory: "Appendectomy age 22.",
      familyHistory: "Father had MI at 58. Mother has type 2 diabetes.",
      socialHistory: "Never smoker. Occasional alcohol. Desk job. Walks 2x/week.",
      medications: "Amlodipine 5 mg daily",
      allergies: "NKDA",
      reviewOfSystems:
        "Constitutional: denies fever/weight loss. CV: chest discomfort as above, no palpitations. Resp: mild DOE. GI/GU/Neuro/MSK: negative.",
      vitals: JSON.stringify({
        bp: "148/92",
        hr: "88",
        rr: "16",
        temp: "36.8",
        spo2: "98%",
        weight: "78 kg",
      }),
      examination:
        "Alert, no distress. Heart: S1 S2 normal, no murmur. Lungs clear bilaterally. Abdomen soft. Extremities: no edema.",
      assessment:
        "Chest discomfort — rule out anginal equivalent vs musculoskeletal. Hypertensive on presentation.",
      plan: "ECG, troponin x2, basic metabolic panel. Continue amlodipine. Low-dose aspirin pending ECG. Cardiology follow-up if abnormal. Return precautions reviewed.",
    },
  });

  console.log("Seed complete.");
  console.log("Demo login: doctor@clincase.dev / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
