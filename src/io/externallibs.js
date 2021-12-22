export let ExternalLibLocation = null;

export let LoadedExternalLibs = {};

export function LoadExternalLibrary(libName)
{
    return new Promise ((resolve, reject) => {
        if (ExternalLibLocation === null) {
            reject ();
            return;
        }
    
        if (LoadedExternalLibs[libName] !== undefined) {
            resolve ();
            return;
        }
    
        let scriptElement = document.createElement ('script');
        scriptElement.type = 'text/javascript';
        scriptElement.src = ExternalLibLocation + '/' + libName;
        scriptElement.onload = () => {
            LoadedExternalLibs[libName] = true;
            resolve ();
        };
        scriptElement.onerror = () => {
            reject ();
        };
        document.head.appendChild (scriptElement);
    });
};
