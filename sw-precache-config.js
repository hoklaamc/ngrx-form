module.exports = {
	staticFileGlobs: [
		'dist/**.html',
		'dist/**.js',
		'dist/**.css'
	],
	root: 'dist',
	stripPrefix: 'dist/',
	navigateFallback: '/index.html',
	runtimeCaching: [{
		handler: 'networkFirst'
	}]
};