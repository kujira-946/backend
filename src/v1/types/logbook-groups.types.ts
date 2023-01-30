import { Prisma } from "@prisma/client";

const logbookGroupsWithRelations = Prisma.validator<Prisma.LogbookGroupArgs>()({
  include: { items: true, logbook: true },
});
export type LogbookGroupsWithRelations = Prisma.LogbookGroupGetPayload<
  typeof logbookGroupsWithRelations
>;

const logbookGroupsCreateData = Prisma.validator<Prisma.LogbookGroupArgs>()({
  select: {
    date: true,
    logbookId: true,
  },
});
export type LogbookGroupsCreateData = Prisma.LogbookGroupGetPayload<
  typeof logbookGroupsCreateData
>;

const logbookGroupsUpdateData = Prisma.validator<Prisma.LogbookGroupArgs>()({
  select: {
    date: true,
    totalCost: true,
    logbookId: true,
  },
});
export type LogbookGroupsUpdateData = Partial<
  Prisma.LogbookGroupGetPayload<typeof logbookGroupsUpdateData>
>;
