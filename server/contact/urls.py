from django.urls import path

from contact.views import ContactMessageCreateView

urlpatterns = [
    path("", ContactMessageCreateView.as_view(), name="contact-create"),
]
