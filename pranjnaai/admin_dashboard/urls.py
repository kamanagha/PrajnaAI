from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.AdminUserViewSet, basename='admin-users')
router.register(r'materials', views.MaterialViewSet, basename='admin-materials')

urlpatterns = [
    path('', include(router.urls)),
    path('create-user/', views.create_user, name='create-user'),
    path('toggle-user-status/<int:user_id>/', views.toggle_user_status, name='toggle-user-status'),
    path('delete-material/<int:material_id>/', views.admin_delete_material, name='admin-delete-material'),
    path('dashboard-stats/', views.get_dashboard_stats, name='dashboard-stats'),
    path('system-settings/', views.system_settings, name='system-settings'),
    path('activity-logs/', views.get_activity_logs, name='activity-logs'),
    path('site-stats/', views.get_site_stats, name='site-stats'),
]