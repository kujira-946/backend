import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

import * as Types from "../types/users.types";
import * as Helpers from "../helpers/users.helpers";
import * as HttpHelpers from "../helpers/http.helpers";
import { HttpStatusCodes } from "../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH ALL USERS ] ===================================================================== //
// ========================================================================================= //

export async function fetchUsers(_: Request, response: Response) {
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
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: "Failed to retrieve accounts. Please refresh the page.",
    });
  }
}

// ========================================================================================= //
// [ FETCH ONE USER ] ====================================================================== //
// ========================================================================================= //

export async function fetchUser(
  request: Request<{ userId: string }>,
  response: Response
) {
  try {
    const user: Types.UserWithRelations = await prisma.user.findUniqueOrThrow({
      where: { id: Number(request.params.userId) },
      include: { overview: true, logbooks: true, logbookReviews: true },
    });
    const userWithoutPassword = Helpers.removePasswordFromUserObject(user);
    return response.status(HttpStatusCodes.OK).json(userWithoutPassword);
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: "Failed to find account. Please make sure you've entered the correct information and try again.",
    });
  }
}

// ========================================================================================= //
// [ UPDATE A USER ] ======================================================================= //
// [ `password` & `totalMoneySavedToDate` UPDATE IS HANDLED BY ANOTHER CONTROLLER ] ======== //
// ========================================================================================= //

export async function updateUser(
  request: Request<{ userId: string }, {}, Types.UserUpdateData>,
  response: Response
) {
  try {
    const userUpdateData: Types.UserUpdateData = {
      email: request.body.email,
      username: request.body.username?.toLowerCase(),
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
    const userWithoutPassword = Helpers.removePasswordFromUserObject(user);
    return response.status(HttpStatusCodes.OK).json(userWithoutPassword);
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: "Failed to update account. Please make sure all required fields are correctly filled in and try again.",
    });
  }
}

// ========================================================================================= //
// [ UPDATE A USER'S PASSWORD ] ============================================================ //
// ========================================================================================= //

export async function updateUserPassword(
  request: Types.RequestWithUserPasswords,
  response: Response
) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      request.body.newPassword,
      saltRounds
    );
    const userUpdatePasswordData: Types.UserUpdatePasswordData = {
      password: hashedPassword,
    };

    await prisma.user.update({
      where: { id: Number(request.params.userId) },
      data: userUpdatePasswordData,
      include: { overview: true, logbooks: true, logbookReviews: true },
    });
    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: "Password successfully updated.",
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: "Failed to update password. Please make sure all required fields are correctly filled in and try again.",
    });
  }
}

// ========================================================================================= //
// [ UPDATE A USER'S `totalMoneySavedToDate` FIELD ] ======================================= //
// ========================================================================================= //

export async function updateUserTotalMoneySavedToDate(
  request: Request<{ userId: string }, {}, Types.UserTotalMoneySavedToDate>,
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
    const { totalMoneySavedToDate } =
      Helpers.removePasswordFromUserObject(user);
    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: "Your total money saved to date has been updated.",
      totalMoneySavedToDate,
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: "Failed to update your total money saved to date. Please refresh the page and try again.",
    });
  }
}

// ========================================================================================= //
// [ DELETE A USER ] ======================================================================== //
// ========================================================================================= //

export async function deleteUser(
  request: Request<{ userId: string }>,
  response: Response
) {
  try {
    await prisma.user.delete({
      where: { id: Number(request.params.userId) },
    });
    return HttpHelpers.respondWithSuccess(response, "ok", {
      body: "Account successfully deleted.",
    });
  } catch (error) {
    return HttpHelpers.respondWithClientError(response, "not found", {
      body: "Failed to delete account. Please refresh the page and try again.",
    });
  }
}
