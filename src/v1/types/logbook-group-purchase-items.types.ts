import { Prisma } from "@prisma/client";

const logbookGroupPurchaseItemsWithRelations =
  Prisma.validator<Prisma.LogbookGroupPurchaseItemArgs>()({
    include: {
      logbookGroup: true,
      logbookReviewNeeds: true,
      logbookReviewPlannedWants: true,
      logbookReviewImpulsiveWants: true,
      logbookReviewRegrets: true,
    },
  });
export type LogbookGroupPurchaseItemsWithRelations =
  Prisma.LogbookGroupPurchaseItemGetPayload<
    typeof logbookGroupPurchaseItemsWithRelations
  >;

const logbookCreateData =
  Prisma.validator<Prisma.LogbookGroupPurchaseItemArgs>()({
    select: {
      placement: true,
      cost: true,
      category: true,
      description: true,
      logbookGroupId: true,
    },
  });
export type LogbookCreateData = Prisma.LogbookGroupPurchaseItemGetPayload<
  typeof logbookCreateData
>;

export type LogbookUpdateData = Partial<LogbookCreateData>;
