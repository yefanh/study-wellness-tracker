// The GraphQL schema (SDL): the contract between the UI and the server.
// `npm run codegen` reads this string and generates TypeScript types for both sides
// (src/graphql/generated/), so a field rename that isn't followed through fails `tsc`.

export const typeDefs = /* GraphQL */ `
  "ISO-8601 timestamp, e.g. 2026-11-02T14:30:00.000Z"
  scalar DateTime

  enum BreakType {
    SHORT
    LONG
    MOVEMENT
    MEAL
    OTHER
  }

  type User {
    id: ID!
    email: String!
    name: String
    "IANA time zone that decides which calendar day a record belongs to"
    timezone: String!
  }

  type StudySession {
    id: ID!
    startedAt: DateTime!
    "null while the session is still running"
    endedAt: DateTime
    focusArea: String
    "elapsed minutes so far if the session is still running"
    durationMinutes: Int!
  }

  type Break {
    id: ID!
    startedAt: DateTime!
    endedAt: DateTime!
    type: BreakType!
    notes: String
    durationMinutes: Int!
  }

  type MoodLog {
    id: ID!
    recordedAt: DateTime!
    mood: Int!
    energy: Int
    stress: Int
    notes: String
  }

  type Habit {
    id: ID!
    name: String!
    targetPerWeek: Int!
    "check-ins in the last 28 days, oldest first"
    checkIns: [HabitCheckIn!]!
    currentStreak: Int!
    doneToday: Boolean!
    "check-ins in the last 7 days, compare with targetPerWeek"
    doneThisWeek: Int!
  }

  type HabitCheckIn {
    id: ID!
    "local calendar day, YYYY-MM-DD"
    day: String!
  }

  type DailyStudy {
    day: String!
    minutes: Int!
    sessions: Int!
  }

  type DailyMood {
    day: String!
    "average of the day's logs; null on days with no log"
    mood: Float
    energy: Float
    entries: Int!
  }

  type WeekSummary {
    studyMinutes: Int!
    sessions: Int!
    averageMood: Float
  }

  type Stats {
    studyByDay: [DailyStudy!]!
    moodByDay: [DailyMood!]!
    "the last 7 days"
    week: WeekSummary!
  }

  type Query {
    me: User!
    activeSession: StudySession
    recentSessions(limit: Int = 5): [StudySession!]!
    recentBreaks(limit: Int = 5): [Break!]!
    recentMoodLogs(limit: Int = 5): [MoodLog!]!
    habits: [Habit!]!
    "daily series for the last \`days\` days (7 to 60), today included"
    stats(days: Int = 14): Stats!
  }

  input StartStudySessionInput {
    focusArea: String
  }

  input LogBreakInput {
    type: BreakType!
    durationMinutes: Int!
    notes: String
  }

  input LogMoodInput {
    mood: Int!
    energy: Int
    stress: Int
    notes: String
  }

  input CreateHabitInput {
    name: String!
    targetPerWeek: Int!
  }

  type Mutation {
    "returns the running session instead of starting a second one"
    startStudySession(input: StartStudySessionInput!): StudySession!
    endStudySession(id: ID!): StudySession!
    "logs a break that just ended"
    logBreak(input: LogBreakInput!): Break!
    logMood(input: LogMoodInput!): MoodLog!
    createHabit(input: CreateHabitInput!): Habit!
    "idempotent: checking in twice on the same day keeps one check-in"
    checkInHabit(habitId: ID!): Habit!
  }
`;
