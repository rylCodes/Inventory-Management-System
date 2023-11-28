from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from .models import Menu, Product, Stock, Supplier, PurchaseBill, PurchaseItem, SalesBill, SalesItem, Stock
from .serializers import MenuSerializer, ProductSerializer, SupplierSerializer, PurchaseBillSerializer, PurchaseItemSerializer , SalesBillSerializer, SalesItemSerializer, StockSerializer

# Stock views
class StockList(generics.ListCreateAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer

    def list(self, request):
        search_query = request.query_params.get('search', None)
        
        if search_query:
            queryset = Stock.objects.filter(name__icontains=search_query)
        else:
            queryset = self.get_queryset()

        serializer = StockSerializer(queryset, many=True)
        return Response(serializer.data)

class StockDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer

# Menus views
class MenuList(generics.ListCreateAPIView):
    queryset = Menu.objects.all()
    serializer_class = MenuSerializer

class MenuDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Menu.objects.all()
    serializer_class = MenuSerializer

# Products views
class ProductList(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

# Supplier Views
class SupplierList(generics.ListCreateAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class SupplierDetail(generics.RetrieveUpdateDestroyAPIView):
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