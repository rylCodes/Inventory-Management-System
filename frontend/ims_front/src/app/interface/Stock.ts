export interface Stock {
    id?: number,
    code: string,
    stock_name: string,
    description: string,
    quantity: number,
    unit: string,
    date_added?: Date,
    date_updated?: Date,
    status: boolean,
}