const path = require('path');
const merge = require('webpack-merge');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const webpackConfigCommon = require('./webpack.config.common');

const fingerprint = +new Date();
const jsFilename = `bundle.${fingerprint}.js`;
const cssFilename = `bundle.${fingerprint}.css`;

console.log('[PHASE]', process.env.PHASE);

const webpackConfigProd = {
    mode: process.env.PHASE === 'alpha' ? 'development' : 'production',
    output: {
        filename: jsFilename,
        path: path.resolve(__dirname, '../dist/js/')
    },
    module: {
        rules: [{
            test: /\.css/,
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
            ]
        }]
    },
    plugins: [
        new CleanWebpackPlugin(['../dist'], {
            root: __dirname,
            allowExternal: true
        }),
        new HtmlWebpackPlugin({
            template: 'src/index.ejs',
            filename: '../index.html',
            inject: false,
            staticResources: {
                js: `js/${jsFilename}`,
                css: `css/${cssFilename}`
            }
        }),
        new CopyWebpackPlugin([
            {
                from: path.join(__dirname, '../src/img'),
                to: path.join(__dirname, '../dist/img')
            },
        ]),
        new MiniCssExtractPlugin({
            filename: `../css/${cssFilename}`,
        })
    ]
};

module.exports = merge(webpackConfigCommon, webpackConfigProd);