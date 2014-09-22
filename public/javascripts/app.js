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

;require.register("entities/tree", function(exports, require, module) {
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
      data.children = this._getChildCollectionRecursively(data.children);
    } else {
      console.debug('Parsing data using Iterative method');
      data.children = this._getChildCollectionIteratively(data.children);
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

  Tree.prototype._getChildCollectionRecursively = function(data) {
    var childData, collection, hasChildren, model, _i, _len;
    collection = new TreeNodes;
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      childData = data[_i];
      model = new TreeNode(_.omit(childData, 'children'));
      hasChildren = childData.children && childData.children.length;
      if (hasChildren) {
        model.set({
          children: this._getChildCollectionRecursively(childData.children)
        });
      }
      collection.add(model);
    }
    return collection;
  };

  Tree.prototype._getChildCollectionIteratively = function(data) {
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

;require.register("entities/tree_node", function(exports, require, module) {
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

;require.register("entities/tree_nodes", function(exports, require, module) {
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

;require.register("initialize", function(exports, require, module) {
var Application;

Application = require('application');

$(function() {
  new Application();
  return Backbone.history.start();
});

});

;require.register("lib/event_hub", function(exports, require, module) {
var EventHub;

EventHub = {};

_.extend(EventHub, Backbone.Events);

module.exports = EventHub;

});

;require.register("lib/router", function(exports, require, module) {
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

;require.register("lib/view_helper", function(exports, require, module) {



});

;require.register("views/section_view", function(exports, require, module) {
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
    'change .isRecursive': '_onParseMethodChange'
  };

  SectionView.prototype.ui = {
    treeContainer: '.tree-container',
    recursiveBox: '.isRecursive'
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
    this._tree = new Tree;
    this.listenTo(this._tree, 'sync', this.render);
    return this._tree.fetch();
  };

  SectionView.prototype._saveTree = function() {
    if (this._tree) {
      return this._tree.save();
    }
  };

  SectionView.prototype._onParseMethodChange = function() {
    this._tree.set({
      isRecursive: this.ui.recursiveBox.is(':checked')
    });
    return this._saveTree();
  };

  return SectionView;

})(Marionette.ItemView);

});

;require.register("views/templates/section_view", function(exports, require, module) {
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, stack2, foundHelper, tmp1, self=this;

function program1(depth0,data) {
  
  
  return " checked";}

  buffer += "<h1>Tree</h1>\n<button class=\"reset\">Load default data</button>\n<input type=\"checkbox\" class=\"isRecursive\"";
  foundHelper = helpers.isRecursive;
  stack1 = foundHelper || depth0.isRecursive;
  stack2 = helpers['if'];
  tmp1 = self.program(1, program1, data);
  tmp1.hash = {};
  tmp1.fn = tmp1;
  tmp1.inverse = self.noop;
  stack1 = stack2.call(depth0, stack1, tmp1);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">Use recursive data parsing</button>\n<div class=\"tree-container\"></div>\n";
  return buffer;});
});

;require.register("views/templates/tree_node_view", function(exports, require, module) {
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<button class=\"delete\">Delete</button>\n<button class=\"add\">Add</button>\n<p class=\"label\">";
  foundHelper = helpers.label;
  stack1 = foundHelper || depth0.label;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "label", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</p>\n<ul class=\"children\"></ul>\n";
  return buffer;});
});

;require.register("views/tree_node_view", function(exports, require, module) {
var TreeNode, TreeNodeView, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

template = require('./templates/tree_node_view');

TreeNode = require('../entities/tree_node');

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
    e.stopPropagation();
    this.collection.add(new TreeNode({
      label: 'New child'
    }));
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

;require.register("views/view", function(exports, require, module) {
var View,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

require('lib/view_helper');

module.exports = View = (function(_super) {

  __extends(View, _super);

  function View() {
    this.render = __bind(this.render, this);
    return View.__super__.constructor.apply(this, arguments);
  }

  View.prototype.template = function() {};

  View.prototype.getRenderData = function() {};

  View.prototype.render = function() {
    this.$el.html(this.template(this.getRenderData()));
    this.afterRender();
    return this;
  };

  View.prototype.afterRender = function() {};

  return View;

})(Backbone.View);

});

;
//# sourceMappingURL=app.js.map