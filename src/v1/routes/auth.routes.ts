import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import * as UserTypes from "../types/users.types";
import { HttpStatusCodes } from "../../utils/http-status-codes";
import { UserRegistrationData } from "../types/auth.types";
import {
  RequestWithUser,
  checkEmailDuringRegistration,
  checkUsernameDuringLogin,
  checkUsernameDuringRegistration,
  checkEmailAndUsernameDuringRegistration,
} from "../middlewares/auth.middlewares";
import { excludeFieldFromUserObject } from "../helpers/users.helpers";

export const authRouter_v1 = express.Router();
const prisma = new PrismaClient();

// Register (create) a user
authRouter_v1.post(
  "/register",
  checkEmailAndUsernameDuringRegistration,
  async (request: Request, response: Response) => {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(
        request.body.password,
        saltRounds
      );

      const userRegistrationData: UserRegistrationData = {
        email: request.body.email,
        username: request.body.username,
        password: hashedPassword,
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        birthday: request.body.birthday,
        currency: request.body.currency,
      };

      const user: UserTypes.UserWithRelations = await prisma.user.create({
        data: userRegistrationData,
        include: { overview: true, logbooks: true, logbookReviews: true },
      });
      const userWithoutPassword = excludeFieldFromUserObject(user, [
        "password",
      ]);
      response.status(HttpStatusCodes.CREATED).json(userWithoutPassword);
    } catch (error) {
      response.status(HttpStatusCodes.BAD_REQUEST).json({
        error:
          "Failed to register. Please make sure all required fields are correctly filled in and try again.",
      });
    }
  }
);

// Checking existence of email during registration
authRouter_v1.get(
  "/register/check-username",
  async (request: Request, response: Response) => {
    const userByUsername = await prisma.user.findUnique({
      where: { username: request.body.username },
    });
    if (userByUsername) {
      response.status(HttpStatusCodes.BAD_REQUEST).json({
        error: "An account with that email already exists. Please try again.",
      });
    } else {
      response
        .status(HttpStatusCodes.OK)
        .json({ success: "Username available." });
    }
  }
);

// Log in a user
authRouter_v1.post(
  "/login",
  checkUsernameDuringLogin,
  async (request: Request, response: Response) => {
    try {
      const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
      const passwordsMatch = bcrypt.compareSync(
        request.body.password,
        (request as RequestWithUser).existingUser.password
      );

      if (!accessTokenSecretKey) {
        response.status(HttpStatusCodes.BAD_REQUEST).json({
          error: "Something went wrong.",
        });
      } else if (passwordsMatch) {
        const accessToken = jwt.sign(
          {
            _id: (request as RequestWithUser).existingUser.id.toString(),
            username: (request as RequestWithUser).existingUser.username,
          },
          accessTokenSecretKey,
          { expiresIn: request.body.thirtyDays ? "30 days" : "7 days" }
        );
        const userWithoutPassword = excludeFieldFromUserObject(
          (request as RequestWithUser).existingUser,
          ["password"]
        );
        response
          .status(HttpStatusCodes.OK)
          .json({ user: userWithoutPassword, accessToken });
      } else {
        response.status(HttpStatusCodes.BAD_REQUEST).json({
          error: "Incorrect password. Please try again.",
        });
      }
    } catch (error) {
      response.status(HttpStatusCodes.BAD_REQUEST).json({
        error:
          "Failed to log in. Please make sure all required fields are correctly filled in and try again.",
      });
    }
  }
);
