import { Prisma } from "@prisma/client";

const logbookEntryFetchValidator = Prisma.validator<Prisma.LogbookEntryArgs>()({
  select: { logbookId: true },
});
export type LogbookEntryFetchValidator = Prisma.LogbookEntryGetPayload<
  typeof logbookEntryFetchValidator
>;

const logbookEntryCreateValidator = Prisma.validator<Prisma.LogbookEntryArgs>()(
  {
    select: {
      date: true,
      logbookId: true,
    },
  }
);
type OptionalCreateData = { totalSpent?: number; budget?: number };
export type LogbookEntryCreateValidator = Prisma.LogbookEntryGetPayload<
  typeof logbookEntryCreateValidator
> &
  OptionalCreateData;

const logbookEntryUpdateValidator = Prisma.validator<Prisma.LogbookEntryArgs>()(
  {
    select: {
      date: true,
      totalSpent: true,
      budget: true,
      logbookId: true,
    },
  }
);
export type LogbookEntryUpdateValidator = Partial<
  Prisma.LogbookEntryGetPayload<typeof logbookEntryUpdateValidator>
>;
