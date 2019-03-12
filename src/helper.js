import _ from 'lodash';


export const Event = {};

Event.addHandler = window.addEventListener ?
  (target, type, handler) => {
    target.addEventListener(type, handler, false);
  } :
  (target, type, handler) => {
    target.attachEvent(`on${type}`, handler);
  };

Event.removeHandler = window.removeEventListener ?
  (target, type, handler) => {
    target.removeEventListener(type, handler, false);
  } :
  (target, type, handler) => {
    target.detachEvent(`on${type}`, handler);
  };

Event.triggerEvent = (target, type) => {
  if (document.createEvent) {
    const eventMp = {
      HTMLEvents: ['abort', 'blur', 'change', 'error', 'focus', 'load', 'reset', 'resize',
        'scroll', 'select', 'submit', 'unload'],
      UIEvents: ['DOMActivate', 'DOMFocusIn', 'DOMFocusOut', 'keydown', 'keypress', 'keyup'],
      MouseEvents: ['click', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup'],
      MutationEvents: ['DOMAttrModified', 'DOMNodeInserted', 'DOMNodeRemoved',
        'DOMCharacterDataModified', 'DOMNodeInsertedIntoDocument', 'DOMNodeRemovedFromDocument',
        'DOMSubtreeModified'],
    };
    let eventKey = null;
    _.map(eventMp, (types, key) => {
      if (_.indexOf(types, type) > -1) {
        eventKey = key;
        return false;
      }
    });

    if (!eventKey) {
      throw new TypeError('Unknown EventType.');
    }

    const event = document.createEvent(eventKey);
    event.initEvent(type, true, true);
    target.dispatchEvent(event);
  } else if (document.createEventObject) {
    target.fireEvent(`on${type}`);
  }
};
