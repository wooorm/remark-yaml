var yaml = require('./index.js');
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

// The `yaml` node now has a `yaml` property.
var data = tree.children[0].yaml;

console.log('json', JSON.stringify(data, 0, 2));

// Stringifying the document (note the formatting) yields:
var doc = mdast.stringify(tree);

console.log('markdown', doc);
