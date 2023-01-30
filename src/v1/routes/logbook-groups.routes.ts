import express from "express";

import * as Types from "../types/logbook-groups.types";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";
import * as Controllers from "../controllers/logbook-groups.controllers";

export const logbookGroupRouter_v1 = express.Router();

logbookGroupRouter_v1.get("/", Controllers.fetchLogbookGroups);

logbookGroupRouter_v1.get("/:logbookGroupId", Controllers.fetchLogbookGroup);

type LogbookGroupCreateDataFields = (keyof Types.LogbookGroupsCreateData)[];
const logbookGroupCreateDataFields: LogbookGroupCreateDataFields = ["date"];
logbookGroupRouter_v1.post(
  "/:logbookId",
  HelperMiddlewares.checkValidityOfUserInput(logbookGroupCreateDataFields),
  Controllers.createLogbookGroup
);

type LogbookGroupUpdateDataFields = (keyof Types.LogbookGroupsUpdateData)[];
const logbookGroupUpdateDataFields: LogbookGroupUpdateDataFields = [
  "date",
  "totalCost",
];
logbookGroupRouter_v1.patch(
  "/:logbookGroupId",
  HelperMiddlewares.checkValidityOfUserInput(logbookGroupUpdateDataFields, {
    requireAllData: false,
  }),
  Controllers.updateLogbookGroup
);

logbookGroupRouter_v1.delete(
  "/:logbookGroupId",
  Controllers.deleteLogbookGroup
);
