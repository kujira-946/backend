import express from "express";

import * as Controllers from "../controllers/auth.controllers";
import { verifyLoginUsername } from "../middlewares/auth.middlewares";
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
  Controllers.registration
);

authRouter_v1.get(
  "/register/check-email",
  checkValidityOfClientData(["email"]),
  Controllers.checkRegistrationEmail
);

authRouter_v1.get(
  "/register/check-username",
  checkValidityOfClientData(["username"]),
  Controllers.checkRegistrationUsername
);

authRouter_v1.post(
  "/login",
  verifyLoginUsername,
  checkValidityOfClientData(["username", "password", "thirtyDays"]),
  Controllers.login
);
