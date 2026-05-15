from __future__ import annotations

import json
from collections import deque
from pathlib import Path
from shutil import copy2

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
REFERENCE_DIR = ROOT / "reference"
OUTPUT_DIR = ROOT / "public" / "generated"

WHITE_THRESHOLD = 245
MIN_COMPONENT_PIXELS = 64
PADDING = 4

SHIP_NAMES = [
    "boss_stage_2",
    "boss_stage_1",
    "player_ship",
    "enemy_miniboss",
    "enemy_light",
    "enemy_heavy",
    "enemy_medium",
    "powerup_01",
    "powerup_02",
    "powerup_03",
    "powerup_04",
]

BACKGROUND_NAMES = {
    "background1.jpg": "stage_1.jpg",
    "background2.jpg": "stage_2.jpg",
    "background3.jpg": "title.jpg",
}


def is_background(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    return a == 0 or (r >= WHITE_THRESHOLD and g >= WHITE_THRESHOLD and b >= WHITE_THRESHOLD)


def build_component_map(image: Image.Image) -> tuple[list[list[bool]], list[tuple[int, int, int, int]]]:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    visited = [[False] * width for _ in range(height)]
    bounds = []

    for y in range(height):
        for x in range(width):
            if visited[y][x]:
                continue
            visited[y][x] = True
            if is_background(pixels[x, y]):
                continue

            queue = deque([(x, y)])
            component = [(x, y)]
            min_x = max_x = x
            min_y = max_y = y

            while queue:
                cx, cy = queue.popleft()
                for ny in range(max(0, cy - 1), min(height, cy + 2)):
                    for nx in range(max(0, cx - 1), min(width, cx + 2)):
                        if visited[ny][nx]:
                            continue
                        visited[ny][nx] = True
                        if is_background(pixels[nx, ny]):
                            continue
                        queue.append((nx, ny))
                        component.append((nx, ny))
                        min_x = min(min_x, nx)
                        min_y = min(min_y, ny)
                        max_x = max(max_x, nx)
                        max_y = max(max_y, ny)

            if len(component) < MIN_COMPONENT_PIXELS:
                continue

            bounds.append((min_x, min_y, max_x, max_y))

    bounds.sort(key=lambda box: (box[1], box[0]))
    return visited, bounds


def whiten_to_alpha(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if r >= WHITE_THRESHOLD and g >= WHITE_THRESHOLD and b >= WHITE_THRESHOLD:
                pixels[x, y] = (255, 255, 255, 0)
            else:
                pixels[x, y] = (r, g, b, a)
    return rgba


def save_components(source_name: str, image: Image.Image, output_subdir: Path, custom_names: list[str] | None = None) -> list[dict]:
    alpha_image = whiten_to_alpha(image)
    _, bounds = build_component_map(alpha_image)
    output_subdir.mkdir(parents=True, exist_ok=True)
    metadata = []

    for index, (min_x, min_y, max_x, max_y) in enumerate(bounds):
        padded = (
            max(min_x - PADDING, 0),
            max(min_y - PADDING, 0),
            min(max_x + PADDING + 1, alpha_image.width),
            min(max_y + PADDING + 1, alpha_image.height),
        )
        crop = alpha_image.crop(padded)
        name = custom_names[index] if custom_names and index < len(custom_names) else f"{output_subdir.name}_{index:02d}"
        filename = f"{name}.png"
        crop.save(output_subdir / filename)
        metadata.append(
            {
                "name": name,
                "file": f"{output_subdir.name}/{filename}",
                "source": source_name,
                "bbox": [min_x, min_y, max_x, max_y],
                "padded_bbox": list(padded),
                "size": [crop.width, crop.height],
            }
        )

    return metadata


def copy_backgrounds() -> list[dict]:
    output_subdir = OUTPUT_DIR / "backgrounds"
    output_subdir.mkdir(parents=True, exist_ok=True)
    metadata = []
    for source_name, dest_name in BACKGROUND_NAMES.items():
        source_path = REFERENCE_DIR / source_name
        dest_path = output_subdir / dest_name
        copy2(source_path, dest_path)
        with Image.open(source_path) as image:
            metadata.append(
                {
                    "name": dest_name.rsplit(".", 1)[0],
                    "file": f"backgrounds/{dest_name}",
                    "source": source_name,
                    "size": [image.width, image.height],
                }
            )
    return metadata


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {
        "backgrounds": copy_backgrounds(),
    }

    with Image.open(REFERENCE_DIR / "ships.jpg") as ships_image:
        manifest["ships"] = save_components(
            "ships.jpg",
            ships_image,
            OUTPUT_DIR / "ships",
            SHIP_NAMES,
        )

    with Image.open(REFERENCE_DIR / "HUD.jpg") as hud_image:
        manifest["hud"] = save_components("HUD.jpg", hud_image, OUTPUT_DIR / "hud")

    with Image.open(REFERENCE_DIR / "FX.jpg") as fx_image:
        manifest["fx"] = save_components("FX.jpg", fx_image, OUTPUT_DIR / "fx")

    (OUTPUT_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Generated assets in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
