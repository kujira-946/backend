import express from "express";

import * as Validators from "../validators/logbooks.validators";
import * as Controllers from "../controllers/logbooks.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const logbooksRouter_v1 = express.Router();

logbooksRouter_v1.get("/", Controllers.fetchLogbooks);

logbooksRouter_v1.get("/:logbookId", Controllers.fetchLogbook);

type LogbookInputs = (keyof Validators.LogbookCreateValidator)[];
const logbookInputs: LogbookInputs = ["name"];

logbooksRouter_v1.post(
  "/:ownerId",
  HelperMiddlewares.checkValidityOfUserInput(logbookInputs),
  Controllers.createLogbook
);

logbooksRouter_v1.patch(
  "/:logbookId/:ownerId",
  HelperMiddlewares.checkValidityOfUserInput(logbookInputs, {
    requireAllData: false,
  }),
  Controllers.updateLogbook
);

logbooksRouter_v1.delete("/:logbookId", Controllers.deleteLogbook);
