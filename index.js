'use strict';

/*
 * Dependencies.
 */

var jsYAML = null;
var fs = {};
var path = {};
var proc = {};

try {
    jsYAML = require('js-yaml');
} catch (exception) {/* empty */}

try {
    fs = require('fs');
} catch (exception) {/* empty */}

try {
    path = require('path');
} catch (exception) {/* empty */}

/*
 * Hide process use from browserify/component/duo.
 */

/* istanbul ignore else */
if (typeof global !== 'undefined' && global.process) {
    proc = global.process;
}

/*
 * Methods.
 */

var exists = fs.existsSync;
var resolve = path.resolve;

/*
 * Constants.
 */

var JS_YAML = 'js-yaml';

/**
 * Find a library.
 *
 * @param {string} pathlike
 * @return {Object}
 */
function loadLibrary(pathlike) {
    var cwd;
    var local;
    var npm;
    var plugin;

    if (pathlike === JS_YAML && jsYAML) {
        return jsYAML;
    }

    cwd = proc.cwd && proc.cwd();

    /* istanbul ignore if */
    if (!cwd) {
        throw new Error('Cannot lazy load library when not in node');
    }

    local = resolve(cwd, pathlike);
    npm = resolve(cwd, 'node_modules', pathlike);

    if (exists(local) || exists(local + '.js')) {
        plugin = local;
    } else if (exists(npm)) {
        plugin = npm;
    } else {
        plugin = pathlike;
    }

    return require(plugin);
}

/**
 * No-operation.
 */
function noop() {}

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
    var callback = settings.onparse || noop;

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

        callback(node, this);
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
    var callback = settings.onstringify || noop;

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

        callback(node, this);

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

    if (typeof settings.library === 'string') {
        settings.library = loadLibrary(settings.library);
    }

    tokenizers.yamlFrontMatter = parse(tokenizers.yamlFrontMatter, settings);
    stringifiers.yaml = stringify(stringifiers.yaml, settings);
}

/*
 * Expose.
 */

module.exports = attacher;
