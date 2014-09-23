Tree = require '../entities/tree'
TreeNodeView = require './tree_node_view'
EventHub = require '../lib/event_hub'
template = require './templates/section_view'

module.exports = class SectionView extends Marionette.ItemView

  tagName: 'section'
  template: template
  events:
    'click .reset': '_reset'
    'change input[name="isRecursive"]': '_onParseMethodChange'

  ui:
    treeContainer: '.tree-container'
    recursiveBox: 'input[name="isRecursive"]'

  _tree: null

  initialize: ->
    _.bindAll @
    @listenTo EventHub, 'node_updated node_added node_removed', @_saveTree
    @_loadTree()

  serializeData: ->
    isRecursive: @_tree.get 'isRecursive'

  render: ->
    super

    if @_tree
      @ui.treeContainer.empty()
      rootNode = new TreeNodeView
        model: @_tree
        eventHub: EventHub
      @ui.treeContainer.append rootNode.render().el

    @

  _reset: ->
    @_tree.loadDefault @render

  _loadTree: ->
    @_tree = new Tree
    @listenTo @_tree, 'sync', @render
    @_tree.fetch()

  _saveTree: ->
    @_tree.save() if @_tree

  _onParseMethodChange: ->
    @_tree.set isRecursive: @ui.recursiveBox.filter(':checked').val() is 'true'
    @_saveTree()
