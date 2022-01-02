import {ButtonDialog} from "./modal.js";
import {ReadLines} from "../../../import/importerutils.js";
import DomUtils from "../../../viewer/domutils.js";

export function ShowOpenUrlDialog  (onOk)
{
    function CorrectFileHostUrls (urls)
    {
        for (let i = 0; i < urls.length; i++) {
            let url = urls[i];
            if (url.search (/www\.dropbox\.com/u) !== -1) {
                url = url.replace ('www.dropbox.com', 'dl.dropbox.com');
                let separatorPos = url.indexOf ('?');
                if (separatorPos !== -1) {
                    url = url.substr (0, separatorPos);
                }
                urls[i] = url;
            } else if (url.search (/github\.com/u) !== -1) {
                url = url.replace ('github.com', 'raw.githubusercontent.com');
                url = url.replace ('/blob', '');
                let separatorPos = url.indexOf ('?');
                if (separatorPos !== -1) {
                    url = url.substr (0, separatorPos);
                }
                urls[i] = url;
            }
        }
    }

    let dialog = new ButtonDialog ();
    let urlsTextArea = DomUtils.CreateDomElement ('textarea', 'ov_dialog_textarea');
    let contentDiv = dialog.Init ('Open Model from Url', [
        {
            name : 'Cancel',
            subClass : 'outline',
            onClick () {
                dialog.Hide ();
            }
        },
        {
            name : 'OK',
            onClick () {
                let urls = [];
                ReadLines (urlsTextArea.value, (line) => {
                    urls.push (line);
                });
                dialog.Hide ();
                CorrectFileHostUrls (urls);
                onOk (urls);
            }
        }
    ]);
    let text = 'Here you can load models based on their urls. You can add more lines if your model builds up from multiple files.';
    DomUtils.AddDiv (contentDiv, 'ov_dialog_section', text);
    contentDiv.appendChild (urlsTextArea);
    dialog.Show ();
    urlsTextArea.focus ();
    return dialog;
};
