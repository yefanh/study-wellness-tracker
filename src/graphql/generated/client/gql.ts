/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query Dashboard($days: Int!) {\n    me {\n      name\n      timezone\n    }\n    activeSession {\n      id\n      startedAt\n      focusArea\n    }\n    recentSessions(limit: 5) {\n      id\n      startedAt\n      focusArea\n      durationMinutes\n    }\n    recentBreaks(limit: 5) {\n      id\n      endedAt\n      type\n      durationMinutes\n    }\n    recentMoodLogs(limit: 5) {\n      id\n      recordedAt\n      mood\n      energy\n      stress\n      notes\n    }\n    habits {\n      id\n      name\n      targetPerWeek\n      currentStreak\n      doneToday\n      doneThisWeek\n      checkIns {\n        day\n      }\n    }\n    stats(days: $days) {\n      studyByDay {\n        day\n        minutes\n        sessions\n      }\n      moodByDay {\n        day\n        mood\n        energy\n        entries\n      }\n      week {\n        studyMinutes\n        sessions\n        averageMood\n      }\n    }\n  }\n": typeof types.DashboardDocument,
    "\n  mutation StartStudySession($input: StartStudySessionInput!) {\n    startStudySession(input: $input) {\n      id\n      startedAt\n      focusArea\n    }\n  }\n": typeof types.StartStudySessionDocument,
    "\n  mutation EndStudySession($id: ID!) {\n    endStudySession(id: $id) {\n      id\n      durationMinutes\n    }\n  }\n": typeof types.EndStudySessionDocument,
    "\n  mutation LogBreak($input: LogBreakInput!) {\n    logBreak(input: $input) {\n      id\n      endedAt\n      type\n      durationMinutes\n    }\n  }\n": typeof types.LogBreakDocument,
    "\n  mutation LogMood($input: LogMoodInput!) {\n    logMood(input: $input) {\n      id\n      recordedAt\n      mood\n      energy\n      stress\n      notes\n    }\n  }\n": typeof types.LogMoodDocument,
    "\n  mutation CreateHabit($input: CreateHabitInput!) {\n    createHabit(input: $input) {\n      id\n      name\n      targetPerWeek\n      currentStreak\n      doneToday\n      doneThisWeek\n      checkIns {\n        day\n      }\n    }\n  }\n": typeof types.CreateHabitDocument,
    "\n  mutation CheckInHabit($habitId: ID!) {\n    checkInHabit(habitId: $habitId) {\n      id\n      name\n      targetPerWeek\n      currentStreak\n      doneToday\n      doneThisWeek\n      checkIns {\n        day\n      }\n    }\n  }\n": typeof types.CheckInHabitDocument,
};
const documents: Documents = {
    "\n  query Dashboard($days: Int!) {\n    me {\n      name\n      timezone\n    }\n    activeSession {\n      id\n      startedAt\n      focusArea\n    }\n    recentSessions(limit: 5) {\n      id\n      startedAt\n      focusArea\n      durationMinutes\n    }\n    recentBreaks(limit: 5) {\n      id\n      endedAt\n      type\n      durationMinutes\n    }\n    recentMoodLogs(limit: 5) {\n      id\n      recordedAt\n      mood\n      energy\n      stress\n      notes\n    }\n    habits {\n      id\n      name\n      targetPerWeek\n      currentStreak\n      doneToday\n      doneThisWeek\n      checkIns {\n        day\n      }\n    }\n    stats(days: $days) {\n      studyByDay {\n        day\n        minutes\n        sessions\n      }\n      moodByDay {\n        day\n        mood\n        energy\n        entries\n      }\n      week {\n        studyMinutes\n        sessions\n        averageMood\n      }\n    }\n  }\n": types.DashboardDocument,
    "\n  mutation StartStudySession($input: StartStudySessionInput!) {\n    startStudySession(input: $input) {\n      id\n      startedAt\n      focusArea\n    }\n  }\n": types.StartStudySessionDocument,
    "\n  mutation EndStudySession($id: ID!) {\n    endStudySession(id: $id) {\n      id\n      durationMinutes\n    }\n  }\n": types.EndStudySessionDocument,
    "\n  mutation LogBreak($input: LogBreakInput!) {\n    logBreak(input: $input) {\n      id\n      endedAt\n      type\n      durationMinutes\n    }\n  }\n": types.LogBreakDocument,
    "\n  mutation LogMood($input: LogMoodInput!) {\n    logMood(input: $input) {\n      id\n      recordedAt\n      mood\n      energy\n      stress\n      notes\n    }\n  }\n": types.LogMoodDocument,
    "\n  mutation CreateHabit($input: CreateHabitInput!) {\n    createHabit(input: $input) {\n      id\n      name\n      targetPerWeek\n      currentStreak\n      doneToday\n      doneThisWeek\n      checkIns {\n        day\n      }\n    }\n  }\n": types.CreateHabitDocument,
    "\n  mutation CheckInHabit($habitId: ID!) {\n    checkInHabit(habitId: $habitId) {\n      id\n      name\n      targetPerWeek\n      currentStreak\n      doneToday\n      doneThisWeek\n      checkIns {\n        day\n      }\n    }\n  }\n": types.CheckInHabitDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Dashboard($days: Int!) {\n    me {\n      name\n      timezone\n    }\n    activeSession {\n      id\n      startedAt\n      focusArea\n    }\n    recentSessions(limit: 5) {\n      id\n      startedAt\n      focusArea\n      durationMinutes\n    }\n    recentBreaks(limit: 5) {\n      id\n      endedAt\n      type\n      durationMinutes\n    }\n    recentMoodLogs(limit: 5) {\n      id\n      recordedAt\n      mood\n      energy\n      stress\n      notes\n    }\n    habits {\n      id\n      name\n      targetPerWeek\n      currentStreak\n      doneToday\n      doneThisWeek\n      checkIns {\n        day\n      }\n    }\n    stats(days: $days) {\n      studyByDay {\n        day\n        minutes\n        sessions\n      }\n      moodByDay {\n        day\n        mood\n        energy\n        entries\n      }\n      week {\n        studyMinutes\n        sessions\n        averageMood\n      }\n    }\n  }\n"): typeof import('./graphql').DashboardDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation StartStudySession($input: StartStudySessionInput!) {\n    startStudySession(input: $input) {\n      id\n      startedAt\n      focusArea\n    }\n  }\n"): typeof import('./graphql').StartStudySessionDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation EndStudySession($id: ID!) {\n    endStudySession(id: $id) {\n      id\n      durationMinutes\n    }\n  }\n"): typeof import('./graphql').EndStudySessionDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation LogBreak($input: LogBreakInput!) {\n    logBreak(input: $input) {\n      id\n      endedAt\n      type\n      durationMinutes\n    }\n  }\n"): typeof import('./graphql').LogBreakDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation LogMood($input: LogMoodInput!) {\n    logMood(input: $input) {\n      id\n      recordedAt\n      mood\n      energy\n      stress\n      notes\n    }\n  }\n"): typeof import('./graphql').LogMoodDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateHabit($input: CreateHabitInput!) {\n    createHabit(input: $input) {\n      id\n      name\n      targetPerWeek\n      currentStreak\n      doneToday\n      doneThisWeek\n      checkIns {\n        day\n      }\n    }\n  }\n"): typeof import('./graphql').CreateHabitDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CheckInHabit($habitId: ID!) {\n    checkInHabit(habitId: $habitId) {\n      id\n      name\n      targetPerWeek\n      currentStreak\n      doneToday\n      doneThisWeek\n      checkIns {\n        day\n      }\n    }\n  }\n"): typeof import('./graphql').CheckInHabitDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
