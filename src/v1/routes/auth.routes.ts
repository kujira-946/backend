import express from "express";

import * as Validators from "../validators/auth.validators";
import * as Controllers from "../controllers/auth.controllers";
import * as Middlewares from "../middlewares/auth.middlewares";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const authRouter_v1 = express.Router();

type VerifyRegistrationData = (keyof Validators.VerifyRegistrationValidator)[];
const verifyRegistrationData: VerifyRegistrationData = [
  "email",
  "signedVerificationCode",
];
authRouter_v1.patch(
  "/register/verify",
  HelperMiddlewares.validateUserData(verifyRegistrationData),
  Middlewares.checkUserExistsWithEmail,
  Controllers.verifyRegistration
);

type EmailAvailabilityData = (keyof Validators.EmailAvailabilityValidator)[];
const emailAvailabilityData: EmailAvailabilityData = ["email"];
authRouter_v1.patch(
  "/register/check-email-availability",
  HelperMiddlewares.validateUserData(emailAvailabilityData),
  Controllers.checkEmailAvailability
);

type RegistrationData = (keyof Validators.RegistrationValidator)[];
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

type UsernameAvailabilityData =
  (keyof Validators.UsernameAvailabilityValidator)[];
const usernameAvailabilityData: UsernameAvailabilityData = ["username"];
authRouter_v1.patch(
  "/register/check-username-availability",
  HelperMiddlewares.validateUserData(usernameAvailabilityData),
  Controllers.checkUsernameAvailability
);

type LoginData = (keyof Validators.LoginValidator)[];
const loginData: LoginData = ["email", "password"];
authRouter_v1.patch(
  "/login",
  HelperMiddlewares.validateUserData(loginData),
  Middlewares.checkUserExistsOnLoginAttempt,
  Middlewares.checkUserVerifiedOnLoginAttempt,
  Controllers.loginUser
);

type VerifyLoginData = (keyof Validators.VerifyLoginValidator)[];
const verifyLoginData: VerifyLoginData = [
  "email",
  "signedVerificationCode",
  "thirtyDays",
];
authRouter_v1.patch(
  "/login/verify",
  HelperMiddlewares.validateUserData(verifyLoginData),
  Middlewares.checkUserExistsWithEmail,
  Controllers.verifyLogin
);

authRouter_v1.patch(
  "/logout/:userId",
  Middlewares.checkUserAlreadyLoggedOut,
  Controllers.logout
);

type RequestNewVerificationCodeData =
  (keyof Validators.RequestNewVerificationCodeValidator)[];
const requestNewVerificationCodeData: RequestNewVerificationCodeData = [
  "email",
];
authRouter_v1.patch(
  "/request-new-verification-code",
  HelperMiddlewares.validateUserData(requestNewVerificationCodeData),
  Controllers.requestNewVerificationCode
);
