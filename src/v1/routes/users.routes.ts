import { PrismaClient } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";

import * as Types from "../types/users.types";

export const userRouter_v1 = express.Router();
const prisma = new PrismaClient();

// Fetch all users
userRouter_v1.get(
  "/",
  async (request: Request, response: Response, next: NextFunction) => {
    // throw new Error("This is a test error");
    try {
      const users: Types.UserWithRelations[] = await prisma.user.findMany({
        include: { overview: true, logbooks: true, logbookReviews: true },
      });
      response.json(users);
    } catch (error) {
      next(new Error("Failed to retrieve users. Please refresh the page."));
    }
  }
);

// Fetch one user
userRouter_v1.get(
  "/:userId",
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user: Types.UserWithRelations = await prisma.user.findFirstOrThrow({
        where: { id: Number(request.params.userId) },
        include: { overview: true, logbooks: true, logbookReviews: true },
      });
      response.json(user);
    } catch (error) {
      next(
        new Error(
          "There was an error in finding the account. Please make sure you've entered the correct information and try again."
        )
      );
    }
  }
);

// Create a  user
userRouter_v1.post(
  "/",
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const userCreateData: Types.UserCreateData = {
        email: request.body.email,
        username: request.body.username,
        password: request.body.password,
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        birthday: request.body.birthday,
        currency: request.body.currency,
      };
      const user: Types.UserWithRelations = await prisma.user.create({
        data: userCreateData,
        include: { overview: true, logbooks: true, logbookReviews: true },
      });
      response.json(user);
    } catch (error) {
      next(
        new Error(
          "There was an error in creating your account. Please make sure all required fields are correctly filled in and try again."
        )
      );
    }
  }
);

// Update a user
userRouter_v1.patch(
  "/:userId",
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const userPatchData: Types.UserUpdateData = {
        email: request.body.email,
        username: request.body.username,
        password: request.body.password,
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        birthday: request.body.birthday,
        currency: request.body.currency,
        theme: request.body.theme,
        mobileNumber: request.body.mobileNumber,
      };
      const user: Types.UserWithRelations = await prisma.user.update({
        where: { id: Number(request.params.userId) },
        data: userPatchData,
        include: { overview: true, logbooks: true, logbookReviews: true },
      });
      response.json(user);
    } catch (error) {
      next(
        new Error(
          "There was an error in updating your account. Please try again. If the problem persists, please reach out to an admin immediately."
        )
      );
    }
  }
);

// Update only an existing user's `totalMoneySavedToDate` field
userRouter_v1.patch(
  "/:userId/totalMoneySavedToDate",
  async (request: Request, response: Response, next: NextFunction) => {
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
      response.json(user);
    } catch (error) {
      next(
        new Error(
          "There was an error in updating your total money saved to date. Please refresh the page. If the problem persists, please reach out to an admin immediately."
        )
      );
    }
  }
);

// Delete a user
userRouter_v1.delete(
  "/:userId",
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user: Types.UserWithRelations = await prisma.user.delete({
        where: { id: Number(request.params.userId) },
        include: { overview: true, logbooks: true, logbookReviews: true },
      });
      response.json(user);
    } catch (error) {
      next(
        new Error(
          "There was an error in deleting your account. Please refresh the page and try again."
        )
      );
    }
  }
);
