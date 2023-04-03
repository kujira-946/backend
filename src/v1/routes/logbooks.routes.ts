import express from "express";

import * as Validators from "../validators/logbooks.validators";
import * as Controllers from "../controllers/logbooks.controllers";
import * as HelperMiddlewares from "../middlewares/helpers.middlewares";

export const logbooksRouter_v1 = express.Router();

logbooksRouter_v1.get("/", Controllers.fetchLogbooks);

logbooksRouter_v1.post(
  "/fetch-user-logbooks",
  HelperMiddlewares.validateUserData(["ownerId"]),
  Controllers.fetchUserLogbooks
);

logbooksRouter_v1.get("/:logbookId", Controllers.fetchLogbook);

type CreateData = (keyof Validators.LogbookCreateValidator)[];
const createData: CreateData = ["name", "ownerId"];
logbooksRouter_v1.post(
  "/",
  HelperMiddlewares.validateUserData(createData),
  Controllers.createLogbook
);

type UpdateData = (keyof Validators.LogbookCreateValidator)[];
const updateData: UpdateData = ["name"];
logbooksRouter_v1.patch(
  "/:logbookId",
  HelperMiddlewares.validateUserData(updateData, {
    isHttpPost: false,
  }),
  Controllers.updateLogbook
);

logbooksRouter_v1.delete("/:logbookId", Controllers.deleteLogbook);
