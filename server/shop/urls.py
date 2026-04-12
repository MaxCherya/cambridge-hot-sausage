from django.urls import include, path
from rest_framework.routers import DefaultRouter

from shop.views import CategoryViewSet, ProductViewSet, ReviewCreateView

router = DefaultRouter(trailing_slash=False)
router.register("categories", CategoryViewSet, basename="category")
router.register("products", ProductViewSet, basename="product")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "products/<slug:product_slug>/reviews",
        ReviewCreateView.as_view(),
        name="review-create",
    ),
]
