TreeNode = require './tree_node'
TreeNodes = require './tree_nodes'

module.exports = class Tree extends Backbone.Model

  id: 1 # Needed for localStorage
  localStorage: new Backbone.LocalStorage 'tree'

  parse: (data) ->
    # This method is called with request response, but
    # for localStorage response is 'true' instead of model data, so don't parse
    return if typeof data isnt 'object'

    # Prefer not to reload isRecursive setting, use existing setting if possible
    data.isRecursive = if @get('isRecursive')? then @get('isRecursive') else data.isRecursive

    if data.isRecursive
      console.debug 'Parsing data using Recursive method'
      data.children = @getChildCollectionRecursively data.children
    else
      console.debug 'Parsing data using Iterative method'
      data.children = @getChildCollectionIteratively data.children

    data

  loadDefault: ->
    $.getJSON 'data/tree', (data) =>
      @set @parse data
      @save()

  # Recursive
  getChildCollectionRecursively: (data) ->
    collection = new TreeNodes
    for childData in data
      model = new TreeNode _.omit childData, 'children'
      hasChildren = childData.children and childData.children.length
      model.set children: @getChildCollectionRecursively childData.children if hasChildren
      collection.add model
    collection

  # Iterative
  getChildCollectionIteratively: (data) ->
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
