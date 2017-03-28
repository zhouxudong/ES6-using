var webpack = require("webpack");
var path = require("path");
var autoprefixer = require("autoprefixer")

module.exports = {
    entry: "index.js",
    output: {
        path: path.join(__dirname,"public"),
        output: "bundle.js"
    },
    module: {
        loaders:[
            { test: /\.css$/,loader:'style!css!postcss'},
            { test:/\.js$/,loader:'babel-loader?presets[]=react,presets[]=es2015',exclude:/node_modules/},
            { test: /\.less$/, loader: 'style!css!postcss!less?sourceMap'},
            { test: /\.(png|jpg|eot|svg|ttf|woff|woff2)$/, loader: 'url-loader?limit=8192'}
        ]
    },
    postcss: [autoprefixer({ browsers: ['last 2 versions'] }) ]
}