var webpack = require("webpack");
var path = require("path");
//var autoprefixer = require("autoprefixer")

module.exports = {
    entry: "./index.js",
    output: {
        path: path.join(__dirname,"public"),
        filename: "bundle.js"
    },
    module: {
        loaders:[
            { test: /\.css$/,loader:'style-loader!css-loader'},
            { test:/\.js$/,loader:'babel-loader',exclude:/node_modules/},
            { test: /\.less$/, loader: 'style!css!postcss!less?sourceMap'},
            //{ test: /\.(png|jpg|eot|svg|ttf|woff|woff2)$/, loader: 'url-loader?limit=8192'}
        ]
    },
    //postcss: [autoprefixer({ browsers: ['last 2 versions'] }) ]
}