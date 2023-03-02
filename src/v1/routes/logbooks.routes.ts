import express from "express";

import * as Validators from "../validators/logbooks.validators";
import * as Controllers from "../controllers/logbooks.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const logbooksRouter_v1 = express.Router();

logbooksRouter_v1.get("/", Controllers.fetchLogbooks);

logbooksRouter_v1.get("/:logbookId", Controllers.fetchLogbook);

type LogbookData = (keyof Validators.LogbookCreateValidator)[];
const logbookData: LogbookData = ["name"];

logbooksRouter_v1.post(
  "/:ownerId",
  HelperMiddlewares.validateUserData(logbookData),
  Controllers.createLogbook
);

logbooksRouter_v1.patch(
  "/:logbookId",
  HelperMiddlewares.validateUserData(logbookData, {
    isHttpPost: false,
  }),
  Controllers.updateLogbook
);

logbooksRouter_v1.delete("/:logbookId", Controllers.deleteLogbook);
