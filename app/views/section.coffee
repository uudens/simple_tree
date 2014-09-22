TreeNode = require './tree_node'
template = require './templates/section'

module.exports = class Section extends Marionette.ItemView

  tagName: 'section'
  template: template

  ui:
    treeContainer: '.tree-container'

  render: ->
    super
    node = new TreeNode model: @model
    @ui.treeContainer.append node.render().el
    @
