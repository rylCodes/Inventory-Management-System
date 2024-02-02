from django.urls import path
from inv_mgt import views

urlpatterns = [
    # Menu URLs
    path('menus/', views.MenuList.as_view(), name='menu-list'),
    path('menus/<int:pk>/', views.MenuDetail.as_view(), name='menu-detail'),

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

    # Notification URLs
    path('notifications/', views.NotificationList.as_view(), name='notification-list'),
    path('notifications/<int:pk>/', views.NotificationDetail.as_view(), name='notification-detail'),

    # User URLs
    path('owners/', views.OwnerList.as_view(), name='owner-list'),
    path('owners/<int:pk>/', views.OwnerDetail.as_view(), name='owner-detail')
]