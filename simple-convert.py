
import re
import base64
import shutil
from PIL import Image
from io import BytesIO

# 读取SVG文件
with open('fightcade.svg', 'r', encoding='utf-8') as f:
    svg_content = f.read()

# 提取base64编码的PNG数据
match = re.search(r'xlink:href="data:image/png;base64,([^"]+)"', svg_content)
if match:
    base64_data = match.group(1)
    png_data = base64.b64decode(base64_data)
    
    # 保存原始PNG
    with open('fightcade-original.png', 'wb') as f:
        f.write(png_data)
    
    img = Image.open(BytesIO(png_data))
    print(f"原始图像: mode={img.mode}, size={img.size}")
    
    # 确保使用RGBA模式
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # 生成各种尺寸的PNG
    sizes = [256, 512, 1024]
    for s in sizes:
        resized = img.resize((s, s), Image.Resampling.LANCZOS)
        resized.save(f'build/icons/{s}x{s}.png', 'PNG')
        print(f"已保存: build/icons/{s}x{s}.png, mode={resized.mode}")
    
    # 保存upms-1024.png
    resized = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    resized.save('build/icons/upms-1024.png', 'PNG')
    print(f"已保存: build/icons/upms-1024.png")
    
    # 复制SVG到build/icons/icon.svg和public/favicon.svg
    shutil.copy('fightcade.svg', 'build/icons/icon.svg')
    shutil.copy('fightcade.svg', 'public/favicon.svg')
    print("已更新icon.svg和favicon.svg")

print("\n图标生成完成！")
