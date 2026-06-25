from rest_framework.throttling import AnonRateThrottle, SimpleRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """Strict per-IP limit on login attempts. 5/min."""

    rate = "5/min"
    scope = "login"


class LoginUsernameRateThrottle(SimpleRateThrottle):
    """
    Per-username limit on login attempts. Prevents distributed credential
    stuffing where an attacker rotates IPs but reuses the same username.
    """

    rate = "10/min"
    scope = "login_username"

    def get_cache_key(self, request, view):
        username = ""
        if isinstance(request.data, dict):
            raw = request.data.get("username") or ""
            if isinstance(raw, str):
                username = raw.strip().lower()
        if not username:
            return None  # No username — let the serializer 400 instead.
        return self.cache_format % {"scope": self.scope, "ident": username}
