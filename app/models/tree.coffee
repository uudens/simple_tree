TreeNode = require './tree_node'

module.exports = class Tree extends Backbone.Model

  url: 'data/tree'

  parse: (data) ->
    label: 'root'
    children: @_getChildCollection data

  # Recursive
  _getChildCollection: (data) ->
    collection = new Backbone.Collection
    for child in data
      model = new TreeNode _.omit child, 'children'
      model.set children: @_getChildCollection child.children if child.children
      collection.add model
    collection
