from django.urls import path

from events.views import (
    CalendarView,
    CalculatePriceView,
    ConfirmBookingView,
    EventConfigView,
    HoldDateView,
    ReleaseHoldView,
)

urlpatterns = [
    path("config", EventConfigView.as_view(), name="event-config"),
    path("calendar", CalendarView.as_view(), name="event-calendar"),
    path("hold", HoldDateView.as_view(), name="event-hold"),
    path("release", ReleaseHoldView.as_view(), name="event-release"),
    path("calculate-price", CalculatePriceView.as_view(), name="event-calculate-price"),
    path("book", ConfirmBookingView.as_view(), name="event-book"),
]
