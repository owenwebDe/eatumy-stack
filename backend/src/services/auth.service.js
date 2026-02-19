import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import prisma from '../utils/prisma.js';
// Simple in-memory OTP store (In production, use Redis)
const otpStore = new Map();
export class AuthService {
    static generateOTP(mobile) {
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = Date.now() + (Number(process.env.OTP_EXPIRY) || 300) * 1000;
        otpStore.set(mobile, { otp, expires: expiry });
        // In dev mode, we log the OTP. In prod, this would trigger an SMS gateway.
        console.log(`[AUTH] OTP for ${mobile}: ${otp}`);
        return otp;
    }
    static verifyOTP(mobile, otp) {
        const record = otpStore.get(mobile);
        if (!record)
            return false;
        if (Date.now() > record.expires) {
            otpStore.delete(mobile);
            return false;
        }
        if (record.otp === otp) {
            otpStore.delete(mobile);
            return true;
        }
        return false;
    }
    static generateToken(user) {
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        return jwt.sign({ id: user.id, role: user.role, mobile: user.mobile }, secret, { expiresIn: '7d' });
    }
}
//# sourceMappingURL=auth.service.js.map