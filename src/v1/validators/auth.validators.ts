import { Prisma } from "@prisma/client";

// ↓↓↓ Siphoning only the fields we need for creating a new user from the automated User table type interface, automatically generated by Prisma. ↓↓↓ //
const userRegistrationValidator = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    username: true,
    password: true,
    signedVerificationCode: true,
  },
});
type OptionalRegistrationOptions = {
  firstName?: string;
  lastName?: string;
  birthday?: string;
  currency?: string;
  mobileNumber?: string;
};
export type UserRegistrationValidator = Prisma.UserGetPayload<
  typeof userRegistrationValidator
> &
  OptionalRegistrationOptions;

const userLoginValidator = Prisma.validator<Prisma.UserArgs>()({
  select: {
    username: true,
    password: true,
  },
});
export type UserLoginValidator = Prisma.UserGetPayload<
  typeof userLoginValidator
>;
