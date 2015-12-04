/**
 * @file 工具方法
 * @author sparklewhy@gmail.com
 */

var fs = require('fs');
var pathUtil = require('path');
var minimatch = require('minimatch');
var _ = require('lodash');
var html = require('./html');

/**
 * 递归遍历给定的目录，收集指定 pattern 的文件
 *
 * @param {string} baseDir 初始基准目录
 * @param {string} dir 要遍历的目录
 * @param {Array.<{absolutePath: string, data: Object}>} collectFiles 收集的文件
 * @param {Array.<string|RegExp>} collectFilePatterns 要收集的文件 pattern，
 *        pattern 可以是正则表达式 或者符合 `minimatch` 的 pattern
 */
exports.traverse = function (baseDir, dir, collectFiles, collectFilePatterns) {
    var fileList = fs.readdirSync(dir);

    for (var f = 0, fLen = fileList.length; f < fLen; f++) {
        var fileName = fileList[f];
        var filePath = pathUtil.resolve(dir, fileName);
        var stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            exports.traverse(baseDir, filePath, collectFiles, collectFilePatterns);
        }
        else {
            var relativePath = pathUtil.relative(baseDir, filePath);
            for (var i = 0, len = collectFilePatterns.length; i < len; i++) {
                var pattern = collectFilePatterns[i];
                if ((pattern instanceof RegExp && pattern.test(relativePath))
                    || (typeof pattern === 'string' && minimatch(relativePath, collectFilePatterns[i]))) {
                    collectFiles.push({
                        absolutePath: filePath,
                        data: fs.readFileSync(filePath, 'utf8')
                    });
                    break;
                }
            }
        }
    }
};

/**
 * 提取链接的样式文件
 *
 * @param {string} content 要提取的文件内容
 * @return {Array.<string>}
 */
exports.extractLinkStyleFile = function (content) {
    var linkFiles = [];

    html.parseHtmlStyle(content, function (found) {
        if (found.isStyleLink) {
            linkFiles.push(found.href);
        }
        return found.match;
    });

    return linkFiles;
};

/**
 * 异步模块 require 正则定义
 *
 * @const
 * @type {RegExp}
 */
var ASYNC_REQUIRE_REGEXP = /(?:\s+|^)require\s*\(\s*\[([^\]]+)\]\s*[\)|,]/g;

/**
 * 提取入口模块 id
 *
 * @param {string} content 要提取的文件内容
 * @return {Array.<string>}
 */
exports.extractAsyncModuleIds = function (content) {
    var asynModuleIds = [];
    var result;
    while (result = ASYNC_REQUIRE_REGEXP.exec(content)) {
        var requireModuleStr = result[1];
        var moduleIdArr = requireModuleStr.split(',');

        for (var i = 0, len = moduleIdArr.length; i < len; i++) {
            var id = moduleIdArr[i];
            id = id.trim();

            // 去掉首尾引号
            var moduleId = id.substr(1, id.length - 2);
            if (moduleId && !_.includes(asynModuleIds, moduleId)) {
                asynModuleIds.push(moduleId);
            }
        }
    }
    return asynModuleIds;
};
