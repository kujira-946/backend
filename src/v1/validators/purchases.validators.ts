import { Prisma } from "@prisma/client";

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
