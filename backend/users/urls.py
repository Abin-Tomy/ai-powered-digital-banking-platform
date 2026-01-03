from django.urls import path
from .views import UserListView, CurrentUserView
from .auth_views import LoginView, LogoutView

urlpatterns = [
    path('', UserListView.as_view(), name='user-list'),      # admin only
    path('me/', CurrentUserView.as_view(), name='user-me'),  # 🔑 current user
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
]