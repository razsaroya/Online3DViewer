var testUtils = require ('./testutils.js');
const {MaterialType} = require("../../source/model/material");
const {Material} = require("../../source/model/material");
const {ImporterFileAccessor} = require("../../source/import/importer");
const {GetFileExtension} = require("../../source/io/fileutils");
const {ImporterO3dv} = require("../../source/import/importero3dv");
const {ImporterGltf} = require("../../source/import/importergltf");
const {Importer3ds} = require("../../source/import/importer3ds");
const {ImporterPly} = require("../../source/import/importerply");
const {ImporterOff} = require("../../source/import/importeroff");
const {ImporterStl} = require("../../source/import/importerstl");
const {ImporterObj} = require("../../source/import/importerobj");

module.exports =
{
    ImportObjFile : function (fileName, onReady)
    {
        var importer = new ImporterObj ();
        this.ImportFile (importer, 'obj', fileName, onReady);
    },

    ImportStlFile : function (fileName, onReady)
    {
        var importer = new ImporterStl ();
        this.ImportFile (importer, 'stl', fileName, onReady);
    },

    ImportOffFile : function (fileName, onReady)
    {
        var importer = new ImporterOff ();
        this.ImportFile (importer, 'off', fileName, onReady);
    },

    ImportPlyFile : function (fileName, onReady)
    {
        var importer = new ImporterPly ();
        this.ImportFile (importer, 'ply', fileName, onReady);
    },

    Import3dsFile : function (fileName, onReady)
    {
        var importer = new Importer3ds ();
        this.ImportFile (importer, '3ds', fileName, onReady);
    },

    ImportGltfFile : function (folderName, fileName, onReady)
    {
        var importer = new ImporterGltf ();
        this.ImportFile (importer, 'gltf/' + folderName, fileName, onReady);
    },

    ImportO3dvFile : function (fileName, onReady)
    {
        var importer = new ImporterO3dv ();
        this.ImportFile (importer, 'o3dv', fileName, onReady);
    },

    ImportFile : function (importer, folder, fileName, onReady)
    {
        let content = testUtils.GetArrayBufferFileContent (folder, fileName);
        var extension = GetFileExtension (fileName);
        let fileAccessor = new ImporterFileAccessor (function (filePath) {
            let fileContent = testUtils.GetArrayBufferFileContent (folder, filePath);
            return fileContent;
        });
        importer.Import (fileName, extension, content, {
            getDefaultMaterial : function () {
                var material = new Material (MaterialType.Phong);
                return material;
            },
            getFileBuffer : function (filePath) {
                return fileAccessor.GetFileBuffer (filePath);
            },
            getTextureBuffer : function (filePath) {
                return fileAccessor.GetTextureBuffer (filePath);
            },
            onSuccess : function () {
                let model = importer.GetModel ();
                onReady (model);
            },
            onError : function () {
                onReady (model);
            },
            onComplete : function () {

            }
        });
    }
}
