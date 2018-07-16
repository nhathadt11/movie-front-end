(function(window) {
  window.mvc = {
    SimpleMVC,
  }

  function SimpleMVC() {
    return {
      Model: Model,
      View: View,
      Controller: Controller,
      OneWayBindingInputControl: OneWayBindingInputControl,
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

  function OneWayBindingInputControl(model, viewSelector, mapDataToValueProp) {
    var _model = model;
    var _viewSelector = validator.requireDomNode(viewSelector);
    var _mapDataToValueProp = mapDataToValueProp;

    _model.register(this);

    this.notify = function(data) {
      _viewSelector.value = _mapDataToValueProp(data);
    }
  }

  // Validator
  var validator = {
    requireDomNode: requireDomNode,
  }

  function requireDomNode(value) {
    if (value instanceof Node) return value;
    throw new TypeError('View selector must be a DOM Node');
  }
})(window);