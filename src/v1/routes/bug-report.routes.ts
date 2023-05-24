import express from "express";

import * as Validators from "../validators/bug-reports.validators";
import * as Controllers from "../controllers/bug-reports.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const bugReportRouter_v1 = express.Router();

bugReportRouter_v1.post(
  "/fetch-user-bug-reports",
  HelperMiddlewares.validateUserData(["ownerId"], { isHttpPost: true }),
  Controllers.fetchUserBugReports
);

type CreateData = (keyof Validators.BugReportsCreateValidator)[];
const createData: CreateData = ["title", "ownerId"];
const optionalCreateData: CreateData = ["body"];
bugReportRouter_v1.post(
  "/",
  HelperMiddlewares.validateUserData(
    createData,
    { isHttpPost: true },
    optionalCreateData
  ),
  Controllers.createBugReport
);

bugReportRouter_v1.delete("/:bugReportId", Controllers.deleteBugReport);
