import nodemailer from "nodemailer";

export async function sendUserConfirmationEmail(
  email: string,
  subject: string,
  text: string,
  confirmationCode: string
) {
  const SMTPtransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: "cordia.carroll93@ethereal.email",
      pass: "df2NhTpTaj7d6gxPKd",
    },
  });

  const confirmationMessage = {
    from: `"Kujira" <foo@example.com>`,
    to: email,
    subject,
    html: `
      <p>${text}</p>
      <p>This is a test confirmation email. Please copy and paste the following confirmation code into the app: ${confirmationCode}</p>
    `,
  };
  await SMTPtransporter.sendMail(confirmationMessage);
}

export function generateEmailConfirmationCode(): string {
  let confirmationCode = "";
  for (let i = 0; i < 8; i++) {
    confirmationCode += Math.floor(Math.random() * 10);
  }
  return confirmationCode;
}
