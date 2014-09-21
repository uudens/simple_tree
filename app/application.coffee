Router = require 'lib/router'

module.exports = class Application

  constructor: ->
    _.extend @, Backbone.Events

    @router = new Router()
    @listenTo @router, 'route:defaultRoute', @_buildTree

  _buildTree: ->
    console.log 'build tree'
