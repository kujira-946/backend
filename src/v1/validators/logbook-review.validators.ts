import { Prisma } from "@prisma/client";

const logbookReviewRelationsValidator =
  Prisma.validator<Prisma.LogbookReviewArgs>()({
    include: {
      needs: true,
      plannedWants: true,
      impulsiveWants: true,
      regrets: true,
    },
  });
export type LogbookReviewRelationsValidator = Prisma.LogbookReviewGetPayload<
  typeof logbookReviewRelationsValidator
>;

const logbookReviewCreateValidator =
  Prisma.validator<Prisma.LogbookReviewArgs>()({
    select: {
      ownerId: true,
    },
  });
export type LogbookReviewCreateValidator = Prisma.LogbookReviewGetPayload<
  typeof logbookReviewCreateValidator
> & { reflection?: string };

const logbookReviewUpdateValidator =
  Prisma.validator<Prisma.LogbookReviewArgs>()({
    select: {
      reflection: true,
    },
  });
export type LogbookReviewUpdateValidator = Partial<
  Prisma.LogbookReviewGetPayload<typeof logbookReviewUpdateValidator>
>;
