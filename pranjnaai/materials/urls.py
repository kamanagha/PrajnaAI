from django.urls import path
from . import views

urlpatterns = [

    # ✅ Upload material (JWT protected)
    path('upload/', views.upload_material, name='upload_material'),

    # ✅ View all materials
    path('view/', views.view_materials, name='view_materials'),

    # ✅ Material detail (with structured content)
    path('<int:id>/', views.material_detail, name='material_detail'),

    # ✅ Delete material (only owner, JWT protected)
    path('delete/<int:id>/', views.delete_material, name='delete_material'), 

    # ✅ Download material file
    path('materials/<int:id>/download/', views.download_material, name='download_material'),

]