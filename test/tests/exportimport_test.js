var assert = require ('assert');
var testUtils = require ('../utils/testutils.js');
const {Coord3D} = require("../../source/geometry/coord3d");
const {CoordIsEqual3D} = require("../../source/geometry/coord3d");
const {GetBoundingBox} = require("../../source/model/modelutils");
const {FileFormat} = require("../../source/io/fileutils");
const {ImportSettings} = require("../../source/import/importer");
const {Importer} = require("../../source/import/importer");
const {Exporter} = require("../../source/export/exporter");

function ExportImport (model, format, extension, onReady)
{
    let exporter = new Exporter ();
    exporter.Export (model, format, extension, {
        onSuccess : function (files) {
            let fileObjects = [];
            for (let file of files) {
                fileObjects.push (new FileObject ('', file.name, file.content));
            }
            let importer = new Importer ();
            let settings = new ImportSettings ();
            importer.ImportFilesFromFileObjects (fileObjects, settings, {
                onFilesLoaded : function () {

                },
                onImportSuccess : function (importResult) {
                    onReady (importResult.model)
                },
                onImportError : function (importError) {

                }
            });
        }
    });
}

describe ('Export-Import Test', function () {
    it ('Obj Export-Import', function (done) {
        let model = testUtils.GetTranslatedRotatedCubesModel ();
        ExportImport (model, FileFormat.Text, 'obj', (result) => {
            assert.strictEqual (model.MeshInstanceCount (), 3);
            let boundingBox = GetBoundingBox (model);
            assert (CoordIsEqual3D (boundingBox.min, new Coord3D (-1.0, 0.0, 0.0)));
            assert (CoordIsEqual3D (boundingBox.max, new Coord3D (3.0, 3.0, 1.0)));
            done ();
        });
    });

    it ('Stl Ascii Export-Import', function (done) {
        let model = testUtils.GetTranslatedRotatedCubesModel ();
        ExportImport (model, FileFormat.Text, 'stl', (result) => {
            assert.strictEqual (model.MeshInstanceCount (), 3);
            let boundingBox = GetBoundingBox (model);
            assert (CoordIsEqual3D (boundingBox.min, new Coord3D (-1.0, 0.0, 0.0)));
            assert (CoordIsEqual3D (boundingBox.max, new Coord3D (3.0, 3.0, 1.0)));
            done ();
        });
    });

    it ('Stl Binary Export-Import', function (done) {
        let model = testUtils.GetTranslatedRotatedCubesModel ();
        ExportImport (model, FileFormat.Binary, 'stl', (result) => {
            assert.strictEqual (model.MeshInstanceCount (), 3);
            let boundingBox = GetBoundingBox (model);
            assert (CoordIsEqual3D (boundingBox.min, new Coord3D (-1.0, 0.0, 0.0)));
            assert (CoordIsEqual3D (boundingBox.max, new Coord3D (3.0, 3.0, 1.0)));
            done ();
        });
    });

    it ('Ply Ascii Export-Import', function (done) {
        let model = testUtils.GetTranslatedRotatedCubesModel ();
        ExportImport (model, FileFormat.Text, 'ply', (result) => {
            assert.strictEqual (model.MeshInstanceCount (), 3);
            let boundingBox = GetBoundingBox (model);
            assert (CoordIsEqual3D (boundingBox.min, new Coord3D (-1.0, 0.0, 0.0)));
            assert (CoordIsEqual3D (boundingBox.max, new Coord3D (3.0, 3.0, 1.0)));
            done ();
        });
    });

    it ('Ply Binary Export-Import', function (done) {
        let model = testUtils.GetTranslatedRotatedCubesModel ();
        ExportImport (model, FileFormat.Binary, 'ply', (result) => {
            assert.strictEqual (model.MeshInstanceCount (), 3);
            let boundingBox = GetBoundingBox (model);
            assert (CoordIsEqual3D (boundingBox.min, new Coord3D (-1.0, 0.0, 0.0)));
            assert (CoordIsEqual3D (boundingBox.max, new Coord3D (3.0, 3.0, 1.0)));
            done ();
        });
    });

    it ('glTF Ascii Export-Import', function (done) {
        let model = testUtils.GetTranslatedRotatedCubesModel ();
        ExportImport (model, FileFormat.Text, 'gltf', (result) => {
            assert.strictEqual (model.MeshInstanceCount (), 3);
            let boundingBox = GetBoundingBox (model);
            assert (CoordIsEqual3D (boundingBox.min, new Coord3D (-1.0, 0.0, 0.0)));
            assert (CoordIsEqual3D (boundingBox.max, new Coord3D (3.0, 3.0, 1.0)));
            done ();
        });
    });

    it ('glTF Binary Export-Import', function (done) {
        let model = testUtils.GetTranslatedRotatedCubesModel ();
        ExportImport (model, FileFormat.Binary, 'glb', (result) => {
            assert.strictEqual (model.MeshInstanceCount (), 3);
            let boundingBox = GetBoundingBox (model);
            assert (CoordIsEqual3D (boundingBox.min, new Coord3D (-1.0, 0.0, 0.0)));
            assert (CoordIsEqual3D (boundingBox.max, new Coord3D (3.0, 3.0, 1.0)));
            done ();
        });
    });


    it ('Off Export-Import', function (done) {
        let model = testUtils.GetTranslatedRotatedCubesModel ();
        ExportImport (model, FileFormat.Text, 'off', (result) => {
            assert.strictEqual (model.MeshInstanceCount (), 3);
            let boundingBox = GetBoundingBox (model);
            assert (CoordIsEqual3D (boundingBox.min, new Coord3D (-1.0, 0.0, 0.0)));
            assert (CoordIsEqual3D (boundingBox.max, new Coord3D (3.0, 3.0, 1.0)));
            done ();
        });
    });
});
