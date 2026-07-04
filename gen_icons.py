from PIL import Image, ImageDraw

def make_icon(size: int, path: str) -> None:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Fond crème "papier"
    bg = (244, 239, 225, 255)
    draw.rounded_rectangle([0, 0, size, size], radius=int(size * 0.22), fill=bg)

    # Carnet (rectangle légèrement incliné simulé par un simple rectangle)
    notebook_color = (232, 150, 122, 255)  # corail doux
    margin = size * 0.20
    draw.rounded_rectangle(
        [margin, margin * 0.8, size - margin, size - margin * 0.8],
        radius=int(size * 0.06),
        fill=notebook_color,
    )

    # Reliure spirale (petits cercles à gauche)
    spiral_color = (61, 90, 108, 255)  # bleu encre
    spiral_x = margin + size * 0.02
    n_dots = 5
    top = margin * 0.8 + size * 0.06
    bottom = size - margin * 0.8 - size * 0.06
    step = (bottom - top) / (n_dots - 1)
    r = size * 0.018
    for i in range(n_dots):
        cy = top + i * step
        draw.ellipse([spiral_x - r, cy - r, spiral_x + r, cy + r], fill=bg)

    # Lignes de texte (soleil + vagues stylisées, thème vacances)
    sun_color = (242, 193, 78, 255)
    sun_r = size * 0.10
    sun_cx = size * 0.68
    sun_cy = size * 0.42
    draw.ellipse(
        [sun_cx - sun_r, sun_cy - sun_r, sun_cx + sun_r, sun_cy + sun_r],
        fill=sun_color,
    )

    wave_color = (143, 174, 139, 255)  # sauge
    wave_y = size * 0.66
    draw.line(
        [(margin + size * 0.08, wave_y), (size - margin - size * 0.05, wave_y)],
        fill=wave_color,
        width=int(size * 0.035),
    )
    wave_y2 = size * 0.76
    draw.line(
        [(margin + size * 0.08, wave_y2), (size - margin - size * 0.05, wave_y2)],
        fill=wave_color,
        width=int(size * 0.035),
    )

    img.save(path)


make_icon(192, "public/icons/icon-192.png")
make_icon(512, "public/icons/icon-512.png")
print("Icônes générées.")
