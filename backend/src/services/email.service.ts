import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export class EmailService {
    /**
     * Sends an email alert.
     */
    static async sendEmail({ to, subject, body }: { to: string | string[], subject: string, body: string }) {
        try {
            const mailOptions = {
                from: `"Eatumy System Alerts" <${process.env.SMTP_USER}>`,
                to: Array.isArray(to) ? to.join(', ') : to,
                subject,
                text: body,
                html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #10b981;">Eatumy System Alert</h2>
            <p>${body}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">This is an automated system alert. Please log in to the admin dashboard for details.</p>
          </div>
        `,
            };

            const info = await transporter.sendMail(mailOptions);
            console.log(`[EMAIL_SERVICE] Email sent: ${info.messageId} to ${mailOptions.to}`);
            return info;
        } catch (error) {
            console.error("[EMAIL_SERVICE] Failed to send email:", error);
            throw error;
        }
    }
}
