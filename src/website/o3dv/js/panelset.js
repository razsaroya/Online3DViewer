import DomUtils from "../../../viewer/domutils.js";
import {Utils} from "./utils.js";

export class Panel
{
    constructor (parentDiv)
    {
        this.parentDiv = parentDiv;
        this.panelDiv = DomUtils.AddDiv (parentDiv);
        DomUtils.HideDomElement (this.panelDiv);
        this.visible = false;
    }

    GetIcon ()
    {
        return null;
    }

    IsVisible ()
    {
        return this.visible;
    }

    Show (show)
    {
        if (this.visible === show) {
            return;
        }

        this.visible = show;
        if (this.visible) {
            DomUtils.ShowDomElement (this.panelDiv);
        } else {
            DomUtils.HideDomElement (this.panelDiv);
        }
    }

    Resize ()
    {

    }

    Clear ()
    {

    }
};

export class PanelSet
{
    constructor (parentDiv)
    {
        this.parentDiv = parentDiv;
        this.menuDiv = DomUtils.AddDiv (parentDiv, 'ov_panel_set_menu');
        this.contentDiv = DomUtils.AddDiv (parentDiv, 'ov_panel_set_content ov_thin_scrollbar');
        this.panels = [];
        this.panelButtons = [];
        this.panelsVisible = true;
        this.panelsPrevWidth = null;
        this.callbacks = null;
    }

    Init (callbacks)
    {
        this.callbacks = callbacks;
    }

    GetContentDiv ()
    {
        return this.contentDiv;
    }

    AddPanel (panel)
    {
        this.panels.push (panel);
        let button = Utils.AddSvgIconElement (this.menuDiv, panel.GetIcon (), 'ov_panel_set_menu_button');
        button.setAttribute ('alt', panel.GetName ());
        button.setAttribute ('title', panel.GetName ());
        this.panelButtons.push (button);
        button.addEventListener ('click', () => {
            if (panel === this.GetVisiblePanel ()) {
                this.ShowPanels (false);
            } else {
                this.ShowPanels (true);
                this.ShowPanel (panel);
            }
        });
    }

    IsPanelsVisible ()
    {
        return this.panelsVisible;
    }

    ShowPanels (show)
    {
        if (!this.IsParentVisible ()) {
            return;
        }

        if (this.panelsVisible === show) {
            return;
        }

        this.panelsVisible = show;
        if (this.panelsVisible) {
            DomUtils.ShowDomElement (this.contentDiv);
            DomUtils.SetDomElementWidth (this.parentDiv, this.menuDiv.offsetWidth + this.panelsPrevWidth);
        } else {
            for (let panelButton of this.panelButtons) {
                panelButton.classList.remove ('selected');
            }
            for (let panel of this.panels) {
                panel.Show (false);
            }
            this.panelsPrevWidth = this.contentDiv.offsetWidth;
            DomUtils.SetDomElementWidth (this.parentDiv, this.menuDiv.offsetWidth);
            DomUtils.HideDomElement (this.contentDiv);
        }

        this.callbacks.onShowHidePanels (this.panelsVisible);
        this.callbacks.onResize ();
    }

    ShowPanel (panel)
    {
        if (panel === this.GetVisiblePanel ()) {
            return;
        }

        let panelButton = this.GetPanelButton (panel);
        for (let otherPanelButton of this.panelButtons) {
            if (otherPanelButton !== panelButton) {
                otherPanelButton.classList.remove ('selected');
            }
        }
        panelButton.classList.add ('selected');

        for (let otherPanel of this.panels) {
            if (otherPanel !== panel) {
                otherPanel.Show (false);
            }
        }
        panel.Show (true);
        panel.Resize ();
    }

    GetVisiblePanel ()
    {
        if (!this.panelsVisible) {
            return null;
        }
        for (let panel of this.panels) {
            if (panel.IsVisible ()) {
                return panel;
            }
        }
        return null;
    }

    SetPanelIcon (panel, icon)
    {
        let panelButton = this.GetPanelButton (panel);
        Utils.SetSvgIconImageElement (panelButton, icon);
    }

    GetPanelButton (panel)
    {
        const panelIndex = this.panels.indexOf (panel);
        return this.panelButtons[panelIndex];
    }

    Resize ()
    {
        let height = this.parentDiv.offsetHeight;
        DomUtils.SetDomElementHeight (this.menuDiv, height);
        DomUtils.SetDomElementHeight (this.contentDiv, height);
        if (this.panelsVisible) {
            for (let panel of this.panels) {
                if (panel.IsVisible ()) {
                    panel.Resize ();
                }
            }
        }
    }

    IsParentVisible ()
    {
        return DomUtils.IsDomElementVisible (this.parentDiv);
    }

    Clear ()
    {
        for (let panel of this.panels) {
            panel.Clear ();
        }
    }
};
