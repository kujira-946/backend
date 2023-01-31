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

export type PurchaseUpdateValidator = Partial<PurchaseCreateValidator>;
