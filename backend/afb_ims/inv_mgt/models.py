from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F
from django.utils import timezone

STATUS_CHOICES = ((True, "Active"), (False, "Inactive"))

# STOCK
class Stock(models.Model):
    code = models.CharField(max_length=100, unique=True)
    stock_name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    quantity = models.FloatField(validators=[MinValueValidator(0)])
    unit = models.CharField(max_length=200)
    date_added = models.DateTimeField(default=timezone.now)
    date_updated = models.DateTimeField(auto_now=True)
    status = models.BooleanField(choices=STATUS_CHOICES, default=True)

    def __str__(self):
        return self.stock_name

# PRODUCT    
class Product(models.Model):
    code = models.CharField(max_length=100)
    product_name = models.CharField(max_length=200, unique=True)
    stock_id = models.ForeignKey(Stock, on_delete=models.CASCADE)
    category = models.TextField(blank=True, null=True)
    qty_per_order = models.FloatField(validators=[MinValueValidator(0)])
    price = models.FloatField(validators=[MinValueValidator(0)])
    date_added = models.DateTimeField(default=timezone.now)
    date_updated = models.DateTimeField(auto_now=True)
    status = models.BooleanField(choices=STATUS_CHOICES, default=True)

    def __str__(self):
        return self.product_name

# SUPPLIER
class Supplier(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15, unique=True)
    address = models.TextField()
    email = models.EmailField(max_length=100, unique=True)
    date_added = models.DateTimeField(default=timezone.now)
    date_updated = models.DateTimeField(auto_now=True)
    status = models.BooleanField(choices=STATUS_CHOICES, default=True)

    def __str__(self):
        return self.name

# PURCHASE BILL
class PurchaseBill(models.Model):
    billno = models.CharField(max_length=100)
    time = models.DateTimeField(auto_now=True)
    supplier_id = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name="bills")
    grand_total = models.FloatField(validators=[MinValueValidator(0)], default=0)

    def __str__(self):
        return "Bill no: " + self.billno

# PURCHASE ITEM
class PurchaseItem(models.Model):
    stock_id = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name="purchase_items")
    purchaseBill_id = models.ForeignKey(PurchaseBill, on_delete=models.CASCADE)
    purchase_date = models.DateTimeField(auto_now_add=True)
    quantity_purchased = models.FloatField(validators=[MinValueValidator(0)])
    item_price = models.FloatField(validators=[MinValueValidator(0)])
    sub_total = models.FloatField(validators=[MinValueValidator(0)], default=0)

    def __str__(self):
        return f"Bill no: {self.purchaseBill_id.billno}, Item = {self.stock_id.stock_name}"


# SALES BILL
class SalesBill(models.Model):
    billno = models.CharField(max_length=100, unique=True)
    time = models.DateTimeField(auto_now=True)
    customer_name = models.CharField(max_length=200)
    remarks = models.CharField(max_length=100)
    grand_total = models.FloatField(validators=[MinValueValidator(0)], default=0)

    def __str__(self):
        return "Bill no: " + self.billno

# SALES ITEM
class SalesItem(models.Model):
    billno = models.ForeignKey(SalesBill, on_delete=models.CASCADE, related_name="sales_items", blank=True, null=True)
    product_id = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.FloatField(validators=[MinValueValidator(0)])
    price = models.FloatField(validators=[MinValueValidator(0)], default=0)
    sale_date = models.DateTimeField(auto_now_add=True)
    sub_total = models.FloatField(validators=[MinValueValidator(0)], default=0)
    
    def __str__(self):
        return f"{self.quantity_sold} of {self.product_id.product_name} on {self.sale_date}"