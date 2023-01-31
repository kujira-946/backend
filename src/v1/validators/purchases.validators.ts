import { Prisma } from "@prisma/client";

import { Category } from "../types/purchases.types";

const purchaseRelationsValidator = Prisma.validator<Prisma.PurchaseArgs>()({
  include: {
    overviewRecurringPurchases: true,
    overviewIncomingPurchases: true,
    logbookDay: true,
    logbookReviewNeeds: true,
    logbookReviewPlannedWants: true,
    logbookReviewImpulsiveWants: true,
    logbookReviewRegrets: true,
  },
});
export type PurchaseRelationsValidator = Prisma.PurchaseGetPayload<
  typeof purchaseRelationsValidator
>;

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

export type PurchaseUpdateValidator = Partial<PurchaseCreateValidator>;
