application = require 'application'

module.exports = class Router extends Backbone.Router

  routes:
    '*path': 'defaultRoute'
