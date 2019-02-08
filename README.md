# Bonfire - A web based chat client for twitch

Bonfire is a web based chat client for twitch chats. It is still under heavy development and **not recommended for general use yet**.

You can either use the website version under chats.c0ldplasma.de or download the deskop app based on electron under releases.

## Getting Started

These instructions will get you a copy of Bonfire up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing

First install [Node.js](https://nodejs.org/en/), then run the following commands in console:
```bash
git clone https://code.flamari.com/public-repos/bonfire
cd bonfire
npm install
```

You can use any IDE like Visual Studio Code or WebStorm for coding. The following commands can be used to continuously build the src/*.js files to the public/bundle.js file while coding. Recommended: `npm run dev`.

The `public/index.html` file contains a `<script src='bundle.js'>` tag, which means we need to create `public/bundle.js`. The `rollup.config.js` file tells Rollup how to create this bundle, starting with `src/main.js` and including all its dependencies, including [date-fns](https://date-fns.org).

`npm run build` builds the application to `public/bundle.js`, along with a sourcemap file for debugging.

`npm start` launches a server, using [serve](https://github.com/zeit/serve). Navigate to [localhost:5000](http://localhost:5000).

`npm run watch` will continually rebuild the application as your source files change.

`npm run dev` will run `npm start` and `npm run watch` in parallel.

## Deployment

### Website

Just copy the public folder content to your webroot and check if your php is configured correctly so that the php/recentMessages.php is working. It is used for loading the recent chat messages from the inofficial twitch api which is not directly accessible from client side because of cross domain policies.

### Desktop App

1. Download a copy of [Electron](https://github.com/electron/electron/releases) for your platform.
1. Extract it.
1. Put the desktop_app/app folder as a whole in the electron/resources folder.
1. In the electron/resources/app/index.html you can change the URL to your own instance of Bonfire at line 92.

## Built with

* [rollup.js](https://rollupjs.org/guide/en) - A module bundler for JavaScript.
* [Electron](https://electronjs.org/) - Build cross platform desktop apps with JavaScript, HTML, and CSS.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

* [Fire icon](https://www.iconfinder.com/icons/116853/fire_icon) by [SmartIcons](https://www.iconfinder.com/iconeden) licensed under the [Creative Commons (Attribution 2.5 Generic)](https://creativecommons.org/licenses/by/2.5/legalcode) is used as the Bonfire app logo with the following modifications made: - Changed the color to purple. 
* The [Readme Template](https://gist.github.com/PurpleBooth/109311bb0361f32d87a2) by [PurpleBooth](https://gist.github.com/PurpleBooth) is used as Template for this Readme.md.
