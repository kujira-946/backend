import { NextFunction, Request, Response } from "express";

import * as HttpHelpers from "../helpers/http.helpers";

// ========================================================================================= //
// [ MAKES SURE THE CLIENT HAS INPUTTED ALL FIELDS REQUIRED BY ENDPOINT ] ================== //
// ========================================================================================= //

function _generateInvalidData(
  providedData: string[],
  requiredData: string[],
  optionalCreateData?: string[]
): string[] {
  return providedData.filter((providedClientData: string) => {
    return (
      !requiredData.includes(providedClientData) &&
      !optionalCreateData?.includes(providedClientData)
    );
  });
}

function _generateMissingCreateData(
  providedData: string[],
  requiredData: string[]
): string[] {
  return requiredData.filter((expectedClientData: string) => {
    return !providedData.includes(expectedClientData);
  });
}

function _checkAtLeastOneRequiredData(
  providedData: string[],
  requiredData: string[]
): boolean {
  for (let index = 0; index < providedData.length; index++) {
    const providedClientData = providedData[index];
    return requiredData.includes(providedClientData);
  }
  return false;
}

function _handleCreate(
  response: Response,
  next: NextFunction,
  providedData: string[],
  requiredData: string[]
) {
  const missingData = _generateMissingCreateData(providedData, requiredData);
  // ↓↓↓ If the client's request doesn't contain all required inputs, we send an error response and terminate the validity check at this stage. ↓↓↓
  if (missingData.length === 0) {
    return next();
  } else {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: `Missing data: ${missingData.join(", ")}.`,
    });
  }
}

function _handleUpdate(
  response: Response,
  next: NextFunction,
  providedData: string[],
  requiredData: string[]
) {
  const atLeastOneRequiredDataProvided = _checkAtLeastOneRequiredData(
    providedData,
    requiredData
  );
  if (atLeastOneRequiredDataProvided) {
    return next();
  } else {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: "Missing at least one required field. Please provide the missing field and try again.",
    });
  }
}

type Options = { isHttpPost: boolean };
const defaultOptions: Options = { isHttpPost: true };

export function validateUserData(
  requiredData: string[],
  options: Options = defaultOptions,
  optionalCreateData?: string[]
) {
  return function (request: Request, response: Response, next: NextFunction) {
    const providedData = Object.keys(request.body); // Data provided by the client.

    // ↓↓↓ If the client's request contains any invalid inputs, we send an error response and terminate the validity check at this stage. ↓↓↓
    const invalidData = _generateInvalidData(
      providedData,
      requiredData,
      optionalCreateData
    );
    if (invalidData.length > 0) {
      return HttpHelpers.respondWithClientError(response, "bad request", {
        body: `Invalid data: ${invalidData.join(", ")}.`,
      });
    }

    // ↓↓↓ If the client's request contains only valid inputs, we move onto checking if all required inputs were provided. ↓↓↓
    else {
      if (options.isHttpPost) {
        return _handleCreate(response, next, providedData, requiredData);
      } else {
        return _handleUpdate(response, next, providedData, requiredData);
      }
    }
  };
}
