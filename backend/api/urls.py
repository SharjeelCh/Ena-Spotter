from django.urls import path
from . import views

urlpatterns = [
    path('suggest-locations/', views.suggest_locations, name='suggest-locations'),
    path('plan-trip/', views.plan_trip, name='plan-trip'),
]
