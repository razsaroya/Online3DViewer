const {Coord3D, CoordIsEqual3D} = require ("../../source/geometry/coord3d");
const {Transformation} = require ("../../source/geometry/transformation");
const {Node} = require ("../../source/model/node");
const {MeshInstance} = require ("../../source/model/meshinstance");
const {Model} = require ("../../source/model/model");
const {Mesh} = require ("../../source/model/mesh");
const {Triangle} = require ("../../source/model/triangle");
const {FinalizeModel} = require ("../../source/model/modelfinalization");
const {Material, MaterialType} = require ("../../source/model/material");
const {GetTopology, IsSolid} = require ("../../source/model/modelutils");
const Matrix = require ("../../source/geometry/matrix");

var assert = require ('assert');
var testUtils = require ('../utils/testutils.js');
const {GetBoundingBox} = require("../../source/model/modelutils");
const {GenerateCuboid} = require("../../source/model/generator");

describe ('Model Utils', function () {
    it ('Mesh Bounding Box', function () {
        var cube = GenerateCuboid (null, 1.0, 1.0, 1.0);
        let cubeBounds = GetBoundingBox (cube);
        assert (CoordIsEqual3D (cubeBounds.min, new Coord3D (0.0, 0.0, 0.0)));
        assert (CoordIsEqual3D (cubeBounds.max, new Coord3D (1.0, 1.0, 1.0)));
    });

    it ('Mesh Instance Bounding Box', function () {
        let cube = GenerateCuboid (null, 1.0, 1.0, 1.0);
        let transformation = new Transformation (new Matrix ().CreateTranslation (2.0, 0.0, 0.0));
        let node = new Node ();
        node.SetTransformation (transformation);
        let cubeInstance = new MeshInstance (node, cube);
        let cubeInstanceBounds = GetBoundingBox (cubeInstance);
        assert (CoordIsEqual3D (cubeInstanceBounds.min, new Coord3D (2.0, 0.0, 0.0)));
        assert (CoordIsEqual3D (cubeInstanceBounds.max, new Coord3D (3.0, 1.0, 1.0)));
    });

    it ('Model Bounding Box', function () {
        var model = new Model ();

        var mesh1 = new Mesh ();
        mesh1.AddVertex (new Coord3D (0.0, 0.0, 0.0));
        mesh1.AddVertex (new Coord3D (1.0, 0.0, 0.0));
        mesh1.AddVertex (new Coord3D (1.0, 1.0, 0.0));
        mesh1.AddTriangle (new Triangle (0, 1, 2));
        model.AddMeshToRootNode (mesh1);

        var mesh2 = new Mesh ();
        mesh2.AddVertex (new Coord3D (0.0, 0.0, 1.0));
        mesh2.AddVertex (new Coord3D (1.0, 0.0, 1.0));
        mesh2.AddVertex (new Coord3D (1.0, 1.0, 1.0));
        mesh2.AddTriangle (new Triangle (0, 1, 2));
        model.AddMeshToRootNode (mesh2);

        FinalizeModel (model, function () { return new Material (MaterialType.Phong); });

        let mesh1Bounds = GetBoundingBox (model.GetMesh (0));
        assert (CoordIsEqual3D (mesh1Bounds.min, new Coord3D (0.0, 0.0, 0.0)));
        assert (CoordIsEqual3D (mesh1Bounds.max, new Coord3D (1.0, 1.0, 0.0)));

        let mesh2Bounds = GetBoundingBox (model.GetMesh (1));
        assert (CoordIsEqual3D (mesh2Bounds.min, new Coord3D (0.0, 0.0, 1.0)));
        assert (CoordIsEqual3D (mesh2Bounds.max, new Coord3D (1.0, 1.0, 1.0)));

        let modelBounds = GetBoundingBox (model);
        assert (CoordIsEqual3D (modelBounds.min, new Coord3D (0.0, 0.0, 0.0)));
        assert (CoordIsEqual3D (modelBounds.max, new Coord3D (1.0, 1.0, 1.0)));
    });

    it ('Tetrahedron Topology Calculation', function () {
        let tetrahedron = testUtils.GetModelWithOneMesh (testUtils.GetTetrahedronMesh ());
        let topology = GetTopology (tetrahedron);
        assert (IsSolid (tetrahedron));
        assert.strictEqual (topology.vertices.length, 4);
        assert.strictEqual (topology.edges.length, 6);
        assert.strictEqual (topology.triangleEdges.length, 4 * 3);
        assert.strictEqual (topology.triangles.length, 4);
        for (let i = 0; i < topology.vertices.length; i++) {
            assert.strictEqual (topology.vertices[i].edges.length, 3);
            assert.strictEqual (topology.vertices[i].triangles.length, 3);
        }
        for (let i = 0; i < topology.edges.length; i++) {
            assert.strictEqual (topology.edges[i].triangles.length, 2);
        }
    });

    it ('Cube Topology Calculation', function () {
        let cube = testUtils.GetModelWithOneMesh (GenerateCuboid (null, 1.0, 1.0, 1.0));
        assert (IsSolid (cube));

        let topology = GetTopology (cube);
        assert.strictEqual (topology.vertices.length, 8);
        assert.strictEqual (topology.edges.length, 12 + 6);
        assert.strictEqual (topology.triangleEdges.length, 6 * 2 * 3);
        assert.strictEqual (topology.triangles.length, 6 * 2);

        let verticesWith4Triangles = 0;
        let verticesWith5Triangles = 0;
        let verticesWith4Edges = 0;
        let verticesWith5Edges = 0;
        for (let i = 0; i < topology.vertices.length; i++) {
            if (topology.vertices[i].triangles.length == 4) {
                verticesWith4Triangles += 1;
            } else if (topology.vertices[i].triangles.length == 5) {
                verticesWith5Triangles += 1;
            }
            if (topology.vertices[i].edges.length == 4) {
                verticesWith4Edges += 1;
            } else if (topology.vertices[i].edges.length == 5) {
                verticesWith5Edges += 1;
            }
        }
        assert.strictEqual (verticesWith4Triangles, 4);
        assert.strictEqual (verticesWith5Triangles, 4);
        assert.strictEqual (verticesWith4Edges, 4);
        assert.strictEqual (verticesWith5Edges, 4);

        for (let i = 0; i < topology.edges.length; i++) {
            assert.strictEqual (topology.edges[i].triangles.length, 2);
        }
    });

    it ('Two Cubes Connecting in One Vertex Topology Calculation', function () {
        const model = testUtils.GetTwoCubesConnectingInOneVertexModel ();
        let topology = GetTopology (model);
        assert.strictEqual (topology.vertices.length, 15);
        assert (IsSolid (model));
    });

    it ('Two Cubes Connecting in One Edge Topology Calculation', function () {
        const model = testUtils.GetTwoCubesConnectingInOneEdgeModel ();
        let topology = GetTopology (model);
        assert.strictEqual (topology.vertices.length, 14);
        assert (IsSolid (model));
    });

    it ('Two Cubes Connecting in One Face Topology Calculation', function () {
        const model = testUtils.GetTwoCubesConnectingInOneFaceModel ();
        let topology = GetTopology (model);
        assert.strictEqual (topology.vertices.length, 12);
        assert (IsSolid (model));
    });
});
