'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var test = require('tape');
var tjYAML = require('yaml');
var remark = require('remark');
var remarkYAML = require('./');

/**
 * Shortcut to process.
 *
 * @param {string} value - Markdown.
 * @param {Object?} [options] - Configuration.
 * @param {boolean?} [parseOnly] - Whether to only parse.
 * @return {string} - Processed `value`.
 */
function yaml(value, options, parseOnly) {
    var processor = remark.use(remarkYAML, options);
    var ast = processor.run(processor.parse(value));

    return parseOnly ? ast : processor.stringify(ast);
}

/*
 * Tests.
 */

test('remark-yaml()', function (t) {
    var ast;
    var isInvoked;

    t.equal(typeof remarkYAML, 'function', 'should be a function');

    t.equal(
        yaml([
            '---',
            '"hello": "world"',
            '---',
            '',
            '# Foo bar',
            ''
        ].join('\n')),
        [
            '---',
            'hello: world',
            '---',
            '',
            '# Foo bar',
            ''
        ].join('\n'),
        'should parse and stringify yaml'
    );

    t.equal(
        yaml([
            '---',
            '---',
            '',
            '# Foo bar',
            ''
        ].join('\n')),
        [
            '---',
            '---',
            '',
            '# Foo bar',
            ''
        ].join('\n'),
        'should support empty yaml'
    );

    t.equal(
        yaml([
            '---',
            '"hello": "world"',
            '---',
            '',
            '# Foo bar',
            ''
        ].join('\n'), {
            'parse': 'load',
            'stringify': 'dump'
        }),
        [
            '---',
            'hello: world',
            '---',
            '',
            '# Foo bar',
            ''
        ].join('\n'),
        'should accept `parse` and `stringify`'
    );

    ast = yaml([
        '---',
        '"hello": "world"',
        '---',
        '',
        '# Foo bar',
        ''
    ].join('\n'), null, true).children[0];

    t.equal('yaml' in ast, true);
    t.equal(ast.yaml.hello, 'world', 'should expose a `yaml` property');

    t.equal(
        yaml([
            '---',
            '"hello": "world"',
            '---',
            '',
            '# Foo bar',
            ''
        ].join('\n'), {
            'prettify': false
        }),
        [
            '---',
            '"hello": "world"',
            '---',
            '',
            '# Foo bar',
            ''
        ].join('\n'),
        'should not stringify yaml when `prettify: false`'
    );

    ast = yaml([
        '---',
        '"hello": "world"',
        '---',
        '',
        '# Foo bar',
        ''
    ].join('\n'), {
        'library': tjYAML,
        'parse': 'eval'
    }, true).children[0];

    /*
     * TJs `js-yaml` is a bit lacking, such as not
     * supporting quoted keys.
     */

    t.equal('yaml' in ast, true);
    t.equal(ast.yaml, 'hello', 'should accept `library`');

    t.doesNotThrow(function () {
        yaml('', {
            'library': 'js-yaml'
        });
    }, 'should accept `library: "js-yaml"`');

    t.doesNotThrow(function () {
        yaml('', {
            'library': 'yaml',
            'parse': 'eval'
        });
    }, 'should accept `library` as a string');

    t.doesNotThrow(function () {
        yaml('', {
            'library': 'node_modules/yaml/lib/yaml.js',
            'parse': 'eval'
        });
    });

    t.doesNotThrow(function () {
        yaml('', {
            'library': 'node_modules/yaml/lib/yaml',
            'parse': 'eval'
        });
    }, 'should accept `library` as a path without extension');

    t.throws(
        function () {
            yaml('', {
                'library': 'foo'
            });
        },
        /Cannot find module 'foo'/,
        'should throw when `library` cannot be found'
    );

    /**
     * Assertion.
     *
     * @param {Node} node - YAML node.
     */
    function onparse(node) {
        t.equal(node.type, 'yaml');
        t.equal(node.value, '"hello": "world"');
        t.equal(node.yaml.hello, 'world');

        isInvoked = true;
    }

    isInvoked = false;

    yaml([
        '---',
        '"hello": "world"',
        '---',
        '',
        '# Foo bar',
        ''
    ].join('\n'), {
        'onparse': onparse
    });

    t.equal(isInvoked, true, 'should accept `onparse`');

    /**
     * Assertion.
     *
     * @param {Node} node - YAML node.
     */
    function onstringify(node) {
        t.equal(node.type, 'yaml');
        t.equal(node.value, 'hello: world');
        t.equal(node.yaml.hello, 'world');

        isInvoked = true;
    }

    isInvoked = false;

    yaml([
        '---',
        '"hello": "world"',
        '---',
        '',
        '# Foo bar',
        ''
    ].join('\n'), {
        'onstringify': onstringify
    });

    t.equal(isInvoked, true, 'should accept `onstringify`');

    t.end();
});
