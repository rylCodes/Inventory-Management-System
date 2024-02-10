from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
from .utils import get_padded_pk, year_last_digits

STATUS_CHOICES = ((True, "Active"), (False, "Inactive"))

class Owner(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    business_name = models.CharField(max_length=100)
    business_address = models.CharField(max_length=100)
    phone = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)

    def __str__(self):
        return self.business_name

# STOCK
class Stock(models.Model):
    code = models.CharField(max_length=100, unique=True, blank=True)
    stock_name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    quantity = models.FloatField(default=0)
    unit = models.CharField(max_length=200)
    date_added = models.DateTimeField(default=timezone.now)
    date_updated = models.DateTimeField(auto_now=True)
    status = models.BooleanField(choices=STATUS_CHOICES, default=True)
    qty_alert_level = models.FloatField(default=0)
    show_notification = models.BooleanField(default=True)

    def __str__(self):
        return self.stock_name
    
    class Meta:
        ordering = ['-date_added']
    
@receiver(post_save, sender=Stock)
def update_stock_code(sender, instance, created, **kwargs):
    if created and not instance.code:
        instance.code = f'ITM-0{year_last_digits()}-{get_padded_pk(instance, 4)}'
        instance.save()

# MENU
class Menu(models.Model):
    code = models.CharField(max_length=100, unique=True, blank=True)
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=200, blank=True, null=True)
    category = models.TextField(blank=True, null=True)
    price = models.FloatField(validators=[MinValueValidator(0)], default=0)
    date_added = models.DateTimeField(default=timezone.now)
    date_updated = models.DateTimeField(auto_now=True)
    status = models.BooleanField(choices=STATUS_CHOICES, default=True)

    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['-date_added']
    
@receiver(post_save, sender=Menu)
def update_menu_code(sender, instance, created, **kwargs):
    if created and not instance.code:
        instance.code = f'MNU-0{year_last_digits()}-{get_padded_pk(instance, 4)}'
        instance.save()

# PRODUCT    
class Product(models.Model):
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, blank=True, null=True)
    stock_id = models.ForeignKey(Stock, on_delete=models.PROTECT)
    qty_per_order = models.FloatField(validators=[MinValueValidator(0)], default=0)
    date_added = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.stock_id.stock_name
    
    class Meta:
        ordering = ['-date_added']

# SUPPLIER
class Supplier(models.Model):
    code = models.CharField(max_length=100, unique=True, blank=True)
    name = models.CharField(max_length=100, unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.CharField(max_length=150, blank=True)
    email = models.EmailField(max_length=100, blank=True, null=True)
    date_added = models.DateTimeField(default=timezone.now)
    date_updated = models.DateTimeField(auto_now=True)
    status = models.BooleanField(choices=STATUS_CHOICES, default=True)

    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['-date_added']
    
@receiver(post_save, sender=Supplier)
def update_supplier_code(sender, instance, created, **kwargs):
    if created and not instance.code:
        instance.code = f'SPL-0{year_last_digits()}-{get_padded_pk(instance, 4)}'
        instance.save()

# PURCHASE BILL
class PurchaseBill(models.Model):
    billno = models.CharField(max_length=100)
    time = models.DateTimeField(default=timezone.now)
    supplier_id = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name="bills")
    grand_total = models.FloatField(validators=[MinValueValidator(0)], default=0)
    remarks = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return "Bill no: " + self.billno
    
    class Meta:
        ordering = ['-time']

# PURCHASE ITEM
class PurchaseItem(models.Model):
    stock_id = models.ForeignKey(Stock, on_delete=models.PROTECT, related_name="purchase_items")
    purchaseBill_id = models.ForeignKey(PurchaseBill, on_delete=models.CASCADE, blank=True, null=True)
    purchase_date = models.DateTimeField(auto_now_add=True)
    quantity_purchased = models.FloatField(validators=[MinValueValidator(0)], default=0)
    item_price = models.FloatField(validators=[MinValueValidator(0)], default=0)
    sub_total = models.FloatField(validators=[MinValueValidator(0)], default=0)

    def __str__(self):
        return f"Bill no: {self.purchaseBill_id.billno}, Item = {self.stock_id.stock_name}"

    class Meta:
        ordering = ['-purchase_date']

# SALES BILL
class SalesBill(models.Model):
    billno = models.CharField(max_length=100, unique=True, blank=True)
    time = models.DateTimeField(auto_now=True)
    customer_name = models.CharField(max_length=200)
    remarks = models.CharField(max_length=100, blank=True, null=True)
    amount_tendered = models.FloatField(validators=[MinValueValidator(0)], default=0)
    grand_total = models.FloatField(validators=[MinValueValidator(0)], default=0)
    mode_of_payment = models.CharField(max_length=100, default="Cash")
    status = models.BooleanField(default=False)

    def __str__(self):
        return "Bill no: " + self.billno
    
    class Meta:
        ordering = ['-time']
    
@receiver(post_save, sender=SalesBill)
def update_billno(sender, instance, created, **kwargs):
    if created and not instance.billno:
        instance.billno = f'TRN-0{year_last_digits()}-{get_padded_pk(instance, 4)}'
        instance.save()

# SALES ITEM
class SalesItem(models.Model):
    billno = models.ForeignKey(SalesBill, on_delete=models.CASCADE, related_name="sales_items", blank=True, null=True)
    menu = models.ForeignKey(Menu, on_delete=models.PROTECT)
    quantity = models.FloatField(validators=[MinValueValidator(0)], default=0)
    price = models.FloatField(validators=[MinValueValidator(0)], default=0)
    sale_date = models.DateTimeField(auto_now_add=True)
    sub_total = models.FloatField(validators=[MinValueValidator(0)], default=0)
    status = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.quantity} of {self.menu.name} on {self.sale_date}"
    
    class Meta:
        ordering = ['-sale_date']

# NOTIFICATION
class Notification(models.Model):
    content = models.CharField(max_length=200)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    warning_type = models.CharField(max_length=50)

    def __str__(self):
        return self.content

    class Meta:
        ordering = ['-timestamp']