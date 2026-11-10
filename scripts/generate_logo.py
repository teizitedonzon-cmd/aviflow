import os
import struct
import zlib

base = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public')
os.makedirs(base, exist_ok=True)


def chunk(tag: bytes, data: bytes) -> bytes:
    return struct.pack('!I', len(data)) + tag + data + struct.pack('!I', zlib.crc32(tag + data) & 0xffffffff)


def write_png(path: str, size: tuple[int, int], bg=(20, 115, 72), accent=(255, 255, 255), ring=(134, 214, 171)):
    width, height = size
    raw = bytearray()

    for y in range(height):
        for x in range(width):
            cx = width / 2
            cy = height / 2
            dx = (x - cx) / (width / 2)
            dy = (y - cy) / (height / 2)
            dist = (dx * dx + dy * dy) ** 0.5

            rr, gg, bb = bg

            # soft rounded-square glow
            if abs(x - cx) <= width * 0.42 and abs(y - cy) <= height * 0.42:
                rr, gg, bb = bg
            else:
                rr, gg, bb = bg

            # stylized A emblem
            left_diag = (y - (height * 0.25)) > ((x - (width * 0.32)) * (height / width) * 0.9)
            right_diag = (y - (height * 0.25)) > ((-(x - (width * 0.68))) * (height / width) * 0.9)
            center_bar = (x > width * 0.38 and x < width * 0.62 and y > height * 0.55 and y < height * 0.72)
            if ((x > width * 0.25 and x < width * 0.75 and y > height * 0.2 and y < height * 0.8) and left_diag and right_diag) or center_bar:
                rr, gg, bb = accent

            # inner ring for better visibility
            if (x > width * 0.28 and x < width * 0.72 and y > height * 0.25 and y < height * 0.78 and abs((x - cx) / (width * 0.4)) + abs((y - cy) / (height * 0.42)) < 1.3):
                rr, gg, bb = ring

            # add a subtle white border on the emblem
            if (x > width * 0.34 and x < width * 0.66 and y > height * 0.2 and y < height * 0.8 and abs((x - cx) / (width * 0.2)) + abs((y - cy) / (height * 0.35)) < 1.2):
                rr, gg, bb = accent

            # white silhouette for clean look
            if dist < 0.72:
                rr, gg, bb = accent

            raw.extend((rr, gg, bb, 255))

    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('!IIBBBBB', width, height, 8, 2, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(bytes(raw), 9))
    png += chunk(b'IEND', b'')
    with open(path, 'wb') as file:
        file.write(png)


write_png(os.path.join(base, 'logo.png'), (512, 512))
write_png(os.path.join(base, 'icon-192.png'), (192, 192))
write_png(os.path.join(base, 'icon-512.png'), (512, 512))
write_png(os.path.join(base, 'apple-touch-icon.png'), (180, 180))
print('Logo generated in public/')
