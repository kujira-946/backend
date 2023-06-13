import { Prisma } from "@prisma/client";

const fetchOverviewGroupPurchasesValidator =
  Prisma.validator<Prisma.PurchaseArgs>()({
    select: { overviewGroupId: true },
  });
export type FetchOverviewGroupPurchasesValidator = Prisma.PurchaseGetPayload<
  typeof fetchOverviewGroupPurchasesValidator
>;

const fetchLogbookEntryPurchasesValidator =
  Prisma.validator<Prisma.PurchaseArgs>()({
    select: { logbookEntryId: true },
  });
export type FetchLogbookEntryPurchasesValidator = Prisma.PurchaseGetPayload<
  typeof fetchLogbookEntryPurchasesValidator
>;

const purchaseValidator = Prisma.validator<Prisma.PurchaseArgs>()({
  select: {
    placement: true,
    category: true,
    description: true,
    cost: true,
    overviewGroupId: true,
    logbookEntryId: true,
  },
});
export type PurchaseValidator = Partial<
  Prisma.PurchaseGetPayload<typeof purchaseValidator>
>;
