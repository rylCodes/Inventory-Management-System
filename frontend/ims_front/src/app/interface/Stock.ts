export interface Stock {
    code?: string;
    name: string;
    description: string;
    quantity: number;
    unit: string;
    date_added: Date;
    date_updated: Date;
    status: number;
    performSale: (param: any) => void;
    performPurchase: (param: any) => void;
}