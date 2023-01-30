import { Prisma } from "@prisma/client";

const logbookReviewWithRelations = Prisma.validator<Prisma.LogbookReviewArgs>()(
  {
    include: {
      needs: true,
      plannedWants: true,
      impulsiveWants: true,
      regrets: true,
      owner: true,
    },
  }
);
export type LogbookReviewWithRelations = Prisma.LogbookReviewGetPayload<
  typeof logbookReviewWithRelations
>;

const logbookReviewCreateData = Prisma.validator<Prisma.LogbookReviewArgs>()({
  select: {
    ownerId: true,
  },
});
export type LogbookReviewCreateData = Prisma.LogbookReviewGetPayload<
  typeof logbookReviewCreateData
>;

const logbookReviewUpdateData = Prisma.validator<Prisma.LogbookReviewArgs>()({
  select: {
    reflection: true,
    // needs: true,
    // plannedWants: true,
    // impulsiveWants: true,
    // regrets: true,
  },
});
export type LogbookReviewUpdateData = Partial<
  Prisma.LogbookReviewGetPayload<typeof logbookReviewUpdateData>
>;
