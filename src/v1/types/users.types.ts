import { Request } from "express";

export type RequestWithUserPasswords = Request<
  { userId: string },
  {},
  { oldPassword: string; newPassword: string }
>;
