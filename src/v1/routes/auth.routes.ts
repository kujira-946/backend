import express from "express";

import * as Types from "../validators/auth.validators";
import * as Controllers from "../controllers/auth.controllers";
import * as Middlewares from "../middlewares/auth.middlewares";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const authRouter_v1 = express.Router();

authRouter_v1.patch(
  "/register/:userId/verify",
  HelperMiddlewares.validateUserData(["verificationCode"]),
  Middlewares.checkUserExistsWithId,
  Controllers.verifyRegistration
);

authRouter_v1.patch(
  "/register/check-email-availability",
  HelperMiddlewares.validateUserData(["email"]),
  Controllers.checkEmailAvailability
);

type RegistrationData = (keyof Types.UserRegistrationValidator)[];
const registrationData: RegistrationData = ["email", "username", "password"];
const optionalRegistrationData: RegistrationData = [
  "firstName",
  "lastName",
  "birthday",
  "currency",
  "mobileNumber",
];
authRouter_v1.post(
  "/register",
  HelperMiddlewares.validateUserData(
    registrationData,
    { isHttpPost: true },
    optionalRegistrationData
  ),
  Controllers.registerUser
);

authRouter_v1.patch(
  "/register/check-username-availability",
  HelperMiddlewares.validateUserData(["username"]),
  Controllers.checkUsernameAvailability
);

type LoginData = (keyof Types.UserLoginValidator)[];
const loginData: LoginData = ["email", "password"];
authRouter_v1.patch(
  "/login",
  HelperMiddlewares.validateUserData(loginData),
  Middlewares.checkUserExistsOnLoginAttempt,
  Middlewares.checkUserVerifiedOnLoginAttempt,
  Controllers.loginUser
);

authRouter_v1.patch(
  "/login/:userId/verify",
  HelperMiddlewares.validateUserData(["verificationCode", "thirtyDays"]),
  Middlewares.checkUserExistsWithId,
  Controllers.verifyLogin
);

authRouter_v1.patch(
  "/logout/:userId",
  Middlewares.checkUserAlreadyLoggedOut,
  Controllers.logout
);

authRouter_v1.patch(
  "/request-new-verification-code",
  HelperMiddlewares.validateUserData(["email"]),
  Controllers.requestNewVerificationCode
);
