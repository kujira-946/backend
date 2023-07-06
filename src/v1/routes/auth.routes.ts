import express from "express";

import * as Controllers from "../controllers/auth.controllers";
import * as Middlewares from "../middlewares/auth.middlewares";
import * as Validators from "../validators/auth.validators";
import { validateUserData } from "../middlewares/helpers.middlewares";

export const authRouter_v1 = express.Router();

const emailAvailabilityData: Validators.EmailAvailabilityData = ["email"];
authRouter_v1.patch(
  "/register/check-email-availability",
  validateUserData(emailAvailabilityData),
  Controllers.checkEmailAvailability
);

const usernameAvailabilityData: Validators.UsernameAvailabilityData = [
  "username",
];
authRouter_v1.patch(
  "/register/check-username-availability",
  validateUserData(usernameAvailabilityData),
  Controllers.checkUsernameAvailability
);

const registrationData: Validators.RegistrationData = [
  "email",
  "username",
  "password",
];
authRouter_v1.post(
  "/register",
  validateUserData(registrationData),
  Controllers.registerUser
);

const verifyRegistrationData: Validators.VerifyRegistrationData = [
  "email",
  "verificationCode",
];
authRouter_v1.patch(
  "/register/verify",
  validateUserData(verifyRegistrationData),
  Middlewares.checkUserExistsWithEmail,
  Controllers.verifyRegistration
);

const loginData: Validators.LoginData = ["email", "password"];
authRouter_v1.patch(
  "/login",
  validateUserData(loginData),
  Middlewares.checkUserExistsOnLoginAttempt,
  Middlewares.checkUserVerifiedOnLoginAttempt,
  Controllers.loginUser
);

const verifyLoginData: Validators.VerifyLoginData = [
  "email",
  "verificationCode",
  "thirtyDays",
];
authRouter_v1.patch(
  "/login/verify",
  validateUserData(verifyLoginData),
  Middlewares.checkUserExistsWithEmail,
  Controllers.verifyLogin
);

authRouter_v1.patch(
  "/logout/:userId",
  Middlewares.checkUserAlreadyLoggedOut,
  Controllers.logout
);

const requestNewVerificationCodeData: Validators.RequestNewVerificationCodeData =
  ["email"];
authRouter_v1.patch(
  "/request-new-verification-code",
  validateUserData(requestNewVerificationCodeData),
  Controllers.requestNewVerificationCode
);
