import { Prisma } from "@prisma/client";

const emailAvailabilityValidator = Prisma.validator<Prisma.UserArgs>()({
  select: { email: true },
});
export type EmailAvailabilityValidator = Prisma.UserGetPayload<
  typeof emailAvailabilityValidator
>;

const usernameAvailabilityValidator = Prisma.validator<Prisma.UserArgs>()({
  select: { username: true },
});
export type UsernameAvailabilityValidator = Prisma.UserGetPayload<
  typeof usernameAvailabilityValidator
>;

const registrationValidator = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    username: true,
    password: true,
    signedVerificationCode: true,
  },
});
type OptionalRegistrationData = {
  firstName?: string;
  lastName?: string;
  birthday?: string;
  currency?: string;
  mobileNumber?: string;
};
export type RegistrationValidator = Prisma.UserGetPayload<
  typeof registrationValidator
> &
  OptionalRegistrationData;

const verifyRegistrationValidator = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    signedVerificationCode: true,
  },
});
export type VerifyRegistrationValidator = Prisma.UserGetPayload<
  typeof verifyRegistrationValidator
>;

const loginValidator = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    password: true,
  },
});
export type LoginValidator = Prisma.UserGetPayload<typeof loginValidator>;

const verifyLoginValidator = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    signedVerificationCode: true,
  },
});
export type VerifyLoginValidator = Prisma.UserGetPayload<
  typeof verifyLoginValidator
> & { thirtyDays: boolean };

const requestNewVerificationCodeValidator = Prisma.validator<Prisma.UserArgs>()(
  {
    select: { email: true },
  }
);
export type RequestNewVerificationCodeValidator = Prisma.UserGetPayload<
  typeof requestNewVerificationCodeValidator
>;
