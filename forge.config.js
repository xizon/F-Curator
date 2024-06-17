const APP_NAME = 'F-Curator';

module.exports = {

    // Windows and macOS (icon)
    packagerConfig: {
        icon: './public/assets/images/icon.icns'
    },

    makers: [
        {
            name: '@electron-forge/maker-dmg',
            config: {
                name: APP_NAME,
                overwrite: true,
                format: 'ULFO'
            }
        },
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                name: APP_NAME
            }
        },

        // inux
        {
            name: '@electron-forge/maker-deb',
            config: {
                options: {
                    name: APP_NAME,
                    icon: './public/assets/images/icon.icns'
                }
            }
        }
    ]
}