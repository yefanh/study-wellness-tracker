import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { User as UserModel, StudySession as StudySessionModel, Break as BreakModel, MoodLog as MoodLogModel, Habit as HabitModel, HabitCheckIn as HabitCheckInModel } from '@prisma/client';
import { GraphQLContext } from '../context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** ISO-8601 timestamp, e.g. 2026-11-02T14:30:00.000Z */
  DateTime: { input: Date; output: Date; }
};

export type Break = {
  __typename?: 'Break';
  durationMinutes: Scalars['Int']['output'];
  endedAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
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
  energy?: Maybe<Scalars['Float']['output']>;
  entries: Scalars['Int']['output'];
  /** average of the day's logs; null on days with no log */
  mood?: Maybe<Scalars['Float']['output']>;
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
  energy?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  mood: Scalars['Int']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  recordedAt: Scalars['DateTime']['output'];
  stress?: Maybe<Scalars['Int']['output']>;
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
  activeSession?: Maybe<StudySession>;
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
  endedAt?: Maybe<Scalars['DateTime']['output']>;
  focusArea?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  startedAt: Scalars['DateTime']['output'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  /** IANA time zone that decides which calendar day a record belongs to */
  timezone: Scalars['String']['output'];
};

export type WeekSummary = {
  __typename?: 'WeekSummary';
  averageMood?: Maybe<Scalars['Float']['output']>;
  sessions: Scalars['Int']['output'];
  studyMinutes: Scalars['Int']['output'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Break: ResolverTypeWrapper<BreakModel>;
  BreakType: BreakType;
  CreateHabitInput: CreateHabitInput;
  DailyMood: ResolverTypeWrapper<DailyMood>;
  DailyStudy: ResolverTypeWrapper<DailyStudy>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Habit: ResolverTypeWrapper<HabitModel>;
  HabitCheckIn: ResolverTypeWrapper<HabitCheckInModel>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  LogBreakInput: LogBreakInput;
  LogMoodInput: LogMoodInput;
  MoodLog: ResolverTypeWrapper<MoodLogModel>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  StartStudySessionInput: StartStudySessionInput;
  Stats: ResolverTypeWrapper<Stats>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  StudySession: ResolverTypeWrapper<StudySessionModel>;
  User: ResolverTypeWrapper<UserModel>;
  WeekSummary: ResolverTypeWrapper<WeekSummary>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars['Boolean']['output'];
  Break: BreakModel;
  CreateHabitInput: CreateHabitInput;
  DailyMood: DailyMood;
  DailyStudy: DailyStudy;
  DateTime: Scalars['DateTime']['output'];
  Float: Scalars['Float']['output'];
  Habit: HabitModel;
  HabitCheckIn: HabitCheckInModel;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  LogBreakInput: LogBreakInput;
  LogMoodInput: LogMoodInput;
  MoodLog: MoodLogModel;
  Mutation: {};
  Query: {};
  StartStudySessionInput: StartStudySessionInput;
  Stats: Stats;
  String: Scalars['String']['output'];
  StudySession: StudySessionModel;
  User: UserModel;
  WeekSummary: WeekSummary;
}>;

export type BreakResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Break'] = ResolversParentTypes['Break']> = ResolversObject<{
  durationMinutes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  endedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['BreakType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DailyMoodResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DailyMood'] = ResolversParentTypes['DailyMood']> = ResolversObject<{
  day?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  energy?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  entries?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  mood?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DailyStudyResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DailyStudy'] = ResolversParentTypes['DailyStudy']> = ResolversObject<{
  day?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  minutes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  sessions?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type HabitResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Habit'] = ResolversParentTypes['Habit']> = ResolversObject<{
  checkIns?: Resolver<Array<ResolversTypes['HabitCheckIn']>, ParentType, ContextType>;
  currentStreak?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  doneThisWeek?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  doneToday?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  targetPerWeek?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type HabitCheckInResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['HabitCheckIn'] = ResolversParentTypes['HabitCheckIn']> = ResolversObject<{
  day?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MoodLogResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['MoodLog'] = ResolversParentTypes['MoodLog']> = ResolversObject<{
  energy?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  mood?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  recordedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  stress?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  checkInHabit?: Resolver<ResolversTypes['Habit'], ParentType, ContextType, RequireFields<MutationCheckInHabitArgs, 'habitId'>>;
  createHabit?: Resolver<ResolversTypes['Habit'], ParentType, ContextType, RequireFields<MutationCreateHabitArgs, 'input'>>;
  endStudySession?: Resolver<ResolversTypes['StudySession'], ParentType, ContextType, RequireFields<MutationEndStudySessionArgs, 'id'>>;
  logBreak?: Resolver<ResolversTypes['Break'], ParentType, ContextType, RequireFields<MutationLogBreakArgs, 'input'>>;
  logMood?: Resolver<ResolversTypes['MoodLog'], ParentType, ContextType, RequireFields<MutationLogMoodArgs, 'input'>>;
  startStudySession?: Resolver<ResolversTypes['StudySession'], ParentType, ContextType, RequireFields<MutationStartStudySessionArgs, 'input'>>;
}>;

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  activeSession?: Resolver<Maybe<ResolversTypes['StudySession']>, ParentType, ContextType>;
  habits?: Resolver<Array<ResolversTypes['Habit']>, ParentType, ContextType>;
  me?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  recentBreaks?: Resolver<Array<ResolversTypes['Break']>, ParentType, ContextType, RequireFields<QueryRecentBreaksArgs, 'limit'>>;
  recentMoodLogs?: Resolver<Array<ResolversTypes['MoodLog']>, ParentType, ContextType, RequireFields<QueryRecentMoodLogsArgs, 'limit'>>;
  recentSessions?: Resolver<Array<ResolversTypes['StudySession']>, ParentType, ContextType, RequireFields<QueryRecentSessionsArgs, 'limit'>>;
  stats?: Resolver<ResolversTypes['Stats'], ParentType, ContextType, RequireFields<QueryStatsArgs, 'days'>>;
}>;

export type StatsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Stats'] = ResolversParentTypes['Stats']> = ResolversObject<{
  moodByDay?: Resolver<Array<ResolversTypes['DailyMood']>, ParentType, ContextType>;
  studyByDay?: Resolver<Array<ResolversTypes['DailyStudy']>, ParentType, ContextType>;
  week?: Resolver<ResolversTypes['WeekSummary'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type StudySessionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['StudySession'] = ResolversParentTypes['StudySession']> = ResolversObject<{
  durationMinutes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  endedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  focusArea?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  startedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timezone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WeekSummaryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['WeekSummary'] = ResolversParentTypes['WeekSummary']> = ResolversObject<{
  averageMood?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  sessions?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  studyMinutes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  Break?: BreakResolvers<ContextType>;
  DailyMood?: DailyMoodResolvers<ContextType>;
  DailyStudy?: DailyStudyResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Habit?: HabitResolvers<ContextType>;
  HabitCheckIn?: HabitCheckInResolvers<ContextType>;
  MoodLog?: MoodLogResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Stats?: StatsResolvers<ContextType>;
  StudySession?: StudySessionResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  WeekSummary?: WeekSummaryResolvers<ContextType>;
}>;

