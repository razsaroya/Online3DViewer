const {CreateUrlBuilder, CreateUrlParser} = require("../../source/parameters/parameterlist");

var assert = require ('assert');
const {Coord3D} = require("../../source/geometry/coord3d");
const {Camera} = require("../../source/viewer/navigation");
const {Color} = require("../../source/model/material");

describe ('Parameter List', function () {
    it ('Parameter list builder', function () {
        let modelUrls = ['a.txt', 'b.txt'];
        let camera = new Camera (
            new Coord3D (1.0, 1.0, 1.0),
            new Coord3D (0.0, 0.0, 0.0),
            new Coord3D (0.0, 0.0, 1.0)
        );
        let background = new Color (4, 5, 6);
        let color = new Color (1, 2, 3);
        let urlParams1 = CreateUrlBuilder ().AddModelUrls (modelUrls).GetParameterList ();
        let urlParams2 = CreateUrlBuilder ().AddCamera (camera).GetParameterList ();
        let urlParams3 = CreateUrlBuilder ().AddModelUrls (modelUrls).AddCamera (camera).GetParameterList ();
        let urlParams4 = CreateUrlBuilder ().AddModelUrls (modelUrls).AddCamera (camera).AddColor (color).GetParameterList ();
        let urlParams5 = CreateUrlBuilder ().AddModelUrls (modelUrls).AddCamera (camera).AddBackground (background).AddColor (color).GetParameterList ();
        assert.strictEqual (urlParams1, 'model=a.txt,b.txt');
        assert.strictEqual (urlParams2, 'camera=1.0000,1.0000,1.0000,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000');
        assert.strictEqual (urlParams3, 'model=a.txt,b.txt$camera=1.0000,1.0000,1.0000,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000');
        assert.strictEqual (urlParams4, 'model=a.txt,b.txt$camera=1.0000,1.0000,1.0000,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000$defaultcolor=1,2,3');
        assert.strictEqual (urlParams5, 'model=a.txt,b.txt$camera=1.0000,1.0000,1.0000,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000$backgroundcolor=4,5,6$defaultcolor=1,2,3');
    });

    it ('Parameter list parser', function () {
        let modelUrls = ['a.txt', 'b.txt'];
        let camera = new Camera (
            new Coord3D (1.0, 1.0, 1.0),
            new Coord3D (0.0, 0.0, 0.0),
            new Coord3D (0.0, 0.0, 1.0)
        );
        let background = new Color (4, 5, 6);
        let color = new Color (1, 2, 3);
        let urlParamsLegacy = 'a.txt,b.txt';
        let urlParams1 = 'model=a.txt,b.txt';
        let urlParams2 = 'camera=1.0000,1.0000,1.0000,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000';
        let urlParams3 = 'model=a.txt,b.txt$camera=1.0000,1.0000,1.0000,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000';
        let urlParams4 = 'model=a.txt,b.txt$camera=1.0000,1.0000,1.0000,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000$defaultcolor=1,2,3';
        let urlParams5 = 'model=a.txt,b.txt$camera=1.0000,1.0000,1.0000,0.0000,0.0000,0.0000,0.0000,0.0000,1.0000$backgroundcolor=4,5,6$defaultcolor=1,2,3';
        let parserLegacy = CreateUrlParser (urlParamsLegacy);
        assert.deepStrictEqual (parserLegacy.GetModelUrls (), modelUrls);
        assert.deepStrictEqual (parserLegacy.GetCamera (), null);
        let parser1 = CreateUrlParser (urlParams1);
        assert.deepStrictEqual (parser1.GetModelUrls (), modelUrls);
        assert.deepStrictEqual (parser1.GetCamera (), null);
        assert.deepStrictEqual (parser1.GetDefaultColor (), null);
        let parser2 = CreateUrlParser (urlParams2);
        assert.deepStrictEqual (parser2.GetModelUrls (), null);
        assert.deepStrictEqual (parser2.GetCamera (), camera);
        assert.deepStrictEqual (parser2.GetDefaultColor (), null);
        let parser3 = CreateUrlParser (urlParams3);
        assert.deepStrictEqual (parser3.GetModelUrls (), modelUrls);
        assert.deepStrictEqual (parser3.GetCamera (), camera);
        assert.deepStrictEqual (parser3.GetDefaultColor (), null);
        let parser4 = CreateUrlParser (urlParams4);
        assert.deepStrictEqual (parser4.GetModelUrls (), modelUrls);
        assert.deepStrictEqual (parser4.GetCamera (), camera);
        assert.deepStrictEqual (parser4.GetDefaultColor (), color);
        let parser5 = CreateUrlParser (urlParams5);
        assert.deepStrictEqual (parser5.GetModelUrls (), modelUrls);
        assert.deepStrictEqual (parser5.GetCamera (), camera);
        assert.deepStrictEqual (parser5.GetDefaultColor (), color);
        assert.deepStrictEqual (parser5.GetBackgroundColor (), background);
    });
});
