import DomUtils from "../../../viewer/domutils.js";
import Utils from "./utils.js";
import {CreateUrlBuilder} from "../../../parameters/parameterlist.js";
import {ShowMessageDialog} from "./dialogs.js";
import {FileSource} from "../../../io/fileutils.js";
import {ButtonDialog} from "./modal.js";

export default function ShowSharingDialog  (importer, settings, camera)
{
    function AddCheckboxLine (parentDiv, text, id, onChange)
    {
        let line = DomUtils.AddDiv (parentDiv, 'ov_dialog_row');
        let label = DomUtils.AddDomElement (line, 'label');
        label.setAttribute ('for', id);
        let check = DomUtils.AddDomElement (label, 'input', 'ov_checkbox');
        check.setAttribute ('type', 'checkbox');
        check.setAttribute ('checked', 'true');
        check.setAttribute ('id', id);
        DomUtils.AddDomElement (label, 'span', null, text);
        check.addEventListener ('change', () => {
            onChange (check.checked);
        });
    }

    function GetSharingLink (params)
    {
        let builder = CreateUrlBuilder ();
        builder.AddModelUrls (params.files);
        let hashParameters = builder.GetParameterList ();
        return 'https://3dviewer.net#' + hashParameters;
    }

    function GetEmbeddingCode (params)
    {
        let builder = CreateUrlBuilder ();
        builder.AddModelUrls (params.files);
        builder.AddCamera (params.camera);
        builder.AddBackground (params.backgroundColor);
        builder.AddColor (params.defaultColor);
        let hashParameters = builder.GetParameterList ();

        let embeddingCode = '';
        embeddingCode += '<iframe';
        embeddingCode += ' width="640" height="480"';
        embeddingCode += ' style="border:1px solid #eeeeee;"';
        embeddingCode += ' src="https://3dviewer.net/embed.html#' + hashParameters + '">';
        embeddingCode += '</iframe>';
        return embeddingCode;
    }

    function AddCopyableTextInput (parentDiv, getText)
    {
        let copyText = 'Copy';
        let copiedText = 'Copied';
        let container = DomUtils.AddDiv (parentDiv, 'ov_dialog_copyable_input');
        let input = DomUtils.AddDomElement (container, 'input', 'ov_dialog_text');
        input.readOnly = true;
        let button = DomUtils.AddDiv (container, 'ov_button outline ov_dialog_copyable_input_button', copyText);
        button.addEventListener ('click', () => {
            Utils.CopyToClipboard (getText ());
            button.innerHTML = copiedText;
            setTimeout (() => {
                button.innerHTML = copyText;
            }, 2000);
        });
        return input;
    }

    function AddSharingLinkTab (parentDiv, sharingLinkParams)
    {
        let section = DomUtils.AddDiv (parentDiv, 'ov_dialog_section');
        DomUtils.AddDiv (section, 'ov_dialog_inner_title', 'Sharing Link');
        let sharingLinkInput = AddCopyableTextInput (section, () => {
            return GetSharingLink (sharingLinkParams);
        });
        sharingLinkInput.value = GetSharingLink (sharingLinkParams);
    }

    function AddEmbeddingCodeTab (parentDiv, settings, embeddingCodeParams)
    {
        let section = DomUtils.AddDiv (parentDiv, 'ov_dialog_section');
        section.style.marginTop = '20px';
        DomUtils.AddDiv (section, 'ov_dialog_inner_title', 'Embedding Code');
        let optionsSection = DomUtils.AddDiv (section, 'ov_dialog_section');
        let embeddingCodeInput = AddCopyableTextInput (section, () => {
            return GetEmbeddingCode (embeddingCodeParams);
        });
        AddCheckboxLine (optionsSection, 'Use current camera position', 'embed_camera', (checked) => {
            embeddingCodeParams.camera = checked ? camera : null;
            embeddingCodeInput.value = GetEmbeddingCode (embeddingCodeParams);
        });
        AddCheckboxLine (optionsSection, 'Use overridden background color', 'embed_background', (checked) => {
            embeddingCodeParams.backgroundColor = checked ? settings.backgroundColor : null;
            embeddingCodeInput.value = GetEmbeddingCode (embeddingCodeParams);
        });
        AddCheckboxLine (optionsSection, 'Use overridden default color', 'embed_color', (checked) => {
            embeddingCodeParams.defaultColor = checked ? settings.defaultColor : null;
            embeddingCodeInput.value = GetEmbeddingCode (embeddingCodeParams);
        });
        embeddingCodeInput.value = GetEmbeddingCode (embeddingCodeParams);
    }

    if (!importer.GetFileList ().IsOnlyUrlSource ()) {
        return ShowMessageDialog (
            'Sharing Failed',
            'Sharing works only if you load files by url. Please upload your model files to a web server, open them by url, and try embedding again.',
            null
        );
    }

    let files = importer.GetFileList ().GetFiles ();
    let modelFiles = [];
    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        let file = files[fileIndex];
        if (file.source === FileSource.Url) {
            modelFiles.push (file.fileUrl);
        }
    }

    let sharingLinkParams = {
        files : modelFiles
    };

    let embeddingCodeParams = {
        files : modelFiles,
        camera : camera,
        backgroundColor : settings.backgroundColor,
        defaultColor : settings.defaultColor
    };

    let dialog = new ButtonDialog ();
    let contentDiv = dialog.Init ('Share', [
        {
            name : 'Close',
            onClick () {
                dialog.Hide ();
            }
        }
    ]);

    AddSharingLinkTab (contentDiv, sharingLinkParams);
    AddEmbeddingCodeTab (contentDiv, settings, embeddingCodeParams);

    dialog.Show ();
    return dialog;
};
