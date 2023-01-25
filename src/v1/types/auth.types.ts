import { Prisma } from "@prisma/client";
import { Request } from "express";

import { User } from "./users.types";

// ↓↓↓ Siphoning only the fields we need for creating a new user from the automated User table type interface, automatically generated by Prisma. ↓↓↓
const userRegistrationData = Prisma.validator<Prisma.UserArgs>()({
  select: {
    email: true,
    username: true,
    password: true,
    firstName: true,
    lastName: true,
    birthday: true,
    currency: true,
    signedVerificationCode: true,
  },
});
export type UserRegistrationData = Prisma.UserGetPayload<
  typeof userRegistrationData
>;

const userLoginData = Prisma.validator<Prisma.UserArgs>()({
  select: {
    username: true,
    password: true,
  },
});
export type UserLoginData = Prisma.UserGetPayload<typeof userLoginData>;

export type RequestWithFoundUser<
  ExtendedParams = void,
  ExtendedResponse = void,
  ExtendedRequest = void
> = {
  foundUser: User;
} & Request<ExtendedParams, ExtendedResponse, ExtendedRequest>;
