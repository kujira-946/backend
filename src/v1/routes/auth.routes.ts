import express from "express";

import * as Types from "../validators/auth.validators";
import * as Controllers from "../controllers/auth.controllers";
import * as Middlewares from "../middlewares/auth.middlewares";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const authRouter_v1 = express.Router();

authRouter_v1.get(
  "/register/check-email-availability",
  HelperMiddlewares.checkValidityOfUserData(["email"]),
  Controllers.checkEmailAvailability
);

authRouter_v1.get(
  "/register/check-username-availability",
  HelperMiddlewares.checkValidityOfUserData(["username"]),
  Controllers.checkUsernameAvailability
);

type RequiredRegistrationFields = (keyof Types.UserRegistrationValidator)[];
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
  HelperMiddlewares.checkValidityOfUserData(requiredRegistrationFields),
  Controllers.registerUser
);

authRouter_v1.patch(
  "/register/:userId/verify",
  HelperMiddlewares.checkValidityOfUserData(["verificationCode"]),
  Middlewares.checkUserExistsWithId,
  Controllers.verifyRegistration
);

authRouter_v1.patch(
  "/login",
  HelperMiddlewares.checkValidityOfUserData(["username", "password"]),
  Middlewares.checkUserExistsOnLoginAttempt,
  Middlewares.checkUserVerifiedOnLoginAttempt,
  Controllers.loginUser
);

authRouter_v1.patch(
  "/login/:userId/verify",
  HelperMiddlewares.checkValidityOfUserData([
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
