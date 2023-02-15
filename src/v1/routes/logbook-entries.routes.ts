import express from "express";

import * as Validators from "../validators/logbook-entries.validators";
import * as Controllers from "../controllers/logbook-entries.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const logbookEntriesRouter_v1 = express.Router();

logbookEntriesRouter_v1.get("/", Controllers.fetchLogbookEntries);

logbookEntriesRouter_v1.get("/:logbookEntryId", Controllers.fetchLogbookEntry);

type LogbookEntryCreateData = (keyof Validators.LogbookEntryCreateValidator)[];
const logbookEntryCreateData: LogbookEntryCreateData = ["date"];
logbookEntriesRouter_v1.post(
  "/:logbookId",
  HelperMiddlewares.checkValidityOfUserData(logbookEntryCreateData),
  Controllers.createLogbookEntry
);

type LogbookEntryUpdateData = (keyof Validators.LogbookEntryUpdateValidator)[];
const logbookEntryUpdateData: LogbookEntryUpdateData = ["date", "totalCost"];
logbookEntriesRouter_v1.patch(
  "/:logbookEntryId/:logbookId?",
  HelperMiddlewares.checkValidityOfUserData(logbookEntryUpdateData, {
    isHttpPost: false,
  }),
  Controllers.updateLogbookEntry
);

logbookEntriesRouter_v1.delete("/:logbookEntryId", Controllers.deleteLogbookEntry);
