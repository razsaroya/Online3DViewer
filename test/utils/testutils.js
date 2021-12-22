const {FinalizeModel} = require("../../source/model/modelfinalization");

var fs = require ('fs');
var path = require ('path');
const {TransformMesh} = require("../../source/model/modelutils");
const {Transformation} = require("../../source/geometry/transformation");
const {GenerateCuboid} = require("../../source/model/generator");
const {Model} = require("../../source/model/model");
const {GetBoundingBox} = require("../../source/model/modelutils");
const Matrix = require("../../source/geometry/matrix");
const {Material, MaterialType} = require("../../source/model/material");
const {Mesh} = require("../../source/model/mesh");
const {Coord3D} = require("../../source/geometry/coord3d");
const {Triangle} = require("../../source/model/triangle");
const {Node} = require("../../source/model/node");
const {QuaternionFromAxisAngle} = require("../../source/geometry/quaternion");

module.exports =
{
    GetTextFileContent : function (folder, fileName)
    {
        var testFilePath = path.join ('testfiles', folder, fileName);
        if (!fs.existsSync (testFilePath)) {
            return null;
        }
        return fs.readFileSync (testFilePath).toString ();
    },

    GetArrayBufferFileContent : function (folder, fileName)
    {
        var testFilePath = path.join ('testfiles', folder, fileName);
        var buffer = fs.readFileSync (testFilePath);
        var arrayBuffer = new ArrayBuffer (buffer.length);
        var uint8Array = new Uint8Array (arrayBuffer);
        var i;
        for (i = 0; i < buffer.length; ++i) {
            uint8Array[i] = buffer[i];
        }
        return arrayBuffer
    },

    ModelNodesToTree : function (model)
    {
        function AddNodeToModelTree (model, node, modelTree)
        {
            modelTree.name = node.HasParent () ? node.GetName () : '<Root>';
            modelTree.childNodes = [];
            for (const childNode of node.GetChildNodes ()) {
                let childTree = {};
                AddNodeToModelTree (model, childNode, childTree);
                modelTree.childNodes.push (childTree);
            }
            modelTree.meshNames = [];
            for (const meshIndex of node.GetMeshIndices ()) {
                modelTree.meshNames.push (model.GetMesh (meshIndex).GetName ());
            }
        }

        let modelTree = {};
        let root = model.GetRootNode ();
        AddNodeToModelTree (model, root, modelTree);
        return modelTree;
    },

    ModelToObject : function (model)
    {
        var obj = {
            name : model.GetName (),
            materials : [],
            meshes : []
        };

        var i, j;

        var material;
        for (i = 0; i < model.MaterialCount (); i++) {
            material = model.GetMaterial (i);
            obj.materials.push ({
                name : material.name
            });
        }

        var mesh, triangle, meshObj, triangleObj;
        for (i = 0; i < model.MeshCount (); i++) {
            mesh = model.GetMesh (i);
            meshObj = {
                name : mesh.GetName (),
                triangles : []
            };
            for (j = 0; j < mesh.TriangleCount (); j++) {
                triangle = mesh.GetTriangle (j);
                triangleObj = {
                    mat : triangle.mat,
                    vertices : [],
                    normals : [],
                    uvs : []
                };
                triangleObj.vertices.push (
                    mesh.GetVertex (triangle.v0).x,
                    mesh.GetVertex (triangle.v0).y,
                    mesh.GetVertex (triangle.v0).z,
                    mesh.GetVertex (triangle.v1).x,
                    mesh.GetVertex (triangle.v1).y,
                    mesh.GetVertex (triangle.v1).z,
                    mesh.GetVertex (triangle.v2).x,
                    mesh.GetVertex (triangle.v2).y,
                    mesh.GetVertex (triangle.v2).z
                );
                triangleObj.normals.push (
                    mesh.GetNormal (triangle.n0).x,
                    mesh.GetNormal (triangle.n0).y,
                    mesh.GetNormal (triangle.n0).z,
                    mesh.GetNormal (triangle.n1).x,
                    mesh.GetNormal (triangle.n1).y,
                    mesh.GetNormal (triangle.n1).z,
                    mesh.GetNormal (triangle.n2).x,
                    mesh.GetNormal (triangle.n2).y,
                    mesh.GetNormal (triangle.n2).z
                );
                if (triangle.HasTextureUVs ()) {
                    triangleObj.uvs.push (
                        mesh.GetTextureUV (triangle.u0).x,
                        mesh.GetTextureUV (triangle.u0).y,
                        mesh.GetTextureUV (triangle.u1).x,
                        mesh.GetTextureUV (triangle.u1).y,
                        mesh.GetTextureUV (triangle.u2).x,
                        mesh.GetTextureUV (triangle.u2).y
                    );
                }
                meshObj.triangles.push (triangleObj);
            }
            obj.meshes.push (meshObj);
        }

        return obj;
    },

    ModelToObjectSimple : function (model)
    {
        var obj = {
            name : model.GetName (),
            materials : [],
            meshes : []
        };

        var i;

        var material;
        for (i = 0; i < model.MaterialCount (); i++) {
            material = model.GetMaterial (i);
            obj.materials.push ({
                name : material.name
            });
        }

        model.EnumerateTransformedMeshes ((mesh) => {
            let boundingBox = GetBoundingBox (mesh);
            let meshObj = {
                name : mesh.GetName (),
                vertexCount : mesh.VertexCount (),
                normalCount : mesh.NormalCount (),
                uvCount : mesh.TextureUVCount (),
                triangleCount : mesh.TriangleCount (),
                boundingBox : {
                    min : [boundingBox.min.x, boundingBox.min.y, boundingBox.min.z],
                    max : [boundingBox.max.x, boundingBox.max.y, boundingBox.max.z]
                }
            };
            obj.meshes.push (meshObj);
        });

        return obj;
    },

    GetTwoCubesConnectingInOneVertexModel : function ()
    {
        let model = new Model ();

        let cube1 = GenerateCuboid (null, 1.0, 1.0, 1.0);
        model.AddMeshToRootNode (cube1);

        let cube2 = GenerateCuboid (null, 1.0, 1.0, 1.0);
        let matrix = new Matrix ().CreateTranslation (1.0, 1.0, 1.0);
        TransformMesh (cube2, new Transformation (matrix));
        model.AddMeshToRootNode (cube2);

        FinalizeModel (model, function () { return new Material (MaterialType.Phong) });
        return model;
    },

    GetTwoCubesConnectingInOneEdgeModel : function ()
    {
        let model = new Model ();

        let cube1 = GenerateCuboid (null, 1.0, 1.0, 1.0);
        model.AddMeshToRootNode (cube1);

        let cube2 = GenerateCuboid (null, 1.0, 1.0, 1.0);
        let matrix = new Matrix ().CreateTranslation (1.0, 0.0, 1.0);
        TransformMesh (cube2, new Transformation (matrix))
        model.AddMeshToRootNode (cube2);

        FinalizeModel (model, function () { return new Material (MaterialType.Phong) });
        return model;
    },

    GetTwoCubesConnectingInOneFaceModel ()
    {
        let model = new Model ();

        let cube1 = GenerateCuboid (null, 1.0, 1.0, 1.0);
        model.AddMeshToRootNode (cube1);

        let cube2 = GenerateCuboid (null, 1.0, 1.0, 1.0);
        let matrix = new Matrix ().CreateTranslation (1.0, 0.0, 0.0);
        TransformMesh (cube2, new Transformation (matrix));
        model.AddMeshToRootNode (cube2);

        FinalizeModel (model, function () { return new Material (MaterialType.Phong) });
        return model;
    },

    GetCubeWithOneMissingFaceMesh ()
    {
        var cube = new Mesh ();
        cube.AddVertex (new Coord3D (0.0, 0.0, 0.0));
        cube.AddVertex (new Coord3D (1.0, 0.0, 0.0));
        cube.AddVertex (new Coord3D (1.0, 1.0, 0.0));
        cube.AddVertex (new Coord3D (0.0, 1.0, 0.0));
        cube.AddVertex (new Coord3D (0.0, 0.0, 1.0));
        cube.AddVertex (new Coord3D (1.0, 0.0, 1.0));
        cube.AddVertex (new Coord3D (1.0, 1.0, 1.0));
        cube.AddVertex (new Coord3D (0.0, 1.0, 1.0));
        cube.AddTriangle (new Triangle (0, 1, 5));
        cube.AddTriangle (new Triangle (0, 5, 4));
        cube.AddTriangle (new Triangle (1, 2, 6));
        cube.AddTriangle (new Triangle (1, 6, 5));
        cube.AddTriangle (new Triangle (2, 3, 7));
        cube.AddTriangle (new Triangle (2, 7, 6));
        cube.AddTriangle (new Triangle (3, 0, 4));
        cube.AddTriangle (new Triangle (3, 4, 7));
        cube.AddTriangle (new Triangle (0, 3, 2));
        cube.AddTriangle (new Triangle (0, 2, 1));
        return cube;
    },

    GetTetrahedronMesh ()
    {
        var tetrahedron = new Mesh ();

        let a = 1.0;
        tetrahedron.AddVertex (new Coord3D (+a, +a, +a));
        tetrahedron.AddVertex (new Coord3D (-a, -a, +a));
        tetrahedron.AddVertex (new Coord3D (-a, +a, -a));
        tetrahedron.AddVertex (new Coord3D (+a, -a, -a));
        tetrahedron.AddTriangle (new Triangle (0, 1, 3));
        tetrahedron.AddTriangle (new Triangle (0, 2, 1));
        tetrahedron.AddTriangle (new Triangle (0, 3, 2));
        tetrahedron.AddTriangle (new Triangle (1, 2, 3));

        return tetrahedron;
    },

    GetModelWithOneMesh (mesh)
    {
        var model = new Model ();
        model.AddMeshToRootNode (mesh);
        FinalizeModel (model, function () { return new Material (MaterialType.Phong) });
        return model;
    },

    GetHierarchicalModelNoFinalization ()
    {
        /*
            + <Root>
                + Node 1
                    + Node 3
                        Mesh 5
                        Mesh 6
                        Mesh 7
                    + Node 4
                        Mesh 7
                    Mesh 3
                    Mesh 4
                + Node 2
                Mesh 1
                Mesh 2
        */

        let model = new Model ();
        let root = model.GetRootNode ();

        let node1 = new Node ();
        node1.SetName ('Node 1');

        let node2 = new Node ();
        node2.SetName ('Node 2');

        let node3 = new Node ();
        node3.SetName ('Node 3');

        let node4 = new Node ();
        node4.SetName ('Node 4');

        root.AddChildNode (node1);
        root.AddChildNode (node2);
        node1.AddChildNode (node3);
        node1.AddChildNode (node4);

        let mesh1 = new Mesh ();
        mesh1.SetName ('Mesh 1');

        let mesh2 = new Mesh ();
        mesh2.SetName ('Mesh 2');

        let mesh3 = new Mesh ();
        mesh3.SetName ('Mesh 3');

        let mesh4 = new Mesh ();
        mesh4.SetName ('Mesh 4');

        let mesh5 = new Mesh ();
        mesh5.SetName ('Mesh 5');

        let mesh6 = new Mesh ();
        mesh6.SetName ('Mesh 6');

        let mesh7 = new Mesh ();
        mesh7.SetName ('Mesh 7');

        let mesh1Ind = model.AddMesh (mesh1);
        let mesh2Ind = model.AddMesh (mesh2);
        let mesh3Ind = model.AddMesh (mesh3);
        let mesh4Ind = model.AddMesh (mesh4);
        let mesh5Ind = model.AddMesh (mesh5);
        let mesh6Ind = model.AddMesh (mesh6);
        let mesh7Ind = model.AddMesh (mesh7);

        root.AddMeshIndex (mesh1Ind);
        root.AddMeshIndex (mesh2Ind);
        node1.AddMeshIndex (mesh3Ind);
        node1.AddMeshIndex (mesh4Ind);
        node3.AddMeshIndex (mesh5Ind);
        node3.AddMeshIndex (mesh6Ind);
        node3.AddMeshIndex (mesh7Ind);
        node4.AddMeshIndex (mesh7Ind);

        return model;
    },

    GetTranslatedRotatedCubesModel ()
    {
        /*
            + <Root>
                + Translated
                    Cube
                + Rotated
                    + Translated and Rotated
                        Cube
                Cube
        */

        let model = new Model ();

        let mesh = GenerateCuboid (null, 1.0, 1.0, 1.0);
        mesh.SetName ('Cube');
        let meshIndex = model.AddMesh (mesh);

        let root = model.GetRootNode ();
        root.AddMeshIndex (0);

        let translatedNode = new Node ();
        translatedNode.SetName ('Translated');
        translatedNode.SetTransformation (new Transformation (new Matrix ().CreateTranslation (2.0, 0.0, 0.0)));
        translatedNode.AddMeshIndex (0);

        let rotatedNode = new Node ();
        rotatedNode.SetName ('Rotated');

        let rotation = QuaternionFromAxisAngle (new Coord3D (0.0, 0.0, 1.0), Math.PI / 2.0);
        rotatedNode.SetTransformation (new Transformation (new Matrix ().CreateRotation (rotation.x, rotation.y, rotation.z, rotation.w)));

        let translatedRotatedNode = new Node ();
        translatedRotatedNode.SetName ('Translated and Rotated');
        translatedRotatedNode.SetTransformation (new Transformation (new Matrix ().CreateTranslation (2.0, 0.0, 0.0)));
        translatedRotatedNode.AddMeshIndex (0);

        root.AddChildNode (translatedNode);
        root.AddChildNode (rotatedNode);
        rotatedNode.AddChildNode (translatedRotatedNode);

        FinalizeModel (model, function () { return new Material (MaterialType.Phong) });
        return model;
    }
}
