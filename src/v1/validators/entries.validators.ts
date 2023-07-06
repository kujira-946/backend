import { Prisma } from "@prisma/client";

const entryCreateValidator = Prisma.validator<Prisma.EntryArgs>()({
  select: { name: true },
});
export type EntryCreateValidator = Prisma.EntryGetPayload<
  typeof entryCreateValidator
> & { overviewId?: number; logbookId?: number };
export type EntryCreateData = (keyof EntryCreateValidator)[];

const entryUpdateValidator = Prisma.validator<Prisma.EntryArgs>()({
  select: {
    name: true,
    totalSpent: true,
    budget: true,
  },
});
export type EntryUpdateValidator = Partial<
  Prisma.EntryGetPayload<typeof entryUpdateValidator>
>;
export type EntryUpdateData = (keyof EntryUpdateValidator)[];
