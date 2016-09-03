'use strict'

const fs = require('fs');
const glob = require('glob');
const postcss = require('postcss');

 /**
  * Simple function to translate given css to less. Only supports
  * transformations that are required for tachyons.
  */
function toLess(css) {
    var root = postcss.parse(css);
    var variables = '';

    // Handle global variables.
    root.walk(node => {
        if (node.selector == ':root') {
            node.walkDecls(decl => {
                variables += [
                decl.prop.replace('--', '@'), ': ', decl.value, ';\n'
                ].join('');
            });
            node.remove();
        }
    });

    // Replace css3 variables with less variables.
    root.replaceValues(/var\(--(.*)\)/, {fast: 'var'}, (_, p1) => {
        return '@' + p1;
    });

    root.walkAtRules(atRule => {
        // Convert @custom-media into variables.
        if (atRule.name == 'custom-media') {
            var line = atRule.params;
            var idx = line.indexOf(' ');
            var variableName = line.slice(0, idx);
            var value = line.slice(idx + 1);
            variables += [
                variableName.replace('--', '@'), ': ', '~"', value, '";\n'
            ].join('');
            atRule.remove();
        }
        // Handle @media variables
        if (atRule.name == 'media') {
            atRule.params = atRule.params.replace(/\(--(.*)\)/, (_, p1) => {
                return '@' + p1;
            });
        }

        // Handle @imports
        if (atRule.name == 'import') {
            atRule.params = atRule.params.replace('./', 'less/');
        }
    });

    return root.toString() + variables;
}

glob('./node_modules/tachyons/src/**/*.css', function(err, files) {
    if (err) {
        throw err;
    }
    if (!fs.existsSync('less')){
        fs.mkdirSync('less');
    }

    files.forEach(function(file) {
        var css = fs.readFileSync(file, 'utf8');
        var fileName = file.replace(/(\.\/node_modules\/tachyons\/src\/|\.css)/g, '');
        if (fileName == 'tachyons') {
            return;
        }
        fs.writeFileSync('less/' + fileName + '.less', toLess(css));
    });

    // Handle tachyons.css
    var main = fs.readFileSync('./node_modules/tachyons/src/tachyons.css', 'utf8');
    fs.writeFileSync('tachyons.less', toLess(main));
 });
