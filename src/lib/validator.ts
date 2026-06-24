// 平台专用文案格式校验
// 每个平台有特定的格式要求

export interface ValidationRule {
  id: string;
  platform: string;
  rule: string;
  severity: "error" | "warning";
}

// 小红书：检查是否带了话题标签
export function validateContent(
  platform: string,
  content: string
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  switch (platform) {
    case "xiaohongshu":
      // 检查是否包含话题标签
      if (!content.match(/#[一-龥\w]+/g)?.length) {
        warnings.push("建议添加5-10个#话题标签提升曝光");
      }
      // 检查长度
      if (content.length > 2000) {
        warnings.push("小红书正文建议800字以内，当前超出");
      }
      break;

    case "wechat":
      if (content.length < 500) {
        warnings.push("公众号文章建议至少1500字深度内容");
      }
      break;

    case "douyin":
      if (!content.includes("|")) {
        warnings.push("抖音脚本建议使用表格格式（时间|画面|口播|字幕）");
      }
      break;

    case "toutiao":
      if (content.length < 300) {
        warnings.push("头条文章建议至少800字");
      }
      break;
  }

  return {
    valid: true, // 永远不阻止输出，只给建议
    warnings,
  };
}
