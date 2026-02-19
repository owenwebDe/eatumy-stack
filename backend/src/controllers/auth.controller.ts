import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  static async requestOTP(req: Request, res: Response) {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    try {
      const user = await prisma.user.findUnique({ where: { mobile } });
      if (!user) {
        return res.status(404).json({ error: 'Account not found. Please contact administration.' });
      }

      // Generate and "send" OTP
      AuthService.generateOTP(mobile);
      res.json({ message: 'OTP sent successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to request OTP' });
    }
  }

  static async verifyOTP(req: Request, res: Response) {
    const { mobile, otp, forcedRole } = req.body;
    console.log(`[AUTH] Verify OTP Request - Mobile: ${mobile}, OTP: ${otp}`);

    if (!mobile || !otp) {
      return res.status(400).json({ error: 'Mobile and OTP are required' });
    }

    const isValid = AuthService.verifyOTP(mobile, otp);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    try {
      let user = await prisma.user.findUnique({ where: { mobile } });

      if (!user) {
        return res.status(404).json({ error: 'Account not found.' });
      }

      if (forcedRole && user.role !== forcedRole) {
          // Strict Role Check for Admin Panel vs Shareholder App separation
          // Ideally, we might just return the user and let frontend handle redirect, 
          // but for security, maybe we deny login if trying to access admin as investor?
          // For now, we will allow login but the frontend receiving the user object 
          // should act accordingly.
      }

      const token = AuthService.generateToken(user);

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          mobile: user.mobile,
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
