Tree = require '../entities/tree'
TreeNodeView = require './tree_node_view'
EventHub = require '../lib/event_hub'
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
    @listenTo EventHub, 'node_updated', @_onNodeUpdated
    @_loadTree @render

  render: ->
    super

    if @_tree
      @ui.treeContainer.empty()
      node = new TreeNodeView
        model: @_tree
        eventHub: EventHub
      @ui.treeContainer.append node.render().el

    @

  _reset: ->
    @_loadDefaultTree @render

  _loadDefaultTree: (callback) ->
    $.getJSON 'data/tree', (data) =>
      @_tree = new Tree
      @_tree.set @_tree.parse data
      callback()

  _loadTree: (callback) ->
    @_tree = new Tree
    @_tree.fetch success: callback

  _onNodeUpdated: ->
    @_tree.save()
