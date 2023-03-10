import { Prisma } from "@prisma/client";

import { Category } from "../types/purchases.types";

const purchaseCreateValidator = Prisma.validator<Prisma.PurchaseArgs>()({
  select: { placement: true, category: true, description: true, cost: true },
});
type OptionalCreateOptions = {
  category?: Category;
  description?: string;
  cost?: number;
  overviewGroupId?: number;
  logbookEntryId?: number;
};
export type PurchaseCreateValidator = Prisma.PurchaseGetPayload<
  typeof purchaseCreateValidator
> &
  OptionalCreateOptions;

const purchaseUpdateValidator = Prisma.validator<Prisma.PurchaseArgs>()({
  select: {
    placement: true,
    category: true,
    description: true,
    cost: true,
    overviewGroupId: true,
    logbookEntryId: true,
  },
});
export type PurchaseUpdateValidator = Partial<
  Prisma.PurchaseGetPayload<typeof purchaseUpdateValidator>
>;
