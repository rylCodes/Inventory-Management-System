export interface PurchaseBill {
    id?: number,
    billno: string,
    time: string,
    supplier_id?: number,
    grand_total: number,
    remarks: string,
}

export interface PurchaseItem {
    id?: number,
    stock_id?: number,
    purchaseBill_id?: number,
    purchase_date: string,
    quantity_purchased: number,
    item_price: number,
    sub_total: number,
}