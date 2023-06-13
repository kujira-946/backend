import { Prisma } from "@prisma/client";

const fetchUserLogbooksValidator = Prisma.validator<Prisma.LogbookArgs>()({
  select: { ownerId: true },
});
export type FetchUserLogbooksValidator = Prisma.LogbookGetPayload<
  typeof fetchUserLogbooksValidator
>;

const logbookCreateValidator = Prisma.validator<Prisma.LogbookArgs>()({
  select: {
    name: true,
    ownerId: true,
  },
});
export type LogbookCreateValidator = Prisma.LogbookGetPayload<
  typeof logbookCreateValidator
>;

const logbookUpdateValidator = Prisma.validator<Prisma.LogbookArgs>()({
  select: { name: true },
});
export type LogbookUpdateValidator = Partial<
  Prisma.LogbookGetPayload<typeof logbookUpdateValidator>
>;
