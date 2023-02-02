import express from "express";

import * as Validators from "../validators/logbook-days.validators";
import * as Controllers from "../controllers/logbook-days.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const logbookDaysRouter_v1 = express.Router();

logbookDaysRouter_v1.get("/", Controllers.fetchLogbookDays);

logbookDaysRouter_v1.get("/:logbookDayId", Controllers.fetchLogbookDay);

type LogbookDayCreateData = (keyof Validators.LogbookDayCreateValidator)[];
const logbookDayCreateData: LogbookDayCreateData = ["date"];
logbookDaysRouter_v1.post(
  "/:logbookId",
  HelperMiddlewares.checkValidityOfUserData(logbookDayCreateData),
  Controllers.createLogbookDay
);

type LogbookDayUpdateData = (keyof Validators.LogbookDayUpdateValidator)[];
const logbookDayUpdateData: LogbookDayUpdateData = ["date", "totalCost"];
logbookDaysRouter_v1.patch(
  "/:logbookDayId/:logbookId?",
  HelperMiddlewares.checkValidityOfUserData(logbookDayUpdateData, {
    isHttpPost: false,
  }),
  Controllers.updateLogbookDay
);

logbookDaysRouter_v1.delete("/:logbookDayId", Controllers.deleteLogbookDay);
