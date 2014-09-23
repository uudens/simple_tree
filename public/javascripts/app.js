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
require.register("application", function(exports, require, module) {
var Application, Router, SectionView;

Router = require('lib/router');

SectionView = require('views/section_view');

module.exports = Application = (function() {

  function Application() {
    _.extend(this, Backbone.Events);
    this.router = new Router;
    this.listenTo(this.router, 'route:defaultRoute', this._showSection);
  }

  Application.prototype._showSection = function() {
    var section;
    section = new SectionView;
    return $('body').append(section.render().el);
  };

  return Application;

})();

});

require.register("entities/tree", function(exports, require, module) {
var Tree, TreeNode, TreeNodes,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

TreeNode = require('./tree_node');

TreeNodes = require('./tree_nodes');

module.exports = Tree = (function(_super) {

  __extends(Tree, _super);

  function Tree() {
    return Tree.__super__.constructor.apply(this, arguments);
  }

  Tree.prototype.id = 1;

  Tree.prototype.localStorage = new Backbone.LocalStorage('tree');

  Tree.prototype.parse = function(data) {
    if (typeof data !== 'object') {
      return;
    }
    data.isRecursive = this.get('isRecursive') != null ? this.get('isRecursive') : data.isRecursive;
    if (data.isRecursive) {
      console.debug('Parsing data using Recursive method');
      data.children = this.getChildCollectionRecursively(data.children);
    } else {
      console.debug('Parsing data using Iterative method');
      data.children = this.getChildCollectionIteratively(data.children);
    }
    return data;
  };

  Tree.prototype.loadDefault = function() {
    var _this = this;
    return $.getJSON('data/tree', function(data) {
      _this.set(_this.parse(data));
      return _this.save();
    });
  };

  Tree.prototype.getChildCollectionRecursively = function(data) {
    var childData, collection, hasChildren, model, _i, _len;
    collection = new TreeNodes;
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      childData = data[_i];
      model = new TreeNode(_.omit(childData, 'children'));
      hasChildren = childData.children && childData.children.length;
      if (hasChildren) {
        model.set({
          children: this.getChildCollectionRecursively(childData.children)
        });
      }
      collection.add(model);
    }
    return collection;
  };

  Tree.prototype.getChildCollectionIteratively = function(data) {
    var childData, collection, i, index, indexes, model, parentCollections, _i, _len;
    collection = new TreeNodes;
    parentCollections = [collection];
    indexes = [0];
    while (true) {
      for (i = _i = 0, _len = indexes.length; _i < _len; i = ++_i) {
        index = indexes[i];
        if (!i) {
          childData = {
            children: data
          };
        }
        childData = childData.children && childData.children[index];
        if (!childData) {
          indexes.pop();
          parentCollections.pop();
          break;
        }
      }
      if (!childData) {
        if (!indexes.length) {
          break;
        }
        indexes[indexes.length - 1]++;
        continue;
      }
      model = new TreeNode(_.omit(childData, 'children'));
      _.last(parentCollections).add(model);
      if (childData.children && childData.children.length) {
        parentCollections.push(new TreeNodes);
        model.set({
          children: _.last(parentCollections)
        });
        indexes.push(0);
        continue;
      }
      indexes[indexes.length - 1]++;
    }
    return collection;
  };

  return Tree;

})(Backbone.Model);

});

require.register("entities/tree_node", function(exports, require, module) {
var TreeNode, TreeNodes,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

TreeNodes = require('./tree_nodes');

module.exports = TreeNode = (function(_super) {

  __extends(TreeNode, _super);

  function TreeNode() {
    return TreeNode.__super__.constructor.apply(this, arguments);
  }

  TreeNode.prototype.initialize = function() {
    if (!this.id) {
      this.set({
        id: this._getUniqueId()
      });
    }
    if (!this.get('children')) {
      return this.set({
        children: new TreeNodes
      });
    }
  };

  TreeNode.prototype._getUniqueId = function() {
    return 'n' + (Math.random() + 1).toString(36).substring(7);
  };

  return TreeNode;

})(Backbone.Model);

});

require.register("entities/tree_nodes", function(exports, require, module) {
var TreeNodes,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = TreeNodes = (function(_super) {

  __extends(TreeNodes, _super);

  function TreeNodes() {
    return TreeNodes.__super__.constructor.apply(this, arguments);
  }

  return TreeNodes;

})(Backbone.Collection);

});

require.register("initialize", function(exports, require, module) {
var Application;

Application = require('application');

$(function() {
  new Application();
  return Backbone.history.start();
});

});

require.register("lib/event_hub", function(exports, require, module) {
var EventHub;

EventHub = {};

_.extend(EventHub, Backbone.Events);

module.exports = EventHub;

});

require.register("lib/router", function(exports, require, module) {
var Router, application,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

application = require('application');

module.exports = Router = (function(_super) {

  __extends(Router, _super);

  function Router() {
    return Router.__super__.constructor.apply(this, arguments);
  }

  Router.prototype.routes = {
    '*path': 'defaultRoute'
  };

  return Router;

})(Backbone.Router);

});

require.register("lib/trees", function(exports, require, module) {
var Trees;

module.exports = Trees = {
  getRandom: function() {
    return this._capitalize(_.sample(this._trees));
  },
  _capitalize: function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  _trees: ['almond', 'apple', 'apricot', 'ash', 'aspen', 'baobob', 'banyan', 'bark', 'beech', 'black ash', 'black willow', 'bigtooth aspen', 'birch', 'bodhi', 'bristlecone pine', 'buckeye', 'butternut', 'cabbage palmetto', 'camellia', 'catalpa', 'cedar', 'cherry', 'chestnut', 'choke cherry', 'coconut palm', 'cone', 'cottonwood', 'crape myrtle', 'crabapple', 'cypress', 'date', 'dogwood', 'Douglas fir', 'elderberry', 'elm', 'eucalyptus', 'evergreen', 'fig', 'filbert', 'fir', 'flame tree', 'forest', 'ginkgo', 'goldenlarch', 'grapefruit', 'grove', 'gum', 'hackberry', 'haw', 'hawthorn', 'hemlock', 'hickory', 'holly', 'honeylocust', 'ipil', 'ironwood', 'jack pine', 'jacktree', 'Japanese maple', 'jujuba', 'jungle', 'juniper', 'kapok tree', 'katsura', 'kukui nut', 'kumquat', 'larch', 'lilac', 'linden', 'live oak', 'loblolly pine', 'locust', 'loquat', 'lone pine', 'longleaf pine', 'magnolia', 'mahogany', 'mangrove', 'maple', 'mimosa', 'mountainash', 'nectarine', 'northern red oak', 'Norway maple', 'oak', 'olive', 'orange', 'paper birch', 'palm', 'palmetto', 'pawpaw', 'peach', 'pear', 'pecan', 'persimmon', 'pine', 'piñon pine', 'plum', 'poplar', 'quaking aspen', 'quince', 'rain forest', 'redbud', 'redwood', 'rings', 'rubber tree', 'sassafras', 'Scotch pine', 'sequoia', 'serviceberry', 'silver maple', 'Sitka spruce', 'slippery elm', 'spruce', 'sugar maple', 'sweetgum', 'sycamore', 'teak', 'tree', 'tulip-tree', 'tupelo', 'upright red maple', 'viburnum', 'walnut', 'weeping willow', 'white ash', 'white oak', 'white pine', 'willow', 'wingnut', 'witchhazel', 'yellowwood', 'yew', 'zebrawood', 'zelkova']
};

});

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

require.register("views/section_view", function(exports, require, module) {
var EventHub, SectionView, Tree, TreeNodeView, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Tree = require('../entities/tree');

TreeNodeView = require('./tree_node_view');

EventHub = require('../lib/event_hub');

template = require('./templates/section_view');

module.exports = SectionView = (function(_super) {

  __extends(SectionView, _super);

  function SectionView() {
    return SectionView.__super__.constructor.apply(this, arguments);
  }

  SectionView.prototype.tagName = 'section';

  SectionView.prototype.template = template;

  SectionView.prototype.events = {
    'click .reset': '_reset',
    'change input[name="isRecursive"]': '_onParseMethodChange'
  };

  SectionView.prototype.ui = {
    treeContainer: '.tree-container',
    recursiveBox: 'input[name="isRecursive"]'
  };

  SectionView.prototype._tree = null;

  SectionView.prototype.initialize = function() {
    _.bindAll(this);
    this.listenTo(EventHub, 'node_updated node_added node_removed', this._saveTree);
    return this._loadTree();
  };

  SectionView.prototype.serializeData = function() {
    return {
      isRecursive: this._tree.get('isRecursive')
    };
  };

  SectionView.prototype.render = function() {
    var rootNode;
    SectionView.__super__.render.apply(this, arguments);
    if (this._tree) {
      this.ui.treeContainer.empty();
      rootNode = new TreeNodeView({
        model: this._tree,
        eventHub: EventHub
      });
      this.ui.treeContainer.append(rootNode.render().el);
    }
    return this;
  };

  SectionView.prototype._reset = function() {
    return this._tree.loadDefault(this.render);
  };

  SectionView.prototype._loadTree = function() {
    var _this = this;
    this._tree = new Tree;
    this.listenTo(this._tree, 'sync', this.render);
    return this._tree.fetch({
      error: this._reset,
      success: function() {
        if (_this._tree.get('children').isEmpty()) {
          return _this._reset();
        }
      }
    });
  };

  SectionView.prototype._saveTree = function() {
    if (this._tree) {
      return this._tree.save();
    }
  };

  SectionView.prototype._onParseMethodChange = function() {
    this._tree.set({
      isRecursive: this.ui.recursiveBox.filter(':checked').val() === 'true'
    });
    return this._saveTree();
  };

  return SectionView;

})(Marionette.ItemView);

});

require.register("views/templates/section_view", function(exports, require, module) {
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, foundHelper, tmp1, self=this;

function program1(depth0,data) {
  
  
  return " checked";}

function program3(depth0,data) {
  
  
  return " checked";}

  buffer += "<header>\n	<h1>Tree</h1>\n	<div class=\"settings\">\n		<label>\n			<input type=\"radio\" name=\"isRecursive\" value=\"true\"";
  foundHelper = helpers.isRecursive;
  stack1 = foundHelper || depth0.isRecursive;
  stack2 = helpers['if'];
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " />\n			Use recursive data parsing\n		</label>\n		<label>\n			<input type=\"radio\" name=\"isRecursive\" value=\"false\"";
  foundHelper = helpers.isRecursive;
  stack1 = foundHelper || depth0.isRecursive;
  stack2 = helpers.unless;
  tmp1 = self.program(3, program3, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " />\n			Use iterative data parsing\n		</label>\n		<button class=\"reset\">Load default data</button>\n	</div>\n</header>\n<ul class=\"tree-container\"></ul>\n";
  return buffer;});
});

require.register("views/templates/tree_node_view", function(exports, require, module) {
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<div class=\"itemHead\">\n	<button class=\"delete\" title=\"Delete this item with all it's children\">Delete</button>\n	<button class=\"add\" title=\"Add new child to this item\">Add</button>\n	<p class=\"label\" title=\"Double click to edit label\">";
  foundHelper = helpers.label;
  stack1 = foundHelper || depth0.label;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "label", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</p>\n</div>\n<ul class=\"children\"></ul>\n";
  return buffer;});
});

require.register("views/tree_node_view", function(exports, require, module) {
var TreeNode, TreeNodeView, Trees, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

template = require('./templates/tree_node_view');

TreeNode = require('../entities/tree_node');

Trees = require('../lib/trees');

module.exports = TreeNodeView = (function(_super) {

  __extends(TreeNodeView, _super);

  function TreeNodeView() {
    return TreeNodeView.__super__.constructor.apply(this, arguments);
  }

  TreeNodeView.prototype.template = template;

  TreeNodeView.prototype.tagName = 'li';

  TreeNodeView.prototype.childViewContainer = '.children';

  TreeNodeView.prototype.events = {
    'click .delete': '_onDeleteClick',
    'click .add': '_onAddClick',
    'dblclick .label': '_onLabelDoubleClick',
    'keydown': '_onKeyDown'
  };

  TreeNodeView.prototype.ui = {
    label: '.label'
  };

  TreeNodeView.prototype._eventHub = null;

  TreeNodeView.prototype._isEditing = false;

  TreeNodeView.prototype.initialize = function(_arg) {
    this._eventHub = _arg.eventHub;
    _.bindAll(this);
    return this.collection = this.model.get('children');
  };

  TreeNodeView.prototype.childViewOptions = function() {
    return {
      eventHub: this._eventHub
    };
  };

  TreeNodeView.prototype._edit = function() {
    this._isEditing = true;
    $(document).on('click', this._onDocumentClickWhileEditing);
    return this.ui.label.prop('contenteditable', true).focus();
  };

  TreeNodeView.prototype._stopEdit = function() {
    this._isEditing = false;
    $(document).off('click', this._onDocumentClickWhileEditing);
    this.ui.label.prop('contenteditable', false);
    this.model.set('label', this.ui.label.html());
    return this._trigger('node_updated');
  };

  TreeNodeView.prototype._trigger = function(type) {
    if (this._eventHub) {
      return this._eventHub.trigger(type);
    }
  };

  TreeNodeView.prototype._onDeleteClick = function(e) {
    e.stopPropagation();
    this.model.collection.remove(this.model);
    return this._trigger('node_removed');
  };

  TreeNodeView.prototype._onAddClick = function(e) {
    var newNode;
    e.stopPropagation();
    newNode = new TreeNode({
      label: Trees.getRandom()
    });
    this.collection.add(newNode, {
      at: 0
    });
    return this._trigger('node_added');
  };

  TreeNodeView.prototype._onLabelDoubleClick = function(e) {
    e.stopPropagation();
    return this._edit();
  };

  TreeNodeView.prototype._onKeyDown = function(e) {
    if (e.which !== 13) {
      return;
    }
    if (!this._isEditing) {
      return;
    }
    return this._stopEdit();
  };

  TreeNodeView.prototype._onDocumentClickWhileEditing = function(e) {
    if (e.target === this.ui.label.get(0)) {
      return;
    }
    return this._stopEdit();
  };

  return TreeNodeView;

})(Marionette.CompositeView);

});


//# sourceMappingURL=app.js.map