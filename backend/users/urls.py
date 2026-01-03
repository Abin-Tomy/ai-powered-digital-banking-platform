from django.urls import path
from .views import UserListView
from .auth_views import LoginView, LogoutView

urlpatterns = [
    path('', UserListView.as_view(), name='user-list'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
]
