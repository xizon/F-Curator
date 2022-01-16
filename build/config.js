'use strict';

const webpack = require('webpack');
const path = require('path');
const json = require('../package.json');
const moment = require('moment');
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const WebpackDevServer = require('webpack-dev-server');


/*! 
 *************************************
 *  Main configuration
 *************************************
 */
const devMode = process.env.NODE_ENV !== 'production';

const webpackConfig = {
	devtool: devMode ? 'source-map' : false,
    mode: devMode === 'development' ? 'development' : 'production',
	watch: true,
	context: __dirname, // to automatically find tsconfig.json
    resolve: {
		fallback: {
		    fs: false
		},
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss', '.sass'],
		alias: {
			// specific mappings.
			// Supports directories and custom aliases for specific files when the express server is running, 
			// you need to configure the following files at the same time:
			// 1) `babel.config.js`    --> "plugins": [["module-resolver", {"alias": {...}} ]]
			//  2) `tsconfig.json`      --> "compilerOptions": { "paths": {...} }
			//  3) `package.json`       --> "jest": { "moduleNameMapper": {...} }
			
			'@': path.resolve(__dirname, '../src')
		}
    },
	
	entry: {
		'app': path.resolve(__dirname, '../renderer/index.tsx'),
		'app.min': path.resolve(__dirname, '../renderer/index.tsx')
	},
	output: {
	  library: {
		name: 'RootLib',
		type: 'var'
	  },
	  filename: '[name].js',
	  path: path.resolve(__dirname, '../dist'),
	},
	/*
	entry: path.resolve(__dirname, '../src/index.ts'),
	output: {
	  filename: 'app.js',
	  path: path.resolve(__dirname, '../dist'),
	},
	*/
	optimization: {
		minimize: true,
	    minimizer: [

			new TerserPlugin({
				test: /\.min\.js$/i
			}),

			new MiniCssExtractPlugin({
				// Options similar to the same options in webpackOptions.output
				// both options are optional
				filename: '../dist/[name].css'
			}),
			new CssMinimizerPlugin({
				test:/\.min\.css$/i,
				parallel: true,
				minimizerOptions: {
					preset: [
						"default",
						{
							discardComments: { removeAll: true },
						},
					],
				},
			}),


		],
		
	},
    module: {
        rules: [
            {
				test: /\.(js|jsx|ts|tsx)$/,
                loader: 'babel-loader',
                exclude: path.resolve(__dirname, '../node_modules' ),
                options: {  
				  'presets': [
					  '@babel/preset-env',
					  '@babel/preset-react',
					  '@babel/preset-typescript',
					  {
						plugins: [
						  '@babel/plugin-proposal-class-properties'
						]
					  }	
				  ]
                }
			},

			{
				test: /\.(sa|sc|c)ss$/,
				include: [
					path.resolve(__dirname, '../src'),
					// Prevent errors in calling the node library: Module parse failed: Unexpected character'@'
					path.resolve(__dirname, '../node_modules'),
				],
				use: [
					/**
					 * Note:
					 * You can use `style-loader` to inject CSS into the DOM to generate a final js file
					 */
					{
						loader: MiniCssExtractPlugin.loader, //Extracts CSS into separate files  ( Step 3 )
						options: {
							// you can specify a publicPath here
							// by default it use publicPath in webpackOptions.output
							publicPath: '../dist/'
	
						}
					},
	
					{
						loader: "css-loader",  // interprets @import and url() and will resolve them. ( Step 2 )
						options: {
							sourceMap: true
						}
					},
					{
						loader: 'sass-loader', // compiles Sass to CSS ( Step 1 )
						options: {
							sourceMap: true,
							sassOptions: {
								/* (nested | expanded | compact | compressed) */
								outputStyle: 'expanded'
							},

						}
	
					},
				]
			},


			{
				test: /\.(glsl|vs|fs|vert|frag)$/,
				exclude: path.resolve(__dirname, '../node_modules' ),
				use: [
					'raw-loader',
					'glslify-loader'
				]
			},
			{
				test: /\.json$/,
				use: 'json-loader'
			},
			


        ],
		
    },
	plugins: []
	
	
};

// Add souce maps
webpackConfig.plugins.push(
	new webpack.SourceMapDevToolPlugin({
	  filename: '../dist/[file].map',
	})
);

// Adds a banner to the top of each generated chunk.
webpackConfig.plugins.push(
    new webpack.BannerPlugin(`
	Boot Helpers

	@source: https://github.com/xizon/f-curator
	@version: ${json.version} (${moment().format( "MMMM D, YYYY" )})
	@author: UIUX Lab <uiuxlab@gmail.com>
	@license: MIT
	`)
);



/*! 
 *************************************
 *  Listen the server
 *************************************
 */
 const compiler = webpack(webpackConfig);
 const server = new WebpackDevServer(compiler, {
	 // After setting the static parameter, the file path in `public/index.html` can be written as: `../dist/app.min.css`
	 static: path.resolve(__dirname, '../' ),
	 hot: true,
	 // Disables a full-screen overlay in the browser when there are compiler errors or warnings.
	 client: {
		 overlay: {
			 warnings: false,
			 errors: true
		 }
	 }
});

server.listen(8080, "localhost", function (err, result) {
	if (err) {
		return console.log(err);
	}

	console.log( 'Listening at http://localhost:8080/');
})


									
/*! 
 *************************************
 *  Exporting webpack module
 *************************************
 */
module.exports = webpackConfig;


