const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const tailwindcss = require('@tailwindcss/postcss');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const fs = require('fs');

let package_dir = "";

// Helper to define build entries
function makeArrays(themes, resourceDir, targetDir) {
    let entries = {};
    let copies = [];
    for (let i = 0; i < themes.length; i++) {
        let current = themes[i];
        let theme = current.theme.source;
        let assets = current.assets;
        for (let k in assets) {
            let type = assets[k]["type"];
            let currentKeyNode = assets[k];
            switch (type) {
                case "js":
                case "css":
                    // Key: public/assets/fe/basic/js/app
                    // Value: ./resources/assets/fe/basic/js/app.js
                    entries[`${targetDir}/${theme}/${currentKeyNode.target}`] = `./${resourceDir}/${theme}/${currentKeyNode.source}`;
                    break;
                case "copy":
                    if (fs.existsSync(`${resourceDir}/${theme}/${currentKeyNode.source}`)) {
                        copies.push({
                            from: `${resourceDir}/${theme}/${currentKeyNode.source}`,
                            to: `${targetDir}/${theme}/${currentKeyNode.target}`,
                            noErrorOnMissing: true
                        });
                    }
                    break;
            }
        }
    }
    return { entries, copies };
}

let themesForFrontend = [
    {
        theme: { source: 'basic', type: 'theme' },
        assets: [
            { source: 'js/app.js', target: 'js/app', type: 'js' },
            { source: 'sass/app.scss', target: 'css/app', type: 'css' },
            { source: 'img', target: 'img', type: 'copy' },
            { source: 'fonts', target: 'fonts', type: 'copy' }
        ]
    },
    {
        theme: { source: 'modern', type: 'theme' },
        assets: [
            { source: 'js/app.js', target: 'js/app', type: 'js' },
            { source: 'css/app.css', target: 'css/app', type: 'css' },
            { source: 'img', target: 'img', type: 'copy' },
            { source: 'fonts', target: 'fonts', type: 'copy' }
        ]
    }
];

// FE only - focusing on Frontend Renderer
// Input: resources/assets/fe
// Output: public/assets/hashtagcms/fe
let toBeBuildF = makeArrays(themesForFrontend, `resources/assets${package_dir}/fe`, `public/assets/hashtagcms/fe`);

let buildEntries = toBeBuildF.entries;
let buildCopies = toBeBuildF.copies;

console.log("Building Frontend Assets...");
console.log(buildEntries);

module.exports = {
    stats: {
        all: false,
        errors: true,
        errorDetails: true,
        warnings: false
    },
    mode: process.env.NODE_ENV || 'development',
    entry: buildEntries,
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname),
        clean: false // Do not clean output path (root) 
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    { loader: "css-loader", options: { url: false, importLoaders: 1 } },
                    { loader: 'postcss-loader', options: { postcssOptions: { plugins: [tailwindcss, autoprefixer, cssnano], }, } },
                ],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    { loader: "css-loader", options: { url: false, importLoaders: 1 } },
                    { loader: 'postcss-loader', options: { postcssOptions: { plugins: [autoprefixer, cssnano], }, } },
                    { loader: 'sass-loader' }
                ],
            }
        ]
    },
    plugins: [
        new CaseSensitivePathsPlugin(),
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
        new CopyWebpackPlugin({
            patterns: buildCopies
        }),
        {
            apply: (compiler) => {
                compiler.hooks.done.tap('everythingIsDone', (compilation) => {
                    console.log("Assets Compilation Completed!")
                });
            }
        },
    ],
    resolve: {
        alias: {
            vue: path.resolve(__dirname, 'node_modules/vue/dist/vue.esm-bundler.js'),
        },
        extensions: ['.js', '.vue'],
        symlinks: false
    },
};
