import nodemailer from "nodemailer";

export async function sendUserConfirmationEmail(
  email: string,
  subject: string,
  text: string
) {
  const testAccount = await nodemailer.createTestAccount();

  const SMTPtransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: "cordia.carroll93@ethereal.email",
      pass: "df2NhTpTaj7d6gxPKd",
    },
  });

  const confirmationCode = "473829479";

  const confirmationMessage = {
    from: `"The Express App" <foo@example.com>`,
    to: email,
    subject,
    text: `${text} This is a test confirmation email. Please copy and paste the following confirmation code into the app: ${confirmationCode}`,
  };
  const info = await SMTPtransporter.sendMail(confirmationMessage);

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
