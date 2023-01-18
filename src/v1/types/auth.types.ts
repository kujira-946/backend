import { Prisma } from "@prisma/client";

// Siphoning only the fields we need for creating a new user from the automated User table
// type interface, automatically generated by Prisma.
const userRegistrationData = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    username: true,
    password: true,
    firstName: true,
    lastName: true,
    birthday: true,
    currency: true,
  },
});
export type UserRegistrationData = Prisma.UserGetPayload<
  typeof userRegistrationData
>;
