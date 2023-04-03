import express from "express";

import * as Validators from "../validators/logbook-entries.validators";
import * as Controllers from "../controllers/logbook-entries.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const logbookEntriesRouter_v1 = express.Router();

logbookEntriesRouter_v1.get("/", Controllers.fetchLogbookEntries);

logbookEntriesRouter_v1.post(
  "/fetch-logbook-entries",
  HelperMiddlewares.validateUserData(["logbookId"]),
  Controllers.fetchLogbookLogbookEntries
);

logbookEntriesRouter_v1.get("/:logbookEntryId", Controllers.fetchLogbookEntry);

type CreateData = (keyof Validators.LogbookEntryCreateValidator)[];
const createData: CreateData = ["date", "logbookId"];
const optionalCreateData: CreateData = ["spent", "budget"];
logbookEntriesRouter_v1.post(
  "/",
  HelperMiddlewares.validateUserData(
    createData,
    { isHttpPost: true },
    optionalCreateData
  ),
  Controllers.createLogbookEntry
);

type UpdateData = (keyof Validators.LogbookEntryUpdateValidator)[];
const updateData: UpdateData = ["date", "spent", "budget", "logbookId"];
logbookEntriesRouter_v1.patch(
  "/:logbookEntryId",
  HelperMiddlewares.validateUserData(updateData, {
    isHttpPost: false,
  }),
  Controllers.updateLogbookEntry
);

logbookEntriesRouter_v1.delete(
  "/:logbookEntryId",
  Controllers.deleteLogbookEntry
);
