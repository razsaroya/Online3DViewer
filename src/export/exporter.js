import ExporterObj from './exporterobj.js';
import ExporterStl from './exporterstl.js';
import ExporterPly from './exporterply.js';
import ExporterOff from './exporteroff.js';
import ExporterGltf from './exportergltf.js';
import Exporter3dm from './exporter3dm.js';

export class Exporter
{
    constructor ()
    {
        this.exporters = [
            new ExporterObj (),
            new ExporterStl (),
            new ExporterPly (),
            new ExporterOff (),
            new ExporterGltf (),
            new Exporter3dm ()
        ];
    }

    AddExporter (exporter)
    {
        this.exporters.push (exporter);
    }

    Export (model, format, extension, callbacks)
    {
        let exporter = null;
        for (let i = 0; i < this.exporters.length; i++) {
            let currentExporter = this.exporters[i];
            if (currentExporter.CanExport (format, extension)) {
                exporter = currentExporter;
                break;
            }
        }
        if (exporter === null) {
            callbacks.onError ();
            return;
        }

        exporter.Export (model, format, (files) => {
            if (files.length === 0) {
                callbacks.onError ();
            } else {
                callbacks.onSuccess (files);
            }
        });
    }
};
