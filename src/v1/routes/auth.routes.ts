import express from "express";

import * as Controllers from "../controllers/auth.controllers";
import { verifyLoginUsernameMiddleware } from "../middlewares/auth.middlewares";
import {
  checkIfAllRequiredFormFieldsWereSentMiddleware,
  checkInvalidFormFieldsMiddleware,
} from "../middlewares/helpers.middlewares";
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
  checkInvalidFormFieldsMiddleware(requiredRegistrationFields),
  checkIfAllRequiredFormFieldsWereSentMiddleware(requiredRegistrationFields),
  Controllers.registrationController
);

authRouter_v1.get(
  "/register/check-email",
  Controllers.checkRegistrationEmailController
);

authRouter_v1.get(
  "/register/check-username",
  Controllers.checkRegistrationUsernameController
);

authRouter_v1.post(
  "/login",
  verifyLoginUsernameMiddleware,
  Controllers.loginController
);
