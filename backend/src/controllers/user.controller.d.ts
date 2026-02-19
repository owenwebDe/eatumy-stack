import type { Request, Response } from 'express';
export declare class UserController {
    static getAll(req: Request, res: Response): Promise<void>;
    static getProfile(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateKyc(req: Request, res: Response): Promise<void>;
    static addBankAccount(req: any, res: Response): Promise<void>;
}
//# sourceMappingURL=user.controller.d.ts.map