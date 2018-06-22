#
# http://brunch.io/docs/config.html
#

config =
  paths:
    watched: ['source']

  conventions:
    assets: /source\/static/

  files:
    stylesheets:
      joinTo:
        'assets/stylesheets/package.css': 'source/stylesheets/**/*.styl'
    javascripts:
      entryPoints:
        # 'entry.js':
        #   'output.js': [ 'module/included/if/matched/**/*.js' ]
        'source/javascripts/package.js': 'assets/javascripts/package.js'

  modules:
    nameCleaner: (path) ->
      path.replace('source/javascripts/', '')
    autoRequire:
      'assets/javascripts/package.js': ['package.js']

  plugins:
    digest:
      referenceFiles: /\.(html|js|css)$/
    jadeStatic:
      basedir: 'source/content'
      formatPath: (path) =>
        path.match(/^source\/content\/(.+)\.jade/)[1]
      pretty: true
      locals:
        NODE_ENV: process.env.NODE_ENV || 'development'
    stylus:
      includeCss: true
    eslint:
      pattern: /^source\/javascripts\/.*\.js/

module.exports = config
