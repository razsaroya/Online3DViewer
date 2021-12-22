import {Utils} from "./utils.js";
import DomUtils from "../../../viewer/domutils.js";
import {IsDefined} from "../../../core/core.js";

export function ScrollToView  (element)
{
    element.scrollIntoView ({
        behavior : 'smooth',
        block : 'nearest'
    });
};

export class TreeViewButton
{
    constructor (imagePath)
    {
        this.imagePath = imagePath;
        this.mainElement = Utils.CreateSvgIconElement (this.imagePath, 'ov_tree_item_button');
        this.mainElement.setAttribute ('src', this.imagePath);
    }

    SetImage (imagePath)
    {
        this.imagePath = imagePath;
        Utils.SetSvgIconImageElement (this.mainElement, this.imagePath);
    }

    OnClick (clickHandler)
    {
        this.mainElement.addEventListener ('click', (ev) => {
            ev.stopPropagation ();
            clickHandler (ev);
        });
    }

    GetDomElement ()
    {
        return this.mainElement;
    }
};

export class TreeViewItem
{
    constructor (name, icon)
    {
        this.name = name;
        this.parent = null;
        this.mainElement = DomUtils.CreateDiv ('ov_tree_item');
        this.mainElement.setAttribute ('title', this.name);
        this.nameElement = DomUtils.AddDiv (this.mainElement, 'ov_tree_item_name', this.name);
        if (IsDefined (icon)) {
            let iconElement = Utils.CreateSvgIconElement (icon, 'ov_tree_item_icon');
            DomUtils.InsertDomElementBefore (iconElement, this.nameElement);
        }
    }

    OnClick (onClick)
    {
        this.mainElement.classList.add ('clickable');
        this.mainElement.style.cursor = 'pointer';
        this.mainElement.addEventListener ('click', onClick);
    }

    SetParent (parent)
    {
        this.parent = parent;
    }

    AddDomElements (parentDiv)
    {
        parentDiv.appendChild (this.mainElement);
    }
};

export class TreeViewSingleItem extends TreeViewItem
{
    constructor (name, icon)
    {
        super (name, icon);
        this.selected = false;
    }

    SetSelected (selected)
    {
        this.selected = selected;
        if (this.selected) {
            this.mainElement.classList.add ('selected');
            let parent = this.parent;
            if (parent === null) {
                ScrollToView (this.mainElement);
            } else {
                while (parent !== null) {
                    parent.ShowChildren (true);
                    ScrollToView (this.mainElement);
                    parent = parent.parent;
                }
            }
        } else {
            this.mainElement.classList.remove ('selected');
        }
    }
};

export class TreeViewButtonItem extends TreeViewSingleItem
{
    constructor (name, icon)
    {
        super (name, icon);
        this.buttonsDiv = DomUtils.CreateDiv ('ov_tree_item_button_container');
        DomUtils.InsertDomElementBefore (this.buttonsDiv, this.nameElement);
    }

    AppendButton (button)
    {
        this.buttonsDiv.appendChild (button.GetDomElement ());
    }
};

export class TreeViewGroupItem extends TreeViewItem
{
    constructor (name, icon)
    {
        super (name, icon);
        this.children = [];
        this.isVisible = true;
        this.isChildrenVisible = false;

        this.childrenDiv = null;
        this.openButtonIcon = 'arrow_down';
        this.closeButtonIcon = 'arrow_right';

        this.openCloseButton = Utils.CreateSvgIconElement (this.openButtonIcon, 'ov_tree_item_icon');
        DomUtils.InsertDomElementBefore (this.openCloseButton, this.nameElement);
    }

    AddChild (child)
    {
        this.CreateChildrenDiv ();
        this.children.push (child);
        child.SetParent (this);
        child.AddDomElements (this.childrenDiv);
    }

    ExpandAll (expand)
    {
        for (let child of this.children) {
            if (child instanceof TreeViewGroupItem) {
                child.ShowChildren (expand);
                child.ExpandAll (expand);
            }
        }
    }

    Show (show)
    {
        this.isVisible = show;
        if (this.childrenDiv === null) {
            return;
        }
        if (this.isVisible) {
            DomUtils.ShowDomElement (this.mainElement);
            this.childrenDiv.classList.add ('ov_tree_view_children');
        } else {
            DomUtils.HideDomElement (this.mainElement);
            this.childrenDiv.classList.remove ('ov_tree_view_children');
        }
    }

    ShowChildren (show)
    {
        this.isChildrenVisible = show;
        if (this.childrenDiv === null) {
            return;
        }
        if (show) {
            Utils.SetSvgIconImageElement (this.openCloseButton, this.openButtonIcon);
            DomUtils.ShowDomElement (this.childrenDiv);
        } else {
            Utils.SetSvgIconImageElement (this.openCloseButton, this.closeButtonIcon);
            DomUtils.HideDomElement (this.childrenDiv);
        }
    }

    CreateChildrenDiv ()
    {
        if (this.childrenDiv === null) {
            this.childrenDiv = DomUtils.CreateDiv ('ov_tree_view_children');
            DomUtils.InsertDomElementAfter (this.childrenDiv, this.mainElement);
            this.Show (this.isVisible);
            this.ShowChildren (this.isChildrenVisible);
            this.OnClick ((ev) => {
                this.isChildrenVisible = !this.isChildrenVisible;
                this.ShowChildren (this.isChildrenVisible);
            });
        }
        return this.childrenDiv;
    }
};

export class TreeViewGroupButtonItem extends TreeViewGroupItem
{
    constructor (name, icon)
    {
        super (name, icon);
        this.buttonsDiv = DomUtils.CreateDiv ('ov_tree_item_button_container');
        DomUtils.InsertDomElementBefore (this.buttonsDiv, this.nameElement);
    }

    AppendButton (button)
    {
        this.buttonsDiv.appendChild (button.GetDomElement ());
    }
};

export class TreeView
{
    constructor (parentDiv)
    {
        this.mainDiv = DomUtils.AddDiv (parentDiv, 'ov_tree_view');
        this.children = [];
    }

    AddClass (className)
    {
        this.mainDiv.classList.add (className);
    }

    AddChild (child)
    {
        child.AddDomElements (this.mainDiv);
        this.children.push (child);
    }

    Clear ()
    {
        DomUtils.ClearDomElement (this.mainDiv);
        this.children = [];
    }
};
