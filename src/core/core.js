export function IsDefined  (val)
{
    return val !== undefined && val !== null;
};

export function ValueOrDefault  (val, def)
{
    if (val === undefined || val === null) {
        return def;
    }
    return val;
};
