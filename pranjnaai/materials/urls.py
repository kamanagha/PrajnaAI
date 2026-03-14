from django.urls import path
from . import views

urlpatterns = [

    path('upload/', views.upload_material),
    path('view/', views.view_material),

]