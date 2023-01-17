import { PrismaClient } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";

import * as Types from "../types/users";

export const userRouter_v1 = express.Router();
const prisma = new PrismaClient();

userRouter_v1.get(
  "/",
  async (request: Request, response: Response, next: NextFunction) => {
    // throw new Error("This is a test error");
    try {
      const users = await prisma.user.findMany({
        include: { overview: true, logbooks: true, logbookReviews: true },
      });
      response.json(users);
    } catch (error) {
      next(error);
    }
  }
);

userRouter_v1.get(
  "/:userId",
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findFirstOrThrow({
        where: { id: Number(request.params.userId) },
        include: { overview: true, logbooks: true, logbookReviews: true },
      });
      response.json(user);
    } catch (error) {
      next(error);
    }
  }
);

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
      const user = await prisma.user.create({ data: userCreateData });
      response.json(user);
    } catch (error) {
      next(error);
    }
  }
);

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
      const user = await prisma.user.update({
        where: { id: Number(request.params.userId) },
        data: userPatchData,
      });
      response.json(user);
    } catch (error) {
      next(error);
    }
  }
);

userRouter_v1.patch(
  "/:userId/totalMoneySavedToDate",
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const totalMoneySavedToDateData: Types.UserTotalMoneySavedToDate = {
        totalMoneySavedToDate: request.body.totalMoneySavedToDate,
      };
      const user = await prisma.user.update({
        where: { id: Number(request.params.userId) },
        data: totalMoneySavedToDateData,
      });
      response.json(user);
    } catch (error) {
      next(error);
    }
  }
);

userRouter_v1.delete(
  "/:userId",
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.delete({
        where: { id: Number(request.params.userId) },
      });
      response.json(user);
    } catch (error) {
      next(error);
    }
  }
);
