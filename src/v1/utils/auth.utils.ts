export enum AuthSuccesses {
  ACCOUNT_VERIFICATION_SUCCESS = "Account verification successful!",
}

export enum AuthErrors {
  INCORRECT_VERIFICATION_CODE = "You've supplied an incorrect verification code. Please enter the correct code and try again. If your code has expired, please request a new verification code.",
  ACCOUNT_NOT_FOUND = "Account does not exist. Please register to create a new account.",
}
