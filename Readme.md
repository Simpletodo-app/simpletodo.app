# Simpletodo.app

Built using

- [Electron-forge](https://www.electronforge.io/)
- [Vite](https://vitejs.dev/)
- [Tiptap](https://tiptap.dev/)
- [Legend State](https://legendapp.com/open-source/state/v3/) and
- [Radix UI](https://www.radix-ui.com/)

## Requires

- Nodejs 18
- ESLint vscode extension
- Prettier vscode extension

## Upcoming

Things to be done, not ordered by priority:

- [ ] Support signed Windows build (too expensive to get a signing certificate)
- [ ] Syncing todo across multiple devices
- [ ] AI to help go through opened todo list, indicating which task it can help with. E.g. creating a calendar invite or composing an email

## Contribution

To start local dev, run the below command:

```
yarn start
```

### Build the app

```
yarn make
```

### Publish the app

```
yarn run publish
```

Once published, you’ll need to approve the release in the repository for it to be made public.

### Add a new service

- Create the service class in [main/services](/src/main/services/)
- update [main/services/apply.ts](/src/main/services/apply.ts) and initialise the new services in the `servicesInstance`
- To expose the service to electron app we need to update the [preload.ts](./src/preload.ts) file with a list of services we want to expose to electron renderer
- Lastly, update the [global.d.ts](/global.d.ts) with the new services

### DB Migration

1. Create a new migration `.ts` file in [main/services/migrations](/src/main/services/migrations/) with the current date appended to the filename.
2. Export the SQL script to alter or modify the database state.
3. Update [index.ts](/src/main/services/migrations/index.ts) to export the new migration file.
4. Import the migration in the [`DBService.connect`](/src/main/services/DB.ts) method.

### Generate Icon

We use https://www.npmjs.com/package/electron-icon-builder for generating icons.

```sh
cd src/app/images

electron-icon-builder --input=logo.png --output=./appicons
```

Then,

- copy 512x512 png to `appicons/icon.png`
- copy icon.icns, icon.ico from mac and win respectively to `appicons/` directory

### Signing and Notarizing the app

Follow the instruction in this blog post to create a certificate
https://www.peterkoraca.com/blog/how-to-package-code-sign-notarize-and-share-an-electronjs-app-for-mac-os-in-2023

Ask Theo, to add you to the Apple dev team, so we can generate ur app login for the `.env`. If not, ask Theo to share his.

#### FAQ

- To verify if the .app was verified

```sh
> codesign --verify --deep --strict --verbose out/Simpletodo-darwin-arm64/Simpletodo.app
```

- To sign app manually

```sh
 > codesign --deep --force --verify --verbose --sign "Developer ID Application: Firstname Lastname (ID)" out/Simpletodo-darwin-arm64/Simpletodo.app
```

- To notarize app manually for debugging

```sh
>  xcrun notarytool store-credentials --apple-id "EMAIL" --team-id "TEAM-ID" --password PASSWORD
```

- Notarizing

```
 > xcrun notarytool submit out/make/zip/darwin/arm64/Simpletodo-darwin-arm64-1.0.0.zip --keychain-profile "simpletodo.app" --wait
```

- Error with node-gyp build failing with python

See: https://stackoverflow.com/a/77438783/5836034

in your .zshrc, add

```vim
alias python="/opt/homebrew/bin/python3.11"
export PYTHON="/opt/homebrew/bin/python3.11"
```
