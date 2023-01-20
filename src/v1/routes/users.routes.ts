import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";
import bcrypt from "bcrypt";

import * as Middlewares from "../middlewares/users.middlewares";
import * as Controllers from "../controllers/users.controllers";
import { checkInvalidFormFieldsMiddleware } from "../middlewares/helpers.middlewares";
import * as Helpers from "../helpers/users.helpers";
import * as Types from "../types/users.types";
import { HttpStatusCodes } from "../../utils/http-status-codes";

export const userRouter_v1 = express.Router();
const prisma = new PrismaClient();

userRouter_v1.get("/", Controllers.fetchUsersController);

userRouter_v1.get("/:userId", Controllers.fetchUserController);

userRouter_v1.patch(
  "/:userId",
  checkInvalidFormFieldsMiddleware([
    "email",
    "username",
    "firstName",
    "lastName",
    "birthday",
    "currency",
    "theme",
    "mobileNumber",
  ]),
  Controllers.updateUserController
);

// ↓↓↓ Update user password ↓↓↓
userRouter_v1.patch(
  "/:userId/updatePassword",
  checkInvalidFormFieldsMiddleware(["oldPassword", "newPassword"]),
  Middlewares.checkOldPasswordMatchMiddleware,
  Controllers.updateUserPasswordController
);

// ↓↓↓ Update only an existing user's `totalMoneySavedToDate` field ↓↓↓
userRouter_v1.patch(
  "/:userId/totalMoneySavedToDate",
  async (request: Request, response: Response) => {
    // TODO : NEED TO FIX THE LOGIC FOR AUTOMATICALLY HANDLING THE MANUAL UPDATING OF TOTALMONEYSAVEDTODATE AT THE END OF EVERY MONTH.
    // TODO : SET UP A CRON JOB TO HANDLE THIS LOGIC.
    try {
      const totalMoneySavedToDateData: Types.UserTotalMoneySavedToDate = {
        totalMoneySavedToDate: request.body.totalMoneySavedToDate,
      };

      const user: Types.UserWithRelations = await prisma.user.update({
        where: { id: Number(request.params.userId) },
        data: totalMoneySavedToDateData,
        include: { overview: true, logbooks: true, logbookReviews: true },
      });
      const userWithoutPassword = Helpers.excludeFieldFromUserObject(user, [
        "password",
      ]);
      response.status(HttpStatusCodes.OK).json(userWithoutPassword);
    } catch (error) {
      response.status(HttpStatusCodes.BAD_REQUEST).json({
        error:
          "Failed to update your total money saved to date. Please refresh the page.",
      });
    }
  }
);

// ↓↓↓ Delete a user ↓↓↓
userRouter_v1.delete(
  "/:userId",
  async (request: Request, response: Response) => {
    try {
      await prisma.user.delete({
        where: { id: Number(request.params.userId) },
      });
      response
        .status(HttpStatusCodes.OK)
        .json({ message: "Account successfully deleted." });
    } catch (error) {
      response.status(HttpStatusCodes.NOT_FOUND).json({
        error:
          "Failed to delete account. Please refresh the page and try again.",
      });
    }
  }
);
