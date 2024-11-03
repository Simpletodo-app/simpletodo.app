import type { ForgeConfig } from '@electron-forge/shared-types'
import { MakerZIP } from '@electron-forge/maker-zip'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerDeb } from '@electron-forge/maker-deb'
import { MakerRpm } from '@electron-forge/maker-rpm'
import { MakerDMG } from '@electron-forge/maker-dmg'
import { VitePlugin } from '@electron-forge/plugin-vite'

import dotenv from 'dotenv'

dotenv.config()

const config: ForgeConfig = {
  packagerConfig: {
    icon: 'src/app/images/appicons/icon',
    ignore: [/data\/simpletodoapp\.db/, /\.env.*/, /.vscode/, /.github/],
    osxSign: {
      identity: 'Developer ID Application: Omosumwen Omoregbee (TPS5CSQ7M8)',
      optionsForFile: () => {
        return {
          entitlements: './entitlements.plist',
        }
      },
    },
    osxNotarize: {
      tool: 'notarytool',
      appleId: process.env.APPLE_ID as string,
      appleIdPassword: process.env.APPLE_PASSWORD as string,
      teamId: process.env.APPLE_TEAM_ID as string,
    },
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      setupIcon: 'src/app/images/appicons/icon.ico',
    }),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({
      options: {
        icon: 'src/app/images/appicons/icon.png',
        homepage: 'https://simpletodo.app',
      },
    }),
    new MakerDeb({
      options: {
        icon: 'src/app/images/appicons/icon.png',
        maintainer: 'Theophilus Omoregbee',
        homepage: 'http://theoomoregbee.me/',
      },
    }),
    new MakerDMG({
      icon: 'src/app/images/appicons/icon.icns',
    }),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'simpletodo-app',
          name: 'simpletodo.app',
        },
        prerelease: false,
        draft: true,
        authToken: process.env.GITHUB_TOKEN as string,
      },
    },
  ],
}

export default config
