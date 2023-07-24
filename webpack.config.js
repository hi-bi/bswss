// Generated using webpack-cli https://github.com/webpack/webpack-cli

//const path = require("path");
//const MiniCssExtractPlugin = require("mini-css-extract-plugin");

import * as path from 'path';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const isProduction = process.env.NODE_ENV == "production";

const stylesHandler = isProduction
  ? MiniCssExtractPlugin.loader
  : "style-loader";

const config = {
  target: 'node12.18',
  entry: "./server.js",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: 'server.js',
  },
//  resolve: {
//    modules: ['node_modules'],
//  },
  plugins: [
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  experiments: {
    outputModule: true,
  },
  module: {
    rules: [
      {
        test: /.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
	  options: {
	    presets: ['@babel/preset-env'],
	  },
        },
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, "css-loader"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
};


//module.exports = () => {
export default function () { 
  if (isProduction) {
    config.mode = "production";

    config.plugins.push(new MiniCssExtractPlugin());
  } else {
    config.mode = "development";
  }
  return config;
};
