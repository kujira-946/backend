import express from "express";

import * as Types from "../types/auth.types";
import * as Middlewares from "../middlewares/auth.middlewares";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";
import * as Controllers from "../controllers/auth.controllers";

export const authRouter_v1 = express.Router();

authRouter_v1.get(
  "/register/check-email-availability",
  HelperMiddlewares.checkValidityOfUserInput(["email"]),
  Controllers.checkEmailAvailability
);

authRouter_v1.get(
  "/register/check-username-availability",
  HelperMiddlewares.checkValidityOfUserInput(["username"]),
  Controllers.checkUsernameAvailability
);

type RequiredRegistrationFields = (keyof Types.UserRegistrationData)[];
const requiredRegistrationFields: RequiredRegistrationFields = [
  "email",
  "username",
  "password",
  "firstName",
  "lastName",
  "birthday",
  "currency",
];
authRouter_v1.post(
  "/register",
  HelperMiddlewares.checkValidityOfUserInput(requiredRegistrationFields),
  Controllers.registerUser
);

authRouter_v1.patch(
  "/register/:userId/verify",
  HelperMiddlewares.checkValidityOfUserInput(["verificationCode"]),
  Middlewares.checkUserExistsWithId,
  Controllers.verifyRegistration
);

authRouter_v1.patch(
  "/login",
  HelperMiddlewares.checkValidityOfUserInput(["username", "password"]),
  Middlewares.checkUserExistsOnLoginAttempt,
  Middlewares.checkUserVerifiedOnLoginAttempt,
  Controllers.loginUser
);

authRouter_v1.patch(
  "/login/:userId/verify",
  HelperMiddlewares.checkValidityOfUserInput([
    "verificationCode",
    "thirtyDays",
  ]),
  Middlewares.checkUserExistsWithId,
  Controllers.verifyLogin
);

authRouter_v1.patch(
  "/logout/:userId",
  Middlewares.checkUserAlreadyLoggedOut,
  Controllers.logout
);

authRouter_v1.patch(
  "/request-new-verification-code/:userId",
  Controllers.requestNewVerificationCode
);

authRouter_v1.delete(
  "/delete-unverified-account",
  Controllers.deleteUnverifiedNewAccount
);
