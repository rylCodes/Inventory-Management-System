from django.contrib import admin
from .models import Category, Supplier, PurchaseItem, PurchaseBill, SalesBill, SalesItem, Stock

# Register your models here.
admin.site.register(Category)
admin.site.register(PurchaseBill)
admin.site.register(PurchaseItem)
admin.site.register(SalesItem)
admin.site.register(SalesBill)
admin.site.register(Stock)
admin.site.register(Supplier)