"""
Geolocation utilities for event bookings.

Haversine distance calculation and reverse geocoding via
OpenStreetMap Nominatim for anti-ocean validation.
"""

import math
from dataclasses import dataclass

import requests

# Cambridge city centre coordinates
CAMBRIDGE_LAT = 52.2053
CAMBRIDGE_LNG = 0.1218

# Earth's radius in miles
EARTH_RADIUS_MI = 3958.8

# Nominatim requires a meaningful User-Agent
NOMINATIM_UA = "CambridgeHotSausage/1.0"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"


def haversine_miles(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance in miles between two coordinates."""
    lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
    return EARTH_RADIUS_MI * 2 * math.asin(math.sqrt(a))


def distance_from_cambridge(lat: float, lng: float) -> float:
    """Distance in miles from Cambridge city centre."""
    return haversine_miles(CAMBRIDGE_LAT, CAMBRIDGE_LNG, lat, lng)


@dataclass
class GeoValidation:
    valid: bool
    address: str
    error: str


def validate_location(lat: float, lng: float, max_radius: float) -> GeoValidation:
    """
    Validate that coordinates are:
    1. Within the max radius from Cambridge
    2. On land (not ocean/river) via reverse geocode
    """
    distance = distance_from_cambridge(lat, lng)

    if distance > max_radius:
        return GeoValidation(
            valid=False,
            address="",
            error=f"Location is {distance:.0f} miles from Cambridge. Maximum is {max_radius:.0f} miles.",
        )

    # Reverse geocode to check it's a real land address
    try:
        resp = requests.get(
            NOMINATIM_URL,
            params={
                "lat": lat,
                "lon": lng,
                "format": "json",
                "addressdetails": 1,
                "zoom": 16,
            },
            headers={"User-Agent": NOMINATIM_UA},
            timeout=5,
        )
        resp.raise_for_status()
        data = resp.json()
    except (requests.RequestException, ValueError):
        # If geocoding fails, allow it (admin can review)
        return GeoValidation(valid=True, address="", error="")

    if "error" in data:
        return GeoValidation(
            valid=False,
            address="",
            error="This location doesn't appear to be a valid address. Please pick a location on land.",
        )

    # Check for water bodies
    address_type = data.get("type", "")
    category = data.get("class", "")
    if category in ("natural", "waterway") and address_type in ("water", "riverbank", "river", "lake", "sea", "ocean", "bay", "strait"):
        return GeoValidation(
            valid=False,
            address="",
            error="This location appears to be on water. Please choose a land-based venue.",
        )

    display_name = data.get("display_name", "")
    return GeoValidation(valid=True, address=display_name, error="")
