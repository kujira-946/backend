import { Prisma } from "@prisma/client";

// ↓↓↓ Prisma's automated type interfaces generated via the schema models don't include relations. ↓↓↓
// ↓↓↓ Therefore, we have to manually include them, which is implemented below. ↓↓↓
const userRelationsValidator = Prisma.validator<Prisma.UserArgs>()({
  include: { overview: true, logbooks: true, logbookReviews: true },
});
export type UserRelationsValidator = Prisma.UserGetPayload<
  typeof userRelationsValidator
>;

const userUpdateValidator = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    username: true,
    firstName: true,
    lastName: true,
    birthday: true,
    currency: true,
    theme: true,
    mobileNumber: true,
  },
});
export type UserUpdateValidator = Partial<
  Prisma.UserGetPayload<typeof userUpdateValidator>
>;

const userUpdatePasswordValidator = Prisma.validator<Prisma.UserArgs>()({
  select: {
    password: true,
  },
});
export type UserUpdatePasswordValidator = Prisma.UserGetPayload<
  typeof userUpdatePasswordValidator
>;

// ↓↓↓ Used for only updating the user's total money saved to date. ↓↓↓
// ↓↓↓ Doing this because this field is automatically updated at the end of every month via a cron job. ↓↓↓
const userTotalMoneySavedToDateValidator = Prisma.validator<Prisma.UserArgs>()({
  select: { totalMoneySavedToDate: true },
});
export type UserTotalMoneySavedToDateValidator = Prisma.UserGetPayload<
  typeof userTotalMoneySavedToDateValidator
>;
