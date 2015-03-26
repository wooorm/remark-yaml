'use strict';

/*
 * Dependencies.
 */

var jsYAML = null;

try {
    jsYAML = require('js-yaml');
} catch (exception) {}

/**
 * Remove trailing newline.
 *
 * @param {string} value
 * @return {string}
 */
function removeLastLine(value) {
    return value && value.charAt(value.length === '\n') ?
        value.slice(0, -1) :
        value || '';
}

/**
 * Parse factory.
 *
 * @param {Function} tokenize - Previous parser.
 * @param {Object} settings
 */
function parse(tokenize, settings) {
    var parser = settings.library || jsYAML;
    var method = settings.parse || 'safeLoad';

    /**
     * Parse YAML, if available, using the bound
     * library and method.
     *
     * @param {function(string)} eat
     * @param {string} $0 - Whole value.
     * @param {string} $1 - YAML.
     */
    return function (eat, $0, $1) {
        var data = parser[method]($1 || '') || '';
        var node = this.renderRaw('yaml', removeLastLine($1));

        Object.defineProperty(node, 'yaml', {
            'configurable': true,
            'writable': true,
            'enumerable': false,
            'value': data
        });

        eat($0)(node);
    };
}

/**
 * Stringify factory.
 *
 * @param {Function} compile - Previous compiler.
 * @param {Object} settings
 */
function stringify(compile, settings) {
    var stringifier = settings.library || jsYAML;
    var method = settings.stringify || 'safeDump';

    if (settings.prettify === false) {
        return compile;
    }

    /**
     * Stringify YAML, if available, using the bound
     * library and method.
     *
     * @param {Object} node
     * @return {string}
     */
    return function (node) {
        if (node.yaml) {
            node.value = removeLastLine(stringifier[method](node.yaml));
        }

        return compile.apply(this, arguments);
    };
}

/**
 * Modify mdast to parse/stringify YAML.
 *
 * @param {MDAST} mdast
 * @param {Object?} options
 */
function attacher(mdast, options) {
    var tokenizers = mdast.Parser.prototype.blockTokenizers;
    var stringifiers = mdast.Compiler.prototype;
    var settings = options || {};

    tokenizers.yamlFrontMatter = parse(tokenizers.yamlFrontMatter, settings);
    stringifiers.yaml = stringify(stringifiers.yaml, settings);
}

/*
 * Expose.
 */

module.exports = attacher;
