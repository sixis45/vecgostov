"""Recreate optimized variants from the two downloaded source images (Pillow)."""
from PIL import Image, ImageOps
from pathlib import Path
root = Path(__file__).resolve().parent.parent
for name in ("interior", "lake"):
    source = ImageOps.exif_transpose(Image.open(root / "assets" / f"{name}-original.jpg")).convert("RGB")
    for width in (480, 900, 1600):
        img = ImageOps.fit(source, (width, width * 3 // 4), method=Image.Resampling.LANCZOS)
        img.save(root / "assets" / f"{name}-{width}.webp", "WEBP", quality=79, method=6)
        img.save(root / "assets" / f"{name}-{width}.jpg", "JPEG", quality=82, optimize=True, progressive=True)
    print(name, source.size)
