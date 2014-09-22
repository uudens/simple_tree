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
var Application, Router, Section;

Router = require('lib/router');

Section = require('views/section');

module.exports = Application = (function() {

  function Application() {
    _.extend(this, Backbone.Events);
    this.router = new Router();
    this.listenTo(this.router, 'route:defaultRoute', this._buildTree);
  }

  Application.prototype._buildTree = function() {
    var recursiveTree, section, treeData;
    treeData = [
      {
        id: 'c4ca423',
        label: 'Element #1'
      }, {
        id: 'f75849b',
        label: 'Element #2',
        children: [
          {
            id: 'ryg5rd',
            label: 'Child #1 of element #2'
          }
        ]
      }, {
        id: '20dcc50',
        label: 'Element #3',
        children: [
          {
            id: '38a0b923',
            label: 'Child #1 of element #3',
            children: [
              {
                id: 'dcc509',
                label: 'Subchild'
              }, {
                id: 'a0b9238',
                label: 'Another subchild'
              }
            ]
          }
        ]
      }
    ];
    recursiveTree = new Backbone.Model({
      label: 'root',
      children: this._getChildCollection(treeData)
    });
    section = new Section({
      model: recursiveTree
    });
    return $('body').append(section.render().el);
  };

  Application.prototype._getChildCollection = function(data) {
    var child, collection, model, _i, _len;
    collection = new Backbone.Collection;
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      child = data[_i];
      model = new Backbone.Model(_.omit(child, 'children'));
      if (child.children) {
        model.set({
          children: this._getChildCollection(child.children)
        });
      }
      collection.add(model);
    }
    return collection;
  };

  return Application;

})();

});

;require.register("initialize", function(exports, require, module) {
var Application;

Application = require('application');

$(function() {
  new Application();
  return Backbone.history.start();
});

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

;require.register("models/collection", function(exports, require, module) {
var Collection,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = Collection = (function(_super) {

  __extends(Collection, _super);

  function Collection() {
    return Collection.__super__.constructor.apply(this, arguments);
  }

  return Collection;

})(Backbone.Collection);

});

;require.register("models/model", function(exports, require, module) {
var Model,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = Model = (function(_super) {

  __extends(Model, _super);

  function Model() {
    return Model.__super__.constructor.apply(this, arguments);
  }

  return Model;

})(Backbone.Model);

});

;require.register("views/section", function(exports, require, module) {
var Section, TreeNode, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

TreeNode = require('./tree_node');

template = require('./templates/section');

module.exports = Section = (function(_super) {

  __extends(Section, _super);

  function Section() {
    return Section.__super__.constructor.apply(this, arguments);
  }

  Section.prototype.tagName = 'section';

  Section.prototype.template = template;

  Section.prototype.ui = {
    treeContainer: '.tree-container'
  };

  Section.prototype.render = function() {
    var node;
    Section.__super__.render.apply(this, arguments);
    node = new TreeNode({
      model: this.model
    });
    this.ui.treeContainer.append(node.render().el);
    return this;
  };

  return Section;

})(Marionette.ItemView);

});

;require.register("views/templates/section", function(exports, require, module) {
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var foundHelper, self=this;


  return "<h1>Tree</h1>\n<div class=\"tree-container\"></div>\n";});
});

;require.register("views/templates/tree_node", function(exports, require, module) {
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


  buffer += "<p class=\"label\">";
  foundHelper = helpers.label;
  stack1 = foundHelper || depth0.label;
  if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
  else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "label", { hash: {} }); }
  buffer += escapeExpression(stack1) + "</p>\n<ul class=\"children\"></ul>\n";
  return buffer;});
});

;require.register("views/tree_node", function(exports, require, module) {
var TreeNode, template,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

template = require('./templates/tree_node');

module.exports = TreeNode = (function(_super) {

  __extends(TreeNode, _super);

  function TreeNode() {
    return TreeNode.__super__.constructor.apply(this, arguments);
  }

  TreeNode.prototype.template = template;

  TreeNode.prototype.tagName = 'li';

  TreeNode.prototype.childViewContainer = '.children';

  TreeNode.prototype.initialize = function() {
    return this.collection = this.model.get('children');
  };

  return TreeNode;

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