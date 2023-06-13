import nodemailer from "nodemailer";

export function emailBugReportToKujiraHelp(
  bugReportTitle: string,
  bugReportBody: string | null,
  userId: number,
  username: string
) {
  const message = {
    from: `"KUJIRA BUG REPORT" <${process.env.EMAIL_HELP}>`,
    to: process.env.EMAIL_HELP,
    subject: bugReportTitle,
    html: [
      `<p>Sent by user with ID: <b>${userId}</b> and USERNAME: <b>${username}</b></p>`,
      `<p>${
        bugReportBody || "User did not describe the issue in more detail."
      }</p>`,
    ].join(""),
  };

  const SMTPtransporter = nodemailer.createTransport({
    service: "hotmail",
    secure: false,
    auth: {
      user: process.env.EMAIL_HELP,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: { ciphers: "SSLv3" },
  });

  SMTPtransporter.sendMail(message, function (error: any, information: any) {
    if (error) console.log(error);
    else console.log("Sent Response:", information.response);
  });
}
