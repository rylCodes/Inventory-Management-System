export interface SaleBill {
    id?: number,
    billno: string,
    time: string,
    customer_name: string,
    remarks: string,
    grand_total: number,
}

export interface SaleItem {
    id?: number
    billno: any,
    product: any,
    quantity_sold: number,
    sale_data: string,
    sub_total: number,
}