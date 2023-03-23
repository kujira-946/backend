import { Prisma } from "@prisma/client";

const overviewGroupCreateValidator =
  Prisma.validator<Prisma.OverviewGroupArgs>()({
    select: { name: true, overviewId: true },
  });
type OptionalCreateData = { totalCost?: number };
export type OverviewGroupCreateValidator = Prisma.OverviewGroupGetPayload<
  typeof overviewGroupCreateValidator
> &
  OptionalCreateData;

const overviewGroupUpdateValidator =
  Prisma.validator<Prisma.OverviewGroupArgs>()({
    select: { name: true, totalCost: true, overviewId: true },
  });
export type OverviewGroupUpdateValidator = Prisma.OverviewGroupGetPayload<
  typeof overviewGroupUpdateValidator
>;
