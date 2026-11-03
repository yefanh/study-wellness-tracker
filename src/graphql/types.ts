import type { DashboardQuery } from './generated/client/graphql';

// Short names for the generated result types, used as component props.
// They come straight from the Dashboard query, so a component can only read fields the query asks for.
export type Dashboard = DashboardQuery;
export type ActiveSession = NonNullable<DashboardQuery['activeSession']>;
export type SessionItem = DashboardQuery['recentSessions'][number];
export type BreakItem = DashboardQuery['recentBreaks'][number];
export type MoodLogItem = DashboardQuery['recentMoodLogs'][number];
export type HabitItem = DashboardQuery['habits'][number];
export type DailyStudyItem = DashboardQuery['stats']['studyByDay'][number];
export type DailyMoodItem = DashboardQuery['stats']['moodByDay'][number];
export type WeekSummary = DashboardQuery['stats']['week'];
