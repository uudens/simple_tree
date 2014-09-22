Router = require 'lib/router'
SectionView = require 'views/section_view'
TreeNode = require 'models/tree_node'
module.exports = class Application

  constructor: ->
    _.extend @, Backbone.Events

    @router = new Router()
    @listenTo @router, 'route:defaultRoute', @_buildTree

  _buildTree: ->
    treeData = [
        id: 'c4ca423'
        label: 'Element #1'
      ,
        id: 'f75849b'
        label: 'Element #2'
        children: [
            id: 'ryg5rd'
            label: 'Child #1 of element #2'
        ]
      ,
        id: '20dcc50'
        label: 'Element #3'
        children: [
          id: '38a0b923'
          label: 'Child #1 of element #3'
          children: [
              id: 'dcc509'
              label: 'Subchild'
            ,
              id: 'a0b9238'
              label: 'Another subchild'
          ]
        ]
    ]

    recursiveTree = new TreeNode
      label: 'root'
      children: @_getChildCollection treeData

    section = new SectionView model: recursiveTree
    $('body').append section.render().el

    window.section = section

  # Recursive
  _getChildCollection: (data) ->
    collection = new Backbone.Collection
    for child in data
      model = new TreeNode _.omit child, 'children'
      model.set children: @_getChildCollection child.children if child.children
      collection.add model
    collection
