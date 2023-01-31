import express from "express";

import * as Validators from "../validators/logbooks.validators";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";
import * as Controllers from "../controllers/logbooks.controllers";

export const logbooksRouter_v1 = express.Router();

logbooksRouter_v1.get("/", Controllers.fetchLogbooks);

logbooksRouter_v1.get("/:logbookId", Controllers.fetchLogbook);

type LogbookDataFields = (keyof Validators.LogbookCreateValidator)[];
const logbookDataFields: LogbookDataFields = ["name"];

logbooksRouter_v1.post(
  "/:ownerId",
  HelperMiddlewares.checkValidityOfUserInput(logbookDataFields),
  Controllers.createLogbook
);

logbooksRouter_v1.patch(
  "/:logbookId/:ownerId",
  HelperMiddlewares.checkValidityOfUserInput(logbookDataFields, {
    requireAllData: false,
  }),
  Controllers.updateLogbook
);

logbooksRouter_v1.delete("/:logbookId", Controllers.deleteLogbook);
