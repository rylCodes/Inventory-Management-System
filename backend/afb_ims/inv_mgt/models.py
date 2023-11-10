from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F
from django.utils import timezone

# Status Fields Option
STATUS_CHOICES = ((True, "Active"), (False, "Inactive"))

# STOCK
class Stock(models.Model):
    code = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    quantity = models.FloatField(validators=[MinValueValidator(0)])
    unit = models.CharField(max_length=200)
    date_added = models.DateTimeField(default=timezone.now)
    date_updated = models.DateTimeField(auto_now=True)
    status = models.BooleanField(choices=STATUS_CHOICES, default=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["-date_updated"]

    def perform_sale(self, qty_sold):
        self.quantity += qty_sold
        self.save()

    def perform_purchase(self, qty_purchased):
        self.quantity -= qty_purchased
        self.save()

    def perform_sale(self, qty_sold):
        if qty_sold <= self.quantity:
            Stock.objects.filter(pk=self.pk).update(quantity=F('quantity') - qty_sold)
        else:
            raise ValidationError("Quantity sold is greater than available stock!")

    def perform_purchase(self, qty_purchased):
        Stock.objects.filter(pk=self.pk).update(quantity=F('quantity') + qty_purchased)

# PRODUCT    
class Product(models.Model):
    code = models.CharField(max_length=100)
    name = models.CharField(max_length=200, unique=True)
    stock_name = models.ForeignKey(Stock, on_delete=models.CASCADE)
    description = models.TextField(blank=True, null=True)
    qty_per_order = models.PositiveIntegerField(validators=[MinValueValidator(0)])
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.BooleanField(choices=STATUS_CHOICES, default=True)

    def __str__(self):
        return self.name

# SUPPLIER
class Supplier(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15, unique=True)
    address = models.TextField()
    email = models.EmailField(max_length=100, unique=True)
    status = models.BooleanField(choices=STATUS_CHOICES, default=True)

    def __str__(self):
        return self.name

# PURCHASE BILL
class PurchaseBill(models.Model):
    billno = models.CharField(max_length=100)
    time = models.DateTimeField(auto_now=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name="bills")

    def __str__(self):
        return "Bill no: " + self.billno

    def get_items_list(self):
        return PurchaseItem.objects.filter(billno=self)

    def get_total_price(self):
        purchase_items = PurchaseItem.objects.filter(billno=self)
        total = sum(item.total_price for item in purchase_items)
        return total

# PURCHASE ITEM
class PurchaseItem(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name="purchase_items")
    billno = models.ForeignKey(PurchaseBill, on_delete=models.CASCADE)
    purchase_date = models.DateTimeField(auto_now_add=True)
    quantity_purchased = models.PositiveIntegerField(validators=[MinValueValidator(0)])
    item_price = models.DecimalField(max_digits=10, decimal_places=2)

    def calculate_total_price(self):
        total_price = self.quantity_purchased * self.item_price
        return total_price
    
    def update_stock(self):
        self.stock.perform_purchase(self.quantity_purchased)

    def __str__(self):
        return f"Bill no: {self.billno.billno}, Item = {self.stock.name}"

# SALES BILL
class SalesBill(models.Model):
    billno = models.CharField(max_length=100, unique=True)
    time = models.DateTimeField(auto_now=True)
    customer_name = models.CharField(max_length=200)
    remarks = models.CharField(max_length=100)

    def __str__(self):
        return "Bill no: " + self.billno

    def get_items_list(self):
        sales_items = SalesItem.objects.filter(billno=self)
        total = sum(item.total_price for item in sales_items)
        return total

# SALES ITEM
class SalesItem(models.Model):
    billno = models.ForeignKey(SalesBill, on_delete=models.CASCADE, related_name="sales_items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity_sold = models.PositiveIntegerField(validators=[MinValueValidator(0)])
    sale_date = models.DateTimeField(auto_now_add=True)
    
    def calculate_total_price(self):
        total_price = self.quantity_sold * self.product.price
        return total_price
    
    def update_stock(self):
        stock_qty = self.product.stock_name.quantity
        total_qty = self.quantity_sold * self.product.qty_per_order
        if total_qty > stock_qty:
            raise ValidationError("Quantity sold is greater than available stock!")
        else:
            self.product.stock_name.perform_sale(total_qty)

    def __str__(self):
        return f"{self.quantity_sold} of {self.product.name} on {self.sale_date}"