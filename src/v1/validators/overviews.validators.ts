import { Prisma } from "@prisma/client";

const overviewWithRelations = Prisma.validator<Prisma.OverviewArgs>()({
  include: { recurringCosts: true, incomingCosts: true },
});
export type OverviewWithRelations = Prisma.OverviewGetPayload<
  typeof overviewWithRelations
>;

const overviewCreateData = Prisma.validator<Prisma.OverviewArgs>()({
  select: {
    savings: true,
    ownerId: true,
  },
});
export type OverviewCreateData = Prisma.OverviewGetPayload<
  typeof overviewCreateData
> & { income?: number};

const overviewUpdateData = Prisma.validator<Prisma.OverviewArgs>()({
  select: {
    income: true,
    savings: true,
  },
});
export type OverviewUpdateData = Partial<
  Prisma.OverviewGetPayload<typeof overviewUpdateData>
>;
