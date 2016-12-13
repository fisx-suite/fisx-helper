/**
 * @file 提供各种资源或信息的工具方法
 * @author sparklewhy@gmail.com
 */

var util = require('./util');

/**
 * 获取要处理的文件
 *
 * @inner
 * @param {Object} options 选项信息
 * @param {Array.<string>=} options.files 要处理的文件，文件的 pattern 使用 `minimatch`
 *                          的 pattern 或者 正则表达式，可选，默认处理 tpl 或者 html 文件类型
 * @param {string|Array.<string>=} options.scanDir 要扫描的目录，可选默认当前工作目录
 * @return {Array.<{absolutePath: string, data: string}>}
 */
function getProcessFiles(options) {
    options.files || (options.files = [/.*\.(tpl|html)$/]);

    // 如果传入的为文件对象，则直接返回，无需处理
    if (options.files[0].absolutePath) {
        return [].concat(options.files);
    }

    var collectFiles = [];
    var scanDir = options.scanDir || process.cwd();

    if (!Array.isArray(scanDir)) {
        scanDir = [scanDir];
    }

    scanDir.forEach(function (dir) {
        util.traverse(dir, dir, collectFiles, options.files);
    });

    return collectFiles;
}

/**
 * 获取提取的信息
 *
 * @inner
 * @param {Array.<string>} rawResult 原始结果列表
 * @param {Object} options 选项信息
 * @param {function(string):boolean=} options.filter 过滤要返回的文件路径，可选，默认所
 *                                    有提取的文件路径全部返回
 * @param {function(string):string=} options.preprocess 对要返回的路径做预处理，可选，
 *                                    默认直接返回原始提取的文件路径
 * @return {Array.<string>}
 */
function getExtractInfo(rawResult, options) {
    var result = [];
    var filter = options.filter;
    var preprocess = options.preprocess;
    rawResult.forEach(function (path) {
        if (typeof filter === 'function') {
            !filter(path) && (path = null);
        }

        if (path && typeof preprocess === 'function') {
            path = preprocess(path);
        }

        if (path && result.indexOf(path) === -1) {
            result.push(path);
        }
    });

    return result;
}

/**
 * 提取链接的样式文件路径
 *
 * @param {Object} options 提取选项信息
 * @param {Array.<string|Object>=} options.files 要处理的文件，文件的 pattern 使用
 *        `minimatch` 的 pattern 或者 正则表达式，或者传入已经读取的文件对象，结构为
 *        {absolutePath: string, data: string}
 *        可选，默认处理 tpl 或者 html 文件类型
 * @param {function(string):boolean=} options.filter 过滤要返回的文件路径，可选，默认所
 *                                    有提取的文件路径全部返回
 * @param {function(string):string=} options.preprocess 对要返回的路径做预处理，可选，
 *                                    默认直接返回原始提取的文件路径
 * @param {string|Array.<string>=} options.scanDir 要扫描的目录，可选默认当前工作目录
 * @return {Array.<string>}
 */
exports.extractLinkStyleFileSync = function (options) {
    options || (options = {});
    var collectFiles = getProcessFiles(options);

    var styleFiles = [];
    collectFiles.forEach(function (file) {
        styleFiles.push.apply(styleFiles, util.extractLinkStyleFile(file.data));
    });

    return getExtractInfo(styleFiles, options);
};

/**
 * 提取页面的入口模块
 *
 * @param {Object} options 提取选项信息
 * @param {Array.<string>=} options.files 要处理的文件，文件的 pattern 使用 `minimatch`
 *                          的 pattern 或者 正则表达式，可选，默认处理 tpl 或者 html 文件类型
 * @param {function(string):boolean=} options.filter 过滤要返回的模块，可选，默认所
 *                                    有提取的文件路径全部返回
 * @param {function(string):string=} options.preprocess 对要返回的路径做预处理，可选，
 *                                    默认直接返回原始提取的文件路径
 * @param {string|Array.<string>=} options.scanDir 要扫描的目录，可选默认当前工作目录
 * @return {Array.<string>}
 */
exports.extractPageEntryModules = function (options) {
    options || (options = {});
    var collectFiles = getProcessFiles(options);

    var moduleIds = [];
    collectFiles.forEach(function (file) {
        moduleIds.push.apply(moduleIds, util.extractAsyncModuleIds(file.data));
    });

    return getExtractInfo(moduleIds, options);
};
