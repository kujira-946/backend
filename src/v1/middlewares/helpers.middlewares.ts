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

type RequireAllData = { requireAllData: boolean };
export function checkValidityOfUserInput(
  requiredData: string[],
  { requireAllData }: RequireAllData = { requireAllData: true }
) {
  return function (request: Request, response: Response, next: NextFunction) {
    // ↓↓↓ Data provided by the client. ↓↓↓
    const providedData = Object.keys(request.body);

    // ↓↓↓ If the client's request contains any invalid inputs, we send an error response and terminate the validity check at this stage. ↓↓↓
    const invalidData = _generateInvalidData(requiredData, providedData);
    if (invalidData.length > 0) {
      return HttpHelpers.respondWithClientError(response, "bad request", {
        body: `Invalid data: ${invalidData.join(", ")}.`,
      });
    }
    // ↓↓↓ If the client's request contains only valid inputs, we move onto checking if all required inputs were provided. ↓↓↓
    else {
      if (requireAllData) {
        const missingData = _generateMissingData(requiredData, providedData);
        // ↓↓↓ If the client's request doesn't contain all required inputs, we send an error response and terminate the validity check at this stage. ↓↓↓
        if (missingData.length > 0) {
          return HttpHelpers.respondWithClientError(response, "bad request", {
            body: `Missing data: ${missingData.join(", ")}.`,
          });
        } else {
          // ↓↓↓ If we've reached this point, there are no issues, so we're good to go. ↓↓↓
          return next();
        }
      } else {
        const atLeastOneRequiredInputProvided = _checkAtLeastOneRequiredData(
          requiredData,
          providedData
        );
        if (atLeastOneRequiredInputProvided) {
          // ↓↓↓ If we've reached this point, there are no issues, so we're good to go. ↓↓↓
          return next();
        } else {
          return HttpHelpers.respondWithClientError(response, "bad request", {
            body: "Missing at least one required field. Please provide the missing field and try again.",
          });
        }
      }
    }
  };
}
