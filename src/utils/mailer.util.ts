import nodemailer from 'nodemailer';

interface OtpEmailOptions {
  to: string;
  otpCode: string;
  expiresInMinutes: number;
  purpose: 'registration' | 'forgot-password' | 'resend';
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Sends a secure verification OTP code to a user.
 */
export const sendOtpEmail = async ({
  to,
  otpCode,
  expiresInMinutes,
  purpose
}: OtpEmailOptions): Promise<void> => {
  const appName = process.env.APP_NAME || 'Our App';

  const subjectMap = {
    registration: `[${appName}] Verify your registration`,
    'forgot-password': `[${appName}] Reset your password`,
    resend: `[${appName}] Verification Code`
  };

  const titleMap = {
    registration: 'Verify Your Registration',
    'forgot-password': 'Reset Your Password',
    resend: 'Verification Code'
  };

  const actionMap = {
    registration: 'complete your registration',
    'forgot-password': 'reset your password',
    resend: 'continue your action'
  };

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #333;">${titleMap[purpose]}</h2>
      <p style="font-size: 16px; color: #555;">Use the following security code to ${actionMap[purpose]}:</p>
      <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 4px; border-radius: 4px; color: #000;">
        ${otpCode}
      </div>
      <p style="font-size: 13px; color: #888; margin-top: 15px;">
        This code is confidential and will expire in <strong>${expiresInMinutes} minutes</strong>.
      </p>
    </div>
  `;

  const textContent = `Your ${appName} ${purpose.replace('-', ' ')} code is: ${otpCode}. It expires in ${expiresInMinutes} minutes.`;

  await transporter.sendMail({
    from: `"${appName}" <${process.env.SMTP_USER}>`,
    to,
    subject: subjectMap[purpose],
    text: textContent,
    html: htmlContent
  });
};
