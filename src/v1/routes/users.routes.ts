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
      next(new Error("Error fetching users. Please try again."));
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
      next(new Error("Cannot find user. Please try again."));
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
          "There was an error when trying to create your account. Please try again."
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
          "There was an error in updating your account. Please try again."
        )
      );
    }
  }
);

// Update only an existing user's `totalMoneySavedToDate` field
userRouter_v1.patch(
  "/:userId/totalMoneySavedToDate",
  async (request: Request, response: Response, next: NextFunction) => {
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
          "There was an error in updating your Total Money Saved To Date. Please refresh the page. If the problem persists, please contact an admin for help."
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
          "There was an error in deleting your account. Please refresh the page and try again. If the problem persists, please contact an admin."
        )
      );
    }
  }
);
