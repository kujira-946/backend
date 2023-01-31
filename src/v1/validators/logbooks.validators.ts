import { Prisma } from "@prisma/client";

const logbookRelationsValidator = Prisma.validator<Prisma.LogbookArgs>()({
  include: { days: true, owner: true },
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

export type LogbookUpdateValidator = Partial<LogbookCreateValidator>;
