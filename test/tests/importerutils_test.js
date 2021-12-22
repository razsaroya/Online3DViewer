var assert = require ('assert');
const {NextPowerOfTwo} = require("../../source/import/importerutils");
const {IsPowerOfTwo} = require("../../source/import/importerutils");

describe ('Power of Two', function () {
    it ('IsPowerOfTwo', function () {
        assert (IsPowerOfTwo (1));
        assert (IsPowerOfTwo (2));
        assert (!IsPowerOfTwo (3));
        for (let i = 4; i <= 1024; i *= 2) {
            assert (IsPowerOfTwo (i));
            assert (!IsPowerOfTwo (i + 1));
            assert (!IsPowerOfTwo (i - 1));
            assert.strictEqual (NextPowerOfTwo (i), i);
            assert.strictEqual (NextPowerOfTwo (i - 1), i);
            assert.strictEqual (NextPowerOfTwo (i + 1), i * 2);
        }
    });
});
