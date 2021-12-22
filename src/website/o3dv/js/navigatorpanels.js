import {Utils} from "./utils.js";
import {CalculatePopupPositionToElementBottomRight} from "./dialogs.js";
import {Panel} from "./panelset.js";
import {TreeView, TreeViewButton, TreeViewButtonItem, TreeViewGroupItem, TreeViewSingleItem} from "./treeview.js";
import DomUtils from "../../../viewer/domutils.js";
import {MeshItem, NavigatorItemRecurse, NodeItem} from "./navigatoritems.js";
import {NodeType} from "../../../model/node.js";
import {MeshInstanceId} from "../../../model/meshinstance.js";

export class NavigatorPopupButton
{
    constructor (parentDiv)
    {
        this.parentDiv = parentDiv;
        this.callbacks = null;
        this.popup = null;

        this.button = DomUtils.AddDiv (this.parentDiv, 'ov_navigator_info_button');
        this.buttonText = DomUtils.AddDiv (this.button, 'ov_navigator_info_button_text');
        Utils.AddSvgIconElement (this.button, 'arrow_right', 'ov_navigator_info_button_icon');
        this.button.addEventListener ('click', () => {
            this.OnButtonClick ();
        });
    }

    Init (callbacks)
    {
        this.callbacks = callbacks;
    }

    OnButtonClick ()
    {

    }

    Clear ()
    {
        if (this.popup !== null) {
            this.popup.Hide ();
            this.popup = null;
        }
    }
};

export class NavigatorMeshesPopupButton extends NavigatorPopupButton
{
    constructor (parentDiv)
    {
        super (parentDiv);
        this.meshInfoArray = null;
    }

    Update (meshInfoArray)
    {
        this.meshInfoArray = meshInfoArray;
        if (this.meshInfoArray === null) {
            return;
        }

        let meshesText = 'Meshes (' + this.meshInfoArray.length + ')';
        this.buttonText.innerHTML = meshesText;
    }

    OnButtonClick ()
    {
        if (this.meshInfoArray === null) {
            return;
        }

        let meshItems = [];
        for (let i = 0; i < this.meshInfoArray.length; i++) {
            let meshInfo = this.meshInfoArray[i];
            meshItems.push ({
                name : GetMeshName (meshInfo.name)
            });
        }

        if (meshItems.length === 0) {
            return;
        }

        this.popup = ShowListPopup (meshItems, {
            calculatePosition : (contentDiv) => {
                return CalculatePopupPositionToElementBottomRight (this.button, contentDiv);
            },
            onHoverStart : (index) => {
                const meshData = this.meshInfoArray[index];
                this.callbacks.onMeshHover (meshData.meshId);
            },
            onHoverStop : (index) => {
                this.callbacks.onMeshHover (null);
            },
            onClick : (index) => {
                const meshData = this.meshInfoArray[index];
                this.callbacks.onMeshSelected (meshData.meshId);
            }
        });
    }
};

export class NavigatorMaterialsPopupButton extends NavigatorPopupButton
{
    constructor (parentDiv)
    {
        super (parentDiv);
        this.materialInfoArray = null;
    }

    Update (materialInfoArray)
    {
        this.materialInfoArray = materialInfoArray;
        if (this.materialInfoArray === null) {
            return;
        }

        let materialsText = 'Materials (' + this.materialInfoArray.length + ')';
        this.buttonText.innerHTML = materialsText;
    }

    OnButtonClick ()
    {
        if (this.materialInfoArray === null) {
            return;
        }

        let materialItems = [];
        for (let i = 0; i < this.materialInfoArray.length; i++) {
            let usedMaterial = this.materialInfoArray[i];
            materialItems.push ({
                name : GetMaterialName (usedMaterial.name),
                color : usedMaterial.color
            });
        }

        if (materialItems.length === 0) {
            return;
        }

        this.popup = ShowListPopup (materialItems, {
            calculatePosition : (contentDiv) => {
                return CalculatePopupPositionToElementBottomRight (this.button, contentDiv);
            },
            onClick : (index) => {
                let usedMaterial = this.materialInfoArray[index];
                this.callbacks.onMaterialSelected (usedMaterial.index);
            }
        });
    }
};

export class NavigatorPanel extends Panel
{
    constructor (parentDiv)
    {
        super (parentDiv);
        this.callbacks = null;

        this.titleDiv = DomUtils.AddDiv (this.panelDiv, 'ov_navigator_tree_title');
        this.treeDiv = DomUtils.AddDiv (this.panelDiv, 'ov_navigator_tree_panel ov_thin_scrollbar');
        this.treeView = new TreeView (this.treeDiv);

        let panelName = this.GetName ();
        this.titleDiv.innerHTML = panelName;
        this.titleDiv.setAttribute ('title', panelName);
    }

    Clear ()
    {
        this.treeView.Clear ();
    }

    GetName ()
    {
        return null;
    }

    Init (callbacks)
    {
        this.callbacks = callbacks;
    }

    Fill (importResult)
    {

    }
};

export class NavigatorFilesPanel extends NavigatorPanel
{
    constructor (parentDiv)
    {
        super (parentDiv);
    }

    GetName ()
    {
        return 'Files';
    }

    GetIcon ()
    {
        return 'files';
    }

    Resize ()
    {
        let titleHeight = DomUtils.GetDomElementOuterHeight (this.titleDiv);
        let height = this.parentDiv.offsetHeight;
        DomUtils.SetDomElementHeight (this.treeDiv, height - titleHeight);
    }

    Clear ()
    {
        super.Clear ();
    }

    Fill (importResult)
    {
        super.Fill (importResult);
        const usedFiles = importResult.usedFiles;
        const missingFiles = importResult.missingFiles;

        if (missingFiles.length > 0) {
            let missingFilesItem = new TreeViewGroupItem ('Missing Files', null);
            missingFilesItem.ShowChildren (true);
            this.treeView.AddChild (missingFilesItem);
            for (let i = 0; i < missingFiles.length; i++) {
                let file = missingFiles[i];
                let item = new TreeViewButtonItem (file);
                let browseButton = new TreeViewButton ('open');
                browseButton.OnClick (() => {
                    this.callbacks.onFileBrowseButtonClicked ();
                });
                item.AppendButton (browseButton);
                missingFilesItem.AddChild (item);
            }
            let filesItem = new TreeViewGroupItem ('Available Files', null);
            filesItem.ShowChildren (true);
            this.treeView.AddChild (filesItem);
            for (let i = 0; i < usedFiles.length; i++) {
                let file = usedFiles[i];
                let item = new TreeViewSingleItem (file);
                filesItem.AddChild (item);
            }
        } else {
            for (let i = 0; i < usedFiles.length; i++) {
                let file = usedFiles[i];
                let item = new TreeViewSingleItem (file);
                this.treeView.AddChild (item);
            }
        }
    }
};

export class NavigatorMaterialsPanel extends NavigatorPanel
{
    constructor (parentDiv)
    {
        super (parentDiv);
        this.callbacks = null;
        this.materialIndexToItem = new Map ();

        this.popupDiv = DomUtils.AddDiv (this.panelDiv, 'ov_navigator_info_panel');
        this.meshesButton = new NavigatorMeshesPopupButton (this.popupDiv);
    }

    GetName ()
    {
        return 'Materials';
    }

    GetIcon ()
    {
        return 'materials';
    }

    Resize ()
    {
        let titleHeight = DomUtils.GetDomElementOuterHeight (this.titleDiv);
        let popupHeight = DomUtils.GetDomElementOuterHeight (this.popupDiv);
        let height = this.parentDiv.offsetHeight;
        DomUtils.SetDomElementHeight (this.treeDiv, height - titleHeight - popupHeight);
    }

    Clear ()
    {
        super.Clear ();
        this.meshesButton.Clear ();
        this.materialIndexToItem = new Map ();
    }

    Init (callbacks)
    {
        super.Init (callbacks);
        this.meshesButton.Init ({
            onMeshHover : (meshInstanceId) => {
                this.callbacks.onMeshTemporarySelected (meshInstanceId);
            },
            onMeshSelected : (meshInstanceId) => {
                this.callbacks.onMeshSelected (meshInstanceId);
            }
        });
    }

    Fill (importResult)
    {
        super.Fill (importResult);
        const model = importResult.model;
        for (let materialIndex = 0; materialIndex < model.MaterialCount (); materialIndex++) {
            let material = model.GetMaterial (materialIndex);
            let materialName = GetMaterialName (material.name);
            let materialItem = new MaterialItem (materialName, materialIndex, {
                onSelected : (materialIndex) => {
                    this.callbacks.onMaterialSelected (materialIndex);
                }
            });
            this.materialIndexToItem.set (materialIndex, materialItem);
            this.treeView.AddChild (materialItem);
        }
    }

    GetMaterialItem (materialIndex)
    {
        return this.materialIndexToItem.get (materialIndex);
    }

    SelectMaterialItem (materialIndex, isSelected)
    {
        this.GetMaterialItem (materialIndex).SetSelected (isSelected);
    }

    UpdateMeshList (meshInfoArray)
    {
        this.meshesButton.Update (meshInfoArray);
    }
};

export class NavigatorMeshesPanel extends NavigatorPanel
{
    constructor (parentDiv)
    {
        super (parentDiv);

        this.callbacks = null;
        this.nodeIdToItem = new Map ();
        this.meshInstanceIdToItem = new Map ();
        this.rootItem = null;
        this.showTree = false;
        this.buttons = null;

        this.titleDiv.classList.add ('nomargin');
        this.treeView.AddClass ('tight');
        this.buttonsDiv = DomUtils.CreateDiv ('ov_navigator_buttons');
        DomUtils.InsertDomElementBefore (this.buttonsDiv, this.treeDiv);

        this.popupDiv = DomUtils.AddDiv (this.panelDiv, 'ov_navigator_info_panel');
        this.materialsButton = new NavigatorMaterialsPopupButton (this.popupDiv);
    }

    GetName ()
    {
        return 'Meshes';
    }

    GetIcon ()
    {
        return 'meshes';
    }

    Resize ()
    {
        let titleHeight = this.titleDiv.offsetHeight;
        let buttonsHeight = DomUtils.GetDomElementOuterHeight (this.buttonsDiv);
        let popupHeight = DomUtils.GetDomElementOuterHeight (this.popupDiv);
        let height = this.parentDiv.offsetHeight;
        DomUtils.SetDomElementHeight (this.treeDiv, height - titleHeight - buttonsHeight - popupHeight);
    }

    Clear ()
    {
        this.ClearMeshTree ();
        DomUtils.ClearDomElement (this.buttonsDiv);
        this.buttons = null;
    }

    ClearMeshTree ()
    {
        super.Clear ();
        this.materialsButton.Clear ();
        this.nodeIdToItem = new Map ();
        this.meshInstanceIdToItem = new Map ();
        this.rootItem = null;
    }

    Init (callbacks)
    {
        super.Init (callbacks);
        this.materialsButton.Init ({
            onMeshHover : (meshInstanceId) => {
                this.callbacks.onMeshTemporarySelected (meshInstanceId);
            },
            onMeshSelected : (meshInstanceId) => {
                this.callbacks.onMeshSelected (meshInstanceId);
            },
            onMaterialSelected : (materialIndex) => {
                this.callbacks.onMaterialSelected (materialIndex);
            }
        });
    }

    Fill (importResult)
    {
        super.Fill (importResult);

        const model = importResult.model;
        this.FillButtons (importResult);
        this.FillMeshTree (model);

        this.Resize ();
    }

    FillButtons (importResult)
    {
        function CreateButton (parentDiv, button, className, onClick)
        {
            button.div = DomUtils.AddDiv (parentDiv, 'ov_navigator_button');
            button.div.setAttribute ('alt', button.name);
            button.div.setAttribute ('title', button.name);
            if (className) {
                button.div.classList.add (className);
            }
            button.iconDiv = Utils.AddSvgIconElement (button.div, button.icon);
            button.div.addEventListener ('click', () => {
                onClick ();
            });
        }

        function UpdateButtonsStatus (buttons, showTree, isHierarchical)
        {
            if (showTree) {
                buttons.flatList.iconDiv.classList.remove ('selected');
                buttons.treeView.iconDiv.classList.add ('selected');
            } else {
                buttons.flatList.iconDiv.classList.add ('selected');
                buttons.treeView.iconDiv.classList.remove ('selected');
            }
            if (showTree && isHierarchical) {
                DomUtils.ShowDomElement (buttons.separator);
                DomUtils.ShowDomElement (buttons.expandAll.div);
                DomUtils.ShowDomElement (buttons.collapseAll.div);
            } else {
                DomUtils.HideDomElement (buttons.separator);
                DomUtils.HideDomElement (buttons.expandAll.div);
                DomUtils.HideDomElement (buttons.collapseAll.div);
            }
        }

        function UpdateView (panel, importResult, isHierarchical)
        {
            let hiddenMeshInstanceIds = [];
            panel.EnumerateMeshItems ((meshItem) => {
                if (!meshItem.IsVisible ()) {
                    hiddenMeshInstanceIds.push (meshItem.GetMeshInstanceId ());
                }
                return true;
            });

            panel.ClearMeshTree ();
            panel.FillMeshTree (importResult.model);

            for (let meshInstanceId of hiddenMeshInstanceIds) {
                let meshItem = panel.GetMeshItem (meshInstanceId);
                meshItem.SetVisible (false, NavigatorItemRecurse.Parents);
            }

            UpdateButtonsStatus (panel.buttons, panel.showTree, isHierarchical);
            panel.callbacks.onViewTypeChanged ();
        }

        this.buttons = {
            flatList : {
                name : 'Flat list',
                icon : 'flat_list',
                div : null,
                iconDiv : null
            },
            treeView : {
                name : 'Tree view',
                icon : 'tree_view',
                div : null,
                iconDiv : null
            },
            separator : null,
            expandAll : {
                name : 'Expand all',
                icon : 'expand',
                div : null,
                iconDiv : null
            },
            collapseAll : {
                name : 'Collapse all',
                icon : 'collapse',
                div : null,
                iconDiv : null
            },
            showHideMeshes : {
                name : 'Show/hide meshes',
                icon : 'visible',
                div : null,
                iconDiv : null
            },
            fitToWindow : {
                name : 'Fit meshes to window',
                icon : 'fit',
                div : null,
                iconDiv : null
            }
        };

        const rootNode = importResult.model.GetRootNode ();
        let isHierarchical = false;
        for (let childNode of rootNode.GetChildNodes ()) {
            if (childNode.GetType () === NodeType.GroupNode) {
                isHierarchical = true;
                break;
            }
        }

        CreateButton (this.buttonsDiv, this.buttons.flatList, null, () => {
            if (!this.showTree) {
                return;
            }
            this.showTree = false;
            UpdateView (this, importResult, isHierarchical);
        });

        CreateButton (this.buttonsDiv, this.buttons.treeView, null, () => {
            if (this.showTree) {
                return;
            }
            this.showTree = true;
            UpdateView (this, importResult, isHierarchical);
        });

        this.buttons.separator = DomUtils.AddDiv (this.buttonsDiv, 'ov_navigator_buttons_separator');

        CreateButton (this.buttonsDiv, this.buttons.expandAll, null, () => {
            this.rootItem.ExpandAll (true);
        });

        CreateButton (this.buttonsDiv, this.buttons.collapseAll, null, () => {
            this.rootItem.ExpandAll (false);
        });

        CreateButton (this.buttonsDiv, this.buttons.showHideMeshes, 'right', () => {
            let nodeId = this.rootItem.GetNodeId ();
            this.callbacks.onNodeShowHide (nodeId);
        });

        CreateButton (this.buttonsDiv, this.buttons.fitToWindow, 'right', () => {
            let nodeId = this.rootItem.GetNodeId ();
            this.callbacks.onNodeFitToWindow (nodeId);
        });

        UpdateButtonsStatus (this.buttons, this.showTree, isHierarchical);
    }

    FillMeshTree (model)
    {
        function AddMeshToNodeTree (panel, model, node, meshIndex, parentItem, showTree)
        {
            let mesh = model.GetMesh (meshIndex);
            let meshName = GetMeshName (mesh.GetName ());
            let meshInstanceId = new MeshInstanceId (node.GetId (), meshIndex);
            let meshItemIcon = showTree ? 'tree_mesh' : null;
            let meshItem = new MeshItem (meshName, meshItemIcon, meshInstanceId, {
                onShowHide : (selectedMeshId) => {
                    panel.callbacks.onMeshShowHide (selectedMeshId);
                },
                onFitToWindow : (selectedMeshId) => {
                    panel.callbacks.onMeshFitToWindow (selectedMeshId);
                },
                onSelected : (selectedMeshId) => {
                    panel.callbacks.onMeshSelected (selectedMeshId);
                }
            });
            panel.meshInstanceIdToItem.set (meshInstanceId.GetKey (), meshItem);
            parentItem.AddChild (meshItem);
        }

        function CreateNodeItem (panel, node)
        {
            const nodeName = GetNodeName (node.GetName ());
            const nodeId = node.GetId ();
            let nodeItem = new NodeItem (nodeName, nodeId, {
                onShowHide : (selectedNodeId) => {
                    panel.callbacks.onNodeShowHide (selectedNodeId);
                },
                onFitToWindow : (selectedNodeId) => {
                    panel.callbacks.onNodeFitToWindow (selectedNodeId);
                }
            });
            panel.nodeIdToItem.set (nodeId, nodeItem);
            return nodeItem;
        }

        function CreateDummyRootItem (panel, node)
        {
            const nodeId = node.GetId ();
            let rootItem = new NodeItem (null, nodeId, {
                onVisibilityChanged : (isVisible) => {
                    if (isVisible) {
                        Utils.SetSvgIconImageElement (panel.buttons.showHideMeshes.iconDiv, 'visible');
                    } else {
                        Utils.SetSvgIconImageElement (panel.buttons.showHideMeshes.iconDiv, 'hidden');
                    }
                }
            });
            rootItem.Show (false);
            rootItem.ShowChildren (true);
            panel.treeView.AddChild (rootItem);
            panel.nodeIdToItem.set (nodeId, rootItem);
            return rootItem;
        }

        function AddModelNodeToTree (panel, model, node, parentItem, showTree)
        {
            let meshNodes = [];
            for (let childNode of node.GetChildNodes ()) {
                if (showTree) {
                    if (childNode.GetType () === NodeType.GroupNode) {
                        let nodeItem = CreateNodeItem (panel, childNode);
                        parentItem.AddChild (nodeItem);
                        AddModelNodeToTree (panel, model, childNode, nodeItem, showTree);
                    } else if (childNode.GetType () === NodeType.MeshNode) {
                        meshNodes.push (childNode);
                    }
                } else {
                    AddModelNodeToTree (panel, model, childNode, parentItem, showTree);
                }
            }
            for (let meshNode of meshNodes) {
                AddModelNodeToTree (panel, model, meshNode, parentItem, showTree);
            }
            for (let meshIndex of node.GetMeshIndices ()) {
                AddMeshToNodeTree (panel, model, node, meshIndex, parentItem, showTree);
            }
        }

        let rootNode = model.GetRootNode ();
        this.rootItem = CreateDummyRootItem (this, rootNode);
        AddModelNodeToTree (this, model, rootNode, this.rootItem, this.showTree);
    }

    UpdateMaterialList (materialInfoArray)
    {
        this.materialsButton.Update (materialInfoArray);
    }

    GetNodeItem (nodeId)
    {
        return this.nodeIdToItem.get (nodeId);
    }

    MeshItemCount ()
    {
        return this.meshInstanceIdToItem.size;
    }

    GetMeshItem (meshInstanceId)
    {
        return this.meshInstanceIdToItem.get (meshInstanceId.GetKey ());
    }

    EnumerateNodeItems (processor)
    {
        for (const nodeItem of this.nodeIdToItem.values ()) {
            if (!processor (nodeItem)) {
                break;
            }
        }
    }

    EnumerateMeshItems (processor)
    {
        for (const meshItem of this.meshInstanceIdToItem.values ()) {
            if (!processor (meshItem)) {
                break;
            }
        }
    }

    IsMeshVisible (meshInstanceId)
    {
        let meshItem = this.GetMeshItem (meshInstanceId);
        return meshItem.IsVisible ();
    }

    HasHiddenMesh ()
    {
        let hasHiddenMesh = false;
        this.EnumerateMeshItems ((meshItem) => {
            if (!meshItem.IsVisible ()) {
                hasHiddenMesh = true;
                return false;
            }
            return true;
        });
        return hasHiddenMesh;
    }

    ShowAllMeshes (show)
    {
        this.EnumerateNodeItems ((nodeItem) => {
            nodeItem.SetVisible (show, NavigatorItemRecurse.No);
            return true;
        });
        this.EnumerateMeshItems ((meshItem) => {
            meshItem.SetVisible (show, NavigatorItemRecurse.No);
            return true;
        });
    }

    ToggleNodeVisibility (nodeId)
    {
        let nodeItem = this.GetNodeItem (nodeId);
        nodeItem.SetVisible (!nodeItem.IsVisible (), NavigatorItemRecurse.All);
    }

    ToggleMeshVisibility (meshInstanceId)
    {
        let meshItem = this.GetMeshItem (meshInstanceId);
        meshItem.SetVisible (!meshItem.IsVisible (), NavigatorItemRecurse.Parents);
    }

    IsMeshIsolated (meshInstanceId)
    {
        let isIsolated = true;
        this.EnumerateMeshItems ((meshItem) => {
            if (!meshItem.GetMeshInstanceId ().IsEqual (meshInstanceId) && meshItem.IsVisible ()) {
                isIsolated = false;
                return false;
            }
            return true;
        });
        return isIsolated;
    }

    IsolateMesh (meshInstanceId)
    {
        this.ShowAllMeshes (false);
        this.ToggleMeshVisibility (meshInstanceId);
    }
};
