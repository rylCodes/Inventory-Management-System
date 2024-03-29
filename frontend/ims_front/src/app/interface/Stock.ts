export interface Stock {
    id?: number,
    code?: string,
    stock_name: string,
    description: string,
    quantity: number,
    unit: string,
    date_added?: string,
    date_updated?: string,
    status: boolean,
    qty_alert_level: number,
    show_notification: boolean,
}