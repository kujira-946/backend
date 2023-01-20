import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";
import bcrypt from "bcrypt";

import * as Types from "../types/users.types";
import * as Helpers from "../helpers/users.helpers";
import { HttpStatusCodes } from "../../utils/http-status-codes";

export const userRouter_v1 = express.Router();
const prisma = new PrismaClient();

// Fetch all users
userRouter_v1.get("/", async (request: Request, response: Response) => {
  try {
    const users: Types.UserWithRelations[] = await prisma.user.findMany({
      include: { overview: true, logbooks: true, logbookReviews: true },
    });
    const usersWithoutPassword = Helpers.excludeFieldFromUsersObject(users, [
      "password",
    ]);
    response.status(HttpStatusCodes.OK).json(usersWithoutPassword);
  } catch (error) {
    response.status(HttpStatusCodes.NOT_FOUND).json({
      error: "Failed to retrieve accounts. Please refresh the page.",
    });
  }
});

// Fetch one user
userRouter_v1.get("/:id", async (request: Request, response: Response) => {
  try {
    const user: Types.UserWithRelations = await prisma.user.findFirstOrThrow({
      where: { id: Number(request.params.id) },
      include: { overview: true, logbooks: true, logbookReviews: true },
    });
    const userWithoutPassword = Helpers.excludeFieldFromUserObject(user, [
      "password",
    ]);
    response.status(HttpStatusCodes.OK).json(userWithoutPassword);
  } catch (error) {
    response.status(HttpStatusCodes.NOT_FOUND).json({
      error:
        "Failed to find account. Please make sure you've entered the correct information and try again.",
    });
  }
});

// Update a user
userRouter_v1.patch("/:id", async (request: Request, response: Response) => {
  try {
    const userUpdate: Types.UserUpdateData = {
      email: request.body.email,
      username: request.body.username,
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      birthday: request.body.birthday,
      currency: request.body.currency,
      theme: request.body.theme,
      mobileNumber: request.body.mobileNumber,
    };

    const user: Types.UserWithRelations = await prisma.user.update({
      where: { id: Number(request.params.id) },
      data: userUpdate,
      include: { overview: true, logbooks: true, logbookReviews: true },
    });
    const userWithoutPassword = Helpers.excludeFieldFromUserObject(user, [
      "password",
    ]);
    response.status(HttpStatusCodes.OK).json(userWithoutPassword);
  } catch (error) {
    response.status(HttpStatusCodes.BAD_REQUEST).json({
      error:
        "Failed to update account. Please make sure all required fields are correctly filled in and try again.",
    });
  }
});

//; Update user password
userRouter_v1.patch(
  "/:id/updatePassword",
  async (request: Request, response: Response) => {
    try {
      const userWithOldPassword = await prisma.user.findFirstOrThrow({
        where: { id: Number(request.params.id) },
      });
      const oldPasswordsMatch = bcrypt.compareSync(
        request.body.oldPassword,
        userWithOldPassword.password
      );
      if (oldPasswordsMatch) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(
          request.body.newPassword,
          saltRounds
        );
        const userUpdatePasswordData: Types.UserUpdatePasswordData = {
          password: hashedPassword,
        };
        const user: Types.UserWithRelations = await prisma.user.update({
          where: { id: Number(request.params.id) },
          data: userUpdatePasswordData,
          include: { overview: true, logbooks: true, logbookReviews: true },
        });
        const userWithoutPassword = Helpers.excludeFieldFromUserObject(user, [
          "password",
        ]);
        response.status(HttpStatusCodes.OK).json(userWithoutPassword);
      } else {
        response.status(HttpStatusCodes.BAD_REQUEST).json({
          error: "Incorrect old password. Please try again.",
        });
      }
    } catch (error) {
      response.status(HttpStatusCodes.BAD_REQUEST).json({
        error:
          "Failed to update password. Please make sure all required fields are correctly filled in and try again.",
      });
    }
  }
);

// Update only an existing user's `totalMoneySavedToDate` field
userRouter_v1.patch(
  "/:id/totalMoneySavedToDate",
  async (request: Request, response: Response) => {
    // TODO : NEED TO FIX THE LOGIC FOR AUTOMATICALLY HANDLING THE MANUAL UPDATING OF TOTALMONEYSAVEDTODATE AT THE END OF EVERY MONTH.
    // TODO : SET UP A CRON JOB TO HANDLE THIS LOGIC.
    try {
      const totalMoneySavedToDateData: Types.UserTotalMoneySavedToDate = {
        totalMoneySavedToDate: request.body.totalMoneySavedToDate,
      };

      const user: Types.UserWithRelations = await prisma.user.update({
        where: { id: Number(request.params.id) },
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

// Delete a user
userRouter_v1.delete("/:id", async (request: Request, response: Response) => {
  try {
    await prisma.user.delete({
      where: { id: Number(request.params.id) },
    });
    response
      .status(HttpStatusCodes.OK)
      .json({ message: "Account successfully deleted." });
  } catch (error) {
    response.status(HttpStatusCodes.NOT_FOUND).json({
      error: "Failed to delete account. Please refresh the page and try again.",
    });
  }
});
