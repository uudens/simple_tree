TreeNode = require './tree_node'

module.exports = class Tree extends Backbone.Model

  id: 1 # Needed for localStorage
  localStorage: new Backbone.LocalStorage 'tree'

  toJSON: ->
    @get('children').toJSON()

  parse: (data) ->
    children: @_getChildCollection data

  # Recursive
  _getChildCollection: (data) ->
    collection = new Backbone.Collection
    for child in data
      model = new TreeNode _.omit child, 'children'
      model.set children: @_getChildCollection child.children if child.children
      collection.add model
    collection
