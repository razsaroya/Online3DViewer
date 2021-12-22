var assert = require ('assert');
const {Model} = require("../../source/model/model");
const {PropertyType} = require("../../source/model/property");
const {Property} = require("../../source/model/property");
const {PropertyGroup} = require("../../source/model/property");

describe ('Property Test', function () {
    it ('Property Group', function() {
        let group = new PropertyGroup ('Group');
        group.AddProperty (new Property (PropertyType.Text, 'name 01', 'value 01'));
        group.AddProperty (new Property (PropertyType.Integer, 'name 02', 2));
        group.AddProperty (new Property (PropertyType.Number, 'name 03', 3.5));
        assert.strictEqual (group.PropertyCount (), 3);
        assert.strictEqual (group.GetProperty (0).name, 'name 01');
        assert.strictEqual (group.GetProperty (0).value, 'value 01');
        assert.strictEqual (group.GetProperty (1).name, 'name 02');
        assert.strictEqual (group.GetProperty (1).value, 2);
        assert.strictEqual (group.GetProperty (2).name, 'name 03');
        assert.strictEqual (group.GetProperty (2).value, 3.5);
    });

    it ('Model Properties', function() {
        let model = new Model ();
        let group1 = new PropertyGroup ('Group 01');
        let group2 = new PropertyGroup ('Group 02');
        let group3 = new PropertyGroup ('Group 03');
        group1.AddProperty (new Property (PropertyType.Text, 'name 01', 'value 01'));
        group2.AddProperty (new Property (PropertyType.Integer, 'name 02', 2));
        group3.AddProperty (new Property (PropertyType.Number, 'name 03', 3.5));
        model.AddPropertyGroup (group1);
        model.AddPropertyGroup (group2);
        model.AddPropertyGroup (group3);
        assert.strictEqual (model.PropertyGroupCount (), 3);
        assert.strictEqual (model.GetPropertyGroup (0).name, 'Group 01');
        assert.strictEqual (model.GetPropertyGroup (1).name, 'Group 02');
        assert.strictEqual (model.GetPropertyGroup (2).name, 'Group 03');
        assert.strictEqual (model.GetPropertyGroup (0).GetProperty (0).name, 'name 01');
        assert.strictEqual (model.GetPropertyGroup (0).GetProperty (0).value, 'value 01');
        assert.strictEqual (model.GetPropertyGroup (1).GetProperty (0).name, 'name 02');
        assert.strictEqual (model.GetPropertyGroup (1).GetProperty (0).value, 2);
        assert.strictEqual (model.GetPropertyGroup (2).GetProperty (0).name, 'name 03');
        assert.strictEqual (model.GetPropertyGroup (2).GetProperty (0).value, 3.5);
    });
});
