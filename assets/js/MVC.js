(function(window) {
  window.mvc = {
    SimpleMVC,
  }

  function SimpleMVC() {
    return {
      Model: Model,
      View: View,
      Controller: Controller,
    }
  }

  function Model(data) {
    var _data = data || {};
    var _listeners = [];

    this.getData = function() {
      return _data;
    }

    this.setData = function(data) {
      console.group('Model');
      console.log('%c Prev data: ', 'color:grey', _data);
      _data = data;
      console.log('%c Next data: ', 'color:green', _data);
      console.groupEnd();

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

  function View(model, onDataChanged) {
    var _model = model;
    var _onDataChanged = onDataChanged;

    _model.register(this);

    this.notify = function(data) {
      _onDataChanged(data);
    }
  }

  function Controller(view, model, controls) {
    var _view = view;
    var _model = model;

    this.updateData = function(data) {
      var nextData = Object.assign({}, _model.getData(), data);

      _model.setData(nextData);
    }

    for (var control in controls) {
      this[control] = controls[control];
    }
  }
})(window);