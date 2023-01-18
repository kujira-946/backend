import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";
import bcrypt from "bcrypt";

import * as UserTypes from "../types/users.types";
import { HttpStatusCodes } from "../../utils/http-status-codes";

export const authRouter_v1 = express.Router();
const prisma = new PrismaClient();

// Register (create) a user
authRouter_v1.post(
  "/register",
  async (request: Request, response: Response) => {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(
        request.body.password,
        saltRounds
      );

      const userCreateData: UserTypes.UserCreateData = {
        email: request.body.email,
        username: request.body.username,
        password: hashedPassword,
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        birthday: request.body.birthday,
        currency: request.body.currency,
      };

      const user: UserTypes.UserWithRelations = await prisma.user.create({
        data: userCreateData,
        include: { overview: true, logbooks: true, logbookReviews: true },
      });
      response.status(HttpStatusCodes.CREATED).json(user);
    } catch (error) {
      response.status(HttpStatusCodes.BAD_REQUEST).json({
        error:
          "Failed to register. Please make sure all required fields are correctly filled in and try again.",
      });
    }
  }
);

// Log in a user
authRouter_v1.post("/login", async (request: Request, response: Response) => {
  try {
    const user = await prisma.user.findFirstOrThrow({
      where: {
        username: request.body.username,
      },
    });

    const passwordsMatch = await bcrypt.compareSync(
      request.body.password,
      user.password
    );

    if (passwordsMatch) {
      response.status(HttpStatusCodes.OK).json(user);
    } else {
      response.status(HttpStatusCodes.BAD_REQUEST).json({
        error:
          "Incorrect password. Please enter the correct password and try again.",
      });
    }
  } catch (error) {
    response.status(HttpStatusCodes.BAD_REQUEST).json({
      error:
        "Failed to log in. Please make sure all required fields are correctly filled in and try again.",
    });
  }
});

// Log out a user
authRouter_v1.post("/logout", async (request: Request, response: Response) => {
  try {
    response.status(HttpStatusCodes.OK).json("foo");
  } catch (error) {
    response.status(HttpStatusCodes.BAD_REQUEST).json({
      error: "Failed to log out. Please refresh the page and try again.",
    });
  }
});
