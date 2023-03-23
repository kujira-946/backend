import { Prisma } from "@prisma/client";

const logbookEntryCreateValidator = Prisma.validator<Prisma.LogbookEntryArgs>()(
  {
    select: {
      date: true,
      logbookId: true,
    },
  }
);
type OptionalCreateData = { spent?: number; budget?: number };
export type LogbookEntryCreateValidator = Prisma.LogbookEntryGetPayload<
  typeof logbookEntryCreateValidator
> &
  OptionalCreateData;

const logbookEntryUpdateValidator = Prisma.validator<Prisma.LogbookEntryArgs>()(
  {
    select: {
      date: true,
      spent: true,
      budget: true,
      logbookId: true,
    },
  }
);
export type LogbookEntryUpdateValidator = Partial<
  Prisma.LogbookEntryGetPayload<typeof logbookEntryUpdateValidator>
>;
