import { Prisma } from "@prisma/client";

const bugReportsCreateValidator = Prisma.validator<Prisma.BugReportArgs>()({
  select: { title: true, ownerId: true },
});
type OptionalCreateData = { body?: string };
export type BugReportsCreateValidator = Prisma.BugReportGetPayload<
  typeof bugReportsCreateValidator
> &
  OptionalCreateData;
