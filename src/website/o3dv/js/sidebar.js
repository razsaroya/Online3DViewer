import {PanelSet} from "./panelset.js";
import {DetailsSidebarPanel, SettingsSidebarPanel} from "./sidebarpanels.js";
import DomUtils from "../../../viewer/domutils.js";
import {Settings} from "./settings.js";
import {Utils} from "./utils.js";

export class Sidebar
{
    constructor (mainDiv, splitterDiv)
    {
        this.mainDiv = mainDiv;
        this.splitterDiv = splitterDiv;
        this.panelSet = new PanelSet (mainDiv);

        this.detailsPanel = new DetailsSidebarPanel (this.panelSet.GetContentDiv ());
        this.settingsPanel = new SettingsSidebarPanel (this.panelSet.GetContentDiv ());

        this.panelSet.AddPanel (this.detailsPanel);
        this.panelSet.AddPanel (this.settingsPanel);
        this.panelSet.ShowPanel (this.detailsPanel);
    }

    IsPanelsVisible ()
    {
        return this.panelSet.IsPanelsVisible ();
    }

    ShowPanels (show)
    {
        this.panelSet.ShowPanels (show);
    }

    Init (settings, callbacks)
    {
        this.callbacks = callbacks;

        this.panelSet.Init ({
            onResize : () => {
                if (this.panelSet.IsPanelsVisible ()) {
                    DomUtils.ShowDomElement (this.splitterDiv);
                } else {
                    DomUtils.HideDomElement (this.splitterDiv);
                }
                this.callbacks.onResize ();
            },
            onShowHidePanels : (show) => {
                this.callbacks.onShowHidePanels (show);
            }
        });

        let defaultSettings = new Settings ();
        this.settingsPanel.InitSettings (
            settings,
            defaultSettings,
            {
                onBackgroundColorChange : (newVal) => {
                    this.callbacks.onBackgroundColorChange (newVal);
                },
                onDefaultColorChange : (newVal) => {
                    this.callbacks.onDefaultColorChange (newVal);
                },
                onThemeChange : (newVal) => {
                    this.callbacks.onThemeChange (newVal);
                }
            }
        );

        Utils.InstallVerticalSplitter (this.splitterDiv, this.mainDiv, true, () => {
            this.callbacks.onResize ();
        });
    }

    Update (model)
    {
        this.settingsPanel.Update (model);
    }

    Resize (height)
    {
        DomUtils.SetDomElementOuterHeight (this.mainDiv, height);
        DomUtils.SetDomElementHeight (this.splitterDiv, height);
        this.panelSet.Resize ();
    }

    GetWidth ()
    {
        let sidebarWidth = DomUtils.GetDomElementOuterWidth (this.mainDiv);
        let splitterWidth = 0;
        if (this.panelSet.IsPanelsVisible ()) {
             splitterWidth = this.splitterDiv.offsetWidth;
        }
        return sidebarWidth + splitterWidth;
    }

    DecreaseWidth (diff)
    {
        let oldWidth = this.mainDiv.offsetWidth;
        DomUtils.SetDomElementWidth (this.mainDiv, oldWidth - diff);
    }

    Clear ()
    {
        this.panelSet.Clear ();
    }

    AddObject3DProperties (object3D)
    {
        this.detailsPanel.AddObject3DProperties (object3D);
    }

    AddMaterialProperties (material)
    {
        this.detailsPanel.AddMaterialProperties (material);
    }
};
