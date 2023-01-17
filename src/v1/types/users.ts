import { Prisma } from "@prisma/client";

// Siphoning only the fields we need for creating a new user from the automated User table
// type interface, automatically generated by Prisma.
const userCreateData = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    username: true,
    firstName: true,
    lastName: true,
    birthday: true,
    currency: true,
  },
});
export type UserCreateData = Prisma.UserGetPayload<typeof userCreateData>;

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

// Used for only updating the user's total money saved to date.
// Doing this because this field is automatically updated at the end of every month.
const userTotalMoneySavedToDate = Prisma.validator<Prisma.UserArgs>()({
  select: { totalMoneySavedToDate: true },
});
export type UserTotalMoneySavedToDate = Prisma.UserGetPayload<
  typeof userTotalMoneySavedToDate
>;

// Prisma's automated type interfaces via the schema models don't include relations.
// Therefore, we have to manually include them, which is implemented below.
const userWithRelations = Prisma.validator<Prisma.UserArgs>()({
  include: { logbooks: true, logbookReviews: true },
});
export type UserWithRelations = Prisma.UserGetPayload<typeof userWithRelations>;
