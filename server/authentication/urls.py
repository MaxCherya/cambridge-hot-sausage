from django.urls import path

from authentication.views import DashboardView, LoginView, LogoutView, MeView

urlpatterns = [
    path("login", LoginView.as_view(), name="auth-login"),
    path("logout", LogoutView.as_view(), name="auth-logout"),
    path("me", MeView.as_view(), name="auth-me"),
    path("dashboard", DashboardView.as_view(), name="auth-dashboard"),
]
