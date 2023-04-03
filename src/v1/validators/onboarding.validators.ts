import { Prisma } from "@prisma/client";

const overviewCreateValidator = Prisma.validator<Prisma.OverviewArgs>()({
  select: {
    income: true,
    savings: true,
    ownerId: true,
  },
});
type OverviewCreateValidator = Prisma.OverviewGetPayload<
  typeof overviewCreateValidator
>;

const overviewGroupCreateValidator =
  Prisma.validator<Prisma.OverviewGroupArgs>()({
    select: {
      name: true,
      totalCost: true,
    },
  });
type OverviewGroupCreateValidator = Prisma.OverviewGroupGetPayload<
  typeof overviewGroupCreateValidator
>;

const purchaseCreateValidator = Prisma.validator<Prisma.PurchaseArgs>()({
  select: {
    placement: true,
    description: true,
    cost: true,
  },
});
export type PurchaseCreateValidator = Prisma.PurchaseGetPayload<
  typeof purchaseCreateValidator
>;

export type OnboardingValidator = {
  overview: OverviewCreateValidator;
  recurringOverviewGroup: OverviewGroupCreateValidator;
  incomingOverviewGroup: OverviewGroupCreateValidator;
  recurringPurchases: PurchaseCreateValidator[];
  incomingPurchases: PurchaseCreateValidator[];
};
