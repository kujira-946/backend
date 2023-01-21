import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

import * as Helpers from "../helpers/users.helpers";
import * as Types from "../types/users.types";
import { HttpStatusCodes } from "../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH ALL USERS ] ===================================================================== //
// ========================================================================================= //

export async function fetchUsers(request: Request, response: Response) {
  try {
    const users: Types.UserWithRelations[] = await prisma.user.findMany({
      orderBy: { id: "asc" },
      include: { overview: true, logbooks: true, logbookReviews: true },
    });
    const usersWithoutPassword = Helpers.excludeFieldFromUsersObject(users, [
      "password",
    ]);
    return response.status(HttpStatusCodes.OK).json(usersWithoutPassword);
  } catch (error) {
    return response.status(HttpStatusCodes.NOT_FOUND).json({
      error: "Failed to retrieve accounts. Please refresh the page.",
    });
  }
}

// ========================================================================================= //
// [ FETCH ONE USER ] ====================================================================== //
// ========================================================================================= //

export async function fetchUser(request: Request, response: Response) {
  try {
    const user: Types.UserWithRelations = await prisma.user.findUniqueOrThrow({
      where: { id: Number(request.params.userId) },
      include: { overview: true, logbooks: true, logbookReviews: true },
    });
    const userWithoutPassword = Helpers.excludeFieldFromUserObject(user, [
      "password",
    ]);
    return response.status(HttpStatusCodes.OK).json(userWithoutPassword);
  } catch (error) {
    return response.status(HttpStatusCodes.NOT_FOUND).json({
      error:
        "Failed to find account. Please make sure you've entered the correct information and try again.",
    });
  }
}

// ========================================================================================= //
// [ UPDATE A USER ] ======================================================================= //
// [ `password` & `totalMoneySavedToDate` UPDATE IS HANDLED BY ANOTHER CONTROLLER ] ======== //
// ========================================================================================= //

export async function updateUser(request: Request, response: Response) {
  try {
    const userUpdateData: Partial<Types.UserUpdateData> = {
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
      data: userUpdateData,
      include: { overview: true, logbooks: true, logbookReviews: true },
    });
    const userWithoutPassword = Helpers.excludeFieldFromUserObject(user, [
      "password",
    ]);
    return response.status(HttpStatusCodes.OK).json(userWithoutPassword);
  } catch (error) {
    return response.status(HttpStatusCodes.BAD_REQUEST).json({
      error:
        "Failed to update account. Please make sure all required fields are correctly filled in and try again.",
    });
  }
}

// ========================================================================================= //
// [ UPDATE A USER'S PASSWORD ] ============================================================ //
// ========================================================================================= //

export async function updateUserPassword(request: Request, response: Response) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      request.body.newPassword,
      saltRounds
    );

    const userUpdatePasswordData: Types.UserUpdatePasswordData = {
      password: hashedPassword,
    };

    const user: Types.UserWithRelations = await prisma.user.update({
      where: { id: Number(request.params.userId) },
      data: userUpdatePasswordData,
      include: { overview: true, logbooks: true, logbookReviews: true },
    });
    const userWithoutPassword = Helpers.excludeFieldFromUserObject(user, [
      "password",
    ]);
    return response.status(HttpStatusCodes.OK).json(userWithoutPassword);
  } catch (error) {
    return response.status(HttpStatusCodes.BAD_REQUEST).json({
      error:
        "Failed to update password. Please make sure all required fields are correctly filled in and try again.",
    });
  }
}

// ========================================================================================= //
// [ UPDATE A USER'S `totalMoneySavedToDate` FIELD ] ======================================= //
// ========================================================================================= //

export async function updateUserTotalMoneySavedToDate(
  request: Request,
  response: Response
) {
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
    return response.status(HttpStatusCodes.OK).json(userWithoutPassword);
  } catch (error) {
    return response.status(HttpStatusCodes.BAD_REQUEST).json({
      error:
        "Failed to update your total money saved to date. Please refresh the page.",
    });
  }
}

// ========================================================================================= //
// [ DELETE A USER ] ======================================================================== //
// ========================================================================================= //

export async function deleteUser(request: Request, response: Response) {
  try {
    await prisma.user.delete({
      where: { id: Number(request.params.userId) },
    });
    return response
      .status(HttpStatusCodes.OK)
      .json({ message: "Account successfully deleted." });
  } catch (error) {
    return response.status(HttpStatusCodes.NOT_FOUND).json({
      error: "Failed to delete account. Please refresh the page and try again.",
    });
  }
}
