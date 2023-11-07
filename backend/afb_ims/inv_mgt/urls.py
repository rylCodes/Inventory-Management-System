from django.urls import path
from . import views

urlpatterns = [
    #Login URL
    path('api/users/', UserList.as_view(), name='user-list'),
    path('api/users/<int:pk>/', UserDetail.as_view(), name='user-detail'),

    # Product URLs
    path('products/', views.ProductList.as_view(), name='product-list'),
    path('products/<int:pk>/', views.ProductDetail.as_view(), name='product-detail'),

    # Supplier URLs
    path('suppliers/', views.SupplierList.as_view(), name='supplier-list'),
    path('suppliers/<int:pk>/', views.SupplierDetail.as_view(), name='supplier-detail'),

    # Purchase Bill URLs
    path('purchase-bill/', views.PurchaseBillList.as_view(), name='purchase-bill-list'),
    path('purchase-bill/<int:pk>/', views.PurchaseBillDetail.as_view(), name='purchase-bill-detail'),

    # Purchase Item URLs
    path('purchase-item/', views.PurchaseItemList.as_view(), name='purchase-item-list'),
    path('purchase-item/<int:pk>/', views.PurchaseItemDetail.as_view(), name='purchase-item-detail'),

    # Sales Bill URLs
    path('sales-bill/', views.SalesBillList.as_view(), name='sales-bill-list'),
    path('sales-bill/<int:pk>/', views.SalesBillDetail.as_view(), name='sales-bill-detail'),

    # Sales Item URLs
    path('sales-item/', views.SalesItemList.as_view(), name='sales-item-list'),
    path('sales-item/<int:pk>/', views.SalesItemDetail.as_view(), name='sales-item-detail'),

    # Stock URLs
    path('stocks/', views.StockList.as_view(), name='stock-list'),
    path('stocks/<int:pk>/', views.StockDetail.as_view(), name='stock-detail'),
]