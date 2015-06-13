# mdast-yaml [![Build Status](https://img.shields.io/travis/wooorm/mdast-yaml.svg?style=flat)](https://travis-ci.org/wooorm/mdast-yaml) [![Coverage Status](https://img.shields.io/coveralls/wooorm/mdast-yaml.svg?style=flat)](https://coveralls.io/r/wooorm/mdast-yaml?branch=master)

Parse and stringify YAML code blocks in **mdast**.

Supports IE9+ ([mdn](https://developer.mozilla.org/JavaScript/Reference/Global_Objects/Object/defineProperty), [Kangax](http://kangax.github.io/compat-table/es5/#Object.defineProperty)).

## Installation

[npm](https://docs.npmjs.com/cli/install)

```bash
npm install mdast-yaml
```

[Component.js](https://github.com/componentjs/component)

```bash
component install wooorm/mdast-yaml
```

[Bower](http://bower.io/#install-packages)

```bash
bower install mdast-yaml
```

[Duo](http://duojs.org/#getting-started)

```javascript
var yaml = require('wooorm/mdast-yaml');
```

UMD: globals, AMD, and CommonJS ([uncompressed](mdast-yaml.js) and [compressed](mdast-yaml.min.js)):

```html
<script src="path/to/mdast.js"></script>
<script src="path/to/mdast-yaml.js"></script>
<script>
  mdast.use(mdastYAML);
</script>
```

## Table of Contents

*   [Usage](#usage)

*   [API](#api)

    *   [mdast.use(yaml, options)](#mdastuseyaml-options)

*   [License](#license)

## Usage

```javascript
var yaml = require('mdast-yaml');
var mdast = require('mdast').use(yaml);
var input = [
    '---',
    '"layout": "post"',
    '"title": \'Blogging Like a Hacker\'',
    '---',
    '',
    '# A header!',
    ''
].join('\n');
var tree = mdast.parse(input);
```

The `yaml` node now has a `yaml` property.

```javascript
var data = tree.children[0].yaml;
```

```json
{
  "layout": "post",
  "title": "Blogging Like a Hacker"
}
```

Stringifying the document (note the formatting) yields:

```javascript
var doc = mdast.stringify(tree);
```

```markdown
---
layout: post
title: Blogging Like a Hacker
---

# A header!
```

## API

### [mdast](https://github.com/wooorm/mdast#api).[use](https://github.com/wooorm/mdast#mdastuseplugin-options)(yaml, options)

Adds a `yaml` property to [**YAML**](https://github.com/wooorm/mdast/blob/master/doc/Nodes.md#yaml) nodes.

**Signatures**

*   `mdast = mdast.use(yaml, options?)`.

**Parameters**

*   `yaml` — This plugin;

*   `options` (`Object?`) — Settings:

    *   `library` (`string?` or `Object?`, default: [`nodeca/js-yaml`](https://github.com/nodeca/js-yaml))
        — you can also pass a file or node module in;

    *   `parse` (`string?`, default [`"safeLoad"`](https://github.com/nodeca/js-yaml#safeload-string---options-));

    *   `stringify` (`string?`, default [`"safeDump"`](https://github.com/nodeca/js-yaml#safedump-object---options-));

    *   `prettify` (`boolean?`, default: `true`)
        — When true, the node’s content will be overwritten by the result
        of `library[stringify](node.yaml)`;

    *   `onparse` (`function(Node)`, default `function () {}`)
        — Invoked when YAML is parsed, during parsing;

    *   `onstringify` (`function(Node)`, default `function () {}`)
        — Invoked when YAML is stringified, during stringification.

## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com)
