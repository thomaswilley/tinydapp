const loadBinds = () => {
  window._db = db;
  window.db = ObservableSlim.create(window._db, true, function(changes) {
    changes.forEach((change) => {
      let path = 'db.' + change.currentPath;
      if(change.currentPath.split('.').reverse()[0] === 'length') {
        path = path.split('.').reverse().slice(1).reverse().join('.')
      }
      document.querySelectorAll('[data-bind="'+path+'"]').forEach((el) => {
        renderElement(el);
      });
    });
  });
}

const renderElement = async (el) => {
  var newEl = document.createElement(el.nodeName);
  el.getAttributeNames().forEach((attr) => {
    newEl.setAttribute(attr, el.getAttribute(attr));
  });

  let bindTo = el.dataset['bind'];
  let itemRender = eval(el.dataset['itemtemplate']);
  let itemsRaw = eval(bindTo);
  let items = typeof(itemsRaw)==='object' ? Array.prototype.slice.call(itemsRaw) : [itemsRaw];
  items.forEach((item) => {
    newEl.appendChild(itemRender(item));
  });

  el.replaceWith(newEl);
}
