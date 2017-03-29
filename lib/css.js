/**
 * @file css 相关工具方法
 * @author sparklewhy@gmail.com
 */

var pathUtil = require('./path-util');
var helper = require('./helper');

var CSS_URL_REGEXP = /url\s*\(\s*['"]?\s*([^'")]+)\s*['"]?\s*\)/g;

var CSS_IMPORT_REGEXP = /@import\s+(?:url\s*\(\s*)?['"]?\s*([^'")]+)\s*['"]?(?:\s*\))?([^;]*);/g;

var CSS_SRC_REGEXP = /\bsrc\s*=\s*('|")([^'"\s)]+)\1/g;

var CSS_IMAGE_SET_REGEXP = /image-set\(\s*(['"][\s\S]*?)\)/g;

/**
 * 用于提取样式中 url 属性值里包含的链接
 *
 * @const
 * @type {RegExp}
 */
exports.CSS_URL_REGEXP = CSS_URL_REGEXP;

/**
 * 提取 import 样式的正则
 *
 * @const
 * @type {RegExp}
 */
exports.CSS_IMPORT_REGEXP = CSS_IMPORT_REGEXP;

/**
 * ie alphaimageloader 引用的资源提取正则
 *
 * @const
 * @type {RegExp}
 */
exports.CSS_SRC_REGEXP = CSS_SRC_REGEXP;

/**
 * 提取 image-set 非 url() 方式的样式
 *
 * @const
 * @type {RegExp}
 */
exports.CSS_IMAGE_SET_REGEXP = CSS_IMAGE_SET_REGEXP;

var URL_EXTRACT_REGEXP = /(['"])([^'"]+)\1/g;

function processReferURLResource(fileContent, replacer) {
    return fileContent.replace(CSS_URL_REGEXP, replacer)
        .replace(CSS_IMPORT_REGEXP, replacer)
        .replace(CSS_IMAGE_SET_REGEXP, function (match, imgSet) {
            var result;
            var urls = [];
            while ((result = URL_EXTRACT_REGEXP.exec(imgSet))) {
                if (urls.indexOf(result[2]) === -1) {
                    urls.push(result[2]);
                }
            }
            return replacer(match, urls);
        })
        .replace(CSS_SRC_REGEXP, function (match, quot, url) {
            return replacer(match, url);
        });
}

/**
 * 处理 CSS 样式引用的 url 资源
 *
 * @param {string} fileContent 样式内容
 * @param {function(string, string):string} replacer 自定义的替换处理器
 * @return {string} 更新后的样式内容
 */
exports.processCSSURLResource = processReferURLResource;

/**
 * 规范化 CSS 样式引用的 url 资源
 *
 * @param {string} filePath 样式内容所在的文件路径
 * @param {string} fileContent 样式内容
 * @param {string} targetFilePath 样式重新被引用的目标文件路径
 * @param {boolean=} isAbsolute 是否 resolve css url 资源路径为绝对路径，可选，
 *        默认 false，即相对路径
 * @return {string} 更新后的样式内容
 */
exports.normalizeCSSURLResource = function (
    filePath, fileContent, targetFilePath, isAbsolute
) {
    return processReferURLResource(fileContent, function (match, urls) {
        if (!Array.isArray(urls)) {
            urls = [urls];
        }

        for (var i = 0, len = urls.length; i < len; i++) {
            var urlItem = urls[i];

            if (urlItem && pathUtil.isLocalPath(urlItem)) {
                var processedUrlItem = pathUtil.rebasePath(
                    urlItem, filePath, targetFilePath
                );

                if (isAbsolute) {
                    processedUrlItem = '/' + processedUrlItem;
                }
                match = helper.replaceURL(
                    match, urlItem, pathUtil.normalizePath(processedUrlItem)
                );
            }
        }

        return match;
    });
};


