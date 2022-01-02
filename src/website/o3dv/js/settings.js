import {Color} from '../../../model/material';

export let Theme = {
    Light : 1,
    Dark : 2
};

export class Settings
{
    constructor ()
    {
        this.backgroundColor = new Color (255, 255, 255);
        this.defaultColor = new Color (200, 200, 200);
        this.themeId = Theme.Light;
    }

    LoadFromCookies (cookieHandler)
    {
        this.backgroundColor = cookieHandler.GetColorVal ('ov_background_color', new Color (255, 255, 255));
        this.defaultColor = cookieHandler.GetColorVal ('ov_default_color', new Color (200, 200, 200));
        this.themeId = cookieHandler.GetIntVal ('ov_theme_id', Theme.Light);
    }

    SaveToCookies (cookieHandler)
    {
        cookieHandler.SetColorVal ('ov_background_color', this.backgroundColor);
        cookieHandler.SetColorVal ('ov_default_color', this.defaultColor);
        cookieHandler.SetStringVal ('ov_theme_id', this.themeId);
    }
};
