from django.urls import path
from . import views

urlpatterns = [
    # Product URLs
    path('products/', views.ProductList.as_view(), name='product-list'),
    path('products/<int:pk>/', views.ProductDetail.as_view(), name='product-detail'),

    # Purchase URLs
    path('purchases/', views.PurchaseList.as_view(), name='purchase-list'),
    path('purchases/<int:pk>/', views.PurchaseDetail.as_view(), name='purchase-detail'),

    # Sale URLs
    path('sales/', views.SaleList.as_view(), name='sale-list'),
    path('sales/<int:pk>/', views.SaleDetail.as_view(), name='sale-detail'),

    # Stock URLs
    path('stock/', views.StockList.as_view(), name='stock-list'),
    path('stock/<int:pk>/', views.StockDetail.as_view(), name='stock-detail'),
]