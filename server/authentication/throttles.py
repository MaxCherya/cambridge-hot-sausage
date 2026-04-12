from rest_framework.throttling import AnonRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """
    Strict rate limiting for login attempts.
    5 attempts per 5 minutes per IP to prevent brute force.
    """

    rate = "5/min"
    scope = "login"
