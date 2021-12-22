import {ExporterBase, ExportedFile} from './exporterbase.js';
import {TextWriter} from '../io/textwriter.js';
import {EnumerateModelVerticesAndTriangles} from "../model/modelutils.js";
import {FileFormat} from "../io/fileutils.js";

export default class ExporterOff extends ExporterBase
{
	constructor ()
	{
		super ();
	}

    CanExport (format, extension)
    {
        return format === FileFormat.Text && extension === 'off';
    }

	ExportContent (model, format, files, onFinish)
	{
		let offFile = new ExportedFile ('model.off');
		files.push (offFile);

		let offWriter = new TextWriter ();
		offWriter.WriteLine ('OFF');
		offWriter.WriteArrayLine ([model.VertexCount (), model.TriangleCount (), 0]);

		EnumerateModelVerticesAndTriangles (model, {
			onVertex : function (x, y, z) {
				offWriter.WriteArrayLine ([x, y, z]);
			},
			onTriangle : function (v0, v1, v2) {
				offWriter.WriteArrayLine ([3, v0, v1, v2]);
			}
		});

		offFile.SetTextContent (offWriter.GetText ());
		onFinish ();
	}
};
