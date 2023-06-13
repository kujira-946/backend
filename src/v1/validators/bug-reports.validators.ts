import { Prisma } from "@prisma/client";

const fetchUserBugReportsValidator = Prisma.validator<Prisma.BugReportArgs>()({
  select: { ownerId: true },
});
export type FetchUserBugReportsValidator = Prisma.BugReportGetPayload<
  typeof fetchUserBugReportsValidator
>;

const bugReportsCreateValidator = Prisma.validator<Prisma.BugReportArgs>()({
  select: { title: true, ownerId: true },
});
type OptionalCreateData = { body?: string };
export type BugReportsCreateValidator = Prisma.BugReportGetPayload<
  typeof bugReportsCreateValidator
> &
  OptionalCreateData;
