// Synthetic demo data: 8 weeks of study sessions, breaks, mood logs and habit check-ins.
// Seeded random numbers make every run produce the same history (relative to today).
// Usage: npm run db:seed   (also runs automatically after `prisma migrate reset`)

import { BreakType, PrismaClient } from '@prisma/client';
import { addDays, dayToDate, localDay, zonedDate } from '../src/lib/time';

const prisma = new PrismaClient();
const DAYS = 56;
const TZ = 'America/New_York';

// mulberry32: a tiny deterministic random generator
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(42);
const between = (lo: number, hi: number) => Math.round(lo + rand() * (hi - lo));
const pick = <T,>(items: readonly T[]) => items[Math.floor(rand() * items.length)];

const FOCUS_AREAS = ['Algorithms', 'Databases', 'Linear algebra', 'Essay draft', 'Reading', 'Problem set'];
const HABITS = [
  { name: 'Read 20 pages', targetPerWeek: 5 },
  { name: 'Stretch', targetPerWeek: 7 },
  { name: 'Walk outside', targetPerWeek: 4 },
];

async function main() {
  const email = process.env.DEMO_USER_EMAIL ?? 'demo@studywellness.local';
  await prisma.user.deleteMany({ where: { email } }); // cascades to all of the user's records
  const user = await prisma.user.create({ data: { email, name: 'Demo Student', timezone: TZ } });

  const today = localDay(new Date(), TZ);
  const sessions = [];
  const breaks = [];
  const moods = [];

  // History stops yesterday, so today starts empty and the e2e tests own it.
  for (let i = DAYS; i >= 1; i--) {
    const day = addDays(today, -i);
    const weekend = [0, 6].includes(new Date(`${day}T12:00:00Z`).getUTCDay());
    const count = weekend ? between(0, 1) : between(1, 3);
    let studied = 0;

    for (let s = 0; s < count; s++) {
      const start = zonedDate(day, `${String([9, 14, 20][s]).padStart(2, '0')}:${String(between(0, 45)).padStart(2, '0')}`, TZ);
      const minutes = between(25, 100);
      studied += minutes;
      const end = new Date(start.getTime() + minutes * 60_000);
      sessions.push({ userId: user.id, startedAt: start, endedAt: end, focusArea: pick(FOCUS_AREAS) });

      if (rand() < 0.7) {
        const breakMinutes = between(5, 20);
        breaks.push({
          userId: user.id,
          startedAt: end,
          endedAt: new Date(end.getTime() + breakMinutes * 60_000),
          type: pick([BreakType.SHORT, BreakType.MOVEMENT, BreakType.MEAL, BreakType.LONG]),
        });
      }
    }

    // Mood loosely tracks how the day went: some study helps, a marathon day hurts.
    const base = 3 + (studied > 30 ? 0.6 : -0.4) - (studied > 200 ? 1.2 : 0);
    const clamp = (n: number) => Math.min(5, Math.max(1, Math.round(n)));
    for (let m = 0; m < between(1, 2); m++) {
      moods.push({
        userId: user.id,
        recordedAt: zonedDate(day, m === 0 ? '12:30' : '21:45', TZ),
        mood: clamp(base + (rand() - 0.5) * 2),
        energy: clamp(base - 0.3 + (rand() - 0.5) * 2),
        stress: clamp(5 - base + (rand() - 0.5) * 2),
      });
    }
  }

  await prisma.studySession.createMany({ data: sessions });
  await prisma.break.createMany({ data: breaks });
  await prisma.moodLog.createMany({ data: moods });

  for (const h of HABITS) {
    const habit = await prisma.habit.create({ data: { userId: user.id, ...h } });
    const checkIns = [];
    for (let i = DAYS; i >= 1; i--) {
      if (rand() < h.targetPerWeek / 7 - 0.05) {
        checkIns.push({ habitId: habit.id, userId: user.id, day: dayToDate(addDays(today, -i)) });
      }
    }
    await prisma.habitCheckIn.createMany({ data: checkIns });
  }

  console.log(
    `Seeded ${email}: ${sessions.length} sessions, ${breaks.length} breaks, ${moods.length} mood logs, ${HABITS.length} habits`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
