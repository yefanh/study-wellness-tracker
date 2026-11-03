import { graphql } from './generated/client';

// Every query and mutation the UI sends. Codegen turns each one into a typed document:
// the result type and the variables type travel with the document, so callers get both
// checked by TypeScript (see serverQuery and gqlRequest).

export const DashboardQuery = graphql(`
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
`);

export const StartStudySessionMutation = graphql(`
  mutation StartStudySession($input: StartStudySessionInput!) {
    startStudySession(input: $input) {
      id
      startedAt
      focusArea
    }
  }
`);

export const EndStudySessionMutation = graphql(`
  mutation EndStudySession($id: ID!) {
    endStudySession(id: $id) {
      id
      durationMinutes
    }
  }
`);

export const LogBreakMutation = graphql(`
  mutation LogBreak($input: LogBreakInput!) {
    logBreak(input: $input) {
      id
      endedAt
      type
      durationMinutes
    }
  }
`);

export const LogMoodMutation = graphql(`
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
`);

export const CreateHabitMutation = graphql(`
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
`);

export const CheckInHabitMutation = graphql(`
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
`);
