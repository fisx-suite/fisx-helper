/**
 * @file 路径相关工具方法
 * @author sparklewhy@gmail.com
 */

var pathUtil = require('path');

/**
 * 判断给定的路径是不是本地路径
 *
 * @param {string} filePath 要判断的文件路径
 * @return {boolean}
 */
exports.isLocalPath = function (filePath) {
    return !(/^\/\//.test(filePath) || /^[a-z][a-z0-9\+\-\.]+:/i.test(filePath));
};

/**
 * 规范化给定的文件路径
 *
 * @param {string} srcPath 路径
 * @return {string}
 */
exports.normalizePath = function (srcPath) {
    return pathUtil.normalize(srcPath).replace(/\\/g, '/');
};

/**
 * 重新计算文件的相对路径
 *
 * @param {string} filePath 当前引用的文件路径
 * @param {string} referFilePath 引用该文件的路径
 * @param {string} rebaseFilePath 重新调整的目标文件路径
 * @return {string}
 */
exports.rebasePath = function (filePath, referFilePath, rebaseFilePath) {
    if (!exports.isLocalPath(filePath) || /^\//.test(filePath)) {
        return filePath;
    }
    var relativeDir = pathUtil.relative(
        pathUtil.dirname(rebaseFilePath), pathUtil.dirname(referFilePath)
    );
    return pathUtil.join(relativeDir, filePath);
};

/**
 * 重新计算给定的相对路径为绝对路径
 *
 * @param {string} relativePath 相对路径
 * @param {string} baseFilePath 相对的文件的路径
 * @return {string}
 */
exports.resolvePath = function (relativePath, baseFilePath) {
    var slashRegex = /^\//;
    if (!exports.isLocalPath(relativePath) || slashRegex.test(relativePath)) {
        return relativePath;
    }

    relativePath = exports.normalizePath(relativePath);
    baseFilePath = exports.normalizePath(baseFilePath);
    if (!slashRegex.test(baseFilePath)) {
        baseFilePath = '/' + baseFilePath;
    }
    return exports.normalizePath(
        pathUtil.join(pathUtil.dirname(baseFilePath), relativePath)
    );
};
