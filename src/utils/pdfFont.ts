import jsPDF from 'jspdf';

// 字体名称常量
const FONT_NAME = 'NotoSansSC';
const FONT_FILE = 'NotoSansSC-Regular.ttf';
const FONT_PATH = '/fonts/NotoSansSC-Regular.ttf';

// 内存缓存
let fontCache: string | null = null;
let fontLoading: Promise<boolean> | null = null;
let fontRegistered = false; // 标记字体是否已注册到当前 jsPDF 实例

/**
 * 将 Blob 转为 base64 字符串（使用 FileReader，更可靠）
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // 去掉 data:font/ttf;base64, 前缀
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * 加载中文字体（运行时从 public 目录获取，内存缓存）
 * @returns 是否加载成功
 */
export async function loadChineseFont(): Promise<boolean> {
  // 已缓存
  if (fontCache) return true;

  // 正在加载
  if (fontLoading) return fontLoading;

  fontLoading = (async () => {
    try {
      const response = await fetch(FONT_PATH);
      if (!response.ok) {
        console.warn('Failed to fetch Chinese font:', response.status);
        return false;
      }
      const blob = await response.blob();
      const base64 = await blobToBase64(blob);
      fontCache = base64;
      console.log('Chinese font loaded successfully, size:', Math.round(base64.length / 1024 / 1024), 'MB');
      return true;
    } catch (error) {
      console.warn('Failed to load Chinese font for PDF:', error);
      return false;
    } finally {
      fontLoading = null;
    }
  })();

  return fontLoading;
}

/**
 * 注册字体到 jsPDF 实例（确保只注册一次）
 */
function registerFont(doc: jsPDF): void {
  if (fontRegistered || !fontCache) return;

  try {
    // 注册字体文件到虚拟文件系统
    doc.addFileToVFS(FONT_FILE, fontCache);
    // 添加字体（指定 Identity-H 编码以支持中文）
    doc.addFont(FONT_FILE, FONT_NAME, 'normal');
    fontRegistered = true;
    console.log('Chinese font registered to jsPDF');
  } catch (error) {
    console.warn('Failed to register Chinese font:', error);
  }
}

/**
 * 创建支持中文的 jsPDF 实例
 * 自动加载并注册 Noto Sans SC 字体
 */
export async function createChinesePdf(): Promise<jsPDF> {
  const loaded = await loadChineseFont();

  const doc = new jsPDF();

  if (loaded && fontCache) {
    // 每个新 jsPDF 实例都需要重新注册字体
    fontRegistered = false;
    registerFont(doc);

    // 设置默认字体
    try {
      doc.setFont(FONT_NAME);
      console.log('Chinese font set as default');
    } catch (error) {
      console.warn('Failed to set Chinese font as default:', error);
    }
  }

  return doc;
}

/**
 * 在 jsPDF 实例上设置中文字体
 * 每次调用 doc.setFont() 切换字体后，需要重新调用此方法来恢复中文支持
 */
export function setChineseFont(doc: jsPDF): void {
  if (!fontCache) return;

  try {
    // 确保字体已注册到当前实例
    registerFont(doc);
    doc.setFont(FONT_NAME);
  } catch (error) {
    console.warn('Failed to set Chinese font:', error);
  }
}

/**
 * 检查中文字体是否已加载
 */
export function isChineseFontAvailable(): boolean {
  return fontCache !== null;
}

/**
 * 获取字体名称（供 autoTable 等使用）
 */
export function getChineseFontName(): string {
  return FONT_NAME;
}
