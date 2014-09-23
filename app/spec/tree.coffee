Tree = require '../entities/tree'

describe "Tree", ->

  beforeEach ->
    @_data =
      isRecursive: true
      children: [
          label: 'topLevel1'
        ,
          label: 'topLevel2'
          children: [
              label: '2ndLevel1'
          ]
      ]

  describe '#parse', ->

    describe 'when isRecursive: true', ->

      it 'should call #getChildCollectionRecursively', ->
        tree = new Tree
        spyOn(tree, 'getChildCollectionRecursively')
        tree.set tree.parse @_data
        expect(tree.getChildCollectionRecursively).toHaveBeenCalled()

      it 'should not call #getChildCollectionIteratively', ->
        tree = new Tree
        spyOn(tree, 'getChildCollectionIteratively')
        tree.set tree.parse @_data
        expect(tree.getChildCollectionIteratively).not.toHaveBeenCalled()

    describe 'when isRecursive: false', ->

      beforeEach ->
        @_data.isRecursive = false

      it 'should not call #getChildCollectionRecursively', ->
        tree = new Tree
        spyOn(tree, 'getChildCollectionRecursively')
        tree.set tree.parse @_data
        expect(tree.getChildCollectionRecursively).not.toHaveBeenCalled()

      it 'should call #getChildCollectionIteratively', ->
        tree = new Tree
        spyOn(tree, 'getChildCollectionIteratively')
        tree.set tree.parse @_data
        expect(tree.getChildCollectionIteratively).toHaveBeenCalled()

  describe '#getChildCollectionRecursively', ->

    it 'should be recursive (call itself)', ->
      tree = new Tree
      spyOn(tree, 'getChildCollectionRecursively').and.callThrough()
      collection = tree.getChildCollectionRecursively @_data.children
      expect(tree.getChildCollectionRecursively.calls.count()).toBeGreaterThan(1)

    it 'should generate nested child collections and models', ->
      tree = new Tree
      collection = tree.getChildCollectionRecursively @_data.children

      expect(collection instanceof Backbone.Collection).toBe(true)
      expect(collection.at(1) instanceof Backbone.Model).toBe(true)
      expect(collection.at(1).get('children') instanceof Backbone.Collection).toBe(true)

    it 'should populate models with data from JSON', ->
      tree = new Tree
      collection = tree.getChildCollectionRecursively @_data.children

      expect(collection.at(0).get('label')).toBe('topLevel1')
      expect(collection.at(1).get('label')).toBe('topLevel2')
      expect(collection.at(1).get('children').at(0).get('label')).toBe('2ndLevel1')

  describe '#getChildCollectionIteratively', ->

    it 'should not be recursive (not call itself)', ->
      tree = new Tree
      spyOn(tree, 'getChildCollectionIteratively').and.callThrough()
      collection = tree.getChildCollectionIteratively @_data.children
      expect(tree.getChildCollectionIteratively.calls.count()).toBe(1)

    it 'should generate nested child collections and models', ->
      tree = new Tree
      collection = tree.getChildCollectionIteratively @_data.children

      expect(collection instanceof Backbone.Collection).toBe(true)
      expect(collection.at(1) instanceof Backbone.Model).toBe(true)
      expect(collection.at(1).get('children') instanceof Backbone.Collection).toBe(true)

    it 'should populate models with data from JSON', ->
      tree = new Tree
      collection = tree.getChildCollectionIteratively @_data.children

      expect(collection.at(0).get('label')).toBe('topLevel1')
      expect(collection.at(1).get('label')).toBe('topLevel2')
      expect(collection.at(1).get('children').at(0).get('label')).toBe('2ndLevel1')

  describe '#loadDefault', ->

    it 'should GET data/tree', ->
      tree = new Tree
      spyOn $, 'ajax'
      tree.loadDefault()
      ajaxArgs = _.first $.ajax.calls.argsFor(0)
      expect(ajaxArgs.type).toBe('get')
      expect(ajaxArgs.url).toBe('data/tree')

    it 'should parse result', ->
      tree = new Tree
      spyOn $, 'ajax'
      spyOn tree, 'parse'
      tree.loadDefault()
      ajaxArgs = _.first $.ajax.calls.argsFor(0)
      ajaxArgs.success @_data
      expect(tree.parse).toHaveBeenCalledWith @_data
