/* eslint-disable */
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** ISO-8601 timestamp, e.g. 2026-11-02T14:30:00.000Z */
  DateTime: { input: string; output: string; }
};

export type Break = {
  __typename?: 'Break';
  durationMinutes: Scalars['Int']['output'];
  endedAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  notes: Maybe<Scalars['String']['output']>;
  startedAt: Scalars['DateTime']['output'];
  type: BreakType;
};

export type BreakType =
  | 'LONG'
  | 'MEAL'
  | 'MOVEMENT'
  | 'OTHER'
  | 'SHORT';

export type CreateHabitInput = {
  name: Scalars['String']['input'];
  targetPerWeek: Scalars['Int']['input'];
};

export type DailyMood = {
  __typename?: 'DailyMood';
  day: Scalars['String']['output'];
  energy: Maybe<Scalars['Float']['output']>;
  entries: Scalars['Int']['output'];
  /** average of the day's logs; null on days with no log */
  mood: Maybe<Scalars['Float']['output']>;
};

export type DailyStudy = {
  __typename?: 'DailyStudy';
  day: Scalars['String']['output'];
  minutes: Scalars['Int']['output'];
  sessions: Scalars['Int']['output'];
};

export type Habit = {
  __typename?: 'Habit';
  /** check-ins in the last 28 days, oldest first */
  checkIns: Array<HabitCheckIn>;
  currentStreak: Scalars['Int']['output'];
  /** check-ins in the last 7 days, compare with targetPerWeek */
  doneThisWeek: Scalars['Int']['output'];
  doneToday: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  targetPerWeek: Scalars['Int']['output'];
};

export type HabitCheckIn = {
  __typename?: 'HabitCheckIn';
  /** local calendar day, YYYY-MM-DD */
  day: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type LogBreakInput = {
  durationMinutes: Scalars['Int']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  type: BreakType;
};

export type LogMoodInput = {
  energy?: InputMaybe<Scalars['Int']['input']>;
  mood: Scalars['Int']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  stress?: InputMaybe<Scalars['Int']['input']>;
};

export type MoodLog = {
  __typename?: 'MoodLog';
  energy: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  mood: Scalars['Int']['output'];
  notes: Maybe<Scalars['String']['output']>;
  recordedAt: Scalars['DateTime']['output'];
  stress: Maybe<Scalars['Int']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** idempotent: checking in twice on the same day keeps one check-in */
  checkInHabit: Habit;
  createHabit: Habit;
  endStudySession: StudySession;
  /** logs a break that just ended */
  logBreak: Break;
  logMood: MoodLog;
  /** returns the running session instead of starting a second one */
  startStudySession: StudySession;
};


export type MutationCheckInHabitArgs = {
  habitId: Scalars['ID']['input'];
};


export type MutationCreateHabitArgs = {
  input: CreateHabitInput;
};


export type MutationEndStudySessionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLogBreakArgs = {
  input: LogBreakInput;
};


export type MutationLogMoodArgs = {
  input: LogMoodInput;
};


export type MutationStartStudySessionArgs = {
  input: StartStudySessionInput;
};

export type Query = {
  __typename?: 'Query';
  activeSession: Maybe<StudySession>;
  habits: Array<Habit>;
  me: User;
  recentBreaks: Array<Break>;
  recentMoodLogs: Array<MoodLog>;
  recentSessions: Array<StudySession>;
  /** daily series for the last `days` days (7 to 60), today included */
  stats: Stats;
};


export type QueryRecentBreaksArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRecentMoodLogsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRecentSessionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryStatsArgs = {
  days?: InputMaybe<Scalars['Int']['input']>;
};

export type StartStudySessionInput = {
  focusArea?: InputMaybe<Scalars['String']['input']>;
};

export type Stats = {
  __typename?: 'Stats';
  moodByDay: Array<DailyMood>;
  studyByDay: Array<DailyStudy>;
  /** the last 7 days */
  week: WeekSummary;
};

export type StudySession = {
  __typename?: 'StudySession';
  /** elapsed minutes so far if the session is still running */
  durationMinutes: Scalars['Int']['output'];
  /** null while the session is still running */
  endedAt: Maybe<Scalars['DateTime']['output']>;
  focusArea: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  startedAt: Scalars['DateTime']['output'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Maybe<Scalars['String']['output']>;
  /** IANA time zone that decides which calendar day a record belongs to */
  timezone: Scalars['String']['output'];
};

export type WeekSummary = {
  __typename?: 'WeekSummary';
  averageMood: Maybe<Scalars['Float']['output']>;
  sessions: Scalars['Int']['output'];
  studyMinutes: Scalars['Int']['output'];
};

export type DashboardQueryVariables = Exact<{
  days: Scalars['Int']['input'];
}>;


export type DashboardQuery = { __typename?: 'Query', me: { __typename?: 'User', name: string | null, timezone: string }, activeSession: { __typename?: 'StudySession', id: string, startedAt: string, focusArea: string | null } | null, recentSessions: Array<{ __typename?: 'StudySession', id: string, startedAt: string, focusArea: string | null, durationMinutes: number }>, recentBreaks: Array<{ __typename?: 'Break', id: string, endedAt: string, type: BreakType, durationMinutes: number }>, recentMoodLogs: Array<{ __typename?: 'MoodLog', id: string, recordedAt: string, mood: number, energy: number | null, stress: number | null, notes: string | null }>, habits: Array<{ __typename?: 'Habit', id: string, name: string, targetPerWeek: number, currentStreak: number, doneToday: boolean, doneThisWeek: number, checkIns: Array<{ __typename?: 'HabitCheckIn', day: string }> }>, stats: { __typename?: 'Stats', studyByDay: Array<{ __typename?: 'DailyStudy', day: string, minutes: number, sessions: number }>, moodByDay: Array<{ __typename?: 'DailyMood', day: string, mood: number | null, energy: number | null, entries: number }>, week: { __typename?: 'WeekSummary', studyMinutes: number, sessions: number, averageMood: number | null } } };

export type StartStudySessionMutationVariables = Exact<{
  input: StartStudySessionInput;
}>;


export type StartStudySessionMutation = { __typename?: 'Mutation', startStudySession: { __typename?: 'StudySession', id: string, startedAt: string, focusArea: string | null } };

export type EndStudySessionMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type EndStudySessionMutation = { __typename?: 'Mutation', endStudySession: { __typename?: 'StudySession', id: string, durationMinutes: number } };

export type LogBreakMutationVariables = Exact<{
  input: LogBreakInput;
}>;


export type LogBreakMutation = { __typename?: 'Mutation', logBreak: { __typename?: 'Break', id: string, endedAt: string, type: BreakType, durationMinutes: number } };

export type LogMoodMutationVariables = Exact<{
  input: LogMoodInput;
}>;


export type LogMoodMutation = { __typename?: 'Mutation', logMood: { __typename?: 'MoodLog', id: string, recordedAt: string, mood: number, energy: number | null, stress: number | null, notes: string | null } };

export type CreateHabitMutationVariables = Exact<{
  input: CreateHabitInput;
}>;


export type CreateHabitMutation = { __typename?: 'Mutation', createHabit: { __typename?: 'Habit', id: string, name: string, targetPerWeek: number, currentStreak: number, doneToday: boolean, doneThisWeek: number, checkIns: Array<{ __typename?: 'HabitCheckIn', day: string }> } };

export type CheckInHabitMutationVariables = Exact<{
  habitId: Scalars['ID']['input'];
}>;


export type CheckInHabitMutation = { __typename?: 'Mutation', checkInHabit: { __typename?: 'Habit', id: string, name: string, targetPerWeek: number, currentStreak: number, doneToday: boolean, doneThisWeek: number, checkIns: Array<{ __typename?: 'HabitCheckIn', day: string }> } };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const DashboardDocument = new TypedDocumentString(`
    query Dashboard($days: Int!) {
  me {
    name
    timezone
  }
  activeSession {
    id
    startedAt
    focusArea
  }
  recentSessions(limit: 5) {
    id
    startedAt
    focusArea
    durationMinutes
  }
  recentBreaks(limit: 5) {
    id
    endedAt
    type
    durationMinutes
  }
  recentMoodLogs(limit: 5) {
    id
    recordedAt
    mood
    energy
    stress
    notes
  }
  habits {
    id
    name
    targetPerWeek
    currentStreak
    doneToday
    doneThisWeek
    checkIns {
      day
    }
  }
  stats(days: $days) {
    studyByDay {
      day
      minutes
      sessions
    }
    moodByDay {
      day
      mood
      energy
      entries
    }
    week {
      studyMinutes
      sessions
      averageMood
    }
  }
}
    `) as unknown as TypedDocumentString<DashboardQuery, DashboardQueryVariables>;
export const StartStudySessionDocument = new TypedDocumentString(`
    mutation StartStudySession($input: StartStudySessionInput!) {
  startStudySession(input: $input) {
    id
    startedAt
    focusArea
  }
}
    `) as unknown as TypedDocumentString<StartStudySessionMutation, StartStudySessionMutationVariables>;
export const EndStudySessionDocument = new TypedDocumentString(`
    mutation EndStudySession($id: ID!) {
  endStudySession(id: $id) {
    id
    durationMinutes
  }
}
    `) as unknown as TypedDocumentString<EndStudySessionMutation, EndStudySessionMutationVariables>;
export const LogBreakDocument = new TypedDocumentString(`
    mutation LogBreak($input: LogBreakInput!) {
  logBreak(input: $input) {
    id
    endedAt
    type
    durationMinutes
  }
}
    `) as unknown as TypedDocumentString<LogBreakMutation, LogBreakMutationVariables>;
export const LogMoodDocument = new TypedDocumentString(`
    mutation LogMood($input: LogMoodInput!) {
  logMood(input: $input) {
    id
    recordedAt
    mood
    energy
    stress
    notes
  }
}
    `) as unknown as TypedDocumentString<LogMoodMutation, LogMoodMutationVariables>;
export const CreateHabitDocument = new TypedDocumentString(`
    mutation CreateHabit($input: CreateHabitInput!) {
  createHabit(input: $input) {
    id
    name
    targetPerWeek
    currentStreak
    doneToday
    doneThisWeek
    checkIns {
      day
    }
  }
}
    `) as unknown as TypedDocumentString<CreateHabitMutation, CreateHabitMutationVariables>;
export const CheckInHabitDocument = new TypedDocumentString(`
    mutation CheckInHabit($habitId: ID!) {
  checkInHabit(habitId: $habitId) {
    id
    name
    targetPerWeek
    currentStreak
    doneToday
    doneThisWeek
    checkIns {
      day
    }
  }
}
    `) as unknown as TypedDocumentString<CheckInHabitMutation, CheckInHabitMutationVariables>;