"""
Version-keyed cache helpers.

Instead of busting cache keys by SCAN (`cache.delete_pattern("*X*")`, which is
O(K) across the entire Redis keyspace), every cached read mixes a version
number into the key. Invalidation is then a single `cache.incr(version_key)`
— old keys become unreachable and expire naturally.

This is the canonical pattern for cache invalidation at scale and is also
forward-compatible with a memcached / locmem backend (which don't support
SCAN at all).
"""

from django.core.cache import cache

PRODUCTS_VERSION_KEY = "shop:v:products"
CATEGORIES_VERSION_KEY = "shop:v:categories"


def _get_version(key: str) -> int:
    version = cache.get(key)
    if version is None:
        # cache.add is atomic — if two workers race here, only one wins and
        # the other reads the just-set value via the subsequent get.
        cache.add(key, 1)
        version = cache.get(key) or 1
    return int(version)


def get_products_version() -> int:
    return _get_version(PRODUCTS_VERSION_KEY)


def get_categories_version() -> int:
    return _get_version(CATEGORIES_VERSION_KEY)


def _bump(key: str) -> None:
    try:
        cache.incr(key)
    except ValueError:
        # Key didn't exist yet — initialize, then everything written under
        # the previous (implicit) v=1 becomes unreachable.
        cache.set(key, 2)


def bump_products_version() -> None:
    _bump(PRODUCTS_VERSION_KEY)


def bump_categories_version() -> None:
    _bump(CATEGORIES_VERSION_KEY)
