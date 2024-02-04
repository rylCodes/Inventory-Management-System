from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from .models import *
from .serializers import *
from .permissions import DeleteWithAdminPasswordPermission
from django.db.models.deletion import ProtectedError

# Stock views
class StockList(generics.ListCreateAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer

    def list(self, request):
        search_query = request.query_params.get('search', None)
        
        if search_query:
            queryset = Stock.objects.filter(stock_name__icontains=search_query)
        else:
            queryset = self.get_queryset()

        serializer = StockSerializer(queryset, many=True)
        return Response(serializer.data)

class StockDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    # permission_classes = [IsAdminUser]

    def delete(self, request, *args, **kwargs):
        try:
            return super().delete(request, *args, **kwargs)
        except ProtectedError as e:
            error_message = "Unable to delete! This product is linked to other records."
            return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)

# Menus views
class MenuList(generics.ListCreateAPIView):
    queryset = Menu.objects.all()
    serializer_class = MenuSerializer

    def list(self, request):
        search_query = request.query_params.get('search', None)
        
        if search_query:
            queryset = Menu.objects.filter(name__icontains=search_query)
        else:
            queryset = self.get_queryset()

        serializer = MenuSerializer(queryset, many=True)
        return Response(serializer.data)

class MenuDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Menu.objects.all()
    serializer_class = MenuSerializer
    # permission_classes = [IsAdminUser]

    def delete(self, request, *args, **kwargs):
        try:
            return super().delete(request, *args, **kwargs)
        except ProtectedError as e:
            error_message = "Unable to delete! This product is linked to other records."
            return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)

# Products views
class ProductList(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    # permission_classes = [IsAdminUser]

    def delete(self, request, *args, **kwargs):
        try:
            return super().delete(request, *args, **kwargs)
        except ProtectedError as e:
            error_message = "Unable to delete! This item is linked to other records."
            return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)

# Supplier Views
class SupplierList(generics.ListCreateAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

    def list(self, request):
        search_query = request.query_params.get('search', None)
        
        if search_query:
            queryset = Supplier.objects.filter(name__icontains=search_query)
        else:
            queryset = self.get_queryset()

        serializer = SupplierSerializer(queryset, many=True)
        return Response(serializer.data)

class SupplierDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    # permission_classes = [IsAdminUser]

    def delete(self, request, *args, **kwargs):
        try:
            return super().delete(request, *args, **kwargs)
        except ProtectedError as e:
            error_message = "Unable to delete! This supplier is linked to other records."
            return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)

# Purchase Bill views
class PurchaseBillList(generics.ListCreateAPIView):
    queryset = PurchaseBill.objects.all()
    serializer_class = PurchaseBillSerializer

    def list(self, request):
        search_query = request.query_params.get('search', None)
        
        if search_query:
            queryset = PurchaseBill.objects.filter(billno__icontains=search_query)
        else:
            queryset = self.get_queryset()

        serializer = PurchaseBillSerializer(queryset, many=True)
        return Response(serializer.data)

class PurchaseBillDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = PurchaseBill.objects.all()
    serializer_class = PurchaseBillSerializer
    # permission_classes = [DeleteWithAdminPasswordPermission]

    def delete(self, request, *args, **kwargs):
        try:
            return super().delete(request, *args, **kwargs)
        except ProtectedError as e:
            error_message = "Unable to delete! This purchase is linked to other records."
            return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)

# Purchase Item views
class PurchaseItemList(generics.ListCreateAPIView):
    queryset = PurchaseItem.objects.all()
    serializer_class = PurchaseItemSerializer

class PurchaseItemDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = PurchaseItem.objects.all()
    serializer_class = PurchaseItemSerializer
    # permission_classes = [DeleteWithAdminPasswordPermission]

    def delete(self, request, *args, **kwargs):
        try:
            return super().delete(request, *args, **kwargs)
        except ProtectedError as e:
            error_message = "Unable to delete! This item is linked to other records."
            return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)

# Sale Bill views
class SalesBillList(generics.ListCreateAPIView):
    queryset = SalesBill.objects.all()
    serializer_class = SalesBillSerializer

    def list(self, request):
        search_query = request.query_params.get('search', None)
        
        if search_query:
            queryset = SalesBill.objects.filter(customer_name__icontains=search_query)
        else:
            queryset = self.get_queryset()

        serializer = SalesBillSerializer(queryset, many=True)
        return Response(serializer.data)

class SalesBillDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = SalesBill.objects.all()
    serializer_class = SalesBillSerializer
    # permission_classes = [DeleteWithAdminPasswordPermission]

    def delete(self, request, *args, **kwargs):
        try:
            return super().delete(request, *args, **kwargs)
        except ProtectedError as e:
            error_message = "Unable to delete! This is linked to other records."
            return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)

# Sales Item views
class SalesItemList(generics.ListCreateAPIView):
    queryset = SalesItem.objects.all()
    serializer_class = SalesItemSerializer

class SalesItemDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = SalesItem.objects.all()
    serializer_class = SalesItemSerializer
    # permission_classes = [DeleteWithAdminPasswordPermission]

    def delete(self, request, *args, **kwargs):
        try:
            return super().delete(request, *args, **kwargs)
        except ProtectedError as e:
            error_message = "Unable to delete! This item is linked to other records."
            return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)

# Notification views
class NotificationList(generics.ListCreateAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

class NotificationDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

# Owner views
class OwnerList(generics.ListCreateAPIView):
    queryset = Owner.objects.all()
    serializer_class = OwnerSerializer

class OwnerDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Owner.objects.all()
    serializer_class = OwnerSerializer
    # permission_classes = [IsAdminUser]

    def delete(self, request, *args, **kwargs):
        try:
            return super().delete(request, *args, **kwargs)
        except ProtectedError as e:
            error_message = "Unable to delete! This is linked to other records."
            return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)