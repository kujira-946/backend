import express from "express";

import * as Controllers from "../controllers/auth.controllers";
import { checkUsernameUniquenessDuringLogin } from "../middlewares/auth.middlewares";

export const authRouter_v1 = express.Router();

authRouter_v1.post("/register", Controllers.registrationController);

authRouter_v1.get(
  "/register/check-email",
  Controllers.registrationCheckEmailController
);

authRouter_v1.get(
  "/register/check-username",
  Controllers.registrationCheckUsernameController
);

authRouter_v1.post(
  "/login",
  checkUsernameUniquenessDuringLogin,
  Controllers.loginController
);
