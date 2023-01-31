import { Prisma } from "@prisma/client";

import { Category } from "../types/purchases.types";

const purchaseCreateValidator = Prisma.validator<Prisma.PurchaseArgs>()({
  select: {
    placement: true,
    cost: true,
    description: true,
  },
});
export type PurchaseCreateValidator = Prisma.PurchaseGetPayload<
  typeof purchaseCreateValidator
> & { category?: Category };

const purchaseUpdateValidator = Prisma.validator<Prisma.PurchaseArgs>()({
  select: {
    overviewRecurringPurchasesId: true,
    overviewIncomingPurchasesId: true,
    logbookDayId: true,
    logbookReviewNeedsId: true,
    logbookReviewPlannedWantsId: true,
    logbookReviewImpulsiveWantsId: true,
    logbookReviewRegretsId: true,
  },
});

export type PurchaseUpdateValidator = Partial<
  PurchaseCreateValidator &
    Prisma.PurchaseGetPayload<typeof purchaseUpdateValidator>
>;
