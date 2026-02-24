import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import prisma from '../utils/prisma.js';
import nodemailer from 'nodemailer';

export class AuthService {
  static async generateOTP(email: string): Promise<boolean> {
    try {
      if (email === 'admin@test.com' || email === 'investor@test.com' || email === 'Equitrust99@gmail.com') {
        const localOtp = '1234';
        const expirySize = parseInt(process.env.OTP_EXPIRY || '300');
        const expiry = new Date(Date.now() + (expirySize * 1000));
        await prisma.user.update({
          where: { email },
          data: {
            otp: localOtp,
            otpExpires: expiry
          }
        });
        console.log(`[AUTH] Email OTP bypass generated: ${localOtp} for ${email}`);
        return true;
      }

      const localOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expirySize = parseInt(process.env.OTP_EXPIRY || '300');
      const expiry = new Date(Date.now() + (expirySize * 1000));

      await prisma.user.update({
        where: { email },
        data: {
          otp: localOtp,
          otpExpires: expiry
        }
      });

      console.log(`[AUTH] Email OTP generated: ${localOtp} for ${email}`);

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"Eatumy Security" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your Eatumy Login OTP',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #ea580c;">Eatumy Shareholder</h2>
            <p>Hello,</p>
            <p>You have requested to securely log in to your Eatumy account.</p>
            <p>Your One-Time Password (OTP) is:</p>
            <h1 style="background: #f1f5f9; padding: 10px 20px; display: inline-block; letter-spacing: 5px; border-radius: 5px;">${localOtp}</h1>
            <p>This code will expire in ${expirySize / 60} minutes. Please do not share this code with anyone.</p>
            <p>If you did not request this code, please ignore this email.</p>
          </div>
        `
      };

      try {
        console.log(`[AUTH] Attempting to send SMTP email to: "${email}"`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`[AUTH] Email sent: ${info.messageId}`);
        return true;
      } catch (smtpError: any) {
        console.warn(`[AUTH] SMTP Request Error. Falling back to local log. Message: ${smtpError.message}`);
        return true;
      }
    } catch (error: any) {
      console.error("[AUTH] Generate Email OTP Unexpected Error:", error);
      return false;
    }
  }

  static async verifyOTP(email: string, code: string): Promise<boolean> {
    try {
      // Test email bypass (important for Quick Login buttons that skip request-otp)
      if ((email === 'admin@test.com' || email === 'investor@test.com' || email === 'Equitrust99@gmail.com') && code === '1234') {
        console.log(`[AUTH] Test Email OTP verified via bypass for ${email}`);
        return true;
      }

      const user = await prisma.user.findUnique({ where: { email } });

      if (user && user.otp === code && user.otpExpires && new Date() < user.otpExpires) {
        console.log(`[AUTH] Email OTP verified for ${email}`);

        await prisma.user.update({
          where: { email },
          data: { otp: null, otpExpires: null }
        });
        return true;
      }

      console.warn(`[AUTH] OTP verification failed for ${email}`);
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static generateToken(user: any) {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    return jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      secret,
      { expiresIn: '7d' }
    );
  }
}
