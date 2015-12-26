/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module remark:yaml
 * @fileoverview Parse and stringify YAML code blocks in remark.
 */

'use strict';

/* eslint-env commonjs */

/*
 * Dependencies.
 */

var trimTrailingLines = require('trim-trailing-lines');
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

/* global global */
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
 * @param {string} pathlike - File-path-like value.
 * @return {*} - Library.
 * @throws {Error} - When not in node.
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
 * Parse factory.
 *
 * @param {Function} tokenize - Previous parser.
 * @param {Object} settings - Configuration.
 */
function parse(tokenize, settings) {
    var parser = settings.library || jsYAML;
    var method = settings.parse || 'safeLoad';
    var callback = settings.onparse || noop;

    /**
     * Parse YAML, if available, using the bound
     * library and method.
     *
     * @return {Node?} - YAML node.
     */
    return function () {
        var node = tokenize.apply(this, arguments);
        var data;

        if (node && node.value) {
            data = parser[method](node.value /* istanbul ignore next */ || '');

            Object.defineProperty(node, 'yaml', {
                'configurable': true,
                'writable': true,
                'enumerable': false,
                'value': data
            });

            callback(node, this);
        }

        return node;
    };
}

/**
 * Stringify factory.
 *
 * @param {Function} compile - Previous compiler.
 * @param {Object} settings - Configuration.
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
     * @param {MDASTYAMLNode} node - YAML node.
     * @return {string} - Compiled node.
     */
    return function (node) {
        if (node.yaml) {
            node.value = trimTrailingLines(stringifier[method](node.yaml));
        }

        callback(node, this);

        return compile.apply(this, arguments);
    };
}

/**
 * Modify remark to parse/stringify YAML.
 *
 * @param {Remark} remark - Instance
 * @param {Object?} [options] - Configuration.
 */
function attacher(remark, options) {
    var tokenizers = remark.Parser.prototype.blockTokenizers;
    var stringifiers = remark.Compiler.prototype;
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
