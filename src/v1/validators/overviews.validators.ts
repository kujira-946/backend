import { Prisma } from "@prisma/client";

const overviewRelationsValidator = Prisma.validator<Prisma.OverviewArgs>()({
  include: { groups: true },
});
export type OverviewRelationsValidator = Prisma.OverviewGetPayload<
  typeof overviewRelationsValidator
>;

const overviewCreateValidator = Prisma.validator<Prisma.OverviewArgs>()({
  select: {
    income: true,
    ownerId: true,
  },
});
type OptionalCreateData = { savings?: number };
export type OverviewCreateValidator = Prisma.OverviewGetPayload<
  typeof overviewCreateValidator
> &
  OptionalCreateData;

const overviewUpdateValidator = Prisma.validator<Prisma.OverviewArgs>()({
  select: {
    income: true,
    savings: true,
  },
});
export type OverviewUpdateValidator = Partial<
  Prisma.OverviewGetPayload<typeof overviewUpdateValidator>
>;
