import { Prisma } from "@prisma/client";

const emailAvailabilityValidator = Prisma.validator<Prisma.UserArgs>()({
  select: { email: true },
});
export type EmailAvailabilityValidator = Prisma.UserGetPayload<
  typeof emailAvailabilityValidator
>;
export type EmailAvailabilityData = (keyof EmailAvailabilityValidator)[];

const usernameAvailabilityValidator = Prisma.validator<Prisma.UserArgs>()({
  select: { username: true },
});
export type UsernameAvailabilityValidator = Prisma.UserGetPayload<
  typeof usernameAvailabilityValidator
>;
export type UsernameAvailabilityData = (keyof UsernameAvailabilityValidator)[];

const registrationValidator = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    username: true,
    password: true,
    verificationCode: true,
  },
});
export type RegistrationValidator = Prisma.UserGetPayload<
  typeof registrationValidator
>;
export type RegistrationData = (keyof RegistrationValidator)[];

const verifyRegistrationValidator = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    verificationCode: true,
  },
});
export type VerifyRegistrationValidator = Prisma.UserGetPayload<
  typeof verifyRegistrationValidator
>;
export type VerifyRegistrationData = (keyof VerifyRegistrationValidator)[];

const loginValidator = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    password: true,
  },
});
export type LoginValidator = Prisma.UserGetPayload<typeof loginValidator>;
export type LoginData = (keyof LoginValidator)[];

const verifyLoginValidator = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    verificationCode: true,
  },
});
export type VerifyLoginValidator = Prisma.UserGetPayload<
  typeof verifyLoginValidator
> & { thirtyDays: boolean };
export type VerifyLoginData = (keyof VerifyLoginValidator)[];

const requestNewVerificationCodeValidator = Prisma.validator<Prisma.UserArgs>()(
  { select: { email: true } }
);
export type RequestNewVerificationCodeValidator = Prisma.UserGetPayload<
  typeof requestNewVerificationCodeValidator
>;
export type RequestNewVerificationCodeData =
  (keyof RequestNewVerificationCodeValidator)[];
