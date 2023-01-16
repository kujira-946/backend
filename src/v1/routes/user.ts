import express, { Request, Response } from "express";

export const userRouter_v1 = express.Router();

userRouter_v1.get("/", (request: Request, response: Response) => {
  // throw new Error("This is a test error");
  response.send("Fetch all users");
});

userRouter_v1.get("/:id", (request: Request, response: Response) => {
  console.log("Request Params:", request.params);
  response.send(`Fetch one user with id: ${request.params.id}`);
});

userRouter_v1.post("/", (request: Request, response: Response) => {
  response.send("Create new user");
});

userRouter_v1.patch("/:id", (request: Request, response: Response) => {
  response.send(`Update user based with id: ${request.params.id}`);
});

userRouter_v1.delete("/:id", (request: Request, response: Response) => {
  response.send(`Delete user with id: ${request.params.id}`);
});
