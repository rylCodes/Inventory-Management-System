from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

# CATEGORY
class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    date_added = models.DateTimeField(default=timezone.now)
    date_updated = models.DateTimeField(auto_now=True)
    status = models.IntegerField(default=1)

    def __str__(self):
        return self.name

# STOCK
class Stock(models.Model):
    code = models.CharField(max_length=100, unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="stocks")
    product_name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    quantity_in_stock = models.PositiveIntegerField(validators=[MinValueValidator(0)])
    price = models.DecimalField(max_digits=10, decimal_places=2)
    date_added = models.DateTimeField(default=timezone.now)
    date_updated = models.DateTimeField(auto_now=True)
    status = models.IntegerField(default=1)

    def __str__(self):
        return self.product_name

    class Meta:
        ordering = ["-date_updated"]

# SUPPLIER
class Supplier(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15, unique=True)
    address = models.TextField()
    email = models.EmailField(max_length=100, unique=True)
    status = models.IntegerField(default=1)

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
    quantity_purchased = models.PositiveIntegerField()
    item_price = models.DecimalField(max_digits=10, decimal_places=2)

    def calculate_total_price(self):
        total_price = self.quantity_purchased * self.item_price
        return total_price

    def __str__(self):
        return f"Bill no: {self.billno.billno}, Item = {self.stock.product_name}"

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
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    quantity_sold = models.PositiveIntegerField()
    sale_date = models.DateTimeField(auto_now_add=True)

    def item_price(self):
        return self.stock.price
    
    def calculate_total_price(self):
        total_price = self.quantity_sold * self.item_price()
        return total_price

    def __str__(self):
        return f"{self.quantity_sold} of {self.stock.product_name} on {self.sale_date}"
