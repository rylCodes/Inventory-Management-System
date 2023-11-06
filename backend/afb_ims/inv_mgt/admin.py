from django.contrib import admin
from .models import Product, Supplier, PurchaseItem, PurchaseBill, SalesBill, SalesItem, Stock

# Register your models here.
admin.site.register(Product)
admin.site.register(PurchaseBill)
admin.site.register(PurchaseItem)
admin.site.register(SalesItem)
admin.site.register(SalesBill)
admin.site.register(Stock)
admin.site.register(Supplier)