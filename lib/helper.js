/**
 * @file 辅助工具方法
 * @author sparklewhy@gmail.com
 */

/**
 * 转义字符串的正则字符
 *
 * @param {string} str 要转义的字符串
 * @return {string}
 */
exports.escapeRegexp = function (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
};

/**
 * 替换 URL
 *
 * @param {string} source 要替换的源字符串
 * @param {string} url 要替换的原始 url
 * @param {string} replacement url 要替换的值
 * @return {string}
 */
exports.replaceURL = function (source, url, replacement) {
    if (!url || url === replacement) {
        return source;
    }

    var regexp = new RegExp('([\(\'"\\s,]|^)' + exports.escapeRegexp(url), 'g');
    return source.replace(regexp, '$1' + replacement);
};
