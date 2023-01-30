import express from "express";

import * as Types from "../types/logbooks.types";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";
import * as Controllers from "../controllers/logbooks.controllers";

export const logbookRouter_v1 = express.Router();

logbookRouter_v1.get("/", Controllers.fetchLogbooks);

logbookRouter_v1.get("/:logbookId", Controllers.fetchLogbook);

type LogbookDataFields = (keyof Types.LogbookCreateData)[];
const logbookDataFields: LogbookDataFields = ["name"];

logbookRouter_v1.post(
  "/:ownerId",
  HelperMiddlewares.checkValidityOfUserInput(logbookDataFields),
  Controllers.createLogbook
);

logbookRouter_v1.patch(
  "/:logbookId/:ownerId",
  HelperMiddlewares.checkValidityOfUserInput(logbookDataFields, {
    requireAllData: false,
  }),
  Controllers.updateLogbook
);

logbookRouter_v1.delete("/:logbookId", Controllers.deleteLogbook);
