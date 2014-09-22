template = require './templates/tree_node_view'
TreeNode = require '../models/tree_node'

module.exports = class TreeNodeView extends Marionette.CompositeView

  template: template
  tagName: 'li'
  childViewContainer: '.children'
  events:
    'click .delete': '_onDeleteClick'
    'click .add': '_onAddClick'

  initialize: ->
    @collection = @model.get 'children'

  _onDeleteClick: (e) ->
    # Stop event from bubbling up and parent handlers from firing
    e.stopPropagation()

    @model.collection.remove @model

  _onAddClick: (e) ->
    # Stop event from bubbling up and parent handlers from firing
    e.stopPropagation()

    @collection.add new TreeNode
      label: 'New child'
