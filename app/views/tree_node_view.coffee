template = require './templates/tree_node_view'
TreeNode = require '../entities/tree_node'

module.exports = class TreeNodeView extends Marionette.CompositeView

  template: template
  tagName: 'li'
  childViewContainer: '.children'
  events:
    'click .delete': '_onDeleteClick'
    'click .add': '_onAddClick'
    'dblclick .label': '_onLabelDoubleClick'
    'keydown': '_onKeyDown'

  ui:
    label: '.label'

  _eventHub: null
  _isEditing: false

  initialize: ({ eventHub: @_eventHub }) ->
    @collection = @model.get 'children'

  childViewOptions: ->
    eventHub: @_eventHub

  _edit: ->
    @_isEditing = true
    @ui.label
      .prop('contenteditable', true)
      .focus()

  _stopEdit: ->
    @_isEditing = false
    @ui.label.prop 'contenteditable', false

  _onDeleteClick: (e) ->
    # Stop event from bubbling up and parent handlers from firing
    e.stopPropagation()

    @model.collection.remove @model

  _onAddClick: (e) ->
    e.stopPropagation()

    @collection.add new TreeNode
      label: 'New child'

  _onLabelDoubleClick: (e) ->
    e.stopPropagation()

    @_edit()

  _onKeyDown: (e) ->
    return unless e.which is 13 # Enter key
    return unless @_isEditing

    @_stopEdit()
    @model.set 'label', @ui.label.html()

    @_eventHub.trigger 'node_updated' if @_eventHub
