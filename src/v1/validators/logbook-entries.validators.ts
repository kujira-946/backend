import { Prisma } from "@prisma/client";

const logbookEntryRelationsValidator =
  Prisma.validator<Prisma.LogbookEntryArgs>()({
    include: { purchases: true },
  });
export type LogbookEntryRelationsValidator = Prisma.LogbookEntryGetPayload<
  typeof logbookEntryRelationsValidator
>;

const logbookEntryCreateValidator = Prisma.validator<Prisma.LogbookEntryArgs>()(
  {
    select: {
      date: true,
      logbookId: true,
    },
  }
);
export type LogbookEntryCreateValidator = Prisma.LogbookEntryGetPayload<
  typeof logbookEntryCreateValidator
>;

const logbookEntryUpdateValidator = Prisma.validator<Prisma.LogbookEntryArgs>()(
  {
    select: {
      date: true,
      totalCost: true,
      logbookId: true,
    },
  }
);
export type LogbookEntryUpdateValidator = Partial<
  Prisma.LogbookEntryGetPayload<typeof logbookEntryUpdateValidator>
>;