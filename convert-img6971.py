
from PIL import Image
import shutil

# 打开 IMG_6971.PNG
img = Image.open('IMG_6971.PNG')

# 确保是 RGBA 模式
if img.mode != 'RGBA':
    img = img.convert('RGBA')

# 生成不同尺寸的图标
sizes = [256, 512, 1024]
for s in sizes:
    resized = img.resize((s, s), Image.Resampling.LANCZOS)
    resized.save(f'build/icons/{s}x{s}.png', 'PNG')
    print(f'Generated build/icons/{s}x{s}.png')

# 复制 1024x1024.png 作为 upms-1024.png
shutil.copy('build/icons/1024x1024.png', 'build/icons/upms-1024.png')
print('Generated build/icons/upms-1024.png')

# 使用 IMG_6971.PNG 作为 SVG 图标（直接复制作为 SVG 格式）
shutil.copy('IMG_6971.PNG', 'build/icons/icon.svg')
print('Updated build/icons/icon.svg')

# 更新 public/favicon.svg
shutil.copy('IMG_6971.PNG', 'public/favicon.svg')
print('Updated public/favicon.svg')

print('All icons generated successfully!')
