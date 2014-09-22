Router = require 'lib/router'
SectionView = require 'views/section_view'

module.exports = class Application

  constructor: ->
    _.extend @, Backbone.Events

    @router = new Router
    @listenTo @router, 'route:defaultRoute', @_showSection

  _showSection: ->
    section = new SectionView
    $('body').append section.render().el
