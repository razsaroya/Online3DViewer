var assert = require ('assert');
var testUtils = require ('../utils/testutils.js');
const {MeshInstance} = require("../../source/model/meshinstance");
const {Transformation} = require("../../source/geometry/transformation");
const {CoordDistance3D} = require("../../source/geometry/coord3d");
const {CalculateSurfaceArea} = require("../../source/model/quantities");
const {Triangle} = require("../../source/model/triangle");
const {Coord3D} = require("../../source/geometry/coord3d");
const {Mesh} = require("../../source/model/mesh");
const {CalculateVolume} = require("../../source/model/quantities");
const {IsEqual} = require("../../source/geometry/geometry");
const {GenerateCuboid} = require("../../source/model/generator");
const {Node} = require("../../source/model/node");
const Matrix = require ("../../source/geometry/matrix");

describe ('Quantities', function () {
    it ('Cube Volume Calculation', function () {
        const mesh = GenerateCuboid (null, 1.0, 1.0, 1.0);
        const model = testUtils.GetModelWithOneMesh (mesh);
        assert (IsEqual (CalculateVolume (mesh), 1.0));
        assert (IsEqual (CalculateVolume (model), 1.0));
    });

    it ('Cube with Missing Face Volume Calculation', function () {
        const mesh = testUtils.GetCubeWithOneMissingFaceMesh ();
        const model = testUtils.GetModelWithOneMesh (mesh);
        assert.strictEqual (CalculateVolume (model), null);
    });

    it ('Two Cubes Connecting in One Vertex Volume Calculation', function () {
        const model = testUtils.GetTwoCubesConnectingInOneVertexModel ();
        assert (IsEqual (CalculateVolume (model), 2.0));
    });

    it ('Two Cubes Connecting in One Edge Volume Calculation', function () {
        const model = testUtils.GetTwoCubesConnectingInOneEdgeModel ();
        assert (IsEqual (CalculateVolume (model), 2.0));
    });

    it ('Two Cubes Connecting in One Face Volume Calculation', function () {
        const model = testUtils.GetTwoCubesConnectingInOneFaceModel ();
        assert (IsEqual (CalculateVolume (model), 2.0));
    });

    it ('Cube with Wrongly Oriented Triangle Volume Calculation', function () {
        var mesh = new Mesh ();
        mesh.AddVertex (new Coord3D (0.0, 0.0, 0.0));
        mesh.AddVertex (new Coord3D (1.0, 0.0, 0.0));
        mesh.AddVertex (new Coord3D (1.0, 1.0, 0.0));
        mesh.AddVertex (new Coord3D (0.0, 1.0, 0.0));
        mesh.AddVertex (new Coord3D (0.0, 0.0, 1.0));
        mesh.AddVertex (new Coord3D (1.0, 0.0, 1.0));
        mesh.AddVertex (new Coord3D (1.0, 1.0, 1.0));
        mesh.AddVertex (new Coord3D (0.0, 1.0, 1.0));
        mesh.AddTriangle (new Triangle (0, 1, 5));
        mesh.AddTriangle (new Triangle (0, 5, 4));
        mesh.AddTriangle (new Triangle (1, 2, 6));
        mesh.AddTriangle (new Triangle (1, 6, 5));
        mesh.AddTriangle (new Triangle (2, 3, 7));
        mesh.AddTriangle (new Triangle (2, 7, 6));
        mesh.AddTriangle (new Triangle (3, 0, 4));
        mesh.AddTriangle (new Triangle (3, 4, 7));
        mesh.AddTriangle (new Triangle (0, 3, 2));
        mesh.AddTriangle (new Triangle (0, 2, 1));
        mesh.AddTriangle (new Triangle (4, 5, 6));
        mesh.AddTriangle (new Triangle (4, 7, 6));
        const model = testUtils.GetModelWithOneMesh (mesh);
        assert.strictEqual (CalculateVolume (mesh), null);
        assert.strictEqual (CalculateVolume (model), null);
    });

    it ('Cube Surface Area Calculation', function () {
        const mesh = GenerateCuboid (null, 1.0, 1.0, 1.0);
        const model = testUtils.GetModelWithOneMesh (mesh);
        assert (IsEqual (CalculateSurfaceArea (mesh), 6.0));
        assert (IsEqual (CalculateSurfaceArea (model), 6.0));
    });

    it ('Cube with Missing Face Surface Area Calculation', function () {
        const mesh = testUtils.GetCubeWithOneMissingFaceMesh ();
        const model = testUtils.GetModelWithOneMesh (mesh);
        assert (IsEqual (CalculateSurfaceArea (mesh), 5.0));
        assert (IsEqual (CalculateSurfaceArea (model), 5.0));
    });

    it ('Tetrahedron Volume Calculation', function () {
        const edgeLength = CoordDistance3D (new Coord3D (1.0, 1.0, 1.0), new Coord3D (-1.0, -1.0, 1.0));
        const mesh = testUtils.GetTetrahedronMesh ();
        const model = testUtils.GetModelWithOneMesh (mesh);
        assert (IsEqual (CalculateVolume (mesh), Math.pow (edgeLength, 3.0) / (6.0 * Math.sqrt (2))));
        assert (IsEqual (CalculateVolume (model), Math.pow (edgeLength, 3.0) / (6.0 * Math.sqrt (2))));
    });

    it ('Tetrahedron Surface Area Calculation', function () {
        const edgeLength = CoordDistance3D (new Coord3D (1.0, 1.0, 1.0), new Coord3D (-1.0, -1.0, 1.0));
        const mesh = testUtils.GetTetrahedronMesh ();
        const model = testUtils.GetModelWithOneMesh (mesh);
        assert (IsEqual (CalculateSurfaceArea (mesh), Math.sqrt (3) * Math.pow (edgeLength, 2.0)));
        assert (IsEqual (CalculateSurfaceArea (model), Math.sqrt (3) * Math.pow (edgeLength, 2.0)));
    });

    it ('Cube Scaled Volume and Area Calculation', function () {
        const mesh = GenerateCuboid (null, 1.0, 1.0, 1.0);
        const transformation = new Transformation (new Matrix ().CreateScale (2.0, 2.0, 2.0));
        let node = new Node ();
        node.SetTransformation (transformation);
        const meshInstance = new MeshInstance (node, mesh);
        assert (IsEqual (CalculateVolume (meshInstance), 8.0));
        assert (IsEqual (CalculateSurfaceArea (meshInstance), 24.0));
    });
});
