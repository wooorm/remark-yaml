var yaml = require('./index.js');
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

// The `yaml` node now has a `yaml` property.
var data = tree.children[0].yaml;

console.log('json', JSON.stringify(data, 0, 2));

// Stringifying the document (note the formatting) yields:
var doc = remark.stringify(tree);

console.log('markdown', doc);
