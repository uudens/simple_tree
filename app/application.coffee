Router = require 'lib/router'
SectionView = require 'views/section_view'
Tree = require 'models/tree'
module.exports = class Application

  constructor: ->
    _.extend @, Backbone.Events

    @router = new Router()
    @listenTo @router, 'route:defaultRoute', @_showSection

  _loadDefaultTree: (callback) ->
    $.getJSON 'data/tree', (data) ->
      tree = new Tree
      window.tree = tree # dev
      tree.set tree.parse data
      callback()

  _loadTree: (callback) ->
    tree = new Tree
    tree.fetch success: ->
      window.tree = tree # dev
      callback()

  _showSection: ->
    @_loadDefaultTree ->
      section = new SectionView model: tree
      $('body').append section.render().el
