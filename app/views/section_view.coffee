Tree = require 'models/tree'
TreeNodeView = require './tree_node_view'
template = require './templates/section_view'

module.exports = class SectionView extends Marionette.ItemView

  tagName: 'section'
  template: template
  events:
    'click .reset': '_reset'

  ui:
    treeContainer: '.tree-container'

  _tree: null

  initialize: ->
    _.bindAll @
    @_loadTree @render

  render: ->
    console.log 'rendering'
    super

    if @_tree
      @ui.treeContainer.empty()
      node = new TreeNodeView model: @_tree
      @ui.treeContainer.append node.render().el

    @

  _reset: ->
    @_loadDefaultTree @render

  _loadDefaultTree: (callback) ->
    $.getJSON 'data/tree', (data) =>
      @_tree = new Tree
      @_tree.set @_tree.parse data
      window.tree = @_tree # dev
      callback()

  _loadTree: (callback) ->
    @_tree = new Tree
    @_tree.fetch success: =>
      window.tree = @_tree # dev
      callback()
