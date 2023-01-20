import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

import * as Helpers from "../helpers/users.helpers";
import * as Types from "../types/users.types";
import { HttpStatusCodes } from "../../utils/http-status-codes";

const prisma = new PrismaClient();

// ========================================================================================= //
// [ FETCH ALL USERS ] ===================================================================== //
// ========================================================================================= //

export async function fetchUsersController(
  request: Request,
  response: Response
) {
  try {
    const users: Types.UserWithRelations[] = await prisma.user.findMany({
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

export async function fetchUserController(
  request: Request,
  response: Response
) {
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
// ========================================================================================= //

export async function updateUserController(
  request: Request,
  response: Response
) {
  try {
    const userUpdateData: Types.UserUpdateData = {
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

// ========================================================================================= //
// [ UPDATE A USER'S `totalMoneySavedToDate` FIELD ] ======================================= //
// ========================================================================================= //

// ========================================================================================= //
// [ DELETE A USER ] ======================================================================== //
// ========================================================================================= //
