export interface Product {
    id?: number,
    code?: number,
    stock_id?: number,
    qty_per_order: number,
    date_added?: string,
}

export interface Menu {
    id?: number,
    code?: string,
    name: string,
    description: string,
    category: string,
    price: number,
    date_added?: string,
    date_updated?: string,
    status: boolean,
}