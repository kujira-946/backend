import express from "express";

import * as Controllers from "../controllers/bug-report.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const bugReportRouter_v1 = express.Router();

bugReportRouter_v1.post(
  "/send",
  HelperMiddlewares.validateUserData(["title"], { isHttpPost: true }, ["body"]),
  Controllers.sendBugReport
);
