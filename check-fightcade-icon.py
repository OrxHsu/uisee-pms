
import base64
from PIL import Image
from io import BytesIO
import re

# 读取fightcade.svg文件
with open('fightcade.svg', 'r') as f:
    svg_content = f.read()

# 提取base64编码的PNG数据
match = re.search(r'xlink:href="data:image/png;base64,([^"]+)"', svg_content)
if match:
    png_base64 = match.group(1)
    # 解码base64
    png_data = base64.b64decode(png_base64)
    
    # 用PIL打开图像
    img = Image.open(BytesIO(png_data))
    print(f"原始图像信息: mode={img.mode}, size={img.size}")
    
    # 检查是否有彩色像素
    pixels = list(img.getdata())
    has_color = False
    for p in pixels:
        if len(p) >= 3:
            r, g, b = p[0], p[1], p[2]
            if r != g or g != b:
                has_color = True
                break
    
    print(f"是否有彩色: {has_color}")
    
    # 保存原始图像以便查看
    img.save('fightcade-original.png')
    print("原始图像已保存为 fightcade-original.png")
else:
    print("未找到PNG数据")

