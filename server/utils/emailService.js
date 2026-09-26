const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendPasswordResetEmail = async (email, resetLink) => {
  const mailOptions = {
    from: `"MindCare AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your MindCare AI password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; color: #333;">
        
        <h2 style="color: #4f46e5;">🧠 MindCare AI</h2>

        <p>Hello,</p>

        <p>
          We received a request to reset your MindCare AI account password.
        </p>

        <p>
          Click the button below to create a new password:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a
            href="${resetLink}"
            style="
              background-color: #4f46e5;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              display: inline-block;
            "
          >
            Reset Password
          </a>
        </div>

        <p>
          This link will expire in <strong>15 minutes</strong>.
        </p>

        <p>
          If you did not request a password reset, you can safely ignore this email.
        </p>

        <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;" />

        <p style="font-size: 12px; color: #777;">
          This is an automated email from MindCare AI. Please do not reply.
        </p>

      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendPasswordResetEmail,
};