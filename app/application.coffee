Router = require 'lib/router'
SectionView = require 'views/section_view'
Tree = require 'models/tree'
module.exports = class Application

  constructor: ->
    _.extend @, Backbone.Events

    @router = new Router()
    @listenTo @router, 'route:defaultRoute', @_showSection

  _showSection: ->
    tree = new Tree
    tree.fetch
      success: ->
        section = new SectionView model: tree
        $('body').append section.render().el
