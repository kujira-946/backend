import { Prisma } from "@prisma/client";

const overviewPurchaseItemsWithRelations =
  Prisma.validator<Prisma.OverviewPurchaseItemArgs>()({
    include: { overviewRecurringCost: true, overviewIncomingCost: true },
  });
export type OverviewPurchaseItemsWithRelations =
  Prisma.OverviewPurchaseItemGetPayload<
    typeof overviewPurchaseItemsWithRelations
  >;

const overviewPurchaseItemsCreateData =
  Prisma.validator<Prisma.OverviewPurchaseItemArgs>()({
    select: {
      description: true,
      cost: true,
    },
  });
export type OverviewPurchaseItemsCreateData =
  Prisma.OverviewPurchaseItemGetPayload<typeof overviewPurchaseItemsCreateData>;

export type OverviewPurchaseItemsUpdateData =
  Partial<OverviewPurchaseItemsCreateData>;
