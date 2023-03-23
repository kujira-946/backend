import { Prisma } from "@prisma/client";

const userUpdateValidator = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    username: true,
    firstName: true,
    lastName: true,
    birthday: true,
    currency: true,
    theme: true,
    onboarded: true,
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
