OV.ImporterThreeSvg = class extends OV.ImporterThreeBase
{
    constructor ()
    {
        super ();
    }

    CanImportExtension (extension)
    {
        return extension === 'svg';
    }

    GetUpDirection ()
    {
        return OV.Direction.Z;
    }

    GetExternalLibraries ()
    {
        return [
            'three_loaders/SVGLoader.js'
        ];
    }

    CreateLoader (manager)
    {
        return new THREE.SVGLoader (manager);
    }

    GetMainObject (loadedObject)
    {
        function ShowFill (path)
        {
            const style = path.userData.style;
            if (style.fill === undefined || style.fill === 'none') {
                return false;
            }
            return true;
        }

        function GetOrCreateMaterial (materials, style, opacity)
        {
            let material = null;
            for (let existingMaterial of materials) {
                if (existingMaterial.style === style && existingMaterial.opacity === opacity) {
                    material = existingMaterial.material;
                    break;
                }
            }
            if (material === null) {
                material = new THREE.MeshPhongMaterial ({
                    color: new THREE.Color ().setStyle (style),
                    opacity: opacity,
                    transparent: opacity < 1.0
                });
                materials.push ({
                    style : style,
                    opacity : opacity,
                    material : material
                });
            }
            return material;
        }

        let materials = [];

        let object = new THREE.Object3D ();
        object.rotation.x = Math.PI;

        for (let path of loadedObject.paths) {
            const shapes = THREE.SVGLoader.createShapes (path);
            if (ShowFill (path)) {
                let pathStyle = path.userData.style;
                let pathMaterial = GetOrCreateMaterial (materials, pathStyle.fill, pathStyle.opacity);
                for (const shape of shapes) {
                    const geometry = new THREE.ExtrudeGeometry (shape, {
                        depth: 10,
                        bevelEnabled: false
                    });
                    const mesh = new THREE.Mesh (geometry, pathMaterial);
                    mesh.name = path.userData.node.id;
                    object.add (mesh);
                }
            }
        }
        return object;
    }
};
