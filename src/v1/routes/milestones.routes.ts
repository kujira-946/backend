import express from "express";

import * as Validators from "../validators/milestones.validators";
import * as Controllers from "../controllers/milestones.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const milestonesRouter_v1 = express.Router();

milestonesRouter_v1.get("/", Controllers.fetchMilestones);

milestonesRouter_v1.get("/:milestoneId", Controllers.fetchMilestone);

type MilestoneCreateData = (keyof Validators.MilestoneCreateValidator)[];
const milestoneCreateData: MilestoneCreateData = [
  "placement",
  "name",
  "reward",
];
milestonesRouter_v1.post(
  "/",
  HelperMiddlewares.validateUserData(milestoneCreateData),
  Controllers.createMilestone
);

type MilestoneUpdateData = (keyof Validators.MilestoneUpdateValidator)[];
const milestoneUpdateData: MilestoneUpdateData = [
  "placement",
  "name",
  "reward",
  "achieved",
];
milestonesRouter_v1.patch(
  "/:milestoneId",
  HelperMiddlewares.validateUserData(milestoneUpdateData, {
    isHttpPost: false,
  }),
  Controllers.updateMilestone
);

milestonesRouter_v1.delete("/:milestoneId", Controllers.deleteMilestone);
