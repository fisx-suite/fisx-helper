/**
 * @file fisx-helper 模块
 * @author sparklewhy@gmail.com
 */

var util = require('./lib/util');
var html = require('./lib/html');
var extractor = require('./lib/extractor');

function assign(target) {
    var srcs = [].slice.call(arguments, 1);
    srcs.forEach(function (item) {
        var keys = Object.keys(item);
        for (var i = 0, len = keys.length; i < len; i++) {
            var k = keys[i];
            if (item.hasOwnProperty(k)) {
                target[k] = item[k];
            }
        }
    });
    return target;
}

module.exports = exports = assign({}, util, html, extractor);
