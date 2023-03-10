import express from "express";

import * as Validators from "../validators/logbooks.validators";
import * as Controllers from "../controllers/logbooks.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const logbooksRouter_v1 = express.Router();

logbooksRouter_v1.get("/", Controllers.fetchLogbooks);

logbooksRouter_v1.get("/:logbookId", Controllers.fetchLogbook);

type LogbookCreateData = (keyof Validators.LogbookCreateValidator)[];
const logbookCreateData: LogbookCreateData = ["name", "ownerId"];
logbooksRouter_v1.post(
  "/",
  HelperMiddlewares.validateUserData(logbookCreateData),
  Controllers.createLogbook
);

type LogbookUpdateData = (keyof Validators.LogbookCreateValidator)[];
const logbookUpdateData: LogbookUpdateData = ["name"];
logbooksRouter_v1.patch(
  "/:logbookId",
  HelperMiddlewares.validateUserData(logbookUpdateData, {
    isHttpPost: false,
  }),
  Controllers.updateLogbook
);

logbooksRouter_v1.delete("/:logbookId", Controllers.deleteLogbook);
