import express from "express";

import * as Controllers from "../controllers/onboarding.controllers";
import * as Validators from "../validators/onboarding.validators";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const onboardingRouter_v1 = express.Router();

type CreateData = (keyof Validators.OnboardingValidator)[];
const createData: CreateData = [
  "overview",
  "recurringOverviewGroup",
  "incomingOverviewGroup",
  "recurringPurchases",
  "incomingPurchases",
];

onboardingRouter_v1.post(
  "/",
  HelperMiddlewares.validateUserData(createData, { isHttpPost: true }),
  Controllers.onboardNewUser
);
