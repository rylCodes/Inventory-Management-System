from rest_framework import serializers
from .models import Category, Stock, Supplier, PurchaseBill, PurchaseItem, SalesBill, SalesItem

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = '__all__'

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class PurchaseBillSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseBill
        fields = '__all__'

class PurchaseItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseItem
        fields = '__all__'

class SalesBillSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesBill
        fields = '__all__'

class SalesItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesItem
        fields = '__all__'