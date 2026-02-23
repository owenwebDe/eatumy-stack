import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  static async requestOTP(req: Request, res: Response) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    try {
      console.log(`[AUTH] Request OTP for email: "${email}"`);
      const user = await prisma.user.findUnique({ where: { email } });

      const isTestEmail = email === 'admin@test.com' || email === 'investor@test.com' || email === 'Equitrust99@gmail.com';
      if (!user && !isTestEmail) {
        console.warn(`[AUTH] Account not found for email: ${email}`);
        return res.status(404).json({ error: 'Account not found. Please contact administration.' });
      }

      const success = await AuthService.generateOTP(email);

      if (success) {
        res.json({ message: 'OTP sent successfully to your email.' });
      } else {
        res.status(500).json({ error: 'Failed to send OTP email. Please try again later.' });
      }
    } catch (error: any) {
      console.error("[AUTH] Request OTP Error:", error);
      res.status(500).json({ error: `Failed to request OTP: ${error.message}` });
    }
  }

  static async verifyOTP(req: Request, res: Response) {
    const { email, otp, forcedRole } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    console.log(`[AUTH] Verifying OTP for email: "${email}"`);

    const isValid = await AuthService.verifyOTP(email, otp);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    try {
      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(404).json({ error: 'Account not found.' });
      }

      const token = AuthService.generateToken(user);

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          mobile: user.mobile,
          email: user.email,
          status: user.status
        }
      });
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
  }

  static async getMe(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          mobile: true,
          email: true,
          role: true,
          status: true,
          walletBalance: true,
          kycStatus: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error("GetMe Error:", error);
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  }
}
