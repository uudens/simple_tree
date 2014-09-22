TreeNodes = require './tree_nodes'

module.exports = class TreeNode extends Backbone.Model

  initialize: ->
    # Make sure we have unique id
    @set id: @_getUniqueId() unless @id

    # Make sure we always have 'children' attribute
    @set children: new TreeNodes unless @get 'children'

  # Taken from http://stackoverflow.com/a/8084248/1860900
  _getUniqueId: ->
    'n' + (Math.random() + 1).toString(36).substring(7)
