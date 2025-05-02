import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSvgr } from "@rsbuild/plugin-svgr";
import { RsdoctorRspackPlugin } from "@rsdoctor/rspack-plugin";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

const { publicVars } = loadEnv({ prefixes: ["REACT_APP_"] });

export default defineConfig({
	plugins: [
		pluginReact(),
		pluginSvgr(),
	],
	source: {
		define: publicVars,
	},
	output: {
		distPath: {
			root: "build",
		},
	},
	tools: {
		rspack: {
			/* resolve symlinks so the proto generate code can be built. */
			resolve: {
				symlinks: false,
			},
			plugins: [
				new NodePolyfillPlugin({
					additionalAliases: ["process"],
				}),
				process.env.RSDOCTOR &&
					new RsdoctorRspackPlugin({
						supports: {
							generateTileGraph: true,
						},
					}),
			].filter(Boolean),
		},
	},
});
