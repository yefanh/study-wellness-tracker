/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient, BreakType } = require('@prisma/client');

const prisma = new PrismaClient();

function daysAgo(days, hours = 10) {
  const d = new Date();
  d.setHours(hours, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

async function main() {
  const email = process.env.DEMO_USER_EMAIL ?? 'demo@studywellness.local';

  const user = await prisma.user.upsert({
    where: { email },
    update: { name: 'Demo User' },
    create: { email, name: 'Demo User' },
  });

  // Clear prior demo data for idempotent seeding.
  await prisma.habitCheckIn.deleteMany({ where: { userId: user.id } });
  await prisma.habit.deleteMany({ where: { userId: user.id } });
  await prisma.moodLog.deleteMany({ where: { userId: user.id } });
  await prisma.break.deleteMany({ where: { userId: user.id } });
  await prisma.studySession.deleteMany({ where: { userId: user.id } });

  const sessions = [
    { start: daysAgo(0, 9), minutes: 90, focusArea: 'Deep work' },
    { start: daysAgo(0, 14), minutes: 60, focusArea: 'Reading' },
    { start: daysAgo(1, 10), minutes: 75, focusArea: 'Project' },
    { start: daysAgo(2, 9), minutes: 110, focusArea: 'Algorithms' },
    { start: daysAgo(3, 11), minutes: 50, focusArea: 'Notes review' },
  ];

  for (const s of sessions) {
    await prisma.studySession.create({
      data: {
        userId: user.id,
        startedAt: s.start,
        endedAt: new Date(s.start.getTime() + s.minutes * 60000),
        focusArea: s.focusArea,
        notes: 'Seeded data',
      },
    });
  }

  const breaks = [
    { start: daysAgo(0, 11), minutes: 15, type: BreakType.SHORT },
    { start: daysAgo(0, 15), minutes: 30, type: BreakType.MEAL },
    { start: daysAgo(1, 12), minutes: 10, type: BreakType.MOVEMENT },
    { start: daysAgo(2, 10), minutes: 20, type: BreakType.LONG },
  ];

  for (const b of breaks) {
    await prisma.break.create({
      data: {
        userId: user.id,
        startedAt: b.start,
        endedAt: new Date(b.start.getTime() + b.minutes * 60000),
        type: b.type,
        notes: 'Seeded break',
      },
    });
  }

  const moods = [
    { day: 0, mood: 4, energy: 4, stress: 2 },
    { day: 1, mood: 3, energy: 3, stress: 3 },
    { day: 2, mood: 5, energy: 5, stress: 1 },
    { day: 3, mood: 3, energy: 2, stress: 4 },
    { day: 4, mood: 4, energy: 3, stress: 2 },
  ];

  for (const m of moods) {
    await prisma.moodLog.create({
      data: {
        userId: user.id,
        recordedAt: daysAgo(m.day, 18),
        mood: m.mood,
        energy: m.energy,
        stress: m.stress,
        notes: 'Seeded mood',
      },
    });
  }

  const pomodoro = await prisma.habit.upsert({
    where: { userId_name: { userId: user.id, name: 'Pomodoro x4' } },
    update: { targetPerWeek: 4, archived: false },
    create: { userId: user.id, name: 'Pomodoro x4', targetPerWeek: 4 },
  });

  const walk = await prisma.habit.upsert({
    where: { userId_name: { userId: user.id, name: 'Walk 15m' } },
    update: { targetPerWeek: 5, archived: false },
    create: { userId: user.id, name: 'Walk 15m', targetPerWeek: 5 },
  });

  const checkIns = [
    { habitId: pomodoro.id, day: 0, value: 4, notes: 'Great focus' },
    { habitId: pomodoro.id, day: 1, value: 3 },
    { habitId: walk.id, day: 0, value: 1, notes: 'Evening walk' },
    { habitId: walk.id, day: 2, value: 1 },
  ];

  for (const c of checkIns) {
    await prisma.habitCheckIn.create({
      data: {
        habitId: c.habitId,
        userId: user.id,
        completedAt: daysAgo(c.day, 17),
        value: c.value ?? null,
        notes: c.notes ?? null,
      },
    });
  }

  console.log('Seeded demo data for', email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
