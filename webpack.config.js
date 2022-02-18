const webpack = require("@nativescript/webpack");

module.exports = (env) => {
	if (Object.keys(env).includes("hmr")) delete env.hmr;
	console.log(`ENV: ${JSON.stringify(env)}`);
	webpack.init(env);

	// Learn how to customize:
	// https://docs.nativescript.org/webpack

	// Vue Configuraiton
	webpack.chainWebpack(webpack.defaultConfigs.vue);

	// Allow non-fully specified paths
	// eg. import 'file/compoenet' is ok. No need for import 'file/component.ts'
	webpack.chainWebpack(config => {
		config.module.rule('esm').test(/\.m?jsx?$/).resolve.set('fullySpecified', false)
	});

	// GIF animations
	webpack.Utils.addCopyRule('**/*.gif') 

	return webpack.resolveConfig();
};


