export interface Product {
    id?: number,
    code: string;
    name: string;
    stock_name: number | undefined;
    description: string;
    qty_per_order: number;
    price: number;
    date_added?: Date;
    date_updated?: Date;
    status: boolean;
}