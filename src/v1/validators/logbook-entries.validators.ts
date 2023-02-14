import { Prisma } from "@prisma/client";

const logbookDayRelationsValidator = Prisma.validator<Prisma.LogbookDayArgs>()({
  include: { purchases: true },
});
export type LogbookDayRelationsValidator = Prisma.LogbookDayGetPayload<
  typeof logbookDayRelationsValidator
>;

const logbookDayCreateValidator = Prisma.validator<Prisma.LogbookDayArgs>()({
  select: {
    date: true,
    logbookId: true,
  },
});
export type LogbookDayCreateValidator = Prisma.LogbookDayGetPayload<
  typeof logbookDayCreateValidator
>;

const logbookDayUpdateValidator = Prisma.validator<Prisma.LogbookDayArgs>()({
  select: {
    date: true,
    totalCost: true,
    logbookId: true,
  },
});
export type LogbookDayUpdateValidator = Partial<
  Prisma.LogbookDayGetPayload<typeof logbookDayUpdateValidator>
>;
