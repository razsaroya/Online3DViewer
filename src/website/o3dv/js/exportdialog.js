import {FileFormat} from "../../../io/fileutils.js";
import {ShowMessageDialog} from "./dialogs.js";
import {ButtonDialog} from "./modal.js";
import DomUtils from "../../../viewer/domutils.js";
import {Exporter} from "../../../export/exporter.js";
import {Utils} from "./utils.js";
import {CreateObjectUrl} from "../../../io/bufferutils.js";
import {RunTaskAsync} from "../../../core/taskrunner.js";

export let ExportType =
{
    Model : 1,
    Image : 2
};

export class ExportDialog
{
    constructor (callbacks)
    {
        this.callbacks = callbacks;
        this.model = null;
        this.exportFormats = [
            {
                name : 'obj',
                formats : [
                    { name : 'text', type: ExportType.Model, format : FileFormat.Text, extension : 'obj' }
                ]
            },
            {
                name : 'stl',
                formats : [
                    { name : 'text', type: ExportType.Model, format : FileFormat.Text, extension : 'stl' },
                    { name : 'binary', type: ExportType.Model, format : FileFormat.Binary, extension : 'stl' }
                ]
            },
            {
                name : 'ply',
                formats : [
                    { name : 'text', type: ExportType.Model, format : FileFormat.Text, extension : 'ply' },
                    { name : 'binary', type: ExportType.Model, format : FileFormat.Binary, extension : 'ply' }
                ]
            },
            {
                name : 'gltf',
                formats : [
                    { name : 'text', type: ExportType.Model, format : FileFormat.Text, extension : 'gltf' },
                    { name : 'binary', type: ExportType.Model, format : FileFormat.Binary, extension : 'glb' }
                ]
            },
            {
                name : 'off',
                formats : [
                    { name : 'text', type: ExportType.Model, format : FileFormat.Text, extension : 'off' }
                ]
            },
            {
                name : '3dm',
                formats : [
                    { name : 'binary', type: ExportType.Model, format : FileFormat.Binary, extension : '3dm' }
                ]
            },
            {
                name : 'png',
                formats : [
                    { name : 'current size', type: ExportType.Image, width : null, height : null, extension : 'png' },
                    { name : 'fixed size (1920x1080)', type: ExportType.Image, width : 1920, height : 1080, extension : 'png' }
                ]
            }
        ];
        this.formatParameters = {
            exportFormatButtonDivs : [],
            formatSettingsDiv : null,
            selectedFormat : null
        };
    }

    Show (model, viewer)
    {
        if (model === null) {
            let messageDialog = ShowMessageDialog (
                'Export Failed',
                'Please load a model before exporting.',
                null
            );
            this.callbacks.onDialog (messageDialog);
            return;
        }

        let mainDialog = new ButtonDialog ();
        let contentDiv = mainDialog.Init ('Export', [
            {
                name : 'Close',
                subClass : 'outline',
                onClick () {
                    mainDialog.Hide ();
                }
            },
            {
                name : 'Export',
                onClick : () => {
                    let selectedFormat = this.formatParameters.selectedFormat;
                    if (selectedFormat === null) {
                        return;
                    }
                    mainDialog.Hide ();
                    this.ExportFormat (model, viewer);
                }
            }
        ]);

        let text = 'Select a format from the below list to export your model. Please note that the export can take several second.';
        DomUtils.AddDiv (contentDiv, 'ov_dialog_section', text);

        let exportFormatSelect = DomUtils.AddDiv (contentDiv, 'ov_dialog_select');
        this.formatParameters.formatSettingsDiv = DomUtils.AddDiv (contentDiv, 'ov_dialog_section ov_dialog_options');
        for (let i = 0; i < this.exportFormats.length; i++) {
            let exportFormat = this.exportFormats[i];
            let exportFormatButton = DomUtils.AddDiv (exportFormatSelect, 'ov_button outline ov_dialog_select_option', exportFormat.name);
            this.formatParameters.exportFormatButtonDivs.push (exportFormatButton);
            exportFormatButton.addEventListener ('click', () => {
                this.OnExportFormatSelect (i);
            });
        }
        this.OnExportFormatSelect (0);

        mainDialog.Show ();
        this.callbacks.onDialog (mainDialog);
    }

    OnExportFormatSelect (exportFormatIndex)
    {
        DomUtils.ClearDomElement (this.formatParameters.formatSettingsDiv);
        for (let i = 0; i < this.formatParameters.exportFormatButtonDivs.length; i++) {
            let exportFormatButtonDiv = this.formatParameters.exportFormatButtonDivs[i];
            if (i === exportFormatIndex) {
                exportFormatButtonDiv.classList.remove ('outline');
            } else {
                exportFormatButtonDiv.classList.add ('outline');
            }
        }

        let exportFormat = this.exportFormats[exportFormatIndex];
        for (let i = 0; i < exportFormat.formats.length; i++) {
            let format = exportFormat.formats[i];
            let formatDiv = DomUtils.AddDiv (this.formatParameters.formatSettingsDiv, 'ov_dialog_row');
            let formatLabel = DomUtils.AddDomElement (formatDiv, 'label');
            formatLabel.setAttribute ('for', format.name);
            let formatInput = DomUtils.AddDomElement (formatLabel, 'input', 'ov_radio_button');
            formatInput.setAttribute ('type', 'radio');
            formatInput.setAttribute ('id', format.name);
            formatInput.setAttribute ('name', 'format');
            DomUtils.AddDomElement (formatLabel, 'span', null, format.name);
            if (i === 0) {
                formatInput.checked = true;
                this.formatParameters.selectedFormat = format;
            }
            formatInput.addEventListener ('change', () => {
                this.formatParameters.selectedFormat = format;
            });
        }
    }

    ExportFormat (model, viewer)
    {
        let selectedFormat = this.formatParameters.selectedFormat;
        if (selectedFormat === null) {
            return;
        }

        if (selectedFormat.type === ExportType.Model) {
            let progressDialog = new ProgressDialog ();
            progressDialog.Init ('Exporting Model');
            progressDialog.Show ();
            RunTaskAsync (() => {
                let exporter = new Exporter ();
                exporter.Export (model, selectedFormat.format, selectedFormat.extension, {
                    onError : () => {
                        progressDialog.Hide ();
                    },
                    onSuccess : (files) => {
                        if (files.length === 0) {
                            progressDialog.Hide ();
                        } else if (files.length === 1) {
                            progressDialog.Hide ();
                            let file = files[0];
                            Utils.DownloadArrayBufferAsFile (file.GetBufferContent (), file.GetName ());
                        } else if (files.length > 1) {
                            progressDialog.Hide ();
                            this.ShowExportedFiles (files);
                        }
                    }
                });
            });
        } else if (selectedFormat.type === ExportType.Image) {
            let url = null;
            if (selectedFormat.width === null || selectedFormat.height === null) {
                let size = viewer.GetImageSize ();
                url = viewer.GetImageAsDataUrl (size.width, size.height);
            } else {
                url = viewer.GetImageAsDataUrl (selectedFormat.width, selectedFormat.height);
            }
            Utils.DownloadUrlAsFile (url, 'model.' + selectedFormat.extension);
        }
    }

    ShowExportedFiles (files)
    {
        let dialog = new ButtonDialog ();
        let contentDiv = dialog.Init ('Exported Files', [
            {
                name : 'Close',
                onClick () {
                    dialog.Hide ();
                }
            }
        ]);

        let text = 'You can download your exported files here.';
        DomUtils.AddDiv (contentDiv, 'ov_dialog_section', text);

        let fileListSection = DomUtils.AddDiv (contentDiv, 'ov_dialog_section');
        let fileList = DomUtils.AddDiv (fileListSection, 'ov_dialog_file_list ov_thin_scrollbar');

        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let url = CreateObjectUrl (file.GetBufferContent ());
            let fileLink = DomUtils.AddDomElement (fileList, 'a', 'ov_dialog_file_link');
            fileLink.setAttribute ('href', url);
            fileLink.setAttribute ('download', file.GetName ());
            DomUtils.AddSvgIconElement (fileLink, 'file_download', 'ov_file_link_img');
            DomUtils.AddDiv (fileLink, 'ov_dialog_file_link_text', file.GetName ());
        }

        dialog.Show ();
        this.callbacks.onDialog (dialog);
    }
};
