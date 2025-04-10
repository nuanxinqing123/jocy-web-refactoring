/**
 * 图片处理工具函数
 */

// 图片处理
export function handleImage(url) {
    if (url) {
        // 判断域名地址中是否包含[sinaimg]
        if (url.indexOf("sinaimg") !== -1) {
            // 包含
            return "https://image.baidu.com/search/down?url=" + url;
        } else {
            // 不包含
            return url;
        }
    }
    return "";
} 