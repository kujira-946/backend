import express from "express";

import * as Controllers from "../controllers/auth.controllers";
import {
  checkAccountVerifiedOnLogin,
  checkUsernameExistsOnLogin,
} from "../middlewares/auth.middlewares";
import { checkValidityOfClientData } from "../middlewares/helpers.middlewares";
import { UserRegistrationData } from "../types/auth.types";

export const authRouter_v1 = express.Router();

type RequiredRegistrationFields = (keyof UserRegistrationData)[];
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
  checkValidityOfClientData(requiredRegistrationFields),
  Controllers.registerUser
);

authRouter_v1.patch(
  "/register/:userId/verify/:verificationCode",
  Controllers.verifyRegistration
);

authRouter_v1.get(
  "/register/check-email-availability",
  checkValidityOfClientData(["email"]),
  Controllers.checkEmailAvailability
);

authRouter_v1.get(
  "/register/check-username-availability",
  checkValidityOfClientData(["username"]),
  Controllers.checkUsernameAvailability
);

authRouter_v1.patch(
  "/login",
  checkUsernameExistsOnLogin,
  checkAccountVerifiedOnLogin,
  checkValidityOfClientData(["username", "password"]),
  Controllers.loginUser
);

authRouter_v1.patch(
  "/login/:userId/verify/:verificationCode",
  checkValidityOfClientData(["thirtyDays"]),
  Controllers.verifyLogin
);

authRouter_v1.patch("/logout/:userId", Controllers.logout);

authRouter_v1.post(
  "/:userId/request-new-verification-code",
  Controllers.requestNewVerificationCode
);
