const loadBinds = () => {
  window._db = db;
  window.db = ObservableSlim.create(window._db, true, function(changes) {
    changes.forEach((change) => {
      let path = 'db.' + change.currentPath;
      let toRender = pathsToRender(path);
      if (toRender) {
        document.querySelectorAll('[data-bind="'+toRender+'"]').forEach((el) => {
          renderElement(el, toRender);
        });
      }
    });
  });
}

const pathsToRender = (path) => {
  // return the first path referenced by a dom element (via data-bind property)
  // note: brute force for now. inelegant & low performance.
  if (document.querySelectorAll('[data-bind="'+path+'"]').length > 0) {
    return path;
  } else {
    let nodes = path.split('.');
    if (nodes.length > 1) {
      return pathsToRender(nodes.slice(0, nodes.length-1).join('.'));
    }
  }
}

const renderElement = async (el, path, target) => {
  //console.log('render @ ', path);
  var newEl = document.createElement(el.nodeName);
  el.getAttributeNames().forEach((attr) => {
    newEl.setAttribute(attr, el.getAttribute(attr));
  });

  let bindTo = el.dataset['bind'];
  // observableslim uses .0/i..n notation for arrays. detect & change to [i] for eval
  let lastNode = parseInt(bindTo.split('.').reverse()[0]);
  if (!isNaN(lastNode)) {
    let leaves = bindTo.split('.');
    if(leaves.length > 1) {
      bindTo = leaves.slice(0, leaves.length-1).join('.') + '[' + lastNode.toString() + ']';
    }
  }
  let itemsRaw = eval(bindTo);
  let items = typeof(itemsRaw) === 'object' && itemsRaw.length ? Array.prototype.slice.call(itemsRaw) : [itemsRaw];

  let itemRender = eval(el.dataset['itemtemplate']);
  if (!itemRender) {
    // get parent's itemRender and use that. we're in a dynamic child.
    // TODO: make this recursive; for now it only looks at first parent and then fails badly
    itemRender = eval(el.parentNode.dataset['itemtemplate']);
    if (!itemRender) {
      console.log('exception. unable to render child b/c parent doesnt have a template: ', path);
    }
  }

  items.forEach((item,index,arr) => {
    let elNew = itemRender(item);
    if(arr.length>1) {
      elNew.dataset['bind'] = path + '.' + index;
    }
    newEl.appendChild(elNew);
  });

  el.replaceWith(newEl);
}
