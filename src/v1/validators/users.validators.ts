import { Prisma } from "@prisma/client";
import { Request } from "express";

const user = Prisma.validator<Prisma.UserArgs>()({});
export type User = Prisma.UserGetPayload<typeof user>;

// ↓↓↓ Prisma's automated type interfaces generated via the schema models don't include relations. ↓↓↓
// ↓↓↓ Therefore, we have to manually include them, which is implemented below. ↓↓↓
const userWithRelations = Prisma.validator<Prisma.UserArgs>()({
  include: { overview: true, logbooks: true, logbookReviews: true },
});
export type UserWithRelations = Prisma.UserGetPayload<typeof userWithRelations>;

const userUpdateData = Prisma.validator<Prisma.UserArgs>()({
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
export type UserUpdateData = Partial<
  Prisma.UserGetPayload<typeof userUpdateData>
>;

const userUpdatePasswordData = Prisma.validator<Prisma.UserArgs>()({
  select: {
    password: true,
  },
});
export type UserUpdatePasswordData = Prisma.UserGetPayload<
  typeof userUpdatePasswordData
>;

// ↓↓↓ Used for only updating the user's total money saved to date. ↓↓↓
// ↓↓↓ Doing this because this field is automatically updated at the end of every month via a cron job. ↓↓↓
const userTotalMoneySavedToDate = Prisma.validator<Prisma.UserArgs>()({
  select: { totalMoneySavedToDate: true },
});
export type UserTotalMoneySavedToDate = Prisma.UserGetPayload<
  typeof userTotalMoneySavedToDate
>;

export type RequestWithUserPasswords = Request<
  { userId: string },
  {},
  { oldPassword: string; newPassword: string }
>;
