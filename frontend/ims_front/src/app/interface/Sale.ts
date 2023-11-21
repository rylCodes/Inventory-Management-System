export interface SaleBill {
    id?: number,
    billno?: string,
    time?: string,
    customer_name: string,
    remarks: string,
    grand_total?: number,
}

export interface SaleItem {
    id?: number
    billno?: number | null,
    product_id?: number,
    quantity: number,
    price?: number,
    sale_date?: string,
    sub_total?: number,
}