import { Prisma } from "@prisma/client";

const milestoneRelationsValidator = Prisma.validator<Prisma.MilestoneArgs>()({
  include: { tasks: true },
});
export type MilestoneRelationsValidator = Prisma.MilestoneGetPayload<
  typeof milestoneRelationsValidator
>;

const milestoneCreateValidator = Prisma.validator<Prisma.MilestoneArgs>()({
  select: { placement: true, name: true, reward: true },
});
export type MilestoneCreateValidator = Prisma.MilestoneGetPayload<
  typeof milestoneCreateValidator
>;

const milestoneUpdateValidator = Prisma.validator<Prisma.MilestoneArgs>()({
  select: {
    placement: true,
    achieved: true,
    name: true,
    reward: true,
  },
});
export type MilestoneUpdateValidator = Partial<
  Prisma.MilestoneGetPayload<typeof milestoneUpdateValidator>
>;
