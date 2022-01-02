import {Panel} from "./panelset.js";
import DomUtils from "../../../viewer/domutils.js";
import {GetBoundingBox, HasDefaultMaterial} from "../../../model/modelutils.js";
import {Property, PropertyType} from "../../../model/property.js";
import {CalculateSurfaceArea, CalculateVolume} from "../../../model/quantities.js";
import {GetFileName} from "../../../io/fileutils.js";
import {ColorToHexString, MaterialType, Color} from "../../../model/material.js";
import {SubCoord3D} from "../../../geometry/coord3d.js";
import {Theme} from "./settings.js";
import Utils from "./utils.js";
import {RunTaskAsync} from "../../../core/taskrunner.js";

export class SidebarPanel extends Panel
{
    constructor (parentDiv)
    {
        super (parentDiv);
        this.callbacks = null;

        this.titleDiv = DomUtils.AddDiv (this.panelDiv, 'ov_sidebar_title');
        this.contentDiv = DomUtils.AddDiv (this.panelDiv, 'ov_sidebar_content ov_thin_scrollbar');

        let panelName = this.GetName ();
        DomUtils.AddDiv (this.titleDiv, 'ov_sidebar_title_text', this.GetName ());
        this.titleDiv.setAttribute ('title', panelName);
    }

    GetName ()
    {
        return null;
    }

    Clear ()
    {
        DomUtils.ClearDomElement (this.contentDiv);
    }

    Init (callbacks)
    {
        this.callbacks = callbacks;
    }
};

export class DetailsSidebarPanel extends SidebarPanel
{
    constructor (parentDiv)
    {
        super (parentDiv);
    }

    GetName ()
    {
        return 'Details';
    }

    GetIcon ()
    {
        return 'details';
    }

    AddObject3DProperties (object3D)
    {
        this.Clear ();
        let table = DomUtils.AddDiv (this.contentDiv, 'ov_property_table');
        let boundingBox = GetBoundingBox (object3D);
        let size = SubCoord3D (boundingBox.max, boundingBox.min);
        this.AddProperty (table, new Property (PropertyType.Integer, 'Vertices', object3D.VertexCount ()));
        this.AddProperty (table, new Property (PropertyType.Integer, 'Triangles', object3D.TriangleCount ()));
        this.AddProperty (table, new Property (PropertyType.Number, 'Size X', size.x));
        this.AddProperty (table, new Property (PropertyType.Number, 'Size Y', size.y));
        this.AddProperty (table, new Property (PropertyType.Number, 'Size Z', size.z));
        this.AddCalculatedProperty (table, 'Volume', () => {
            const volume = CalculateVolume (object3D);
            if (volume === null) {
                return null;
            }
            return new Property (PropertyType.Number, null, volume);
        });
        this.AddCalculatedProperty (table, 'Surface', () => {
            const volume = CalculateSurfaceArea (object3D);
            if (volume === null) {
                return null;
            }
            return new Property (PropertyType.Number, null, volume);
        });
        if (object3D.PropertyGroupCount () > 0) {
            let customTable = DomUtils.AddDiv (this.contentDiv, 'ov_property_table ov_property_table_custom');
            for (let i = 0; i < object3D.PropertyGroupCount (); i++) {
                const propertyGroup = object3D.GetPropertyGroup (i);
                this.AddPropertyGroup (customTable, propertyGroup);
                for (let j = 0; j < propertyGroup.PropertyCount (); j++) {
                    const property = propertyGroup.GetProperty (j);
                    this.AddPropertyInGroup (customTable, property);
                }
            }
        }
        this.Resize ();
    }

    AddMaterialProperties (material)
    {
        function AddTextureMap (obj, table, name, map)
        {
            if (map === null || map.name === null) {
                return;
            }
            let fileName = GetFileName (map.name);
            obj.AddProperty (table, new Property (PropertyType.Text, name, fileName));
        }

        this.Clear ();
        let table = DomUtils.AddDiv (this.contentDiv, 'ov_property_table');
        let typeString = null;
        if (material.type === MaterialType.Phong) {
            typeString = 'Phong';
        } else if (material.type === MaterialType.Physical) {
            typeString = 'Physical';
        }
        this.AddProperty (table, new Property (PropertyType.Text, 'Source', material.isDefault ? 'Default' : 'Model'));
        this.AddProperty (table, new Property (PropertyType.Text, 'Type', typeString));
        this.AddProperty (table, new Property (PropertyType.Color, 'Color', material.color));
        if (material.type === MaterialType.Phong) {
            this.AddProperty (table, new Property (PropertyType.Color, 'Ambient', material.ambient));
            this.AddProperty (table, new Property (PropertyType.Color, 'Specular', material.specular));
        } else if (material.type === MaterialType.Physical) {
            this.AddProperty (table, new Property (PropertyType.Percent, 'Metalness', material.metalness));
            this.AddProperty (table, new Property (PropertyType.Percent, 'Roughness', material.roughness));
        }
        this.AddProperty (table, new Property (PropertyType.Percent, 'Opacity', material.opacity));
        AddTextureMap (this, table, 'Diffuse Map', material.diffuseMap);
        AddTextureMap (this, table, 'Specular Map', material.specularMap);
        AddTextureMap (this, table, 'Bump Map', material.bumpMap);
        AddTextureMap (this, table, 'Normal Map', material.normalMap);
        AddTextureMap (this, table, 'Emissive Map', material.emissiveMap);
        AddTextureMap (this, table, 'Metallic Map', material.metalnessMap);
        this.Resize ();
    }

    AddPropertyGroup (table, propertyGroup)
    {
        let row = DomUtils.AddDiv (table, 'ov_property_table_row group', propertyGroup.name);
        row.setAttribute ('title', propertyGroup.name);
    }

    AddProperty (table, property)
    {
        let row = DomUtils.AddDiv (table, 'ov_property_table_row');
        let nameColumn = DomUtils.AddDiv (row, 'ov_property_table_cell ov_property_table_name', property.name + ':');
        let valueColumn = DomUtils.AddDiv (row, 'ov_property_table_cell ov_property_table_value');
        nameColumn.setAttribute ('title', property.name);
        this.DisplayPropertyValue (property, valueColumn);
        return row;
    }

    AddPropertyInGroup (table, property)
    {
        let row = this.AddProperty (table, property);
        row.classList.add ('ingroup');
    }

    AddCalculatedProperty (table, name, calculateValue)
    {
        let row = DomUtils.AddDiv (table, 'ov_property_table_row');
        let nameColumn = DomUtils.AddDiv (row, 'ov_property_table_cell ov_property_table_name', name + ':');
        let valueColumn = DomUtils.AddDiv (row, 'ov_property_table_cell ov_property_table_value');
        nameColumn.setAttribute ('title', name);

        let calculateButton = DomUtils.AddDiv (valueColumn, 'ov_property_table_button', 'Calculate...');
        calculateButton.addEventListener ('click', () => {
            DomUtils.ClearDomElement (valueColumn);
            valueColumn.innerHTML = 'Please wait...';
            RunTaskAsync (() => {
                let propertyValue = calculateValue ();
                if (propertyValue === null) {
                    valueColumn.innerHTML = '-';
                } else {
                    this.DisplayPropertyValue (propertyValue, valueColumn);
                }
            });
        });
    }

    DisplayPropertyValue (property, targetDiv)
    {
        DomUtils.ClearDomElement (targetDiv);
        let valueText = null;
        if (property.type === PropertyType.Text) {
            valueText = property.value;
        } else if (property.type === PropertyType.Integer) {
            valueText = property.value.toLocaleString ();
        } else if (property.type === PropertyType.Number) {
            valueText = property.value.toLocaleString (undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        } else if (property.type === PropertyType.Boolean) {
            valueText = property.value ? 'True' : 'False';
        } else if (property.type === PropertyType.Percent) {
            valueText = parseInt (property.value * 100, 10).toString () + '%';
        } else if (property.type === PropertyType.Color) {
            let hexString = '#' + ColorToHexString (property.value);
            let colorCircle = CreateInlineColorCircle (property.value);
            targetDiv.appendChild (colorCircle);
            DomUtils.AddDomElement (targetDiv, 'span', null, hexString);
        }
        if (valueText !== null) {
            targetDiv.innerHTML = valueText;
            targetDiv.setAttribute ('title', valueText);
        }
    }
};

export class SettingsSidebarPanel extends SidebarPanel
{
    constructor (parentDiv)
    {
        super (parentDiv);
        this.backgroundColorInput = null;
        this.defaultColorInput = null;
        this.defaultColorWarning = null;
        this.themeInput = null;
    }

    GetName ()
    {
        return 'Settings';
    }

    GetIcon ()
    {
        return 'settings';
    }

    Clear ()
    {
        this.backgroundColorInput.pickr.hide ();
        this.defaultColorInput.pickr.hide ();
    }

    InitSettings (settings, defaultSettings, callbacks)
    {
        this.Init (callbacks);
        this.backgroundColorInput = this.AddColorParameter (
            'Background Color',
            'Affects only the visualization.',
            null,
            ['#ffffff', '#e3e3e3', '#c9c9c9', '#898989', '#5f5f5f', '#494949', '#383838', '#0f0f0f'],
            settings.backgroundColor,
            this.callbacks.onBackgroundColorChange
        );
        this.defaultColorInput = this.AddColorParameter (
            'Default Color',
            'Appears when the model doesn\'t have materials.',
            'Has no effect on the currently loaded file.',
            ['#ffffff', '#e3e3e3', '#cc3333', '#fac832', '#4caf50', '#3393bd', '#9b27b0', '#fda4b8'],
            settings.defaultColor,
            this.callbacks.onDefaultColorChange
        );
        this.themeInput = this.AddThemeParameter (settings.themeId);
        this.AddResetToDefaultsButton (defaultSettings);
    }

    Update (model)
    {
        let hasDefaultMaterial = HasDefaultMaterial (model);
        if (!hasDefaultMaterial) {
            DomUtils.ShowDomElement (this.defaultColorInput.warning);
        } else {
            DomUtils.HideDomElement (this.defaultColorInput.warning);
        }
        this.Resize ();
    }

    AddColorParameter (title, description, warningText, predefinedColors, defaultValue, onChange)
    {
        let contentDiv = DomUtils.AddDiv (this.contentDiv, 'ov_sidebar_settings_content');
        let titleDiv = DomUtils.AddDiv (contentDiv, 'ov_sidebar_subtitle');
        let colorInput = DomUtils.AddDiv (titleDiv, 'color-picker');
        DomUtils.AddDomElement (titleDiv, 'span', null, title);
        const pickr = Pickr.create ({
            el : colorInput,
            theme : 'monolith',
            position : 'left-start',
            swatches : predefinedColors,
            comparison : false,
            default : '#' + ColorToHexString (defaultValue),
            components : {
                preview : false,
                opacity : false,
                hue : true,
                interaction: {
                    hex : false,
                    rgba : false,
                    hsla : false,
                    hsva : false,
                    cmyk : false,
                    input : true,
                    clear : false,
                    save : false
                }
            }
        });
        pickr.on ('change', (color, source, instance) => {
            let rgbaColor = color.toRGBA ();
            let ovColor = new Color (
                parseInt (rgbaColor[0], 10),
                parseInt (rgbaColor[1], 10),
                parseInt (rgbaColor[2], 10)
            );
            onChange (ovColor);
        });
        DomUtils.AddDiv (contentDiv, 'ov_sidebar_settings_padded', description);
        let warningDiv = null;
        if (warningText !== null) {
            warningDiv = DomUtils.AddDiv (contentDiv, 'ov_sidebar_settings_padded');
            let icon = Utils.AddSvgIconElement (warningDiv, 'warning', 'left_inline');
            icon.classList.add ('light');
            DomUtils.AddDiv (warningDiv, 'ov_sidebar_settings_warning', warningText);
        }
        return {
            pickr : pickr,
            warning : warningDiv
        };
    }

    AddThemeParameter (defaultValue)
    {
        function AddRadioButton (contentDiv, themeId, themeName, onChange)
        {
            let row = DomUtils.AddDiv (contentDiv, 'ov_sidebar_settings_row');
            let label = DomUtils.AddDomElement (row, 'label');
            label.setAttribute ('for', themeId.toString ());
            let radio = DomUtils.AddDomElement (label, 'input', 'ov_radio_button');
            radio.setAttribute ('type', 'radio');
            radio.setAttribute ('id', themeId.toString ());
            radio.setAttribute ('name', 'theme');
            DomUtils.AddDomElement (label, 'span', null, themeName);
            radio.addEventListener ('change', () => {
                onChange (themeId);
            });
            return radio;
        }

        function Select (radioButtons, defaultValue)
        {
            for (let i = 0; i < radioButtons.length; i++) {
                let radioButton = radioButtons[i];
                radioButton.checked = radioButton.getAttribute ('id') === defaultValue.toString ();
            }
        }

        let contentDiv = DomUtils.AddDiv (this.contentDiv, 'ov_sidebar_settings_content');
        let titleDiv = DomUtils.AddDiv (contentDiv, 'ov_sidebar_subtitle');
        Utils.AddSvgIconElement (titleDiv, 'theme', 'ov_sidebar_subtitle_icon');
        DomUtils.AddDiv (titleDiv, null, 'Appearance');

        let buttonsDiv = DomUtils.AddDiv (contentDiv, 'ov_sidebar_settings_padded');
        let result = {
            buttons : [],
            select: (value) => {
                Select (result.buttons, value);
            }
        };
        result.buttons.push (AddRadioButton (buttonsDiv, Theme.Light, 'Light', this.callbacks.onThemeChange));
        result.buttons.push (AddRadioButton (buttonsDiv, Theme.Dark, 'Dark', this.callbacks.onThemeChange));
        Select (result.buttons, defaultValue);
        return result;

    }

    AddResetToDefaultsButton (defaultSettings)
    {
        let resetToDefaultsButton = DomUtils.AddDiv (this.contentDiv, 'ov_button outline ov_sidebar_button', 'Reset to Default');
        resetToDefaultsButton.addEventListener ('click', () => {
            this.backgroundColorInput.pickr.setColor ('#' + ColorToHexString (defaultSettings.backgroundColor));
            this.callbacks.onBackgroundColorChange (defaultSettings.backgroundColor);
            this.defaultColorInput.pickr.setColor ('#' + ColorToHexString (defaultSettings.defaultColor));
            this.callbacks.onDefaultColorChange (defaultSettings.defaultColor);
            if (this.themeInput !== null) {
                this.themeInput.select (defaultSettings.themeId);
                this.callbacks.onThemeChange (defaultSettings.themeId);
            }
        });
    }
};
