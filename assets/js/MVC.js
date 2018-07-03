(function(window) {
  window.SimpleMVC = {
    Model: Model,
    View: View,
    Controller: Controller,
  }

  function Model() {
    this._data = {};
    this._listeners = [];

    this.getData = function() {
      return this._data;
    }

    this.setData = function(data) {
      this._data = Object.assign({}, this._data, data);

      this.notifyAll();
    }

    this.register = function(listener) {
      this._listeners.push(listener);
    }

    this.notifyAll = function() {
      this._listeners.forEach(listener => {
        listener.notify();
      });
    }
  }

  function View(model) {
    this._model = model;

    this.updateData = function(data) {
      this._model.setData(data);
    }
  }

  function Controller(view, model) {
    this._view = view;
    this._model = model;

    this._model.register(this);

    this.notify = function() {
      console.log('Notified data: ', this._model.getData());
    }
  }
})(window)

var model = new SimpleMVC.Model();
var view = new SimpleMVC.View(model);
var controller = new SimpleMVC.Controller(view, model);

view.updateData({ data: 'abc' })