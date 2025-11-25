import { GraphQLScalarType, Kind } from 'graphql';
import { createSchema, createYoga } from 'graphql-yoga';
import { BreakType, Prisma, PrismaClient, User } from '@prisma/client';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type GraphQLContext = {
  prisma: PrismaClient;
  user: User;
};

const DateTimeScalar = new GraphQLScalarType<Date>({
  name: 'DateTime',
  description: 'ISO-8601 date time string',
  serialize(value) {
    if (value instanceof Date) return value.toISOString();
    const date = new Date(value as string);
    if (Number.isNaN(date.getTime())) {
      throw new TypeError('Invalid Date value');
    }
    return date.toISOString();
  },
  parseValue(value) {
    const date = new Date(value as string);
    if (Number.isNaN(date.getTime())) {
      throw new TypeError('Invalid Date value');
    }
    return date;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      const date = new Date(ast.value);
      if (Number.isNaN(date.getTime())) {
        throw new TypeError('Invalid Date value');
      }
      return date;
    }
    return null;
  },
});

const typeDefs = /* GraphQL */ `
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
    email: String
    name: String
    studySessions(from: DateTime, to: DateTime): [StudySession!]!
    breaks(from: DateTime, to: DateTime): [Break!]!
    moodLogs(from: DateTime, to: DateTime): [MoodLog!]!
    habits(includeArchived: Boolean = false): [Habit!]!
  }

  type StudySession {
    id: ID!
    startedAt: DateTime!
    endedAt: DateTime
    focusArea: String
    notes: String
    durationMinutes: Int
  }

  type Break {
    id: ID!
    startedAt: DateTime!
    endedAt: DateTime
    type: BreakType!
    notes: String
    durationMinutes: Int
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
    targetPerWeek: Int
    archived: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    checkIns: [HabitCheckIn!]!
  }

  type HabitCheckIn {
    id: ID!
    completedAt: DateTime!
    value: Int
    notes: String
  }

  type Query {
    me: User!
    studySessions(from: DateTime, to: DateTime): [StudySession!]!
    breaks(from: DateTime, to: DateTime): [Break!]!
    moodLogs(from: DateTime, to: DateTime): [MoodLog!]!
    habits(includeArchived: Boolean = false): [Habit!]!
  }

  input StartStudySessionInput {
    startedAt: DateTime
    focusArea: String
    notes: String
  }

  input EndStudySessionInput {
    id: ID!
    endedAt: DateTime
  }

  input LogBreakInput {
    startedAt: DateTime
    endedAt: DateTime
    type: BreakType!
    notes: String
  }

  input LogMoodInput {
    recordedAt: DateTime
    mood: Int!
    energy: Int
    stress: Int
    notes: String
  }

  input CreateHabitInput {
    name: String!
    targetPerWeek: Int
  }

  input HabitCheckInInput {
    habitId: ID!
    completedAt: DateTime
    value: Int
    notes: String
  }

  type Mutation {
    startStudySession(input: StartStudySessionInput!): StudySession!
    endStudySession(input: EndStudySessionInput!): StudySession!
    logBreak(input: LogBreakInput!): Break!
    logMood(input: LogMoodInput!): MoodLog!
    createHabit(input: CreateHabitInput!): Habit!
    archiveHabit(id: ID!): Habit!
    checkInHabit(input: HabitCheckInInput!): HabitCheckIn!
  }
`;

const resolvers = {
  DateTime: DateTimeScalar,
  Query: {
    me: async (_parent: unknown, _args: unknown, ctx: GraphQLContext) => ctx.user,
    studySessions: async (
      _parent: unknown,
      args: { from?: Date; to?: Date },
      ctx: GraphQLContext
    ) => {
      const where: Prisma.StudySessionWhereInput = {
        userId: ctx.user.id,
        startedAt:
          args.from || args.to
            ? {
                ...(args.from ? { gte: args.from } : {}),
                ...(args.to ? { lte: args.to } : {}),
              }
            : undefined,
      };
      return ctx.prisma.studySession.findMany({
        where,
        orderBy: { startedAt: 'desc' },
      });
    },
    breaks: async (_parent: unknown, args: { from?: Date; to?: Date }, ctx: GraphQLContext) => {
      const where: Prisma.BreakWhereInput = {
        userId: ctx.user.id,
        startedAt:
          args.from || args.to
            ? {
                ...(args.from ? { gte: args.from } : {}),
                ...(args.to ? { lte: args.to } : {}),
              }
            : undefined,
      };
      return ctx.prisma.break.findMany({
        where,
        orderBy: { startedAt: 'desc' },
      });
    },
    moodLogs: async (_parent: unknown, args: { from?: Date; to?: Date }, ctx: GraphQLContext) => {
      const where: Prisma.MoodLogWhereInput = {
        userId: ctx.user.id,
        recordedAt:
          args.from || args.to
            ? {
                ...(args.from ? { gte: args.from } : {}),
                ...(args.to ? { lte: args.to } : {}),
              }
            : undefined,
      };
      return ctx.prisma.moodLog.findMany({
        where,
        orderBy: { recordedAt: 'desc' },
      });
    },
    habits: async (
      _parent: unknown,
      args: { includeArchived?: boolean },
      ctx: GraphQLContext
    ) => {
      return ctx.prisma.habit.findMany({
        where: {
          userId: ctx.user.id,
          ...(args.includeArchived ? {} : { archived: false }),
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  },
  Mutation: {
    startStudySession: async (
      _parent: unknown,
      { input }: { input: { startedAt?: Date; focusArea?: string; notes?: string } },
      ctx: GraphQLContext
    ) => {
      return ctx.prisma.studySession.create({
        data: {
          userId: ctx.user.id,
          startedAt: input.startedAt ?? new Date(),
          focusArea: input.focusArea,
          notes: input.notes,
        },
      });
    },
    endStudySession: async (
      _parent: unknown,
      { input }: { input: { id: string; endedAt?: Date } },
      ctx: GraphQLContext
    ) => {
      const session = await ctx.prisma.studySession.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      if (!session) {
        throw new Error('Study session not found for current user');
      }
      return ctx.prisma.studySession.update({
        where: { id: session.id },
        data: { endedAt: input.endedAt ?? new Date() },
      });
    },
    logBreak: async (
      _parent: unknown,
      { input }: { input: { startedAt?: Date; endedAt?: Date; type: BreakType; notes?: string } },
      ctx: GraphQLContext
    ) => {
      return ctx.prisma.break.create({
        data: {
          userId: ctx.user.id,
          startedAt: input.startedAt ?? new Date(),
          endedAt: input.endedAt,
          type: input.type,
          notes: input.notes,
        },
      });
    },
    logMood: async (
      _parent: unknown,
      { input }: { input: { recordedAt?: Date; mood: number; energy?: number; stress?: number; notes?: string } },
      ctx: GraphQLContext
    ) => {
      if (input.mood < 1 || input.mood > 5) {
        throw new Error('Mood must be between 1 and 5');
      }
      return ctx.prisma.moodLog.create({
        data: {
          userId: ctx.user.id,
          recordedAt: input.recordedAt ?? new Date(),
          mood: input.mood,
          energy: input.energy,
          stress: input.stress,
          notes: input.notes,
        },
      });
    },
    createHabit: async (
      _parent: unknown,
      { input }: { input: { name: string; targetPerWeek?: number | null } },
      ctx: GraphQLContext
    ) => {
      return ctx.prisma.habit.create({
        data: {
          userId: ctx.user.id,
          name: input.name,
          targetPerWeek: input.targetPerWeek ?? null,
        },
      });
    },
    archiveHabit: async (_parent: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const habit = await ctx.prisma.habit.findFirst({ where: { id, userId: ctx.user.id } });
      if (!habit) {
        throw new Error('Habit not found for current user');
      }
      return ctx.prisma.habit.update({
        where: { id: habit.id },
        data: { archived: true },
      });
    },
    checkInHabit: async (
      _parent: unknown,
      { input }: { input: { habitId: string; completedAt?: Date; value?: number; notes?: string } },
      ctx: GraphQLContext
    ) => {
      const habit = await ctx.prisma.habit.findFirst({
        where: { id: input.habitId, userId: ctx.user.id },
      });
      if (!habit) {
        throw new Error('Habit not found for current user');
      }
      return ctx.prisma.habitCheckIn.create({
        data: {
          habitId: habit.id,
          userId: ctx.user.id,
          completedAt: input.completedAt ?? new Date(),
          value: input.value,
          notes: input.notes,
        },
      });
    },
  },
  User: {
    studySessions: async (parent: User, args: { from?: Date; to?: Date }, ctx: GraphQLContext) => {
      const where: Prisma.StudySessionWhereInput = {
        userId: parent.id,
        startedAt:
          args.from || args.to
            ? {
                ...(args.from ? { gte: args.from } : {}),
                ...(args.to ? { lte: args.to } : {}),
              }
            : undefined,
      };
      return ctx.prisma.studySession.findMany({ where, orderBy: { startedAt: 'desc' } });
    },
    breaks: async (parent: User, args: { from?: Date; to?: Date }, ctx: GraphQLContext) => {
      const where: Prisma.BreakWhereInput = {
        userId: parent.id,
        startedAt:
          args.from || args.to
            ? {
                ...(args.from ? { gte: args.from } : {}),
                ...(args.to ? { lte: args.to } : {}),
              }
            : undefined,
      };
      return ctx.prisma.break.findMany({ where, orderBy: { startedAt: 'desc' } });
    },
    moodLogs: async (parent: User, args: { from?: Date; to?: Date }, ctx: GraphQLContext) => {
      const where: Prisma.MoodLogWhereInput = {
        userId: parent.id,
        recordedAt:
          args.from || args.to
            ? {
                ...(args.from ? { gte: args.from } : {}),
                ...(args.to ? { lte: args.to } : {}),
              }
            : undefined,
      };
      return ctx.prisma.moodLog.findMany({ where, orderBy: { recordedAt: 'desc' } });
    },
    habits: async (parent: User, args: { includeArchived?: boolean }, ctx: GraphQLContext) => {
      return ctx.prisma.habit.findMany({
        where: { userId: parent.id, ...(args.includeArchived ? {} : { archived: false }) },
        orderBy: { createdAt: 'desc' },
      });
    },
  },
  Habit: {
    checkIns: async (parent: { id: string }, _args: unknown, ctx: GraphQLContext) => {
      return ctx.prisma.habitCheckIn.findMany({
        where: { habitId: parent.id },
        orderBy: { completedAt: 'desc' },
      });
    },
  },
  StudySession: {
    durationMinutes: (parent: { startedAt: Date; endedAt?: Date | null }) => {
      if (!parent.endedAt) return null;
      const diffMs = parent.endedAt.getTime() - parent.startedAt.getTime();
      return Math.max(0, Math.round(diffMs / 60000));
    },
  },
  Break: {
    durationMinutes: (parent: { startedAt: Date; endedAt?: Date | null }) => {
      if (!parent.endedAt) return null;
      const diffMs = parent.endedAt.getTime() - parent.startedAt.getTime();
      return Math.max(0, Math.round(diffMs / 60000));
    },
  },
};

const getOrCreateDefaultUser = async () => {
  const email = process.env.DEMO_USER_EMAIL ?? 'demo@studywellness.local';
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Demo User',
    },
  });
};

const yoga = createYoga<GraphQLContext>({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  context: async () => {
    const user = await getOrCreateDefaultUser();
    return { prisma, user };
  },
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Request, Response, Headers },
});

export { yoga as GET, yoga as POST, yoga as OPTIONS };
