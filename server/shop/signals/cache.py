"""
Cache invalidation on admin writes.

When a product, category, variant, image, or review is saved/deleted
via the admin, we bump the relevant version counters so the next API
read serves fresh data. This is O(1) regardless of cache size — unlike
`cache.delete_pattern`, which scans the entire keyspace.
"""

from django.db.models.signals import m2m_changed, post_delete, post_save
from django.dispatch import receiver

from shop.cache_versions import bump_categories_version, bump_products_version
from shop.models import (
    Category,
    Product,
    ProductImage,
    ProductVariant,
    Review,
)


@receiver(post_save, sender=Category)
@receiver(post_delete, sender=Category)
def invalidate_category_cache(sender, **kwargs):
    bump_categories_version()
    bump_products_version()


@receiver(post_save, sender=Product)
@receiver(post_delete, sender=Product)
def invalidate_product_cache(sender, **kwargs):
    bump_products_version()


@receiver(m2m_changed, sender=Product.categories.through)
def invalidate_product_categories_cache(sender, **kwargs):
    bump_products_version()
    bump_categories_version()


@receiver(post_save, sender=ProductVariant)
@receiver(post_delete, sender=ProductVariant)
@receiver(post_save, sender=ProductImage)
@receiver(post_delete, sender=ProductImage)
@receiver(post_save, sender=Review)
@receiver(post_delete, sender=Review)
def invalidate_product_related_cache(sender, **kwargs):
    bump_products_version()
