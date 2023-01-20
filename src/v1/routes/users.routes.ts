import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";

import * as Middlewares from "../middlewares/users.middlewares";
import * as Controllers from "../controllers/users.controllers";
import { checkValidityOfClientRequestMiddleware } from "../middlewares/helpers.middlewares";
import * as Helpers from "../helpers/users.helpers";
import * as Types from "../types/users.types";
import { HttpStatusCodes } from "../../utils/http-status-codes";

export const userRouter_v1 = express.Router();
const prisma = new PrismaClient();

userRouter_v1.get("/", Controllers.fetchUsersController);

userRouter_v1.get("/:userId", Controllers.fetchUserController);

userRouter_v1.patch(
  "/:userId",
  checkValidityOfClientRequestMiddleware(
    [
      "email",
      "username",
      "firstName",
      "lastName",
      "birthday",
      "currency",
      "theme",
      "mobileNumber",
    ],
    { requireAllInputs: false }
  ),
  Controllers.updateUserController
);

userRouter_v1.patch(
  "/:userId/updatePassword",
  checkValidityOfClientRequestMiddleware(["oldPassword", "newPassword"]),
  Middlewares.checkOldPasswordMatchMiddleware,
  Controllers.updateUserPasswordController
);

userRouter_v1.patch(
  "/:userId/totalMoneySavedToDate",
  checkValidityOfClientRequestMiddleware(["totalMoneySavedToDate"]),
  Controllers.updateUserTotalMoneySavedToDateController
);

userRouter_v1.delete("/:userId", Controllers.deleteUserController);
