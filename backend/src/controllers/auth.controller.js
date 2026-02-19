import prisma from '../utils/prisma.js';
import { AuthService } from '../services/auth.service.js';
export class AuthController {
    static async requestOTP(req, res) {
        const { mobile } = req.body;
        if (!mobile) {
            return res.status(400).json({ error: 'Mobile number is required' });
        }
        // In a real scenario, we might check if user exists or create a placeholder
        // For now, we just send OTP to any mobile
        AuthService.generateOTP(mobile);
        res.json({ message: 'OTP sent successfully' });
    }
    static async verifyOTP(req, res) {
        const { mobile, otp } = req.body;
        if (!mobile || !otp) {
            return res.status(400).json({ error: 'Mobile and OTP are required' });
        }
        const isValid = AuthService.verifyOTP(mobile, otp);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }
        // Find or Create User
        let user = await prisma.user.findUnique({ where: { mobile } });
        if (!user) {
            // Auto-register as INVESTOR if not found (optional, depends on policy)
            user = await prisma.user.create({
                data: {
                    mobile,
                    name: 'New Shareholder', // Placeholder name
                    role: 'INVESTOR'
                }
            });
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
    }
}
//# sourceMappingURL=auth.controller.js.map