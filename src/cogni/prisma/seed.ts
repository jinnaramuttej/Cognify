import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create demo user profile
  const userProfile = await prisma.userProfile.upsert({
    where: { userId: "DEMO_USER_001" },
    update: {},
    create: {
      userId: "DEMO_USER_001",
      grade: "12",
      targetExam: "JEE",
      studyStreak: 7,
      lastActiveDate: new Date(),
    },
  });

  // Create weak topics
  const weakTopics = await Promise.all([
    prisma.weakTopicAnalysis.upsert({
      where: { id: "weak_1" },
      update: {},
      create: {
        id: "weak_1",
        userId: "DEMO_USER_001",
        topic: "Electrostatics",
        subject: "Physics",
        accuracy: 45.5,
        attemptCount: 12,
        lastPracticed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        mistakeType: "conceptual",
      },
    }),
    prisma.weakTopicAnalysis.upsert({
      where: { id: "weak_2" },
      update: {},
      create: {
        id: "weak_2",
        userId: "DEMO_USER_001",
        topic: "Organic Chemistry",
        subject: "Chemistry",
        accuracy: 52.0,
        attemptCount: 8,
        lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        mistakeType: "conceptual",
      },
    }),
    prisma.weakTopicAnalysis.upsert({
      where: { id: "weak_3" },
      update: {},
      create: {
        id: "weak_3",
        userId: "DEMO_USER_001",
        topic: "Integration",
        subject: "Mathematics",
        accuracy: 58.0,
        attemptCount: 15,
        lastPracticed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        mistakeType: "calculation",
      },
    }),
    prisma.weakTopicAnalysis.upsert({
      where: { id: "weak_4" },
      update: {},
      create: {
        id: "weak_4",
        userId: "DEMO_USER_001",
        topic: "Mechanics",
        subject: "Physics",
        accuracy: 72.0,
        attemptCount: 20,
        lastPracticed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        mistakeType: "time_pressure",
      },
    }),
    prisma.weakTopicAnalysis.upsert({
      where: { id: "weak_5" },
      update: {},
      create: {
        id: "weak_5",
        userId: "DEMO_USER_001",
        topic: "Thermodynamics",
        subject: "Chemistry",
        accuracy: 65.0,
        attemptCount: 10,
        lastPracticed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        mistakeType: "conceptual",
      },
    }),
  ]);

  // Create test attempts for performance history
  const testAttempts = await Promise.all([
    prisma.testAttempt.create({
      data: {
        id: "attempt_1",
        userId: "DEMO_USER_001",
        subject: "Physics",
        score: 65,
        totalQuestions: 30,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.testAttempt.create({
      data: {
        id: "attempt_2",
        userId: "DEMO_USER_001",
        subject: "Chemistry",
        score: 58,
        totalQuestions: 30,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.testAttempt.create({
      data: {
        id: "attempt_3",
        userId: "DEMO_USER_001",
        subject: "Mathematics",
        score: 72,
        totalQuestions: 30,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.testAttempt.create({
      data: {
        id: "attempt_4",
        userId: "DEMO_USER_001",
        subject: "Physics",
        score: 70,
        totalQuestions: 30,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.testAttempt.create({
      data: {
        id: "attempt_5",
        userId: "DEMO_USER_001",
        subject: "Chemistry",
        score: 62,
        totalQuestions: 30,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  // Create AI session
  const aiSession = await prisma.aISession.create({
    data: {
      id: "session_demo_1",
      userId: "DEMO_USER_001",
      title: "Electrostatics Help Session",
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
  });

  console.log("Seed data created successfully!");
  console.log({ userProfile, weakTopics, testAttempts, aiSession });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
