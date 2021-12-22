var assert = require ('assert');
var testUtils = require ('../utils/testutils.js');
const {CoordIsEqual3D} = require("../../source/geometry/coord3d");
const {GetBoundingBox} = require("../../source/model/modelutils");
const {HexStringToColor} = require("../../source/model/material");
const {ColorToHexString} = require("../../source/model/material");
const {ColorIsEqual} = require("../../source/model/material");
const {FinalizeModel} = require("../../source/model/modelfinalization");
const {Triangle} = require("../../source/model/triangle");
const {Coord2D} = require("../../source/geometry/coord2d");
const {Coord3D} = require("../../source/geometry/coord3d");
const {Mesh} = require("../../source/model/mesh");
const {MaterialType} = require("../../source/model/material");
const {Material, Color} = require("../../source/model/material");
const {Model} = require("../../source/model/model");
const {Node} = require("../../source/model/node");

describe ('Model', function () {
    it ('Default Initialization', function () {
        var model = new Model ();
        assert.strictEqual (model.MaterialCount (), 0);
        assert.strictEqual (model.MeshCount (), 0);
    });

    it ('Add Material', function () {
        var model = new Model ();
        var material = new Material (MaterialType.Phong);
        material.name = 'example';
        var index = model.AddMaterial (material);
        assert.strictEqual (model.MaterialCount (), 1);
        var theMaterial = model.GetMaterial (index);
        assert.strictEqual (theMaterial.name, 'example');
    });

    it ('Add Mesh', function () {
        var model = new Model ();
        var mesh = new Mesh ();
        mesh.SetName ('example');
        var index = model.AddMesh (mesh);
        assert.strictEqual (model.MeshCount (), 1);
        var theMesh = model.GetMesh (index);
        assert.strictEqual (theMesh.GetName (), 'example');
    });

    it ('Counters', function () {
        var model = new Model ();
        let mesh = new Mesh ();
        mesh.AddVertex (new Coord3D (0.0, 0.0, 0.0));
        mesh.AddVertex (new Coord3D (0.0, 0.0, 0.0));
        mesh.AddVertex (new Coord3D (0.0, 0.0, 0.0));
        mesh.AddNormal (new Coord3D (0.0, 0.0, 0.0));
        mesh.AddNormal (new Coord3D (0.0, 0.0, 0.0));
        mesh.AddTextureUV (new Coord2D (0.0, 0.0));
        mesh.AddTriangle (new Triangle (0, 1, 2));
        mesh.AddTriangle (new Triangle (0, 1, 2));
        mesh.AddTriangle (new Triangle (0, 1, 2));
        mesh.AddTriangle (new Triangle (0, 1, 2));
        model.AddMeshToRootNode (mesh);
        assert.strictEqual (model.VertexCount (), 3);
        assert.strictEqual (model.NormalCount (), 2);
        assert.strictEqual (model.TextureUVCount (), 1);
        assert.strictEqual (model.TriangleCount (), 4);
    });

    it ('Remove Mesh', function () {
        var model = new Model ();

        let mesh1 = new Mesh ();
        mesh1.AddVertex (new Coord3D (0.0, 0.0, 0.0));
        mesh1.AddVertex (new Coord3D (1.0, 0.0, 0.0));
        mesh1.AddVertex (new Coord3D (1.0, 1.0, 0.0));
        mesh1.AddTriangle (new Triangle (0, 1, 2));
        model.AddMeshToRootNode (mesh1);

        let mesh2 = new Mesh ();
        mesh2.AddVertex (new Coord3D (0.0, 0.0, 1.0));
        mesh2.AddVertex (new Coord3D (1.0, 0.0, 1.0));
        mesh2.AddVertex (new Coord3D (1.0, 1.0, 1.0));
        mesh2.AddTriangle (new Triangle (0, 1, 2));
        model.AddMeshToRootNode (mesh2);

        assert.strictEqual (model.MeshCount (), 2);
        assert.strictEqual (model.VertexCount (), 6);
        assert.strictEqual (model.TriangleCount (), 2);

        model.RemoveMesh (0);
        assert.strictEqual (model.MeshCount (), 1);
        assert.strictEqual (model.VertexCount (), 3);
        assert.strictEqual (model.TriangleCount (), 1);

        model.RemoveMesh (0);
        assert.strictEqual (model.MeshCount (), 0);
        assert.strictEqual (model.VertexCount (), 0);
        assert.strictEqual (model.TriangleCount (), 0);
    });
});

describe ('Model Finalization', function () {
    it ('Calculate Normal', function () {
        var mesh = new Mesh ();
        var v0 = mesh.AddVertex (new Coord3D (0.0, 0.0, 0.0));
        var v1 = mesh.AddVertex (new Coord3D (1.0, 0.0, 0.0));
        var v2 = mesh.AddVertex (new Coord3D (1.0, 1.0, 0.0));
        var triangleIndex = mesh.AddTriangle (new Triangle (v0, v1, v2));
        var model = new Model ();
        var meshIndex = model.AddMesh (mesh);
        assert.strictEqual (model.MaterialCount (), 0);
        FinalizeModel (model, function () { return new Material (MaterialType.Phong) });
        assert.strictEqual (model.MaterialCount (), 1);
        var theMesh = model.GetMesh (meshIndex);
        assert.strictEqual (theMesh.NormalCount (), 1);
        var triangle = theMesh.GetTriangle (triangleIndex);
        assert.strictEqual (triangle.n0, 0);
        assert.strictEqual (triangle.n1, 0);
        assert.strictEqual (triangle.n2, 0);
        assert.strictEqual (triangle.mat, 0);
    });

    it ('Calculate Curved Normal', function () {
        var mesh = new Mesh ();
        var v0 = mesh.AddVertex (new Coord3D (0.0, 0.0, 0.0));
        var v1 = mesh.AddVertex (new Coord3D (1.0, 0.0, 0.0));
        var v2 = mesh.AddVertex (new Coord3D (1.0, 1.0, 0.0));
        var v3 = mesh.AddVertex (new Coord3D (0.0, 0.0, -1.0));

        var triangle1 = new Triangle (v0, v1, v2);
        triangle1.curve = 1;
        var triangle2 = new Triangle (v0, v3, v1);
        triangle2.curve = 1;

        var triangle1 = mesh.AddTriangle (triangle1);
        var triangle1 = mesh.AddTriangle (triangle2);

        var model = new Model ()
        var meshIndex = model.AddMesh (mesh);

        FinalizeModel (model, function () { return new Material (MaterialType.Phong) });

        var theMesh = model.GetMesh (meshIndex);
        assert.strictEqual (theMesh.NormalCount (), 6);

        var normal = theMesh.GetNormal (0);
        assert.strictEqual (normal.x, 0.0);
        assert.strictEqual (normal.y, -0.7071067811865475);
        assert.strictEqual (normal.z, 0.7071067811865475);
    });

    it ('Calculate Curved Normal 2', function () {
        var mesh = new Mesh ();
        var v0 = mesh.AddVertex (new Coord3D (0.0, 0.0, 0.0));
        var v1 = mesh.AddVertex (new Coord3D (1.0, 0.0, 0.0));
        var v2 = mesh.AddVertex (new Coord3D (1.0, 1.0, 0.0));
        var v3 = mesh.AddVertex (new Coord3D (0.0, 0.0, -1.0));
        var v4 = mesh.AddVertex (new Coord3D (0.0, 1.0, 0.0));

        var triangle1 = new Triangle (v0, v1, v2);
        triangle1.curve = 1;
        var triangle2 = new Triangle (v0, v2, v4);
        triangle2.curve = 1;
        var triangle3 = new Triangle (v0, v3, v1);
        triangle3.curve = 1;

        mesh.AddTriangle (triangle1);
        mesh.AddTriangle (triangle2);
        mesh.AddTriangle (triangle3);

        var model = new Model ()
        var meshIndex = model.AddMesh (mesh);

        FinalizeModel (model, function () { return new Material (MaterialType.Phong) });

        var theMesh = model.GetMesh (meshIndex);
        assert.strictEqual (theMesh.NormalCount (), 9);

        var normal = theMesh.GetNormal (0);
        assert.strictEqual (normal.x, 0.0);
        assert.strictEqual (normal.y, -0.7071067811865475);
        assert.strictEqual (normal.z, 0.7071067811865475);
    });

    it ('Remove Empty Meshes and Nodes', function () {
        let mesh = new Mesh ();
        let emptyMesh = new Mesh ();

        let v0 = mesh.AddVertex (new Coord3D (0.0, 0.0, 0.0));
        let v1 = mesh.AddVertex (new Coord3D (1.0, 0.0, 0.0));
        let v2 = mesh.AddVertex (new Coord3D (1.0, 1.0, 0.0));
        mesh.AddTriangle (new Triangle (v0, v1, v2));

        let model = new Model ()
        let meshIndex = model.AddMesh (mesh);
        let emptyMeshIndex = model.AddMesh (emptyMesh);

        let rootNode = model.GetRootNode ();

        let node1 = new Node ();
        rootNode.AddChildNode (node1);
        node1.AddMeshIndex (meshIndex);
        node1.AddMeshIndex (emptyMeshIndex);

        let node2 = new Node ();
        rootNode.AddChildNode (node2);

        let node3 = new Node ();
        rootNode.AddChildNode (node3);
        node3.AddMeshIndex (meshIndex);
        node3.AddMeshIndex (emptyMeshIndex);

        FinalizeModel (model, function () { return new Material (MaterialType.Phong) });
        assert.strictEqual (model.MeshCount (), 1);

        let meshInstances = [];
        model.EnumerateMeshInstances ((meshInstance) => {
            meshInstances.push (meshInstance);
        });
        assert.strictEqual (meshInstances.length, 2);

        let nodeCount = 0;
        rootNode.Enumerate ((node) => {
            nodeCount += 1;
        });
        assert.strictEqual (nodeCount, 3);
    });

    it ('Remove Empty Nodes Recursively', function () {
        let model = testUtils.GetHierarchicalModelNoFinalization ();
        FinalizeModel (model, function () { return new Material (MaterialType.Phong) });
        assert.strictEqual (model.MeshCount (), 0);
        assert.strictEqual (model.MeshInstanceCount (), 0);
        assert (model.GetRootNode ().IsEmpty ());
    });
});

describe ('Color Conversion', function () {
    it ('Color equality check', function () {
        assert (ColorIsEqual (new Color (10, 20, 30), new Color (10, 20, 30)));
        assert (!ColorIsEqual (new Color (10, 20, 30), new Color (11, 20, 30)));
        assert (!ColorIsEqual (new Color (10, 20, 30), new Color (10, 21, 30)));
        assert (!ColorIsEqual (new Color (10, 20, 30), new Color (10, 20, 31)));
    });

    it ('Color hex string conversion', function () {
        let color = new Color (10, 20, 30);
        let hexString = '0a141e';
        assert.strictEqual (ColorToHexString (color), hexString);
        assert.deepStrictEqual (HexStringToColor (hexString), color);
    });
});

describe ('Node Hierarchy', function () {
    it ('Enumerate hierarchy', function () {
        let model = testUtils.GetHierarchicalModelNoFinalization ();
        let modelTree = testUtils.ModelNodesToTree (model);
        assert.deepStrictEqual (modelTree, {
            name : '<Root>',
            childNodes : [
                {
                    name : 'Node 1',
                    childNodes : [
                        {
                            name : 'Node 3',
                            childNodes : [],
                            meshNames : ['Mesh 5', 'Mesh 6', 'Mesh 7']
                        },
                        {
                            name : 'Node 4',
                            childNodes : [],
                            meshNames : ['Mesh 7']
                        }
                    ],
                    meshNames : ['Mesh 3', 'Mesh 4']
                },
                {
                    name : 'Node 2',
                    childNodes : [],
                    meshNames : []
                }
            ],
            meshNames : ['Mesh 1', 'Mesh 2']
        });
    });

    it ('Remove mesh', function () {
        let model = testUtils.GetHierarchicalModelNoFinalization ();
        model.RemoveMesh (2);
        let modelTree = testUtils.ModelNodesToTree (model);
        assert.deepStrictEqual (modelTree, {
            name : '<Root>',
            childNodes : [
                {
                    name : 'Node 1',
                    childNodes : [
                        {
                            name : 'Node 3',
                            childNodes : [],
                            meshNames : ['Mesh 5', 'Mesh 6', 'Mesh 7']
                        },
                        {
                            name : 'Node 4',
                            childNodes : [],
                            meshNames : ['Mesh 7']
                        }
                    ],
                    meshNames : ['Mesh 4']
                },
                {
                    name : 'Node 2',
                    childNodes : [],
                    meshNames : []
                }
            ],
            meshNames : ['Mesh 1', 'Mesh 2']
        });
    });

    it ('Enumerate mesh instances', function () {
        let model = testUtils.GetTranslatedRotatedCubesModel ();
        let modelTree = testUtils.ModelNodesToTree (model);
        assert.deepStrictEqual (modelTree, {
            name : '<Root>',
            childNodes : [
                {
                    name : 'Translated',
                    childNodes : [],
                    meshNames : ['Cube']
                },
                {
                    name : 'Rotated',
                    childNodes : [
                        {
                            name : 'Translated and Rotated',
                            childNodes : [],
                            meshNames : ['Cube']
                        }
                    ],
                    meshNames : []
                }
            ],
            meshNames : ['Cube']
        });

        let meshInstances = [];
        model.EnumerateMeshInstances ((meshInstance) => {
            meshInstances.push (meshInstance);
        });

        assert.strictEqual (meshInstances.length, 3);

        let boundingBox1 = GetBoundingBox (meshInstances[0]);
        let boundingBox2 = GetBoundingBox (meshInstances[1]);
        let boundingBox3 = GetBoundingBox (meshInstances[2]);

        assert (CoordIsEqual3D (boundingBox1.min, new Coord3D (0.0, 0.0, 0.0)));
        assert (CoordIsEqual3D (boundingBox1.max, new Coord3D (1.0, 1.0, 1.0)));

        assert (CoordIsEqual3D (boundingBox2.min, new Coord3D (2.0, 0.0, 0.0)));
        assert (CoordIsEqual3D (boundingBox2.max, new Coord3D (3.0, 1.0, 1.0)));

        assert (CoordIsEqual3D (boundingBox3.min, new Coord3D (-1.0, 2.0, 0.0)));
        assert (CoordIsEqual3D (boundingBox3.max, new Coord3D (0.0, 3.0, 1.0)));
    });

    it ('Enumerate transformed mesh instances', function () {
        let model = testUtils.GetTranslatedRotatedCubesModel ();
        let modelTree = testUtils.ModelNodesToTree (model);
        assert.deepStrictEqual (modelTree, {
            name : '<Root>',
            childNodes : [
                {
                    name : 'Translated',
                    childNodes : [],
                    meshNames : ['Cube']
                },
                {
                    name : 'Rotated',
                    childNodes : [
                        {
                            name : 'Translated and Rotated',
                            childNodes : [],
                            meshNames : ['Cube']
                        }
                    ],
                    meshNames : []
                }
            ],
            meshNames : ['Cube']
        });

        let meshes = [];
        model.EnumerateTransformedMeshes ((mesh) => {
            meshes.push (mesh);
        });

        assert.strictEqual (meshes.length, 3);

        let boundingBox1 = GetBoundingBox (meshes[0]);
        let boundingBox2 = GetBoundingBox (meshes[1]);
        let boundingBox3 = GetBoundingBox (meshes[2]);

        assert (CoordIsEqual3D (boundingBox1.min, new Coord3D (0.0, 0.0, 0.0)));
        assert (CoordIsEqual3D (boundingBox1.max, new Coord3D (1.0, 1.0, 1.0)));

        assert (CoordIsEqual3D (boundingBox2.min, new Coord3D (2.0, 0.0, 0.0)));
        assert (CoordIsEqual3D (boundingBox2.max, new Coord3D (3.0, 1.0, 1.0)));

        assert (CoordIsEqual3D (boundingBox3.min, new Coord3D (-1.0, 2.0, 0.0)));
        assert (CoordIsEqual3D (boundingBox3.max, new Coord3D (0.0, 3.0, 1.0)));
    });

    it ('Instance counters', function () {
        let model = testUtils.GetTranslatedRotatedCubesModel ();
        FinalizeModel (model, function () { return new Material (MaterialType.Phong) });
        assert.strictEqual (model.MeshCount (), 1);
        assert.strictEqual (model.MeshInstanceCount (), 3);
        assert.strictEqual (model.VertexCount (), 8 * 3);
        assert.strictEqual (model.NormalCount (), 12 * 3);
        assert.strictEqual (model.TextureUVCount (), 0);
        assert.strictEqual (model.TriangleCount (), 12 * 3);
    });
});
