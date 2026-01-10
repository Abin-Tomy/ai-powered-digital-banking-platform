from django.urls import path
from .auth_views import RegisterView, LoginView, LogoutView, CurrentUserView
from .views import UserListView

urlpatterns = [
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('auth/logout/', LogoutView.as_view()),
    path('auth/me/', CurrentUserView.as_view()),

    # Admin
    path('admin/users/', UserListView.as_view()),
]
