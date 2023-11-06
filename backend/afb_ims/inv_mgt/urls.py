from django.urls import path
from . import views

urlpatterns = [
    # Category URLs
    path('categories/', views.CategoryList.as_view(), name='category-list'),
    path('categories/<int:pk>/', views.CategoryDetail.as_view(), name='category-detail'),

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
    path('stock/', views.StockList.as_view(), name='stock-list'),
    path('stock/<int:pk>/', views.StockDetail.as_view(), name='stock-detail'),
]