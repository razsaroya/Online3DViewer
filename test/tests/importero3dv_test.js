var assert = require ('assert');
var testFiles = require ('../utils/testfiles.js');
var testUtils = require ('../utils/testutils.js');
const {CalculateSurfaceArea} = require("../../source/model/quantities");
const {CalculateVolume} = require("../../source/model/quantities");
const {IsEqual} = require("../../source/geometry/geometry");
const {Coord3D} = require("../../source/geometry/coord3d");
const {CoordIsEqual3D} = require("../../source/geometry/coord3d");
const {GetBoundingBox} = require("../../source/model/modelutils");
const {CheckModel} = require("../../source/model/modelfinalization");

describe ('O3dv Importer', function () {
    it ('translateandrotate.o3dv', function (done) {
        testFiles.ImportO3dvFile ('translateandrotate.o3dv', function (model) {
            assert (CheckModel (model));
            assert.deepStrictEqual (testUtils.ModelNodesToTree (model), {
                name : '<Root>',
                childNodes : [
                    {
                        name : 'Translated',
                        childNodes : [
                            {
                                name : '',
                                childNodes : [],
                                meshNames : ['Cube']
                            }
                        ],
                        meshNames : []
                    },
                    {
                        name : 'Rotated',
                        childNodes : [
                            {
                                name : 'Translated and Rotated',
                                childNodes : [
                                    {
                                        name : '',
                                        childNodes : [],
                                        meshNames : ['Cube']
                                    }
                                ],
                                meshNames : []
                            }
                        ],
                        meshNames : []
                    },
                    {
                        name : '',
                        childNodes : [],
                        meshNames : ['Cube']
                    }
                ],
                meshNames : []
            });

            assert.strictEqual (model.MeshInstanceCount (), 3);
            let boundingBox = GetBoundingBox (model);
            assert (CoordIsEqual3D (boundingBox.min, new Coord3D (-1.0, 0.0, 0.0)));
            assert (CoordIsEqual3D (boundingBox.max, new Coord3D (3.0, 3.0, 1.0)));

            done ();
        });
    });

    it ('solids.o3dv', function (done) {
        testFiles.ImportO3dvFile ('solids.o3dv', function (model) {
            assert (CheckModel (model));
            assert.deepStrictEqual (testUtils.ModelNodesToTree (model), {
                name : '<Root>',
                childNodes : [
                    {
                        name : 'Tetrahedral',
                        childNodes : [
                            {
                                name : '',
                                childNodes : [],
                                meshNames : ['Tetrahedron']
                            }
                        ],
                        meshNames : []
                    },
                    {
                        name : 'Octahedral',
                        childNodes : [
                            {
                                name : '',
                                childNodes : [],
                                meshNames : ['Hexahedron']
                            },
                            {
                                name : '',
                                childNodes : [],
                                meshNames : ['Octahedron']
                            }
                        ],
                        meshNames : []
                    },                    {
                        name : 'Icosahedral',
                        childNodes : [
                            {
                                name : '',
                                childNodes : [],
                                meshNames : ['Dodecahedron']
                            },
                            {
                                name : '',
                                childNodes : [],
                                meshNames : ['Icosahedron']
                            }
                        ],
                        meshNames : []
                    }
                ],
                meshNames : []
            });

            assert.strictEqual (model.MaterialCount (), 5);
            assert.strictEqual (model.MeshCount (), 5);
            assert.strictEqual (model.MeshInstanceCount (), 5);

            assert (IsEqual (CalculateVolume (model), 8.707448863695035));
            assert (IsEqual (CalculateSurfaceArea (model), 39.636169009449105));

            assert.strictEqual (model.PropertyGroupCount (), 1);
            assert.strictEqual (model.GetPropertyGroup (0).PropertyCount (), 2);

            for (let i = 0; i < model.MeshCount (); i++) {
                let mesh = model.GetMesh (i);
                assert.strictEqual (mesh.PropertyGroupCount (), 1);
                assert.strictEqual (mesh.GetPropertyGroup (0).PropertyCount (), 5);
            }

            done ();
        });
    });
});
