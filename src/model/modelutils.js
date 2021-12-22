import {Coord3D, CrossVector3D, SubCoord3D} from "../geometry/coord3d.js";
import {Transformation} from "../geometry/transformation.js";
import {Mesh} from "./mesh.js";
import {BoundingBoxCalculator3D} from "../geometry/box3d.js";
import {Octree} from "../geometry/octree.js";
import {Topology} from "./topology.js";
import {MaterialType} from "./material.js";
import Matrix from "../geometry/matrix.js";

export function CalculateTriangleNormal  (v0, v1, v2)
{
    let v = SubCoord3D (v1, v0);
    let w = SubCoord3D (v2, v0);
    let normal = CrossVector3D (v, w);
    normal.Normalize ();
    return normal;
};

export function TransformMesh  (mesh, transformation)
{
    if (transformation.IsIdentity ()) {
        return;
    }

    for (let i = 0; i < mesh.VertexCount (); i++) {
        let vertex = mesh.GetVertex (i);
        let transformed = transformation.TransformCoord3D (vertex);
        vertex.x = transformed.x;
        vertex.y = transformed.y;
        vertex.z = transformed.z;
    }

    if (mesh.NormalCount () > 0) {
        let trs = transformation.GetMatrix ().DecomposeTRS ();
        let normalMatrix = new Matrix ().ComposeTRS (new Coord3D (0.0, 0.0, 0.0), trs.rotation, new Coord3D (1.0, 1.0, 1.0));
        let normalTransformation = new Transformation (normalMatrix);
        for (let i = 0; i < mesh.NormalCount (); i++) {
            let normal = mesh.GetNormal (i);
            let transformed = normalTransformation.TransformCoord3D (normal);
            normal.x = transformed.x;
            normal.y = transformed.y;
            normal.z = transformed.z;
        }
    }
};

export function FlipMeshTrianglesOrientation  (mesh)
{
    for (let i = 0; i < mesh.TriangleCount (); i++) {
        let triangle = mesh.GetTriangle (i);
        let tmp = triangle.v1;
        triangle.v1 = triangle.v2;
        triangle.v2 = tmp;
    }
};

export function IsModelEmpty  (model)
{
    let isEmpty = true;
    model.EnumerateMeshInstances ((meshInstance) => {
        if (meshInstance.TriangleCount () > 0) {
            isEmpty = false;
        }
    });
    return isEmpty;
};

export function CloneMesh  (mesh)
{
    let cloned = new Mesh ();

    cloned.SetName (mesh.GetName ());

    for (let i = 0; i < mesh.VertexCount (); i++) {
        let vertex = mesh.GetVertex (i);
        cloned.AddVertex (vertex.Clone ());
    }

    for (let i = 0; i < mesh.NormalCount (); i++) {
        let normal = mesh.GetNormal (i);
        cloned.AddNormal (normal.Clone ());
    }

    for (let i = 0; i < mesh.TextureUVCount (); i++) {
        let uv = mesh.GetTextureUV (i);
        cloned.AddTextureUV (uv.Clone ());
    }

    for (let i = 0; i < mesh.TriangleCount (); i++) {
        let triangle = mesh.GetTriangle (i);
        cloned.AddTriangle (triangle.Clone ());
    }

    return cloned;
};

export function EnumerateModelVerticesAndTriangles  (model, callbacks)
{
    model.EnumerateMeshInstances ((meshInstance) => {
        meshInstance.EnumerateVertices ((vertex) => {
            callbacks.onVertex (vertex.x, vertex.y, vertex.z);
        });
    });
    let vertexOffset = 0;
    model.EnumerateMeshInstances ((meshInstance) => {
        meshInstance.EnumerateTriangleVertexIndices ((v0, v1, v2) => {
            callbacks.onTriangle (v0 + vertexOffset, v1 + vertexOffset, v2 + vertexOffset);
        });
        vertexOffset += meshInstance.VertexCount ();
    });
};

export function EnumerateTrianglesWithNormals  (object3D, onTriangle)
{
    object3D.EnumerateTriangleVertices ((v0, v1, v2) => {
        let normal = CalculateTriangleNormal (v0, v1, v2);
        onTriangle (v0, v1, v2, normal);
    });
};

export function GetBoundingBox  (object3D)
{
    let calculator = new BoundingBoxCalculator3D ();
    object3D.EnumerateVertices ((vertex) => {
        calculator.AddPoint (vertex);
    });
    return calculator.GetBox ();
};

export function GetTopology  (object3D)
{
    function GetVertexIndex (vertex, octree, topology)
    {
        let index = octree.FindPoint (vertex);
        if (index === null) {
            index = topology.AddVertex ();
            octree.AddPoint (vertex, index);
        }
        return index;
    }

    let boundingBox = GetBoundingBox (object3D);
    let octree = new Octree (boundingBox);
    let topology = new Topology ();

    object3D.EnumerateTriangleVertices ((v0, v1, v2) => {
        let v0Index = GetVertexIndex (v0, octree, topology);
        let v1Index = GetVertexIndex (v1, octree, topology);
        let v2Index = GetVertexIndex (v2, octree, topology);
        topology.AddTriangle (v0Index, v1Index, v2Index);
    });
    return topology;
};

export function IsSolid  (object3D)
{
    function GetEdgeOrientationInTriangle (topology, triangleIndex, edgeIndex)
    {
        const triangle = topology.triangles[triangleIndex];
        const triEdge1 = topology.triangleEdges[triangle.triEdge1];
        const triEdge2 = topology.triangleEdges[triangle.triEdge2];
        const triEdge3 = topology.triangleEdges[triangle.triEdge3];
        if (triEdge1.edge === edgeIndex) {
            return triEdge1.reversed;
        }
        if (triEdge2.edge === edgeIndex) {
            return triEdge2.reversed;
        }
        if (triEdge3.edge === edgeIndex) {
            return triEdge3.reversed;
        }
        return null;
    }

    const topology = GetTopology (object3D);
    for (let edgeIndex = 0; edgeIndex < topology.edges.length; edgeIndex++) {
        const edge = topology.edges[edgeIndex];
        let triCount = edge.triangles.length;
        if (triCount === 0 || triCount % 2 !== 0) {
            return false;
        }
        let edgesDirection = 0;
        for (let triIndex = 0; triIndex < edge.triangles.length; triIndex++) {
            const triangleIndex = edge.triangles[triIndex];
            const edgeOrientation = GetEdgeOrientationInTriangle (topology, triangleIndex, edgeIndex);
            if (edgeOrientation) {
                edgesDirection += 1;
            } else {
                edgesDirection -= 1;
            }
        }
        if (edgesDirection !== 0) {
            return false;
        }
    }
    return true;
};

export function HasDefaultMaterial  (model)
{
    for (let i = 0; i < model.MaterialCount (); i++) {
        let material = model.GetMaterial (i);
        if (material.isDefault) {
            return true;
        }
    }
    return false;
};

export function ReplaceDefaultMaterialColor  (model, color)
{
    for (let i = 0; i < model.MaterialCount (); i++) {
        let material = model.GetMaterial (i);
        if (material.isDefault) {
            material.color = color;
        }
    }
};

export function GetRepresentativeMaterialType  (model)
{
    let maxType = MaterialType.Phong;
    let maxCount = 0;
    let materialTypeToIndex = new Map ();
    for (let i = 0; i < model.MaterialCount (); i++) {
        let material = model.GetMaterial (i);
        if (!materialTypeToIndex.has (material.type)) {
            materialTypeToIndex.set (material.type, 0);
        }
        let typeCount = materialTypeToIndex.get (material.type) + 1;
        materialTypeToIndex.set (material.type, typeCount);
        if (typeCount > maxCount) {
            maxType = material.type;
            maxCount = typeCount;
        }
    }
    return maxType;
};
