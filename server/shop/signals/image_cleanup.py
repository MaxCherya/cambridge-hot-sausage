"""
Auto-delete images from Cloudinary when a ProductImage or Category
image is deleted or replaced.
"""

import logging

from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver

from shop.models import Category, ProductImage

logger = logging.getLogger(__name__)


def _delete_cloudinary_file(image_field):
    """Delete a file from storage (Cloudinary or local)."""
    if image_field and image_field.name:
        try:
            image_field.storage.delete(image_field.name)
        except Exception as e:
            logger.warning(f"Failed to delete image {image_field.name}: {e}")


@receiver(post_delete, sender=ProductImage)
def delete_product_image_file(sender, instance, **kwargs):
    """When a ProductImage row is deleted, delete the file from storage."""
    _delete_cloudinary_file(instance.image)


@receiver(pre_save, sender=ProductImage)
def delete_old_product_image_on_update(sender, instance, **kwargs):
    """When a ProductImage file is replaced, delete the old one."""
    if not instance.pk:
        return
    try:
        old = ProductImage.objects.get(pk=instance.pk)
    except ProductImage.DoesNotExist:
        return
    if old.image and old.image != instance.image:
        _delete_cloudinary_file(old.image)


@receiver(pre_save, sender=Category)
def delete_old_category_image_on_update(sender, instance, **kwargs):
    """When a Category image is replaced, delete the old one."""
    if not instance.pk:
        return
    try:
        old = Category.objects.get(pk=instance.pk)
    except Category.DoesNotExist:
        return
    if old.image and old.image != instance.image:
        _delete_cloudinary_file(old.image)
