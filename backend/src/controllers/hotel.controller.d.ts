import type { Request, Response } from 'express';
export declare class HotelController {
    static getAll(req: Request, res: Response): Promise<void>;
    static getById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static create(req: Request, res: Response): Promise<void>;
    static update(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=hotel.controller.d.ts.map