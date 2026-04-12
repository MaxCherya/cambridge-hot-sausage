"""
Session authentication without CSRF enforcement.

DRF's built-in SessionAuthentication enforces CSRF on all requests.
For our admin API (same-origin, session-based), CSRF adds complexity
without security benefit since:
1. The API only accepts JSON (no form submissions)
2. Requests go through the same-origin Next.js proxy
3. Session cookies are SameSite=Lax (no cross-origin leakage)

This class provides session auth without the CSRF check.
"""

from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Skip CSRF check
