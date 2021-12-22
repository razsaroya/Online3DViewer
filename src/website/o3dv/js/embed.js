import {Viewer} from "../../../viewer/viewer.js";
import {HashHandler} from "./hashhandler.js";
import {ThreeModelLoader} from "../../../threejs/threemodelloader.js";
import DomUtils from "../../../viewer/domutils.js";
import {ImportSettings} from "../../../import/importer.js";
import {CreateModelUrlParameters} from "../../../parameters/parameterlist.js";
import {InitModelLoader} from "./loader.js";

export class Embed
{
    constructor (parameters)
    {
        this.parameters = parameters;
        this.viewer = new Viewer ();
        this.hashHandler = new HashHandler ();
        this.modelLoader = new ThreeModelLoader ();
    }

    Load ()
    {
        let canvas = DomUtils.AddDomElement (this.parameters.viewerDiv, 'canvas');
        this.InitViewer (canvas);
        this.InitModelLoader ();
        this.Resize ();

        if (this.hashHandler.HasHash ()) {
            let urls = this.hashHandler.GetModelFilesFromHash ();
            if (urls === null) {
                return;
            }
            let background = this.hashHandler.GetBackgroundFromHash ();
            if (background !== null) {
                this.viewer.SetBackgroundColor (background);
            }
            let settings = new ImportSettings ();
            let defaultColor = this.hashHandler.GetDefaultColorFromHash ();
            if (defaultColor !== null) {
                settings.defaultColor = defaultColor;
            }
            this.modelLoader.LoadFromUrlList (urls, settings);
            let hashParameters = CreateModelUrlParameters (urls);
            let websiteUrl = this.parameters.websiteLinkDiv.getAttribute ('href') + '#' + hashParameters;
            this.parameters.websiteLinkDiv.setAttribute ('href', websiteUrl);
        }

		window.addEventListener ('resize', () => {
			this.Resize ();
		});
    }

    Resize ()
    {
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        this.viewer.Resize (windowWidth, windowHeight);
    }

    OnModelFinished (importResult, threeObject)
    {
        this.viewer.SetMainObject (threeObject);
        let boundingSphere = this.viewer.GetBoundingSphere ((meshUserData) => {
            return true;
        });
        this.viewer.AdjustClippingPlanesToSphere (boundingSphere);
        let camera = this.hashHandler.GetCameraFromHash ();
        if (camera !== null) {
            this.viewer.SetCamera (camera);
        } else {
            this.viewer.SetUpVector (importResult.upVector, false);
        }
        this.viewer.FitSphereToWindow (boundingSphere, false);
    }

    InitViewer (canvas)
    {
        this.viewer.Init (canvas);
        this.viewer.SetEnvironmentMap ([
            'assets/envmaps/grayclouds/posx.jpg',
            'assets/envmaps/grayclouds/negx.jpg',
            'assets/envmaps/grayclouds/posy.jpg',
            'assets/envmaps/grayclouds/negy.jpg',
            'assets/envmaps/grayclouds/posz.jpg',
            'assets/envmaps/grayclouds/negz.jpg'
        ]);
    }

    InitModelLoader ()
    {
        InitModelLoader (this.modelLoader, {
            onStart : () =>
            {

            },
            onFinish : (importResult, threeObject) =>
            {
                this.OnModelFinished (importResult, threeObject);
            },
            onRender : () =>
            {
                this.viewer.Render ();
            },
            onError : (importError) =>
            {

            }
        });
    }
};
