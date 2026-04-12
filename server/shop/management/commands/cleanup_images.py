"""
Delete orphaned images from Cloudinary.

Finds all ProductImage and Category image fields, collects their
public IDs, then compares against what's stored in Cloudinary's
cambridge_sausages folder. Anything in Cloudinary that's not
referenced in the DB gets deleted.

Usage:
    python manage.py cleanup_images          # dry run (list only)
    python manage.py cleanup_images --delete # actually delete
"""

import cloudinary
import cloudinary.api
from django.conf import settings
from django.core.management.base import BaseCommand

from shop.models import Category, ProductImage


class Command(BaseCommand):
    help = "Delete orphaned images from Cloudinary not referenced in the database."

    def add_arguments(self, parser):
        parser.add_argument(
            "--delete",
            action="store_true",
            help="Actually delete orphans. Without this flag, only lists them.",
        )

    def handle(self, *args, **options):
        cloud_config = getattr(settings, "CLOUDINARY_STORAGE", None)
        if not cloud_config:
            self.stdout.write(self.style.WARNING("Cloudinary not configured. Nothing to clean."))
            return

        cloudinary.config(
            cloud_name=cloud_config["CLOUD_NAME"],
            api_key=cloud_config["API_KEY"],
            api_secret=cloud_config["API_SECRET"],
        )

        folder = cloud_config.get("FOLDER", "cambridge_sausages")

        # Collect all image public IDs from the database
        db_ids = set()

        for img in ProductImage.objects.exclude(image="").exclude(image__isnull=True):
            # Cloudinary storage saves the public_id as the field value
            db_ids.add(str(img.image))

        for cat in Category.objects.exclude(image="").exclude(image__isnull=True):
            db_ids.add(str(cat.image))

        self.stdout.write(f"Found {len(db_ids)} images referenced in DB.")

        # List all resources in the Cloudinary folder
        cloud_ids = set()
        next_cursor = None

        while True:
            params = {"type": "upload", "prefix": folder, "max_results": 500}
            if next_cursor:
                params["next_cursor"] = next_cursor

            result = cloudinary.api.resources(**params)

            for resource in result.get("resources", []):
                cloud_ids.add(resource["public_id"])

            next_cursor = result.get("next_cursor")
            if not next_cursor:
                break

        self.stdout.write(f"Found {len(cloud_ids)} images in Cloudinary '{folder}' folder.")

        # Find orphans
        orphans = cloud_ids - db_ids
        if not orphans:
            self.stdout.write(self.style.SUCCESS("No orphaned images found."))
            return

        self.stdout.write(f"Found {len(orphans)} orphaned images:")
        for public_id in sorted(orphans):
            self.stdout.write(f"  {public_id}")

        if options["delete"]:
            # Cloudinary delete in batches of 100
            orphan_list = list(orphans)
            for i in range(0, len(orphan_list), 100):
                batch = orphan_list[i : i + 100]
                cloudinary.api.delete_resources(batch)
                self.stdout.write(f"  Deleted batch of {len(batch)}")

            self.stdout.write(self.style.SUCCESS(f"Deleted {len(orphans)} orphaned images."))
        else:
            self.stdout.write(
                self.style.WARNING(
                    f"Dry run — {len(orphans)} images would be deleted. "
                    "Run with --delete to actually remove them."
                )
            )
