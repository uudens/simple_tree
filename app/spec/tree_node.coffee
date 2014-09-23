TreeNode = require '../entities/tree_node'

describe "TreeNode", ->

  describe '#initialize', ->

    it 'should generate id if not provided', ->
      node = new TreeNode
      expect(node.id).toBeTruthy()

    it 'should not overwrite id if it\'s provided', ->
      node = new TreeNode id: 1
      expect(node.id).toBe(1)

    it 'should have children collection even if not provided', ->
      node = new TreeNode
      expect(node.get('children') instanceof Backbone.Collection).toBe(true)

    it 'should not overwrite children collection if it\'s provided', ->
      children = new Backbone.Collection
      node = new TreeNode children: children
      expect(node.get('children')).toBe(children)
