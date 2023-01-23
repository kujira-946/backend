import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export async function sendUserConfirmationEmail(
  email: string,
  subject: string,
  text: string,
  confirmationCode: string
) {
  let testAccount = await nodemailer.createTestAccount();

  const SMTPtransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const confirmationMessage = {
    from: `"Kujira" <foo@example.com>`,
    to: email,
    subject,
    html: `
      <p>${text}</p>
      <p>Please copy and paste the following confirmation code into the app: ${confirmationCode}</p>
    `,
  };
  const info = await SMTPtransporter.sendMail(confirmationMessage);

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

export function generateEmailConfirmationCode(secretKey: string): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += Math.floor(Math.random() * 10);
  }
  const confirmationCode = jwt.sign({ code }, secretKey, {
    expiresIn: "5m",
  });
  return confirmationCode;
}
