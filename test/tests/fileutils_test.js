var assert = require ('assert');
const {GetFileName} = require("../../source/io/fileutils");
const {GetFileExtension} = require("../../source/io/fileutils");
const {ReadLines} = require("../../source/import/importerutils");

function GetLines (str)
{
    var lines = [];
    ReadLines (str, function (line) {
        lines.push (line);
    });
    return lines;
}

describe ('File Utils', function () {
    it ('Get File Extension', function () {
        assert.strictEqual (GetFileExtension ('file'), '');
        assert.strictEqual (GetFileExtension ('file.obj'), 'obj');
        assert.strictEqual (GetFileExtension ('file.OBJ'), 'obj');
    });    
    
    it ('Get File Name', function () {
        assert.strictEqual (GetFileName ('file'), 'file');
        assert.strictEqual (GetFileName ('file.obj'), 'file.obj');
        assert.strictEqual (GetFileName ('file.OBJ'), 'file.OBJ');
        assert.strictEqual (GetFileName ('folder/file'), 'file');
        assert.strictEqual (GetFileName ('folder/file.obj'), 'file.obj');
        assert.strictEqual (GetFileName ('folder/file.OBJ'), 'file.OBJ');
        assert.strictEqual (GetFileName ('folder\\file'), 'file');
        assert.strictEqual (GetFileName ('folder\\file.obj'), 'file.obj');
        assert.strictEqual (GetFileName ('folder\\file.OBJ'), 'file.OBJ');
    });    

    it ('Read Lines', function () {
        assert.deepStrictEqual (GetLines (''), []);
        assert.deepStrictEqual (GetLines ('\n'), []);
        assert.deepStrictEqual (GetLines ('\r\n'), []);
        assert.deepStrictEqual (GetLines ('a\nb'), ['a', 'b']);
        assert.deepStrictEqual (GetLines ('apple\nbanana'), ['apple', 'banana']);
        assert.deepStrictEqual (GetLines ('apple\r\nbanana'), ['apple', 'banana']);
        assert.deepStrictEqual (GetLines ('apple\r\n'), ['apple']);
        assert.deepStrictEqual (GetLines ('\r\napple\r\n'), ['apple']);
    });
});
