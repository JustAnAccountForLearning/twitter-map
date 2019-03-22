from django.urls import path

from . import views

urlpatterns = [
    # ex: /application/
    path('', views.index, name='index'),
]