import express from "express";

import * as Validators from "../validators/logbook-entries.validators";
import * as Controllers from "../controllers/logbook-entries.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const logbookEntriesRouter_v1 = express.Router();

logbookEntriesRouter_v1.get("/", Controllers.fetchLogbookDays);

logbookEntriesRouter_v1.get("/:logbookDayId", Controllers.fetchLogbookDay);

type LogbookDayCreateData = (keyof Validators.LogbookDayCreateValidator)[];
const logbookDayCreateData: LogbookDayCreateData = ["date"];
logbookEntriesRouter_v1.post(
  "/:logbookId",
  HelperMiddlewares.checkValidityOfUserData(logbookDayCreateData),
  Controllers.createLogbookDay
);

type LogbookDayUpdateData = (keyof Validators.LogbookDayUpdateValidator)[];
const logbookDayUpdateData: LogbookDayUpdateData = ["date", "totalCost"];
logbookEntriesRouter_v1.patch(
  "/:logbookDayId/:logbookId?",
  HelperMiddlewares.checkValidityOfUserData(logbookDayUpdateData, {
    isHttpPost: false,
  }),
  Controllers.updateLogbookDay
);

logbookEntriesRouter_v1.delete("/:logbookDayId", Controllers.deleteLogbookDay);
