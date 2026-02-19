import type { Request, Response } from 'express';
export declare class FinancialController {
    static allocateProfit(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static requestWithdrawal(req: any, res: Response): Promise<void>;
    static getPendingWithdrawals(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=finance.controller.d.ts.map