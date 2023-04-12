import { Prisma } from "@prisma/client";

const logbookCreateValidator = Prisma.validator<Prisma.LogbookArgs>()({
  select: {
    name: true,
    ownerId: true,
  },
});
type OptionalCreateData = { totalSpent?: number };
export type LogbookCreateValidator = Prisma.LogbookGetPayload<
  typeof logbookCreateValidator
> &
  OptionalCreateData;

const logbookUpdateValidator = Prisma.validator<Prisma.LogbookArgs>()({
  select: { name: true, totalSpent: true },
});
export type LogbookUpdateValidator = Partial<
  Prisma.LogbookGetPayload<typeof logbookUpdateValidator>
>;
