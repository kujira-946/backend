import { Prisma } from "@prisma/client";

const logbookRelationsValidator = Prisma.validator<Prisma.LogbookArgs>()({
  include: { days: true },
});
export type LogbookRelationsValidator = Prisma.LogbookGetPayload<
  typeof logbookRelationsValidator
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
  select: {
    name: true,
  },
});
export type LogbookUpdateValidator = Partial<
  Prisma.LogbookGetPayload<typeof logbookUpdateValidator>
>;
