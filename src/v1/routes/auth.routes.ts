import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import * as Middlewares from "../middlewares/auth.middlewares";
import * as UserTypes from "../types/users.types";
import { UserRegistrationData } from "../types/auth.types";
import { excludeFieldFromUserObject } from "../helpers/users.helpers";
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

// Log in a user
authRouter_v1.post("/login", async (request: Request, response: Response) => {
  try {
    const user = await prisma.user.findFirstOrThrow({
      where: {
        username: request.body.username,
      },
    });
    const passwordsMatch = bcrypt.compareSync(
      request.body.password,
      user.password
    );
    const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
    if (!accessTokenSecretKey) {
      response.status(HttpStatusCodes.BAD_REQUEST).json({
        error: "No key.",
      });
    } else if (passwordsMatch) {
      const accessToken = jwt.sign(
        { _id: user.id.toString(), username: user.username },
        accessTokenSecretKey,
        {
          expiresIn: "7 days",
        }
      );
      const userWithoutPassword = excludeFieldFromUserObject(user, [
        "password",
      ]);
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
});
