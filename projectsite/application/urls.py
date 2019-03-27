from django.urls import path

from . import views

urlpatterns = [
    # Everything should be redirected to index
    path('', views.index, name='index'),
]