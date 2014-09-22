TreeNodeView = require './tree_node_view'
template = require './templates/section_view'

module.exports = class SectionView extends Marionette.ItemView

  tagName: 'section'
  template: template

  ui:
    treeContainer: '.tree-container'

  render: ->
    super
    node = new TreeNodeView model: @model
    @ui.treeContainer.append node.render().el
    @
