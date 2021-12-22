var assert = require ('assert');
const {CoordIsEqual3D} = require("../../source/geometry/coord3d");
const {TransformMesh} = require("../../source/model/modelutils");
const {Transformation} = require("../../source/geometry/transformation");
const {QuaternionFromAxisAngle} = require("../../source/geometry/quaternion");
const {Triangle} = require("../../source/model/triangle");
const {Coord2D} = require("../../source/geometry/coord2d");
const {Coord3D} = require("../../source/geometry/coord3d");
const {Mesh} = require("../../source/model/mesh");
const Matrix = require("../../source/geometry/matrix");

describe ('Mesh', function() {
    it ('Default Initialization', function () {
        var mesh = new Mesh ();
        assert.strictEqual (mesh.GetName (), '');
        assert.strictEqual (mesh.VertexCount (), 0);
        assert.strictEqual (mesh.NormalCount (), 0);
        assert.strictEqual (mesh.TextureUVCount (), 0);
        assert.strictEqual (mesh.TriangleCount (), 0);
    });

    it ('Set Name', function () {
        var mesh = new Mesh ();
        mesh.SetName ('example');
        assert.strictEqual (mesh.GetName (), 'example');
    });

    it ('Add Vertex', function () {
        var mesh = new Mesh ();
        var index = mesh.AddVertex (new Coord3D (1.0, 2.0, 3.0))
        assert.strictEqual (index, 0);
        assert.strictEqual (mesh.VertexCount (), 1);
        var vertex = mesh.GetVertex (index);
        assert.strictEqual (vertex.x, 1.0);
        assert.strictEqual (vertex.y, 2.0);
        assert.strictEqual (vertex.z, 3.0);
    });

    it ('Add Normal', function () {
        var mesh = new Mesh ();
        var index = mesh.AddNormal (new Coord3D (1.0, 2.0, 3.0))
        assert.strictEqual (index, 0);
        assert.strictEqual (mesh.NormalCount (), 1);
        var normal = mesh.GetNormal (index);
        assert.strictEqual (normal.x, 1.0);
        assert.strictEqual (normal.y, 2.0);
        assert.strictEqual (normal.z, 3.0);
    });

    it ('Add Texture UV', function () {
        var mesh = new Mesh ();
        var index = mesh.AddTextureUV (new Coord2D (1.0, 2.0))
        assert.strictEqual (index, 0);
        assert.strictEqual (mesh.TextureUVCount (), 1);
        var uv = mesh.GetTextureUV (index);
        assert.strictEqual (uv.x, 1.0);
        assert.strictEqual (uv.y, 2.0);
    });

    it ('Add Triangle', function () {
        var mesh = new Mesh ();
        var triangle = new Triangle (1, 2, 3);
        var index = mesh.AddTriangle (triangle);
        assert.strictEqual (index, 0);
        assert.strictEqual (mesh.TriangleCount (), 1);
        var triangle = mesh.GetTriangle (index);
        assert.strictEqual (triangle.v0, 1);
        assert.strictEqual (triangle.v1, 2);
        assert.strictEqual (triangle.v2, 3);
        assert (triangle.HasVertices ());
        assert (!triangle.HasNormals ());
        assert (!triangle.HasTextureUVs ());
        assert.strictEqual (triangle.n0, null);
        assert.strictEqual (triangle.n1, null);
        assert.strictEqual (triangle.n2, null);
        assert.strictEqual (triangle.u0, null);
        assert.strictEqual (triangle.u1, null);
        assert.strictEqual (triangle.u2, null);
        assert.strictEqual (triangle.mat, null);
    });

    it ('Transform Mesh', function () {
        var mesh = new Mesh ();
        mesh.AddVertex (new Coord3D (0.0, 0.0, 0.0));
        mesh.AddVertex (new Coord3D (1.0, 0.0, 0.0));
        mesh.AddVertex (new Coord3D (1.0, 1.0, 0.0));
        mesh.AddNormal (new Coord3D (0.0, 0.0, 1.0));
        mesh.AddTextureUV (new Coord2D (0.0, 0.0));
        mesh.AddTextureUV (new Coord2D (1.0, 0.0));
        mesh.AddTextureUV (new Coord2D (1.0, 1.0));
        var triangle = new Triangle (0, 1, 2);
        triangle.SetNormals (0, 0, 0);
        triangle.SetTextureUVs (0, 1, 2);
        mesh.AddTriangle (triangle);

        let rotation = QuaternionFromAxisAngle (new Coord3D (0.0, 1.0, 0.0), -Math.PI / 2.0);
        let transformation = new Transformation ();
        transformation.AppendMatrix (new Matrix ().CreateScale (2.0, 1.0, 1.0));
        transformation.AppendMatrix (new Matrix ().CreateRotation (rotation.x, rotation.y, rotation.z, rotation.w));
        transformation.AppendMatrix (new Matrix ().CreateTranslation (0.0, 0.0, 1.0));
        TransformMesh (mesh, transformation);
        assert (CoordIsEqual3D (mesh.GetVertex (0), new Coord3D (0.0, 0.0, 1.0)));
        assert (CoordIsEqual3D (mesh.GetVertex (1), new Coord3D (0.0, 0.0, 3.0)));
        assert (CoordIsEqual3D (mesh.GetVertex (2), new Coord3D (0.0, 1.0, 3.0)));
        assert (CoordIsEqual3D (mesh.GetNormal (0), new Coord3D (-1.0, 0.0, 0.0)));
    });
});
