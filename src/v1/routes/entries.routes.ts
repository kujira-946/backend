import express from "express";

import * as Controllers from "../controllers/entries.controllers";
import * as Validators from "../validators/entries.validators";
import { validateUserData } from "../middlewares/helpers.middlewares";

export const entriesRouter_v1 = express.Router();

const createEntryData: Validators.EntryCreateData = ["name"];
entriesRouter_v1.post(
  "/",
  validateUserData(createEntryData),
  Controllers.createEntry
);

const updateEntryData: Validators.EntryUpdateData = [
  "name",
  "totalSpent",
  "budget",
];
entriesRouter_v1.post(
  "/:entryId",
  validateUserData(updateEntryData, { isHttpPost: false }),
  Controllers.updateEntry
);
