var assert = require ('assert');
const {GeneratePlatonicSolid} = require("../../source/model/generator");
const {GenerateSphere} = require("../../source/model/generator");
const {IsEqualEps} = require("../../source/geometry/geometry");
const {GenerateCylinder} = require("../../source/model/generator");
const {GeneratorParams} = require("../../source/model/generator");
const {CalculateVolume} = require("../../source/model/quantities");
const {IsEqual} = require("../../source/geometry/geometry");
const {IsSolid} = require("../../source/model/modelutils");
const {GenerateCuboid} = require("../../source/model/generator");

describe ('Generator', function () {
    it ('Cuboid with Default Parameters', function () {
        const cuboid = GenerateCuboid (null, 1.0, 1.0, 1.0);
        assert (IsSolid (cuboid));
        assert (IsEqual (CalculateVolume (cuboid), 1.0));
    });

    it ('Cuboid with Material', function () {
        const params = new GeneratorParams ().SetMaterial (1);
        const cuboid = GenerateCuboid (params, 1.0, 1.0, 1.0);
        for (let i = 0; i < cuboid.TriangleCount (); i++) {
            const triangle = cuboid.GetTriangle (i);
            assert.strictEqual (triangle.mat, 1);
        }
    });

    it ('Cylinder with Default Parameters', function () {
        const cylinder = GenerateCylinder (null, 0.5, 1.0, 25, false);
        assert (IsSolid (cylinder));
        assert (IsEqualEps (CalculateVolume (cylinder), Math.PI * 0.5 * 0.5 * 1.0, 0.1));
    });

    it ('Sphere with Default Parameters', function () {
        const cylinder = GenerateSphere (null, 0.5, 20, false);
        assert (IsSolid (cylinder));
        assert (IsEqualEps (CalculateVolume (cylinder), Math.PI * 0.5 * 0.5 * 0.5 * 4.0 / 3.0, 0.1));
    });

    it ('Platonic Solids', function () {
        let tetrahedron = GeneratePlatonicSolid (null, 'tetrahedron', 1.0);
        assert (IsSolid (tetrahedron));
        assert (IsEqual (CalculateVolume (tetrahedron), 0.5132002392796676));

        let hexahedron = GeneratePlatonicSolid (null, 'hexahedron', 1.0);
        assert (IsSolid (hexahedron));
        assert (IsEqual (CalculateVolume (hexahedron), 1.5396007178390028));

        let octahedron = GeneratePlatonicSolid (null, 'octahedron', 1.0);
        assert (IsSolid (octahedron));
        assert (IsEqual (CalculateVolume (octahedron), 1.3333333333333333));

        let dodecahedron = GeneratePlatonicSolid (null, 'dodecahedron', 1.0);
        assert (IsSolid (dodecahedron));
        assert (IsEqual (CalculateVolume (dodecahedron), 2.7851638631226248));

        let icosahedron = GeneratePlatonicSolid (null, 'icosahedron', 1.0);
        assert (IsSolid (icosahedron));
        assert (IsEqual (CalculateVolume (icosahedron), 2.5361507101204093));
    });
});
