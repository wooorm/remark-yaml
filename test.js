'use strict';

/* eslint-env mocha */

/*
 * Dependencies.
 */

var assert = require('assert');
var tjYAML = require('yaml');
var mdast = require('mdast');
var mdastYAML = require('./');

/**
 * Shortcut to process.
 *
 * @param {string} value
 * @param {Object?} options
 * @return {string}
 */
function yaml(value, options, parseOnly) {
    var processor = mdast.use(mdastYAML, options);
    var ast = processor.run(processor.parse(value));

    return parseOnly ? ast : processor.stringify(ast);
}

/*
 * Tests.
 */

describe('mdast-yaml()', function () {
    it('should be a function', function () {
        assert(typeof mdastYAML === 'function');
    });

    it('should parse and stringify yaml', function () {
        assert(yaml([
            '---',
            '"hello": "world"',
            '---',
            '',
            '# Foo bar',
            ''
        ].join('\n')) === [
            '---',
            'hello: world',
            '---',
            '',
            '# Foo bar',
            ''
        ].join('\n'));
    });

    it('should support empty yaml', function () {
        assert(yaml([
            '---',
            '---',
            '',
            '# Foo bar',
            ''
        ].join('\n')) === [
            '---',
            '---',
            '',
            '# Foo bar',
            ''
        ].join('\n'));
    });

    it('should accept `parse` and `stringify`', function () {
        assert(yaml([
            '---',
            '"hello": "world"',
            '---',
            '',
            '# Foo bar',
            ''
        ].join('\n'), {
            'parse': 'load',
            'stringify': 'dump'
        }) === [
            '---',
            'hello: world',
            '---',
            '',
            '# Foo bar',
            ''
        ].join('\n'));
    });

    it('should expose a `yaml` property', function () {
        var ast = yaml([
            '---',
            '"hello": "world"',
            '---',
            '',
            '# Foo bar',
            ''
        ].join('\n'), null, true).children[0];

        assert('yaml' in ast);
        assert('hello' in ast.yaml);
        assert(ast.yaml.hello === 'world');
    });

    it('should not stringify yaml when `prettify: false`', function () {
        assert(yaml([
            '---',
            '"hello": "world"',
            '---',
            '',
            '# Foo bar',
            ''
        ].join('\n'), {
            'prettify': false
        }) === [
            '---',
            '"hello": "world"',
            '---',
            '',
            '# Foo bar',
            ''
        ].join('\n'));
    });

    it('should accept `library`', function () {
        var ast = yaml([
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

        assert('yaml' in ast);
        assert(ast.yaml === 'hello');
    });

    it('should accept `library: "js-yaml"`', function () {
        assert.doesNotThrow(function () {
            yaml('', {
                'library': 'js-yaml'
            });
        });
    });

    it('should accept `library` as a string', function () {
        assert.doesNotThrow(function () {
            yaml('', {
                'library': 'yaml',
                'parse': 'eval'
            });
        });
    });

    it('should accept `library` as a path', function () {
        assert.doesNotThrow(function () {
            yaml('', {
                'library': 'node_modules/yaml/lib/yaml.js',
                'parse': 'eval'
            });
        });
    });

    it('should accept `library` as a path without extension', function () {
        assert.doesNotThrow(function () {
            yaml('', {
                'library': 'node_modules/yaml/lib/yaml',
                'parse': 'eval'
            });
        });
    });

    it('should throw when `library` cannot be found', function () {
        assert.throws(function () {
            yaml('', {
                'library': 'foo'
            });
        }, /Cannot find module 'foo'/);
    });

    it('should accept `onparse`', function () {
        var isInvoked;

        /**
         * Assertion.
         */
        function onparse(node) {
            assert(node.type === 'yaml');
            assert(node.value === '"hello": "world"');
            assert(node.yaml.hello === 'world');

            isInvoked = true;
        }

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

        assert(isInvoked === true);
    });

    it('should accept `onstringify`', function () {
        var isInvoked;

        /**
         * Assertion.
         */
        function onstringify(node) {
            assert(node.type === 'yaml');
            assert(node.value === 'hello: world');
            assert(node.yaml.hello === 'world');

            isInvoked = true;
        }

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

        assert(isInvoked === true);
    });
});
