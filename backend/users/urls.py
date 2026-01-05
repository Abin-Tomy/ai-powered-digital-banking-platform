from django.urls import path
from .views import RegisterView, UserListView, CurrentUserView
from .auth_views import LoginView, LogoutView

urlpatterns = [
    path('', UserListView.as_view(), name='user-list'),
    path('me/', CurrentUserView.as_view(), name='user-me'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
]
