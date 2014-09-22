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
    _.bindAll @
    @collection = @model.get 'children'

  childViewOptions: ->
    eventHub: @_eventHub

  _edit: ->
    @_isEditing = true

    $(document).on 'click', @_onDocumentClickWhileEditing

    @ui.label
      .prop('contenteditable', true)
      .focus()

  _stopEdit: ->
    @_isEditing = false

    $(document).off 'click', @_onDocumentClickWhileEditing

    @ui.label.prop 'contenteditable', false

    @model.set 'label', @ui.label.html()
    @_trigger 'node_updated'

  _trigger: (type) ->
    @_eventHub.trigger type if @_eventHub

  _onDeleteClick: (e) ->
    # Stop event from bubbling up and parent handlers from firing
    e.stopPropagation()

    @model.collection.remove @model

    @_trigger 'node_removed'

  _onAddClick: (e) ->
    e.stopPropagation()

    @collection.add new TreeNode
      label: 'New child'

    @_trigger 'node_added'

  _onLabelDoubleClick: (e) ->
    e.stopPropagation()

    @_edit()

  _onKeyDown: (e) ->
    return unless e.which is 13 # Enter key
    return unless @_isEditing

    @_stopEdit()

  _onDocumentClickWhileEditing: (e) ->
    return if e.target is @ui.label.get(0)
    @_stopEdit()
