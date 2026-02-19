import type { Request, Response } from 'express';
export declare class AuthController {
    static requestOTP(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static verifyOTP(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=auth.controller.d.ts.map