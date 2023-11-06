from rest_framework.response import Response
from rest_framework import generics
from .models import Category, Stock, Supplier, PurchaseBill, PurchaseItem, SalesBill, SalesItem, Stock
from .serializers import CategorySerializer, SupplierSerializer, PurchaseBillSerializer, PurchaseItemSerializer , SalesBillSerializer, SalesItemSerializer, StockSerializer

# Category views
class CategoryList(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

# Supplier Views
class SupplierList(generics.ListCreateAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class SupplierDetail(generics.RetrieveDestroyAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

# Purchase Bill views
class PurchaseBillList(generics.ListCreateAPIView):
    queryset = PurchaseBill.objects.all()
    serializer_class = PurchaseBillSerializer

class PurchaseBillDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = PurchaseBill.objects.all()
    serializer_class = PurchaseBillSerializer

# Purchase Item views
class PurchaseItemList(generics.ListCreateAPIView):
    queryset = PurchaseItem.objects.all()
    serializer_class = PurchaseItemSerializer

class PurchaseItemDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = PurchaseItem.objects.all()
    serializer_class = PurchaseItemSerializer

# Sale views
class SalesBillList(generics.ListCreateAPIView):
    queryset = SalesBill.objects.all()
    serializer_class = SalesBillSerializer

class SalesBillDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = SalesBill.objects.all()
    serializer_class = SalesBillSerializer

# Sales Item views
class SalesItemList(generics.ListCreateAPIView):
    queryset = SalesItem.objects.all()
    serializer_class = SalesItemSerializer

class SalesItemDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = SalesItem.objects.all()
    serializer_class = SalesItemSerializer

# Stock views
class StockList(generics.ListCreateAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer

class StockDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer