import { Prisma } from "@prisma/client";

const fetchUserOverviewValidator = Prisma.validator<Prisma.OverviewArgs>()({
  select: { ownerId: true },
});
export type FetchUserOverviewValidator = Prisma.OverviewGetPayload<
  typeof fetchUserOverviewValidator
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
