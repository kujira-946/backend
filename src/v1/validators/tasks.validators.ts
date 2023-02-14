import { Prisma } from "@prisma/client";

const taskRelationsValidator = Prisma.validator<Prisma.TaskArgs>()({
  include: { milestone: true },
});
export type TaskRelationsValidator = Prisma.TaskGetPayload<
  typeof taskRelationsValidator
>;

const taskCreateValidator = Prisma.validator<Prisma.TaskArgs>()({
  select: { description: true },
});
export type TaskCreateValidator = Prisma.TaskGetPayload<
  typeof taskCreateValidator
> & { milestoneId?: number };

const taskUpdateValidator = Prisma.validator<Prisma.TaskArgs>()({
  select: {
    completed: true,
    description: true,
  },
});
export type TaskUpdateValidator = Partial<
  Prisma.TaskGetPayload<typeof taskUpdateValidator>
>;
