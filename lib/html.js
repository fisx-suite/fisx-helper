/**
 * @file 解析 html 文件
 * @author sparklewhy@gmail.com
 */

var SCRIPT_ELEM_REGEXP
    = /<!--([\s\S]*?)(?:-->|$)|(\s*<script([^>]*)>([\s\S]*?)<\/script>)\n?/ig;
var LINK_STYLE_ELEM_REGEXP
    = /<!--([\s\S]*?)(?:-->|$)|(?:\s*(<link([^>]*?)(?:\/)?>)|(<style([^>]*)>([\s\S]*?)<\/style>))\n?/ig;

var TYPE_ATTR_REGEXP = /type=('|")(.*?)\1/i;
var SRC_HREF_ATTR_REGEXP = /\s*(?:src|href)=('|")(.+?)\1/i;
var REL_ATTR_REGEXP = /rel=('|")stylesheet\1/i;
var LOADER_ATTR_REGEXP = /data\-loader(?:=('|").*?\1)?/i;
var ENTRY_ATTR_REGEXP = /data\-entry(?:=('|").*?\1)?/i;

var SCRIPT_TYPES = ['text/javascript', 'application/javascript'];

module.exports = exports = {};

/**
 * 解析 html 的脚本
 *
 * @param {string} content 要解析的 html 内容
 * @param {function(Object):string} replacer 碰到解析到的脚本元素要执行的替换逻辑
 * @return {string}
 */
exports.parseHtmlScript = function (content, replacer) {
    return content.replace(SCRIPT_ELEM_REGEXP,
        function (all, comment, script, attrs, body) {
            if (comment) {
                return all;
            }

            body = body.trim();
            if (!body && SRC_HREF_ATTR_REGEXP.test(attrs)) {
                var src = RegExp.$2;
                attrs = attrs.replace(SRC_HREF_ATTR_REGEXP, '').replace(/\s+$/, '');
                return replacer({
                    match: all,
                    isScriptLink: true,
                    src: src,
                    isLoader: LOADER_ATTR_REGEXP.test(attrs),
                    attrs: attrs
                });
            }
            else if (!TYPE_ATTR_REGEXP.test(attrs)
                || (SCRIPT_TYPES.indexOf(RegExp.$2.toLowerCase()) !== -1)
            ) {
                return replacer({
                    match: all,
                    isInlineScript: true,
                    inlineContent: body,
                    isEntryScript: ENTRY_ATTR_REGEXP.test(attrs),
                    attrs: attrs
                });
            }

            return replacer({
                match: all,
                inlineContent: body,
                attrs: attrs
            });
        }
    );
};

/**
 * 解析 html 的样式
 *
 * @param {string} content 要解析的 html 内容
 * @param {function(Object):string} replacer 碰到解析到的样式元素要执行的替换逻辑
 * @return {string}
 */
exports.parseHtmlStyle = function (content, replacer) {
    return content.replace(LINK_STYLE_ELEM_REGEXP,
        function (all, comment, link, linkAttr, style, styleAttr, body) {
            if (comment) {
                return all;
            }

            var isStyleLink = link && REL_ATTR_REGEXP.test(linkAttr)
                && SRC_HREF_ATTR_REGEXP.test(linkAttr);
            if (isStyleLink) {
                var href = RegExp.$2;
                linkAttr = linkAttr
                    .replace(SRC_HREF_ATTR_REGEXP, '')
                    .replace(/\s+$/, '');
                return replacer({
                    match: all,
                    isStyleLink: true,
                    href: href,
                    attrs: linkAttr
                });
            }
            else if (style) {
                return replacer({
                    match: all,
                    isInlineStyle: true,
                    inlineContent: body.trim(),
                    attrs: styleAttr
                });
            }

            return replacer({
                match: all,
                link: link
            });
        }
    );
};

/**
 * 获取 require.config 配置的脚本内容
 *
 * @param {Object} config 配置信息
 * @param {boolean|number=} indent 是否缩进或者缩进的空格数，可选，默认缩进：2
 * @return {string}
 */
exports.getRequireConfigScript = function (config, indent) {
    var hasIndent = indent !== false;
    var result = JSON.stringify(config, null, hasIndent ? (indent || 2) : null);
    return 'require.config(' + result + ');';
};

/**
 * 创建 require.config 配置脚本
 *
 * @param {Object} config 配置信息
 * @return {string}
 */
exports.createRequireConfigScript = function (config) {
    return '<script>\n' + exports.getRequireConfigScript(config) + '\n</script>';
};
