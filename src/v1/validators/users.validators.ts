import { Prisma } from "@prisma/client";

// ↓↓↓ Prisma's automated type interfaces generated via the schema models don't include relations. ↓↓↓ //
// ↓↓↓ Therefore, we have to manually include them, which is implemented below. ↓↓↓ //
const userRelationsValidator = Prisma.validator<Prisma.UserArgs>()({
  include: {
    overview: { include: { groups: true } },
    logbooks: { include: { entries: { include: { purchases: true } } } },
  },
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
