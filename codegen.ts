import type { CodegenConfig } from '@graphql-codegen/cli';

// `npm run codegen` turns the schema + operations into TypeScript.
// CI runs `npm run codegen:check`, which fails if the committed output is stale.
const config: CodegenConfig = {
  schema: 'src/graphql/typeDefs.ts',
  documents: ['src/graphql/operations.ts'],
  ignoreNoDocuments: false,
  generates: {
    // Server side: one type per resolver, e.g. MutationResolvers['logMood'].
    'src/graphql/generated/resolvers-types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: '../context#GraphQLContext',
        useIndexSignature: true,
        enumsAsTypes: true,
        scalars: { DateTime: 'Date' },
        // Resolvers receive Prisma rows as their parent object, not the GraphQL shape.
        mapperTypeSuffix: 'Model',
        mappers: {
          User: '@prisma/client#User',
          StudySession: '@prisma/client#StudySession',
          Break: '@prisma/client#Break',
          MoodLog: '@prisma/client#MoodLog',
          Habit: '@prisma/client#Habit',
          HabitCheckIn: '@prisma/client#HabitCheckIn',
        },
      },
    },
    // Client side: a typed `graphql()` function plus result/variables types per operation.
    'src/graphql/generated/client/': {
      preset: 'client',
      presetConfig: { fragmentMasking: false },
      config: {
        documentMode: 'string',
        enumsAsTypes: true,
        // A nullable field is `T | null`, never missing: the server always sends it.
        avoidOptionals: { field: true, inputValue: false, object: false, defaultValue: false },
        scalars: { DateTime: 'string' },
        useTypeImports: true,
      },
    },
  },
};

export default config;
