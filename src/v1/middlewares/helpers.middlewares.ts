import { NextFunction, Request, Response } from "express";

import * as HttpHelpers from "../helpers/http.helpers";

// ========================================================================================= //
// [ MAKES SURE THE CLIENT HAS INPUTTED ALL FIELDS REQUIRED BY ENDPOINT ] ================== //
// ========================================================================================= //

function _generateInvalidData(
  requiredData: string[],
  providedData: string[]
): string[] {
  return providedData.filter((providedClientInput: string) => {
    return !requiredData.includes(providedClientInput);
  });
}

function _generateMissingData(
  requiredData: string[],
  providedData: string[]
): string[] {
  return requiredData.filter((expectedClientInput: string) => {
    return !providedData.includes(expectedClientInput);
  });
}

function _checkAtLeastOneRequiredData(
  requiredData: string[],
  providedData: string[]
): boolean {
  for (let index = 0; index < providedData.length; index++) {
    const providedClientInput = providedData[index];
    return requiredData.includes(providedClientInput);
  }
  return false;
}

function _handleRequiredData(
  response: Response,
  next: NextFunction,
  requiredData: string[],
  providedData: string[]
) {
  const missingData = _generateMissingData(requiredData, providedData);
  // ↓↓↓ If the client's request doesn't contain all required inputs, we send an error response and terminate the validity check at this stage. ↓↓↓
  if (missingData.length === 0) {
    return next();
  } else {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: `Missing data: ${missingData.join(", ")}.`,
    });
  }
}

function _handleOptionalData(
  response: Response,
  next: NextFunction,
  requiredData: string[],
  providedData: string[]
) {
  const atLeastOneRequiredInputProvided = _checkAtLeastOneRequiredData(
    requiredData,
    providedData
  );
  if (atLeastOneRequiredInputProvided) {
    return next();
  } else {
    return HttpHelpers.respondWithClientError(response, "bad request", {
      body: "Missing at least one required field. Please provide the missing field and try again.",
    });
  }
}

type Options = { requireAllData: boolean };
const defaultOptions: Options = { requireAllData: true };

export function checkValidityOfUserInput(
  requiredData: string[],
  options: Options = defaultOptions
) {
  return function (request: Request, response: Response, next: NextFunction) {
    const providedData = Object.keys(request.body); // Data provided by the client.

    // ↓↓↓ If the client's request contains any invalid inputs, we send an error response and terminate the validity check at this stage. ↓↓↓
    const invalidData = _generateInvalidData(requiredData, providedData);
    if (invalidData.length > 0) {
      return HttpHelpers.respondWithClientError(response, "bad request", {
        body: `Invalid data: ${invalidData.join(", ")}.`,
      });
    }

    // ↓↓↓ If the client's request contains only valid inputs, we move onto checking if all required inputs were provided. ↓↓↓
    else {
      if (options.requireAllData) {
        return _handleRequiredData(response, next, requiredData, providedData);
      } else {
        return _handleOptionalData(response, next, requiredData, providedData);
      }
    }
  };
}
