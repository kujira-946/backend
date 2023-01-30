import { Prisma } from "@prisma/client";

const logbookWithRelations = Prisma.validator<Prisma.LogbookArgs>()({
  include: { groups: true, owner: true },
});
export type LogbookWithRelations = Prisma.LogbookGetPayload<
  typeof logbookWithRelations
>;

const logbookCreateData = Prisma.validator<Prisma.LogbookArgs>()({
  select: {
    name: true,
    ownerId: true,
  },
});
export type LogbookCreateData = Prisma.LogbookGetPayload<
  typeof logbookCreateData
>;

export type LogbookUpdateData = Partial<LogbookCreateData>;
