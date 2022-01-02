import {Importer} from "../import/importer.js";
import {FileSource} from "../io/fileutils.js";
import {
    ConvertModelToThreeObject,
    ModelToThreeConversionOutput,
    ModelToThreeConversionParams
} from "./threeconverter.js";
import {HasHighpDriverIssue} from './threeutils.js';


export class ThreeModelLoader
{
    constructor ()
    {
        this.importer = new Importer ();
        this.callbacks = null;
        this.inProgress = false;
        this.defaultMaterial = null;
        this.hasHighpDriverIssue = HasHighpDriverIssue ();
    }

    Init (callbacks)
    {
        this.callbacks = callbacks;
    }

    LoadFromUrlList (urls, settings)
    {
        this.LoadFromSource (urls, FileSource.Url, settings);
    }

    LoadFromFileList (files, settings)
    {
        this.LoadFromSource (files, FileSource.File, settings);
    }

    LoadFromSource (files, fileSource, settings)
    {
        if (this.inProgress) {
            return;
        }

        this.inProgress = true;
        this.callbacks.onLoadStart ();
        this.importer.ImportFiles (files, fileSource, settings, {
            onFilesLoaded : () => {
                this.callbacks.onImportStart ();
            },
            onImportSuccess : (importResult) => {
                this.OnModelImported (importResult);
            },
            onImportError : (importError) => {
                this.callbacks.onLoadError (importError);
                this.inProgress = false;
            }
        });
    }

    OnModelImported (importResult)
    {
        this.callbacks.onVisualizationStart ();
        let params = new ModelToThreeConversionParams ();
        params.forceMediumpForMaterials = this.hasHighpDriverIssue;
        let output = new ModelToThreeConversionOutput ();
        ConvertModelToThreeObject (importResult.model, params, output, {
            onTextureLoaded : () => {
                this.callbacks.onTextureLoaded ();
            },
            onModelLoaded : (threeObject) => {
                this.defaultMaterial = output.defaultMaterial;
                this.callbacks.onModelFinished (importResult, threeObject);
                this.inProgress = false;
            }
        });
    }

    GetImporter ()
    {
        return this.importer;
    }

    ReplaceDefaultMaterialColor (defaultColor)
    {
        if (this.defaultMaterial !== null) {
            this.defaultMaterial.color = new THREE.Color (defaultColor.r / 255.0, defaultColor.g / 255.0, defaultColor.b / 255.0);
        }
    }
};
