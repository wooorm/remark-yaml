# remark-yaml [![Build Status](https://img.shields.io/travis/wooorm/remark-yaml.svg)](https://travis-ci.org/wooorm/remark-yaml) [![Coverage Status](https://img.shields.io/codecov/c/github/wooorm/remark-yaml.svg)](https://codecov.io/github/wooorm/remark-yaml)

Parse and stringify YAML code blocks in **remark**.

Supports IE9+ ([mdn](https://developer.mozilla.org/JavaScript/Reference/Global_Objects/Object/defineProperty), [Kangax](http://kangax.github.io/compat-table/es5/#Object.defineProperty)).

## Installation

[npm](https://docs.npmjs.com/cli/install)

```bash
npm install remark-yaml
```

[Component.js](https://github.com/componentjs/component)

```bash
component install wooorm/remark-yaml
```

[Bower](http://bower.io/#install-packages)

```bash
bower install remark-yaml
```

[Duo](http://duojs.org/#getting-started)

```javascript
var yaml = require('wooorm/remark-yaml');
```

UMD: globals, AMD, and CommonJS ([uncompressed](remark-yaml.js) and [compressed](remark-yaml.min.js)):

```html
<script src="path/to/remark.js"></script>
<script src="path/to/remark-yaml.js"></script>
<script>
  remark.use(remarkYAML);
</script>
```

## Table of Contents

*   [Usage](#usage)

*   [API](#api)

    *   [remark.use(yaml, options)](#remarkuseyaml-options)

*   [License](#license)

## Usage

```javascript
var yaml = require('remark-yaml');
var remark = require('remark').use(yaml);
var input = [
    '---',
    '"layout": "post"',
    '"title": \'Blogging Like a Hacker\'',
    '---',
    '',
    '# A header!',
    ''
].join('\n');
var tree = remark.parse(input);
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
var doc = remark.stringify(tree);
```

```markdown
---
layout: post
title: Blogging Like a Hacker
---

# A header!
```

## API

### [remark](https://github.com/wooorm/remark#api).[use](https://github.com/wooorm/remark#remarkuseplugin-options)(yaml, options)

Adds a `yaml` property to [**YAML**](https://github.com/wooorm/remark/blob/master/doc/Nodes.md#yaml) nodes.

**Signatures**

*   `remark = remark.use(yaml, options?)`.

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
