const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, '../src/js/index.js'),
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [
                            '@babel/plugin-transform-runtime',
                        ]
                    }
                }
            }
        ]
    }
};