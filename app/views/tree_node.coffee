template = require './templates/tree_node'

module.exports = class TreeNode extends Marionette.CompositeView

  template: template

  tagName: 'li'
  childViewContainer: '.children'

  initialize: ->
    @collection = @model.get 'children'
