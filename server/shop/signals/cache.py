"""
Cache invalidation on admin writes.

When a product, category, variant, image, or review is saved/deleted
via the admin, we bust the relevant cache keys so the API serves
fresh data on the next request.
"""

from django.core.cache import cache
from django.db.models.signals import m2m_changed, post_delete, post_save
from django.dispatch import receiver

from shop.models import (
    Category,
    Product,
    ProductImage,
    ProductVariant,
    Review,
)

CATEGORY_PREFIXES = ["categories", "category_detail"]
PRODUCT_PREFIXES = ["products", "product_detail"]


def _bust(prefixes):
    """
    Clear cache keys that start with any of the given prefixes.

    On LocMemCache (dev) this clears everything — acceptable for dev.
    On Redis (prod) this uses delete_pattern for surgical invalidation.
    """
    backend = cache.__class__.__name__
    if backend == "RedisCache":
        for prefix in prefixes:
            cache.delete_pattern(f"*{prefix}*")
    else:
        cache.clear()


# ── Category signals ────────────────────────────────────────────

@receiver(post_save, sender=Category)
@receiver(post_delete, sender=Category)
def invalidate_category_cache(sender, **kwargs):
    _bust(CATEGORY_PREFIXES + PRODUCT_PREFIXES)


# ── Product signals ─────────────────────────────────────────────

@receiver(post_save, sender=Product)
@receiver(post_delete, sender=Product)
def invalidate_product_cache(sender, **kwargs):
    _bust(PRODUCT_PREFIXES)


@receiver(m2m_changed, sender=Product.categories.through)
def invalidate_product_categories_cache(sender, **kwargs):
    _bust(PRODUCT_PREFIXES + CATEGORY_PREFIXES)


# ── Variant / Image / Review signals ────────────────────────────

@receiver(post_save, sender=ProductVariant)
@receiver(post_delete, sender=ProductVariant)
@receiver(post_save, sender=ProductImage)
@receiver(post_delete, sender=ProductImage)
@receiver(post_save, sender=Review)
@receiver(post_delete, sender=Review)
def invalidate_product_related_cache(sender, **kwargs):
    _bust(PRODUCT_PREFIXES)
