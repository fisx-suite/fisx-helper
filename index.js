/**
 * @file fisx-helper 模块
 * @author sparklewhy@gmail.com
 */

var _ = require('lodash');
var util = require('./lib/util');
var extractor = require('./lib/extractor');

module.exports = exports = _.assign({}, util, extractor);