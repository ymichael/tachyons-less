'use strict'

const fs = require('fs');
const less = require('less');
const expect = require('expect');

describe('tachyons-less', function() {
    it('should compile with no errors', function(done) {
        // Set the timeout of this test to 10000 ms because this might take a
        // while.
        this.timeout(10000);
        var input = fs.readFileSync('tachyons.less', 'utf8');
        less.render(input, {}, function(err, output) {
            done(err);
        });
    });
});
