(function(window) {
  window.SimpleMVC = {
    Model: Model,
    View: View,
    Controller: Controller,
  }

  function Model(data) {
    var _data = data || {};
    var _listeners = [];

    this.getData = function() {
      return _data;
    }

    this.setData = function(data) {
      _data = data;

      this.notifyAll();
    }

    this.register = function(listener) {
      _listeners.push(listener);
    }

    this.notifyAll = function() {
      _listeners.forEach(function(listener) {
        listener.notify(_data);
      }.bind(this));
    }
  }

  function View(model) {
    var _model = model;

    _model.register(this);

    this.notify = function(data) {
      console.log('Notified data: ', data);
    }
  }

  function Controller(view, model) {
    var _view = view;
    var _model = model;

    this.updateData = function(data) {
      _model.setData(data);
    }
  }
})(window)

var model = new SimpleMVC.Model();
var view = new SimpleMVC.View(model);
var controller = new SimpleMVC.Controller(view, model);

controller.updateData({ data: 'abc' })