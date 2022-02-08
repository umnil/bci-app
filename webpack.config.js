const webpack = require("@nativescript/webpack");

module.exports = (env) => {
	if (Object.keys(env).includes("hmr")) delete env.hmr;
	console.log(`ENV: ${JSON.stringify(env)}`);
	webpack.init(env);

	// Learn how to customize:
	// https://docs.nativescript.org/webpack
	webpack.chainWebpack(webpack.defaultConfigs.vue);
	webpack.chainWebpack(config => {
		config.module.rule('esm').test(/\.m?jsx?$/).resolve.set('fullySpecified', false)
	});

	return webpack.resolveConfig();
};


