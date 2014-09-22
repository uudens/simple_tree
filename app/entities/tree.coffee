TreeNode = require './tree_node'
TreeNodes = require './tree_nodes'

module.exports = class Tree extends Backbone.Model

  id: 1 # Needed for localStorage
  localStorage: new Backbone.LocalStorage 'tree'

  _isRecursive: true

  toJSON: ->
    @get('children')?.toJSON()

  parse: (data) ->
    # This method is called with request response, but
    # for localStorage response is 'true' instead of model data, so don't parse
    return if typeof data isnt 'object'

    children: if @_isRecursive then @_getChildCollectionRecursively data else @_getChildCollectionIteratively data

  loadDefault: ->
    $.getJSON 'data/tree', (data) =>
      @set @parse data
      @save()

  setIsRecursive: (value) ->
    @_isRecursive = !!value

  # Recursive
  _getChildCollectionRecursively: (data) ->
    collection = new TreeNodes
    for childData in data
      model = new TreeNode _.omit childData, 'children'
      hasChildren = childData.children and childData.children.length
      model.set children: @_getChildCollectionRecursively childData.children if hasChildren
      collection.add model
    collection

  # Iterative
  _getChildCollectionIteratively: (data) ->
    collection = new TreeNodes

    parentCollections = [collection]
    indexes = [0]
    loop
      # Find current childData
      for index, i in indexes
        if !i # First iteration
          childData = children: data

        childData = childData.children && childData.children[index]

        if !childData

          # Go up 1 level
          indexes.pop()
          parentCollections.pop()

          # Break out of index loop
          break

      # Couldn't find current childData
      if !childData
        break if !indexes.length # We're done if no more levels to iterate

        # Increase index and continue
        indexes[indexes.length - 1]++
        continue

      # Create model and add to collection
      model = new TreeNode _.omit childData, 'children'
      _.last(parentCollections).add model

      # Go down 1 level if has children
      if childData.children and childData.children.length
        parentCollections.push new TreeNodes
        model.set children: _.last parentCollections

        indexes.push 0

        continue

      # Increase last index
      indexes[indexes.length - 1]++

    return collection
