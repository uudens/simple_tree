(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("spec/tree", function(exports, require, module) {
var Tree;

Tree = require('../entities/tree');

describe("Tree", function() {
  beforeEach(function() {
    return this._data = {
      isRecursive: true,
      children: [
        {
          label: 'topLevel1'
        }, {
          label: 'topLevel2',
          children: [
            {
              label: '2ndLevel1'
            }
          ]
        }
      ]
    };
  });
  describe('#parse', function() {
    describe('when isRecursive: true', function() {
      it('should call #getChildCollectionRecursively', function() {
        var tree;
        tree = new Tree;
        spyOn(tree, 'getChildCollectionRecursively');
        tree.set(tree.parse(this._data));
        return expect(tree.getChildCollectionRecursively).toHaveBeenCalled();
      });
      return it('should not call #getChildCollectionIteratively', function() {
        var tree;
        tree = new Tree;
        spyOn(tree, 'getChildCollectionIteratively');
        tree.set(tree.parse(this._data));
        return expect(tree.getChildCollectionIteratively).not.toHaveBeenCalled();
      });
    });
    return describe('when isRecursive: false', function() {
      beforeEach(function() {
        return this._data.isRecursive = false;
      });
      it('should not call #getChildCollectionRecursively', function() {
        var tree;
        tree = new Tree;
        spyOn(tree, 'getChildCollectionRecursively');
        tree.set(tree.parse(this._data));
        return expect(tree.getChildCollectionRecursively).not.toHaveBeenCalled();
      });
      return it('should call #getChildCollectionIteratively', function() {
        var tree;
        tree = new Tree;
        spyOn(tree, 'getChildCollectionIteratively');
        tree.set(tree.parse(this._data));
        return expect(tree.getChildCollectionIteratively).toHaveBeenCalled();
      });
    });
  });
  describe('#getChildCollectionRecursively', function() {
    it('should be recursive (call itself)', function() {
      var collection, tree;
      tree = new Tree;
      spyOn(tree, 'getChildCollectionRecursively').and.callThrough();
      collection = tree.getChildCollectionRecursively(this._data.children);
      return expect(tree.getChildCollectionRecursively.calls.count()).toBeGreaterThan(1);
    });
    it('should generate nested child collections and models', function() {
      var collection, tree;
      tree = new Tree;
      collection = tree.getChildCollectionRecursively(this._data.children);
      expect(collection instanceof Backbone.Collection).toBe(true);
      expect(collection.at(1) instanceof Backbone.Model).toBe(true);
      return expect(collection.at(1).get('children') instanceof Backbone.Collection).toBe(true);
    });
    return it('should populate models with data from JSON', function() {
      var collection, tree;
      tree = new Tree;
      collection = tree.getChildCollectionRecursively(this._data.children);
      expect(collection.at(0).get('label')).toBe('topLevel1');
      expect(collection.at(1).get('label')).toBe('topLevel2');
      return expect(collection.at(1).get('children').at(0).get('label')).toBe('2ndLevel1');
    });
  });
  describe('#getChildCollectionIteratively', function() {
    it('should not be recursive (not call itself)', function() {
      var collection, tree;
      tree = new Tree;
      spyOn(tree, 'getChildCollectionIteratively').and.callThrough();
      collection = tree.getChildCollectionIteratively(this._data.children);
      return expect(tree.getChildCollectionIteratively.calls.count()).toBe(1);
    });
    it('should generate nested child collections and models', function() {
      var collection, tree;
      tree = new Tree;
      collection = tree.getChildCollectionIteratively(this._data.children);
      expect(collection instanceof Backbone.Collection).toBe(true);
      expect(collection.at(1) instanceof Backbone.Model).toBe(true);
      return expect(collection.at(1).get('children') instanceof Backbone.Collection).toBe(true);
    });
    return it('should populate models with data from JSON', function() {
      var collection, tree;
      tree = new Tree;
      collection = tree.getChildCollectionIteratively(this._data.children);
      expect(collection.at(0).get('label')).toBe('topLevel1');
      expect(collection.at(1).get('label')).toBe('topLevel2');
      return expect(collection.at(1).get('children').at(0).get('label')).toBe('2ndLevel1');
    });
  });
  return describe('#loadDefault', function() {
    it('should GET data/tree', function() {
      var ajaxArgs, tree;
      tree = new Tree;
      spyOn($, 'ajax');
      tree.loadDefault();
      ajaxArgs = _.first($.ajax.calls.argsFor(0));
      expect(ajaxArgs.type).toBe('get');
      return expect(ajaxArgs.url).toBe('data/tree');
    });
    return it('should parse result', function() {
      var ajaxArgs, tree;
      tree = new Tree;
      spyOn($, 'ajax');
      spyOn(tree, 'parse');
      tree.loadDefault();
      ajaxArgs = _.first($.ajax.calls.argsFor(0));
      ajaxArgs.success(this._data);
      return expect(tree.parse).toHaveBeenCalledWith(this._data);
    });
  });
});

});

require.register("spec/tree_node", function(exports, require, module) {
var TreeNode;

TreeNode = require('../entities/tree_node');

describe("TreeNode", function() {
  return describe('#initialize', function() {
    it('should generate id if not provided', function() {
      var node;
      node = new TreeNode;
      return expect(node.id).toBeTruthy();
    });
    it('should not overwrite id if it\'s provided', function() {
      var node;
      node = new TreeNode({
        id: 1
      });
      return expect(node.id).toBe(1);
    });
    it('should have children collection even if not provided', function() {
      var node;
      node = new TreeNode;
      return expect(node.get('children') instanceof Backbone.Collection).toBe(true);
    });
    return it('should not overwrite children collection if it\'s provided', function() {
      var children, node;
      children = new Backbone.Collection;
      node = new TreeNode({
        children: children
      });
      return expect(node.get('children')).toBe(children);
    });
  });
});

});


//# sourceMappingURL=spec.js.map