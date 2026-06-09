
from PIL import Image

# 读取原始图像
img = Image.open('fightcade-original.png')

# 生成不同尺寸的图标
sizes = [256, 512, 1024]
for s in sizes:
    # 调整大小，使用高质量的Lanczos重采样
    resized = img.resize((s, s), Image.Resampling.LANCZOS)
    # 保存为PNG
    resized.save(f'build/icons/{s}x{s}.png')
    print(f'已生成 {s}x{s}.png')

# 同时更新upms-1024.png
resized_1024 = img.resize((1024, 1024), Image.Resampling.LANCZOS)
resized_1024.save('build/icons/upms-1024.png')
print('已更新 upms-1024.png')

# 复制fightcade.svg到build/icons目录
import shutil
shutil.copy('fightcade.svg', 'build/icons/icon.svg')
shutil.copy('fightcade.svg', 'public/favicon.svg')
print('已更新 icon.svg 和 favicon.svg')

