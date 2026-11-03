-- CreateEnum
CREATE TYPE "BreakType" AS ENUM ('SHORT', 'LONG', 'MOVEMENT', 'MEAL', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "startedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMPTZ(3),
    "focusArea" TEXT,

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Break" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "startedAt" TIMESTAMPTZ(3) NOT NULL,
    "endedAt" TIMESTAMPTZ(3) NOT NULL,
    "type" "BreakType" NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Break_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoodLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "recordedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mood" SMALLINT NOT NULL,
    "energy" SMALLINT,
    "stress" SMALLINT,
    "notes" TEXT,

    CONSTRAINT "MoodLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Habit" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "targetPerWeek" SMALLINT NOT NULL DEFAULT 7,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitCheckIn" (
    "id" UUID NOT NULL,
    "habitId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "day" DATE NOT NULL,
    "completedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HabitCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "StudySession_userId_startedAt_idx" ON "StudySession"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "Break_userId_startedAt_idx" ON "Break"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "MoodLog_userId_recordedAt_idx" ON "MoodLog"("userId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Habit_userId_name_key" ON "Habit"("userId", "name");

-- CreateIndex
CREATE INDEX "HabitCheckIn_userId_day_idx" ON "HabitCheckIn"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "HabitCheckIn_habitId_day_key" ON "HabitCheckIn"("habitId", "day");

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Break" ADD CONSTRAINT "Break_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodLog" ADD CONSTRAINT "MoodLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitCheckIn" ADD CONSTRAINT "HabitCheckIn_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitCheckIn" ADD CONSTRAINT "HabitCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Rules Prisma's schema language cannot express. The database enforces them,
-- so they hold even when two requests race each other.
-- ---------------------------------------------------------------------------

-- At most one running (endedAt IS NULL) study session per user.
CREATE UNIQUE INDEX "StudySession_one_active_per_user"
  ON "StudySession"("userId") WHERE "endedAt" IS NULL;

ALTER TABLE "StudySession"
  ADD CONSTRAINT "StudySession_end_after_start" CHECK ("endedAt" IS NULL OR "endedAt" >= "startedAt");

ALTER TABLE "Break"
  ADD CONSTRAINT "Break_end_after_start" CHECK ("endedAt" >= "startedAt");

ALTER TABLE "MoodLog"
  ADD CONSTRAINT "MoodLog_scores_1_to_5" CHECK (
    "mood" BETWEEN 1 AND 5
    AND ("energy" IS NULL OR "energy" BETWEEN 1 AND 5)
    AND ("stress" IS NULL OR "stress" BETWEEN 1 AND 5)
  );

ALTER TABLE "Habit"
  ADD CONSTRAINT "Habit_target_1_to_7" CHECK ("targetPerWeek" BETWEEN 1 AND 7);
