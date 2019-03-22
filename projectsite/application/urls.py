from django.urls import path

from . import views

urlpatterns = [
    # ex: /application/
    path('', views.index, name='index'),
    # ex: /application/5/
    path('<int:question_id>/', views.detail, name='detail'),
    # ex: /application/5/results/
    path('<int:question_id/results/', views.results, name='results'),
    # ex: /application/5/vote/
    path('<int:question_id/vote/', views.vote, name='vote'),
]