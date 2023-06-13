import { Prisma } from "@prisma/client";

const fetchOverviewOverviewGroupsValidator =
  Prisma.validator<Prisma.OverviewGroupArgs>()({
    select: { overviewId: true },
  });
export type FetchOverviewOverviewGroupsValidator =
  Prisma.OverviewGroupGetPayload<typeof fetchOverviewOverviewGroupsValidator>;

const overviewGroupCreateValidator =
  Prisma.validator<Prisma.OverviewGroupArgs>()({
    select: { name: true, overviewId: true },
  });
type OptionalCreateData = { totalSpent?: number };
export type OverviewGroupCreateValidator = Prisma.OverviewGroupGetPayload<
  typeof overviewGroupCreateValidator
> &
  OptionalCreateData;

const overviewGroupUpdateValidator =
  Prisma.validator<Prisma.OverviewGroupArgs>()({
    select: { name: true, totalSpent: true, overviewId: true },
  });
export type OverviewGroupUpdateValidator = Prisma.OverviewGroupGetPayload<
  typeof overviewGroupUpdateValidator
>;
