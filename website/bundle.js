(function () {

  /* Riot v6.1.2, @license MIT */
  /**
   * Convert a string from camel case to dash-case
   * @param   {string} string - probably a component tag name
   * @returns {string} component name normalized
   */
  function camelToDashCase(string) {
    return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
  /**
   * Convert a string containing dashes to camel case
   * @param   {string} string - input string
   * @returns {string} my-string -> myString
   */

  function dashToCamelCase(string) {
    return string.replace(/-(\w)/g, (_, c) => c.toUpperCase());
  }

  /**
   * Get all the element attributes as object
   * @param   {HTMLElement} element - DOM node we want to parse
   * @returns {Object} all the attributes found as a key value pairs
   */

  function DOMattributesToObject(element) {
    return Array.from(element.attributes).reduce((acc, attribute) => {
      acc[dashToCamelCase(attribute.name)] = attribute.value;
      return acc;
    }, {});
  }
  /**
   * Move all the child nodes from a source tag to another
   * @param   {HTMLElement} source - source node
   * @param   {HTMLElement} target - target node
   * @returns {undefined} it's a void method ¯\_(ツ)_/¯
   */
  // Ignore this helper because it's needed only for svg tags

  function moveChildren(source, target) {
    if (source.firstChild) {
      target.appendChild(source.firstChild);
      moveChildren(source, target);
    }
  }
  /**
   * Remove the child nodes from any DOM node
   * @param   {HTMLElement} node - target node
   * @returns {undefined}
   */

  function cleanNode(node) {
    clearChildren(node.childNodes);
  }
  /**
   * Clear multiple children in a node
   * @param   {HTMLElement[]} children - direct children nodes
   * @returns {undefined}
   */

  function clearChildren(children) {
    Array.from(children).forEach(removeChild);
  }
  /**
   * Remove a node
   * @param {HTMLElement}node - node to remove
   * @returns {undefined}
   */

  const removeChild = node => node && node.parentNode && node.parentNode.removeChild(node);
  /**
   * Insert before a node
   * @param {HTMLElement} newNode - node to insert
   * @param {HTMLElement} refNode - ref child
   * @returns {undefined}
   */

  const insertBefore = (newNode, refNode) => refNode && refNode.parentNode && refNode.parentNode.insertBefore(newNode, refNode);
  /**
   * Replace a node
   * @param {HTMLElement} newNode - new node to add to the DOM
   * @param {HTMLElement} replaced - node to replace
   * @returns {undefined}
   */

  const replaceChild = (newNode, replaced) => replaced && replaced.parentNode && replaced.parentNode.replaceChild(newNode, replaced);

  // Riot.js constants that can be used accross more modules
  const COMPONENTS_IMPLEMENTATION_MAP$1 = new Map(),
        DOM_COMPONENT_INSTANCE_PROPERTY$1 = Symbol('riot-component'),
        PLUGINS_SET$1 = new Set(),
        IS_DIRECTIVE = 'is',
        VALUE_ATTRIBUTE = 'value',
        MOUNT_METHOD_KEY = 'mount',
        UPDATE_METHOD_KEY = 'update',
        UNMOUNT_METHOD_KEY = 'unmount',
        SHOULD_UPDATE_KEY = 'shouldUpdate',
        ON_BEFORE_MOUNT_KEY = 'onBeforeMount',
        ON_MOUNTED_KEY = 'onMounted',
        ON_BEFORE_UPDATE_KEY = 'onBeforeUpdate',
        ON_UPDATED_KEY = 'onUpdated',
        ON_BEFORE_UNMOUNT_KEY = 'onBeforeUnmount',
        ON_UNMOUNTED_KEY = 'onUnmounted',
        PROPS_KEY = 'props',
        STATE_KEY = 'state',
        SLOTS_KEY = 'slots',
        ROOT_KEY = 'root',
        IS_PURE_SYMBOL = Symbol('pure'),
        IS_COMPONENT_UPDATING = Symbol('is_updating'),
        PARENT_KEY_SYMBOL = Symbol('parent'),
        ATTRIBUTES_KEY_SYMBOL = Symbol('attributes'),
        TEMPLATE_KEY_SYMBOL = Symbol('template');

  var globals = /*#__PURE__*/Object.freeze({
    __proto__: null,
    COMPONENTS_IMPLEMENTATION_MAP: COMPONENTS_IMPLEMENTATION_MAP$1,
    DOM_COMPONENT_INSTANCE_PROPERTY: DOM_COMPONENT_INSTANCE_PROPERTY$1,
    PLUGINS_SET: PLUGINS_SET$1,
    IS_DIRECTIVE: IS_DIRECTIVE,
    VALUE_ATTRIBUTE: VALUE_ATTRIBUTE,
    MOUNT_METHOD_KEY: MOUNT_METHOD_KEY,
    UPDATE_METHOD_KEY: UPDATE_METHOD_KEY,
    UNMOUNT_METHOD_KEY: UNMOUNT_METHOD_KEY,
    SHOULD_UPDATE_KEY: SHOULD_UPDATE_KEY,
    ON_BEFORE_MOUNT_KEY: ON_BEFORE_MOUNT_KEY,
    ON_MOUNTED_KEY: ON_MOUNTED_KEY,
    ON_BEFORE_UPDATE_KEY: ON_BEFORE_UPDATE_KEY,
    ON_UPDATED_KEY: ON_UPDATED_KEY,
    ON_BEFORE_UNMOUNT_KEY: ON_BEFORE_UNMOUNT_KEY,
    ON_UNMOUNTED_KEY: ON_UNMOUNTED_KEY,
    PROPS_KEY: PROPS_KEY,
    STATE_KEY: STATE_KEY,
    SLOTS_KEY: SLOTS_KEY,
    ROOT_KEY: ROOT_KEY,
    IS_PURE_SYMBOL: IS_PURE_SYMBOL,
    IS_COMPONENT_UPDATING: IS_COMPONENT_UPDATING,
    PARENT_KEY_SYMBOL: PARENT_KEY_SYMBOL,
    ATTRIBUTES_KEY_SYMBOL: ATTRIBUTES_KEY_SYMBOL,
    TEMPLATE_KEY_SYMBOL: TEMPLATE_KEY_SYMBOL
  });

  const EACH = 0;
  const IF = 1;
  const SIMPLE = 2;
  const TAG = 3;
  const SLOT = 4;
  var bindingTypes = {
    EACH,
    IF,
    SIMPLE,
    TAG,
    SLOT
  };

  const ATTRIBUTE = 0;
  const EVENT = 1;
  const TEXT = 2;
  const VALUE = 3;
  var expressionTypes = {
    ATTRIBUTE,
    EVENT,
    TEXT,
    VALUE
  };

  const HEAD_SYMBOL = Symbol('head');
  const TAIL_SYMBOL = Symbol('tail');

  /**
   * Create the <template> fragments text nodes
   * @return {Object} {{head: Text, tail: Text}}
   */

  function createHeadTailPlaceholders() {
    const head = document.createTextNode('');
    const tail = document.createTextNode('');
    head[HEAD_SYMBOL] = true;
    tail[TAIL_SYMBOL] = true;
    return {
      head,
      tail
    };
  }

  /**
   * Create the template meta object in case of <template> fragments
   * @param   {TemplateChunk} componentTemplate - template chunk object
   * @returns {Object} the meta property that will be passed to the mount function of the TemplateChunk
   */

  function createTemplateMeta(componentTemplate) {
    const fragment = componentTemplate.dom.cloneNode(true);
    const {
      head,
      tail
    } = createHeadTailPlaceholders();
    return {
      avoidDOMInjection: true,
      fragment,
      head,
      tail,
      children: [head, ...Array.from(fragment.childNodes), tail]
    };
  }

  /**
   * Helper function to set an immutable property
   * @param   {Object} source - object where the new property will be set
   * @param   {string} key - object key where the new property will be stored
   * @param   {*} value - value of the new property
   * @param   {Object} options - set the propery overriding the default options
   * @returns {Object} - the original object modified
   */
  function defineProperty(source, key, value, options) {
    if (options === void 0) {
      options = {};
    }

    /* eslint-disable fp/no-mutating-methods */
    Object.defineProperty(source, key, Object.assign({
      value,
      enumerable: false,
      writable: false,
      configurable: true
    }, options));
    /* eslint-enable fp/no-mutating-methods */

    return source;
  }
  /**
   * Define multiple properties on a target object
   * @param   {Object} source - object where the new properties will be set
   * @param   {Object} properties - object containing as key pair the key + value properties
   * @param   {Object} options - set the propery overriding the default options
   * @returns {Object} the original object modified
   */

  function defineProperties(source, properties, options) {
    Object.entries(properties).forEach(_ref => {
      let [key, value] = _ref;
      defineProperty(source, key, value, options);
    });
    return source;
  }
  /**
   * Define default properties if they don't exist on the source object
   * @param   {Object} source - object that will receive the default properties
   * @param   {Object} defaults - object containing additional optional keys
   * @returns {Object} the original object received enhanced
   */

  function defineDefaults(source, defaults) {
    Object.entries(defaults).forEach(_ref2 => {
      let [key, value] = _ref2;
      if (!source[key]) source[key] = value;
    });
    return source;
  }

  /**
   * Quick type checking
   * @param   {*} element - anything
   * @param   {string} type - type definition
   * @returns {boolean} true if the type corresponds
   */
  function checkType(element, type) {
    return typeof element === type;
  }
  /**
   * Check if an element is part of an svg
   * @param   {HTMLElement}  el - element to check
   * @returns {boolean} true if we are in an svg context
   */

  function isSvg(el) {
    const owner = el.ownerSVGElement;
    return !!owner || owner === null;
  }
  /**
   * Check if an element is a template tag
   * @param   {HTMLElement}  el - element to check
   * @returns {boolean} true if it's a <template>
   */

  function isTemplate(el) {
    return el.tagName.toLowerCase() === 'template';
  }
  /**
   * Check that will be passed if its argument is a function
   * @param   {*} value - value to check
   * @returns {boolean} - true if the value is a function
   */

  function isFunction(value) {
    return checkType(value, 'function');
  }
  /**
   * Check if a value is a Boolean
   * @param   {*}  value - anything
   * @returns {boolean} true only for the value is a boolean
   */

  function isBoolean(value) {
    return checkType(value, 'boolean');
  }
  /**
   * Check if a value is an Object
   * @param   {*}  value - anything
   * @returns {boolean} true only for the value is an object
   */

  function isObject(value) {
    return !isNil(value) && value.constructor === Object;
  }
  /**
   * Check if a value is null or undefined
   * @param   {*}  value - anything
   * @returns {boolean} true only for the 'undefined' and 'null' types
   */

  function isNil(value) {
    return value === null || value === undefined;
  }

  /**
   * ISC License
   *
   * Copyright (c) 2020, Andrea Giammarchi, @WebReflection
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
   * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
   * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
   * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
   * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
   * OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
   * PERFORMANCE OF THIS SOFTWARE.
   */
  // fork of https://github.com/WebReflection/udomdiff version 1.1.0
  // due to https://github.com/WebReflection/udomdiff/pull/2

  /* eslint-disable */

  /**
   * @param {Node[]} a The list of current/live children
   * @param {Node[]} b The list of future children
   * @param {(entry: Node, action: number) => Node} get
   * The callback invoked per each entry related DOM operation.
   * @param {Node} [before] The optional node used as anchor to insert before.
   * @returns {Node[]} The same list of future children.
   */

  var udomdiff = ((a, b, get, before) => {
    const bLength = b.length;
    let aEnd = a.length;
    let bEnd = bLength;
    let aStart = 0;
    let bStart = 0;
    let map = null;

    while (aStart < aEnd || bStart < bEnd) {
      // append head, tail, or nodes in between: fast path
      if (aEnd === aStart) {
        // we could be in a situation where the rest of nodes that
        // need to be added are not at the end, and in such case
        // the node to `insertBefore`, if the index is more than 0
        // must be retrieved, otherwise it's gonna be the first item.
        const node = bEnd < bLength ? bStart ? get(b[bStart - 1], -0).nextSibling : get(b[bEnd - bStart], 0) : before;

        while (bStart < bEnd) insertBefore(get(b[bStart++], 1), node);
      } // remove head or tail: fast path
      else if (bEnd === bStart) {
        while (aStart < aEnd) {
          // remove the node only if it's unknown or not live
          if (!map || !map.has(a[aStart])) removeChild(get(a[aStart], -1));
          aStart++;
        }
      } // same node: fast path
      else if (a[aStart] === b[bStart]) {
        aStart++;
        bStart++;
      } // same tail: fast path
      else if (a[aEnd - 1] === b[bEnd - 1]) {
        aEnd--;
        bEnd--;
      } // The once here single last swap "fast path" has been removed in v1.1.0
      // https://github.com/WebReflection/udomdiff/blob/single-final-swap/esm/index.js#L69-L85
      // reverse swap: also fast path
      else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
        // this is a "shrink" operation that could happen in these cases:
        // [1, 2, 3, 4, 5]
        // [1, 4, 3, 2, 5]
        // or asymmetric too
        // [1, 2, 3, 4, 5]
        // [1, 2, 3, 5, 6, 4]
        const node = get(a[--aEnd], -1).nextSibling;
        insertBefore(get(b[bStart++], 1), get(a[aStart++], -1).nextSibling);
        insertBefore(get(b[--bEnd], 1), node); // mark the future index as identical (yeah, it's dirty, but cheap 👍)
        // The main reason to do this, is that when a[aEnd] will be reached,
        // the loop will likely be on the fast path, as identical to b[bEnd].
        // In the best case scenario, the next loop will skip the tail,
        // but in the worst one, this node will be considered as already
        // processed, bailing out pretty quickly from the map index check

        a[aEnd] = b[bEnd];
      } // map based fallback, "slow" path
      else {
        // the map requires an O(bEnd - bStart) operation once
        // to store all future nodes indexes for later purposes.
        // In the worst case scenario, this is a full O(N) cost,
        // and such scenario happens at least when all nodes are different,
        // but also if both first and last items of the lists are different
        if (!map) {
          map = new Map();
          let i = bStart;

          while (i < bEnd) map.set(b[i], i++);
        } // if it's a future node, hence it needs some handling


        if (map.has(a[aStart])) {
          // grab the index of such node, 'cause it might have been processed
          const index = map.get(a[aStart]); // if it's not already processed, look on demand for the next LCS

          if (bStart < index && index < bEnd) {
            let i = aStart; // counts the amount of nodes that are the same in the future

            let sequence = 1;

            while (++i < aEnd && i < bEnd && map.get(a[i]) === index + sequence) sequence++; // effort decision here: if the sequence is longer than replaces
            // needed to reach such sequence, which would brings again this loop
            // to the fast path, prepend the difference before a sequence,
            // and move only the future list index forward, so that aStart
            // and bStart will be aligned again, hence on the fast path.
            // An example considering aStart and bStart are both 0:
            // a: [1, 2, 3, 4]
            // b: [7, 1, 2, 3, 6]
            // this would place 7 before 1 and, from that time on, 1, 2, and 3
            // will be processed at zero cost


            if (sequence > index - bStart) {
              const node = get(a[aStart], 0);

              while (bStart < index) insertBefore(get(b[bStart++], 1), node);
            } // if the effort wasn't good enough, fallback to a replace,
            // moving both source and target indexes forward, hoping that some
            // similar node will be found later on, to go back to the fast path
            else {
              replaceChild(get(b[bStart++], 1), get(a[aStart++], -1));
            }
          } // otherwise move the source forward, 'cause there's nothing to do
          else aStart++;
        } // this node has no meaning in the future list, so it's more than safe
        // to remove it, and check the next live node out instead, meaning
        // that only the live list index should be forwarded
        else removeChild(get(a[aStart++], -1));
      }
    }

    return b;
  });

  const UNMOUNT_SCOPE = Symbol('unmount');
  const EachBinding = {
    // dynamic binding properties
    // childrenMap: null,
    // node: null,
    // root: null,
    // condition: null,
    // evaluate: null,
    // template: null,
    // isTemplateTag: false,
    nodes: [],

    // getKey: null,
    // indexName: null,
    // itemName: null,
    // afterPlaceholder: null,
    // placeholder: null,
    // API methods
    mount(scope, parentScope) {
      return this.update(scope, parentScope);
    },

    update(scope, parentScope) {
      const {
        placeholder,
        nodes,
        childrenMap
      } = this;
      const collection = scope === UNMOUNT_SCOPE ? null : this.evaluate(scope);
      const items = collection ? Array.from(collection) : []; // prepare the diffing

      const {
        newChildrenMap,
        batches,
        futureNodes
      } = createPatch(items, scope, parentScope, this); // patch the DOM only if there are new nodes

      udomdiff(nodes, futureNodes, patch(Array.from(childrenMap.values()), parentScope), placeholder); // trigger the mounts and the updates

      batches.forEach(fn => fn()); // update the children map

      this.childrenMap = newChildrenMap;
      this.nodes = futureNodes;
      return this;
    },

    unmount(scope, parentScope) {
      this.update(UNMOUNT_SCOPE, parentScope);
      return this;
    }

  };
  /**
   * Patch the DOM while diffing
   * @param   {any[]} redundant - list of all the children (template, nodes, context) added via each
   * @param   {*} parentScope - scope of the parent template
   * @returns {Function} patch function used by domdiff
   */

  function patch(redundant, parentScope) {
    return (item, info) => {
      if (info < 0) {
        // get the last element added to the childrenMap saved previously
        const element = redundant[redundant.length - 1];

        if (element) {
          // get the nodes and the template in stored in the last child of the childrenMap
          const {
            template,
            nodes,
            context
          } = element; // remove the last node (notice <template> tags might have more children nodes)

          nodes.pop(); // notice that we pass null as last argument because
          // the root node and its children will be removed by domdiff

          if (!nodes.length) {
            // we have cleared all the children nodes and we can unmount this template
            redundant.pop();
            template.unmount(context, parentScope, null);
          }
        }
      }

      return item;
    };
  }
  /**
   * Check whether a template must be filtered from a loop
   * @param   {Function} condition - filter function
   * @param   {Object} context - argument passed to the filter function
   * @returns {boolean} true if this item should be skipped
   */


  function mustFilterItem(condition, context) {
    return condition ? !condition(context) : false;
  }
  /**
   * Extend the scope of the looped template
   * @param   {Object} scope - current template scope
   * @param   {Object} options - options
   * @param   {string} options.itemName - key to identify the looped item in the new context
   * @param   {string} options.indexName - key to identify the index of the looped item
   * @param   {number} options.index - current index
   * @param   {*} options.item - collection item looped
   * @returns {Object} enhanced scope object
   */


  function extendScope(scope, _ref) {
    let {
      itemName,
      indexName,
      index,
      item
    } = _ref;
    defineProperty(scope, itemName, item);
    if (indexName) defineProperty(scope, indexName, index);
    return scope;
  }
  /**
   * Loop the current template items
   * @param   {Array} items - expression collection value
   * @param   {*} scope - template scope
   * @param   {*} parentScope - scope of the parent template
   * @param   {EachBinding} binding - each binding object instance
   * @returns {Object} data
   * @returns {Map} data.newChildrenMap - a Map containing the new children template structure
   * @returns {Array} data.batches - array containing the template lifecycle functions to trigger
   * @returns {Array} data.futureNodes - array containing the nodes we need to diff
   */


  function createPatch(items, scope, parentScope, binding) {
    const {
      condition,
      template,
      childrenMap,
      itemName,
      getKey,
      indexName,
      root,
      isTemplateTag
    } = binding;
    const newChildrenMap = new Map();
    const batches = [];
    const futureNodes = [];
    items.forEach((item, index) => {
      const context = extendScope(Object.create(scope), {
        itemName,
        indexName,
        index,
        item
      });
      const key = getKey ? getKey(context) : index;
      const oldItem = childrenMap.get(key);
      const nodes = [];

      if (mustFilterItem(condition, context)) {
        return;
      }

      const mustMount = !oldItem;
      const componentTemplate = oldItem ? oldItem.template : template.clone();
      const el = componentTemplate.el || root.cloneNode();
      const meta = isTemplateTag && mustMount ? createTemplateMeta(componentTemplate) : componentTemplate.meta;

      if (mustMount) {
        batches.push(() => componentTemplate.mount(el, context, parentScope, meta));
      } else {
        batches.push(() => componentTemplate.update(context, parentScope));
      } // create the collection of nodes to update or to add
      // in case of template tags we need to add all its children nodes


      if (isTemplateTag) {
        nodes.push(...meta.children);
      } else {
        nodes.push(el);
      } // delete the old item from the children map


      childrenMap.delete(key);
      futureNodes.push(...nodes); // update the children map

      newChildrenMap.set(key, {
        nodes,
        template: componentTemplate,
        context,
        index
      });
    });
    return {
      newChildrenMap,
      batches,
      futureNodes
    };
  }

  function create$6(node, _ref2) {
    let {
      evaluate,
      condition,
      itemName,
      indexName,
      getKey,
      template
    } = _ref2;
    const placeholder = document.createTextNode('');
    const root = node.cloneNode();
    insertBefore(placeholder, node);
    removeChild(node);
    return Object.assign({}, EachBinding, {
      childrenMap: new Map(),
      node,
      root,
      condition,
      evaluate,
      isTemplateTag: isTemplate(root),
      template: template.createDOM(node),
      getKey,
      indexName,
      itemName,
      placeholder
    });
  }

  /**
   * Binding responsible for the `if` directive
   */

  const IfBinding = {
    // dynamic binding properties
    // node: null,
    // evaluate: null,
    // isTemplateTag: false,
    // placeholder: null,
    // template: null,
    // API methods
    mount(scope, parentScope) {
      return this.update(scope, parentScope);
    },

    update(scope, parentScope) {
      const value = !!this.evaluate(scope);
      const mustMount = !this.value && value;
      const mustUnmount = this.value && !value;

      const mount = () => {
        const pristine = this.node.cloneNode();
        insertBefore(pristine, this.placeholder);
        this.template = this.template.clone();
        this.template.mount(pristine, scope, parentScope);
      };

      switch (true) {
        case mustMount:
          mount();
          break;

        case mustUnmount:
          this.unmount(scope);
          break;

        default:
          if (value) this.template.update(scope, parentScope);
      }

      this.value = value;
      return this;
    },

    unmount(scope, parentScope) {
      this.template.unmount(scope, parentScope, true);
      return this;
    }

  };
  function create$5(node, _ref) {
    let {
      evaluate,
      template
    } = _ref;
    const placeholder = document.createTextNode('');
    insertBefore(placeholder, node);
    removeChild(node);
    return Object.assign({}, IfBinding, {
      node,
      evaluate,
      placeholder,
      template: template.createDOM(node)
    });
  }

  /**
   * Throw an error with a descriptive message
   * @param   { string } message - error message
   * @returns { undefined } hoppla.. at this point the program should stop working
   */

  function panic(message) {
    throw new Error(message);
  }
  /**
   * Returns the memoized (cached) function.
   * // borrowed from https://www.30secondsofcode.org/js/s/memoize
   * @param {Function} fn - function to memoize
   * @returns {Function} memoize function
   */

  function memoize(fn) {
    const cache = new Map();

    const cached = val => {
      return cache.has(val) ? cache.get(val) : cache.set(val, fn.call(this, val)) && cache.get(val);
    };

    cached.cache = cache;
    return cached;
  }
  /**
   * Evaluate a list of attribute expressions
   * @param   {Array} attributes - attribute expressions generated by the riot compiler
   * @returns {Object} key value pairs with the result of the computation
   */

  function evaluateAttributeExpressions(attributes) {
    return attributes.reduce((acc, attribute) => {
      const {
        value,
        type
      } = attribute;

      switch (true) {
        // spread attribute
        case !attribute.name && type === ATTRIBUTE:
          return Object.assign({}, acc, value);
        // value attribute

        case type === VALUE:
          acc.value = attribute.value;
          break;
        // normal attributes

        default:
          acc[dashToCamelCase(attribute.name)] = attribute.value;
      }

      return acc;
    }, {});
  }

  const ElementProto = typeof Element === 'undefined' ? {} : Element.prototype;
  const isNativeHtmlProperty = memoize(name => ElementProto.hasOwnProperty(name)); // eslint-disable-line

  /**
   * Add all the attributes provided
   * @param   {HTMLElement} node - target node
   * @param   {Object} attributes - object containing the attributes names and values
   * @returns {undefined} sorry it's a void function :(
   */

  function setAllAttributes(node, attributes) {
    Object.entries(attributes).forEach(_ref => {
      let [name, value] = _ref;
      return attributeExpression(node, {
        name
      }, value);
    });
  }
  /**
   * Remove all the attributes provided
   * @param   {HTMLElement} node - target node
   * @param   {Object} newAttributes - object containing all the new attribute names
   * @param   {Object} oldAttributes - object containing all the old attribute names
   * @returns {undefined} sorry it's a void function :(
   */


  function removeAllAttributes(node, newAttributes, oldAttributes) {
    const newKeys = newAttributes ? Object.keys(newAttributes) : [];
    Object.keys(oldAttributes).filter(name => !newKeys.includes(name)).forEach(attribute => node.removeAttribute(attribute));
  }
  /**
   * Check whether the attribute value can be rendered
   * @param {*} value - expression value
   * @returns {boolean} true if we can render this attribute value
   */


  function canRenderAttribute(value) {
    return value === true || ['string', 'number'].includes(typeof value);
  }
  /**
   * Check whether the attribute should be removed
   * @param {*} value - expression value
   * @returns {boolean} boolean - true if the attribute can be removed}
   */


  function shouldRemoveAttribute(value) {
    return !value && value !== 0;
  }
  /**
   * This methods handles the DOM attributes updates
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {string} expression.name - attribute name
   * @param   {*} value - new expression value
   * @param   {*} oldValue - the old expression cached value
   * @returns {undefined}
   */


  function attributeExpression(node, _ref2, value, oldValue) {
    let {
      name
    } = _ref2;

    // is it a spread operator? {...attributes}
    if (!name) {
      if (oldValue) {
        // remove all the old attributes
        removeAllAttributes(node, value, oldValue);
      } // is the value still truthy?


      if (value) {
        setAllAttributes(node, value);
      }

      return;
    } // handle boolean attributes


    if (!isNativeHtmlProperty(name) && (isBoolean(value) || isObject(value) || isFunction(value))) {
      node[name] = value;
    }

    if (shouldRemoveAttribute(value)) {
      node.removeAttribute(name);
    } else if (canRenderAttribute(value)) {
      node.setAttribute(name, normalizeValue(name, value));
    }
  }
  /**
   * Get the value as string
   * @param   {string} name - attribute name
   * @param   {*} value - user input value
   * @returns {string} input value as string
   */

  function normalizeValue(name, value) {
    // be sure that expressions like selected={ true } will be always rendered as selected='selected'
    return value === true ? name : value;
  }

  const RE_EVENTS_PREFIX = /^on/;

  const getCallbackAndOptions = value => Array.isArray(value) ? value : [value, false]; // see also https://medium.com/@WebReflection/dom-handleevent-a-cross-platform-standard-since-year-2000-5bf17287fd38


  const EventListener = {
    handleEvent(event) {
      this[event.type](event);
    }

  };
  const ListenersWeakMap = new WeakMap();

  const createListener = node => {
    const listener = Object.create(EventListener);
    ListenersWeakMap.set(node, listener);
    return listener;
  };
  /**
   * Set a new event listener
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {string} expression.name - event name
   * @param   {*} value - new expression value
   * @returns {value} the callback just received
   */


  function eventExpression(node, _ref, value) {
    let {
      name
    } = _ref;
    const normalizedEventName = name.replace(RE_EVENTS_PREFIX, '');
    const eventListener = ListenersWeakMap.get(node) || createListener(node);
    const [callback, options] = getCallbackAndOptions(value);
    const handler = eventListener[normalizedEventName];
    const mustRemoveEvent = handler && !callback;
    const mustAddEvent = callback && !handler;

    if (mustRemoveEvent) {
      node.removeEventListener(normalizedEventName, eventListener);
    }

    if (mustAddEvent) {
      node.addEventListener(normalizedEventName, eventListener, options);
    }

    eventListener[normalizedEventName] = callback;
  }

  /**
   * Normalize the user value in order to render a empty string in case of falsy values
   * @param   {*} value - user input value
   * @returns {string} hopefully a string
   */

  function normalizeStringValue(value) {
    return isNil(value) ? '' : value;
  }

  /**
   * Get the the target text node to update or create one from of a comment node
   * @param   {HTMLElement} node - any html element containing childNodes
   * @param   {number} childNodeIndex - index of the text node in the childNodes list
   * @returns {Text} the text node to update
   */

  const getTextNode = (node, childNodeIndex) => {
    const target = node.childNodes[childNodeIndex];

    if (target.nodeType === Node.COMMENT_NODE) {
      const textNode = document.createTextNode('');
      node.replaceChild(textNode, target);
      return textNode;
    }

    return target;
  };
  /**
   * This methods handles a simple text expression update
   * @param   {HTMLElement} node - target node
   * @param   {Object} data - expression object
   * @param   {*} value - new expression value
   * @returns {undefined}
   */

  function textExpression(node, data, value) {
    node.data = normalizeStringValue(value);
  }

  /**
   * This methods handles the input fileds value updates
   * @param   {HTMLElement} node - target node
   * @param   {Object} expression - expression object
   * @param   {*} value - new expression value
   * @returns {undefined}
   */

  function valueExpression(node, expression, value) {
    node.value = normalizeStringValue(value);
  }

  var expressions = {
    [ATTRIBUTE]: attributeExpression,
    [EVENT]: eventExpression,
    [TEXT]: textExpression,
    [VALUE]: valueExpression
  };

  const Expression = {
    // Static props
    // node: null,
    // value: null,
    // API methods

    /**
     * Mount the expression evaluating its initial value
     * @param   {*} scope - argument passed to the expression to evaluate its current values
     * @returns {Expression} self
     */
    mount(scope) {
      // hopefully a pure function
      this.value = this.evaluate(scope); // IO() DOM updates

      apply(this, this.value);
      return this;
    },

    /**
     * Update the expression if its value changed
     * @param   {*} scope - argument passed to the expression to evaluate its current values
     * @returns {Expression} self
     */
    update(scope) {
      // pure function
      const value = this.evaluate(scope);

      if (this.value !== value) {
        // IO() DOM updates
        apply(this, value);
        this.value = value;
      }

      return this;
    },

    /**
     * Expression teardown method
     * @returns {Expression} self
     */
    unmount() {
      // unmount only the event handling expressions
      if (this.type === EVENT) apply(this, null);
      return this;
    }

  };
  /**
   * IO() function to handle the DOM updates
   * @param {Expression} expression - expression object
   * @param {*} value - current expression value
   * @returns {undefined}
   */

  function apply(expression, value) {
    return expressions[expression.type](expression.node, expression, value, expression.value);
  }

  function create$4(node, data) {
    return Object.assign({}, Expression, data, {
      node: data.type === TEXT ? getTextNode(node, data.childNodeIndex) : node
    });
  }

  /**
   * Create a flat object having as keys a list of methods that if dispatched will propagate
   * on the whole collection
   * @param   {Array} collection - collection to iterate
   * @param   {Array<string>} methods - methods to execute on each item of the collection
   * @param   {*} context - context returned by the new methods created
   * @returns {Object} a new object to simplify the the nested methods dispatching
   */
  function flattenCollectionMethods(collection, methods, context) {
    return methods.reduce((acc, method) => {
      return Object.assign({}, acc, {
        [method]: scope => {
          return collection.map(item => item[method](scope)) && context;
        }
      });
    }, {});
  }

  function create$3(node, _ref) {
    let {
      expressions
    } = _ref;
    return Object.assign({}, flattenCollectionMethods(expressions.map(expression => create$4(node, expression)), ['mount', 'update', 'unmount']));
  }

  function extendParentScope(attributes, scope, parentScope) {
    if (!attributes || !attributes.length) return parentScope;
    const expressions = attributes.map(attr => Object.assign({}, attr, {
      value: attr.evaluate(scope)
    }));
    return Object.assign(Object.create(parentScope || null), evaluateAttributeExpressions(expressions));
  } // this function is only meant to fix an edge case
  // https://github.com/riot/riot/issues/2842


  const getRealParent = (scope, parentScope) => scope[PARENT_KEY_SYMBOL] || parentScope;

  const SlotBinding = {
    // dynamic binding properties
    // node: null,
    // name: null,
    attributes: [],

    // template: null,
    getTemplateScope(scope, parentScope) {
      return extendParentScope(this.attributes, scope, parentScope);
    },

    // API methods
    mount(scope, parentScope) {
      const templateData = scope.slots ? scope.slots.find(_ref => {
        let {
          id
        } = _ref;
        return id === this.name;
      }) : false;
      const {
        parentNode
      } = this.node;
      const realParent = getRealParent(scope, parentScope);
      this.template = templateData && create(templateData.html, templateData.bindings).createDOM(parentNode);

      if (this.template) {
        cleanNode(this.node);
        this.template.mount(this.node, this.getTemplateScope(scope, realParent), realParent);
        this.template.children = Array.from(this.node.childNodes);
      }

      moveSlotInnerContent(this.node);
      removeChild(this.node);
      return this;
    },

    update(scope, parentScope) {
      if (this.template) {
        const realParent = getRealParent(scope, parentScope);
        this.template.update(this.getTemplateScope(scope, realParent), realParent);
      }

      return this;
    },

    unmount(scope, parentScope, mustRemoveRoot) {
      if (this.template) {
        this.template.unmount(this.getTemplateScope(scope, parentScope), null, mustRemoveRoot);
      }

      return this;
    }

  };
  /**
   * Move the inner content of the slots outside of them
   * @param   {HTMLElement} slot - slot node
   * @returns {undefined} it's a void method ¯\_(ツ)_/¯
   */

  function moveSlotInnerContent(slot) {
    const child = slot && slot.firstChild;
    if (!child) return;
    insertBefore(child, slot);
    moveSlotInnerContent(slot);
  }
  /**
   * Create a single slot binding
   * @param   {HTMLElement} node - slot node
   * @param   {string} name - slot id
   * @param   {AttributeExpressionData[]} attributes - slot attributes
   * @returns {Object} Slot binding object
   */


  function createSlot(node, _ref2) {
    let {
      name,
      attributes
    } = _ref2;
    return Object.assign({}, SlotBinding, {
      attributes,
      node,
      name
    });
  }

  /**
   * Create a new tag object if it was registered before, otherwise fallback to the simple
   * template chunk
   * @param   {Function} component - component factory function
   * @param   {Array<Object>} slots - array containing the slots markup
   * @param   {Array} attributes - dynamic attributes that will be received by the tag element
   * @returns {TagImplementation|TemplateChunk} a tag implementation or a template chunk as fallback
   */

  function getTag(component, slots, attributes) {
    if (slots === void 0) {
      slots = [];
    }

    if (attributes === void 0) {
      attributes = [];
    }

    // if this tag was registered before we will return its implementation
    if (component) {
      return component({
        slots,
        attributes
      });
    } // otherwise we return a template chunk


    return create(slotsToMarkup(slots), [...slotBindings(slots), {
      // the attributes should be registered as binding
      // if we fallback to a normal template chunk
      expressions: attributes.map(attr => {
        return Object.assign({
          type: ATTRIBUTE
        }, attr);
      })
    }]);
  }
  /**
   * Merge all the slots bindings into a single array
   * @param   {Array<Object>} slots - slots collection
   * @returns {Array<Bindings>} flatten bindings array
   */


  function slotBindings(slots) {
    return slots.reduce((acc, _ref) => {
      let {
        bindings
      } = _ref;
      return acc.concat(bindings);
    }, []);
  }
  /**
   * Merge all the slots together in a single markup string
   * @param   {Array<Object>} slots - slots collection
   * @returns {string} markup of all the slots in a single string
   */


  function slotsToMarkup(slots) {
    return slots.reduce((acc, slot) => {
      return acc + slot.html;
    }, '');
  }

  const TagBinding = {
    // dynamic binding properties
    // node: null,
    // evaluate: null,
    // name: null,
    // slots: null,
    // tag: null,
    // attributes: null,
    // getComponent: null,
    mount(scope) {
      return this.update(scope);
    },

    update(scope, parentScope) {
      const name = this.evaluate(scope); // simple update

      if (name && name === this.name) {
        this.tag.update(scope);
      } else {
        // unmount the old tag if it exists
        this.unmount(scope, parentScope, true); // mount the new tag

        this.name = name;
        this.tag = getTag(this.getComponent(name), this.slots, this.attributes);
        this.tag.mount(this.node, scope);
      }

      return this;
    },

    unmount(scope, parentScope, keepRootTag) {
      if (this.tag) {
        // keep the root tag
        this.tag.unmount(keepRootTag);
      }

      return this;
    }

  };
  function create$2(node, _ref2) {
    let {
      evaluate,
      getComponent,
      slots,
      attributes
    } = _ref2;
    return Object.assign({}, TagBinding, {
      node,
      evaluate,
      slots,
      attributes,
      getComponent
    });
  }

  var bindings = {
    [IF]: create$5,
    [SIMPLE]: create$3,
    [EACH]: create$6,
    [TAG]: create$2,
    [SLOT]: createSlot
  };

  /**
   * Text expressions in a template tag will get childNodeIndex value normalized
   * depending on the position of the <template> tag offset
   * @param   {Expression[]} expressions - riot expressions array
   * @param   {number} textExpressionsOffset - offset of the <template> tag
   * @returns {Expression[]} expressions containing the text expressions normalized
   */

  function fixTextExpressionsOffset(expressions, textExpressionsOffset) {
    return expressions.map(e => e.type === TEXT ? Object.assign({}, e, {
      childNodeIndex: e.childNodeIndex + textExpressionsOffset
    }) : e);
  }
  /**
   * Bind a new expression object to a DOM node
   * @param   {HTMLElement} root - DOM node where to bind the expression
   * @param   {TagBindingData} binding - binding data
   * @param   {number|null} templateTagOffset - if it's defined we need to fix the text expressions childNodeIndex offset
   * @returns {Binding} Binding object
   */


  function create$1(root, binding, templateTagOffset) {
    const {
      selector,
      type,
      redundantAttribute,
      expressions
    } = binding; // find the node to apply the bindings

    const node = selector ? root.querySelector(selector) : root; // remove eventually additional attributes created only to select this node

    if (redundantAttribute) node.removeAttribute(redundantAttribute);
    const bindingExpressions = expressions || []; // init the binding

    return (bindings[type] || bindings[SIMPLE])(node, Object.assign({}, binding, {
      expressions: templateTagOffset && !selector ? fixTextExpressionsOffset(bindingExpressions, templateTagOffset) : bindingExpressions
    }));
  }

  function createHTMLTree(html, root) {
    const template = isTemplate(root) ? root : document.createElement('template');
    template.innerHTML = html;
    return template.content;
  } // for svg nodes we need a bit more work


  function createSVGTree(html, container) {
    // create the SVGNode
    const svgNode = container.ownerDocument.importNode(new window.DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${html}</svg>`, 'application/xml').documentElement, true);
    return svgNode;
  }
  /**
   * Create the DOM that will be injected
   * @param {Object} root - DOM node to find out the context where the fragment will be created
   * @param   {string} html - DOM to create as string
   * @returns {HTMLDocumentFragment|HTMLElement} a new html fragment
   */


  function createDOMTree(root, html) {
    if (isSvg(root)) return createSVGTree(html, root);
    return createHTMLTree(html, root);
  }

  /**
   * Inject the DOM tree into a target node
   * @param   {HTMLElement} el - target element
   * @param   {DocumentFragment|SVGElement} dom - dom tree to inject
   * @returns {undefined}
   */

  function injectDOM(el, dom) {
    switch (true) {
      case isSvg(el):
        moveChildren(dom, el);
        break;

      case isTemplate(el):
        el.parentNode.replaceChild(dom, el);
        break;

      default:
        el.appendChild(dom);
    }
  }

  /**
   * Create the Template DOM skeleton
   * @param   {HTMLElement} el - root node where the DOM will be injected
   * @param   {string|HTMLElement} html - HTML markup or HTMLElement that will be injected into the root node
   * @returns {?DocumentFragment} fragment that will be injected into the root node
   */

  function createTemplateDOM(el, html) {
    return html && (typeof html === 'string' ? createDOMTree(el, html) : html);
  }
  /**
   * Get the offset of the <template> tag
   * @param {HTMLElement} parentNode - template tag parent node
   * @param {HTMLElement} el - the template tag we want to render
   * @param   {Object} meta - meta properties needed to handle the <template> tags in loops
   * @returns {number} offset of the <template> tag calculated from its siblings DOM nodes
   */


  function getTemplateTagOffset(parentNode, el, meta) {
    const siblings = Array.from(parentNode.childNodes);
    return Math.max(siblings.indexOf(el), siblings.indexOf(meta.head) + 1, 0);
  }
  /**
   * Template Chunk model
   * @type {Object}
   */


  const TemplateChunk = Object.freeze({
    // Static props
    // bindings: null,
    // bindingsData: null,
    // html: null,
    // isTemplateTag: false,
    // fragment: null,
    // children: null,
    // dom: null,
    // el: null,

    /**
     * Create the template DOM structure that will be cloned on each mount
     * @param   {HTMLElement} el - the root node
     * @returns {TemplateChunk} self
     */
    createDOM(el) {
      // make sure that the DOM gets created before cloning the template
      this.dom = this.dom || createTemplateDOM(el, this.html) || document.createDocumentFragment();
      return this;
    },

    // API methods

    /**
     * Attach the template to a DOM node
     * @param   {HTMLElement} el - target DOM node
     * @param   {*} scope - template data
     * @param   {*} parentScope - scope of the parent template tag
     * @param   {Object} meta - meta properties needed to handle the <template> tags in loops
     * @returns {TemplateChunk} self
     */
    mount(el, scope, parentScope, meta) {
      if (meta === void 0) {
        meta = {};
      }

      if (!el) throw new Error('Please provide DOM node to mount properly your template');
      if (this.el) this.unmount(scope); // <template> tags require a bit more work
      // the template fragment might be already created via meta outside of this call

      const {
        fragment,
        children,
        avoidDOMInjection
      } = meta; // <template> bindings of course can not have a root element
      // so we check the parent node to set the query selector bindings

      const {
        parentNode
      } = children ? children[0] : el;
      const isTemplateTag = isTemplate(el);
      const templateTagOffset = isTemplateTag ? getTemplateTagOffset(parentNode, el, meta) : null; // create the DOM if it wasn't created before

      this.createDOM(el); // create the DOM of this template cloning the original DOM structure stored in this instance
      // notice that if a documentFragment was passed (via meta) we will use it instead

      const cloneNode = fragment || this.dom.cloneNode(true); // store root node
      // notice that for template tags the root note will be the parent tag

      this.el = isTemplateTag ? parentNode : el; // create the children array only for the <template> fragments

      this.children = isTemplateTag ? children || Array.from(cloneNode.childNodes) : null; // inject the DOM into the el only if a fragment is available

      if (!avoidDOMInjection && cloneNode) injectDOM(el, cloneNode); // create the bindings

      this.bindings = this.bindingsData.map(binding => create$1(this.el, binding, templateTagOffset));
      this.bindings.forEach(b => b.mount(scope, parentScope)); // store the template meta properties

      this.meta = meta;
      return this;
    },

    /**
     * Update the template with fresh data
     * @param   {*} scope - template data
     * @param   {*} parentScope - scope of the parent template tag
     * @returns {TemplateChunk} self
     */
    update(scope, parentScope) {
      this.bindings.forEach(b => b.update(scope, parentScope));
      return this;
    },

    /**
     * Remove the template from the node where it was initially mounted
     * @param   {*} scope - template data
     * @param   {*} parentScope - scope of the parent template tag
     * @param   {boolean|null} mustRemoveRoot - if true remove the root element,
     * if false or undefined clean the root tag content, if null don't touch the DOM
     * @returns {TemplateChunk} self
     */
    unmount(scope, parentScope, mustRemoveRoot) {
      if (mustRemoveRoot === void 0) {
        mustRemoveRoot = false;
      }

      const el = this.el;

      if (!el) {
        return this;
      }

      this.bindings.forEach(b => b.unmount(scope, parentScope, mustRemoveRoot));

      switch (true) {
        // pure components should handle the DOM unmount updates by themselves
        // for mustRemoveRoot === null don't touch the DOM
        case el[IS_PURE_SYMBOL] || mustRemoveRoot === null:
          break;
        // if children are declared, clear them
        // applicable for <template> and <slot/> bindings

        case Array.isArray(this.children):
          clearChildren(this.children);
          break;
        // clean the node children only

        case !mustRemoveRoot:
          cleanNode(el);
          break;
        // remove the root node only if the mustRemoveRoot is truly

        case !!mustRemoveRoot:
          removeChild(el);
          break;
      }

      this.el = null;
      return this;
    },

    /**
     * Clone the template chunk
     * @returns {TemplateChunk} a clone of this object resetting the this.el property
     */
    clone() {
      return Object.assign({}, this, {
        meta: {},
        el: null
      });
    }

  });
  /**
   * Create a template chunk wiring also the bindings
   * @param   {string|HTMLElement} html - template string
   * @param   {BindingData[]} bindings - bindings collection
   * @returns {TemplateChunk} a new TemplateChunk copy
   */

  function create(html, bindings) {
    if (bindings === void 0) {
      bindings = [];
    }

    return Object.assign({}, TemplateChunk, {
      html,
      bindingsData: bindings
    });
  }

  function noop() {
    return this;
  }
  /**
   * Autobind the methods of a source object to itself
   * @param   {Object} source - probably a riot tag instance
   * @param   {Array<string>} methods - list of the methods to autobind
   * @returns {Object} the original object received
   */

  function autobindMethods(source, methods) {
    methods.forEach(method => {
      source[method] = source[method].bind(source);
    });
    return source;
  }
  /**
   * Call the first argument received only if it's a function otherwise return it as it is
   * @param   {*} source - anything
   * @returns {*} anything
   */

  function callOrAssign(source) {
    return isFunction(source) ? source.prototype && source.prototype.constructor ? new source() : source() : source;
  }

  /**
   * Converts any DOM node/s to a loopable array
   * @param   { HTMLElement|NodeList } els - single html element or a node list
   * @returns { Array } always a loopable object
   */
  function domToArray(els) {
    // can this object be already looped?
    if (!Array.isArray(els)) {
      // is it a node list?
      if (/^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(els)) && typeof els.length === 'number') return Array.from(els);else // if it's a single node
        // it will be returned as "array" with one single entry
        return [els];
    } // this object could be looped out of the box


    return els;
  }

  /**
   * Simple helper to find DOM nodes returning them as array like loopable object
   * @param   { string|DOMNodeList } selector - either the query or the DOM nodes to arraify
   * @param   { HTMLElement }        ctx      - context defining where the query will search for the DOM nodes
   * @returns { Array } DOM nodes found as array
   */

  function $$1(selector, ctx) {
    return domToArray(typeof selector === 'string' ? (ctx || document).querySelectorAll(selector) : selector);
  }

  /**
   * Normalize the return values, in case of a single value we avoid to return an array
   * @param   { Array } values - list of values we want to return
   * @returns { Array|string|boolean } either the whole list of values or the single one found
   * @private
   */

  const normalize = values => values.length === 1 ? values[0] : values;
  /**
   * Parse all the nodes received to get/remove/check their attributes
   * @param   { HTMLElement|NodeList|Array } els    - DOM node/s to parse
   * @param   { string|Array }               name   - name or list of attributes
   * @param   { string }                     method - method that will be used to parse the attributes
   * @returns { Array|string } result of the parsing in a list or a single value
   * @private
   */


  function parseNodes(els, name, method) {
    const names = typeof name === 'string' ? [name] : name;
    return normalize(domToArray(els).map(el => {
      return normalize(names.map(n => el[method](n)));
    }));
  }
  /**
   * Set any attribute on a single or a list of DOM nodes
   * @param   { HTMLElement|NodeList|Array } els   - DOM node/s to parse
   * @param   { string|Object }              name  - either the name of the attribute to set
   *                                                 or a list of properties as object key - value
   * @param   { string }                     value - the new value of the attribute (optional)
   * @returns { HTMLElement|NodeList|Array } the original array of elements passed to this function
   *
   * @example
   *
   * import { set } from 'bianco.attr'
   *
   * const img = document.createElement('img')
   *
   * set(img, 'width', 100)
   *
   * // or also
   * set(img, {
   *   width: 300,
   *   height: 300
   * })
   *
   */


  function set(els, name, value) {
    const attrs = typeof name === 'object' ? name : {
      [name]: value
    };
    const props = Object.keys(attrs);
    domToArray(els).forEach(el => {
      props.forEach(prop => el.setAttribute(prop, attrs[prop]));
    });
    return els;
  }
  /**
   * Get any attribute from a single or a list of DOM nodes
   * @param   { HTMLElement|NodeList|Array } els   - DOM node/s to parse
   * @param   { string|Array }               name  - name or list of attributes to get
   * @returns { Array|string } list of the attributes found
   *
   * @example
   *
   * import { get } from 'bianco.attr'
   *
   * const img = document.createElement('img')
   *
   * get(img, 'width') // => '200'
   *
   * // or also
   * get(img, ['width', 'height']) // => ['200', '300']
   *
   * // or also
   * get([img1, img2], ['width', 'height']) // => [['200', '300'], ['500', '200']]
   */

  function get(els, name) {
    return parseNodes(els, name, 'getAttribute');
  }

  const CSS_BY_NAME = new Map();
  const STYLE_NODE_SELECTOR = 'style[riot]'; // memoized curried function

  const getStyleNode = (style => {
    return () => {
      // lazy evaluation:
      // if this function was already called before
      // we return its cached result
      if (style) return style; // create a new style element or use an existing one
      // and cache it internally

      style = $$1(STYLE_NODE_SELECTOR)[0] || document.createElement('style');
      set(style, 'type', 'text/css');
      /* istanbul ignore next */

      if (!style.parentNode) document.head.appendChild(style);
      return style;
    };
  })();
  /**
   * Object that will be used to inject and manage the css of every tag instance
   */


  var cssManager = {
    CSS_BY_NAME,

    /**
     * Save a tag style to be later injected into DOM
     * @param { string } name - if it's passed we will map the css to a tagname
     * @param { string } css - css string
     * @returns {Object} self
     */
    add(name, css) {
      if (!CSS_BY_NAME.has(name)) {
        CSS_BY_NAME.set(name, css);
        this.inject();
      }

      return this;
    },

    /**
     * Inject all previously saved tag styles into DOM
     * innerHTML seems slow: http://jsperf.com/riot-insert-style
     * @returns {Object} self
     */
    inject() {
      getStyleNode().innerHTML = [...CSS_BY_NAME.values()].join('\n');
      return this;
    },

    /**
     * Remove a tag style from the DOM
     * @param {string} name a registered tagname
     * @returns {Object} self
     */
    remove(name) {
      if (CSS_BY_NAME.has(name)) {
        CSS_BY_NAME.delete(name);
        this.inject();
      }

      return this;
    }

  };

  /**
   * Function to curry any javascript method
   * @param   {Function}  fn - the target function we want to curry
   * @param   {...[args]} acc - initial arguments
   * @returns {Function|*} it will return a function until the target function
   *                       will receive all of its arguments
   */
  function curry(fn) {
    for (var _len = arguments.length, acc = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      acc[_key - 1] = arguments[_key];
    }

    return function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      args = [...acc, ...args];
      return args.length < fn.length ? curry(fn, ...args) : fn(...args);
    };
  }

  /**
   * Get the tag name of any DOM node
   * @param   {HTMLElement} element - DOM node we want to inspect
   * @returns {string} name to identify this dom node in riot
   */

  function getName(element) {
    return get(element, IS_DIRECTIVE) || element.tagName.toLowerCase();
  }

  const COMPONENT_CORE_HELPERS = Object.freeze({
    // component helpers
    $(selector) {
      return $$1(selector, this.root)[0];
    },

    $$(selector) {
      return $$1(selector, this.root);
    }

  });
  const PURE_COMPONENT_API = Object.freeze({
    [MOUNT_METHOD_KEY]: noop,
    [UPDATE_METHOD_KEY]: noop,
    [UNMOUNT_METHOD_KEY]: noop
  });
  const COMPONENT_LIFECYCLE_METHODS = Object.freeze({
    [SHOULD_UPDATE_KEY]: noop,
    [ON_BEFORE_MOUNT_KEY]: noop,
    [ON_MOUNTED_KEY]: noop,
    [ON_BEFORE_UPDATE_KEY]: noop,
    [ON_UPDATED_KEY]: noop,
    [ON_BEFORE_UNMOUNT_KEY]: noop,
    [ON_UNMOUNTED_KEY]: noop
  });
  const MOCKED_TEMPLATE_INTERFACE = Object.assign({}, PURE_COMPONENT_API, {
    clone: noop,
    createDOM: noop
  });
  /**
   * Performance optimization for the recursive components
   * @param  {RiotComponentWrapper} componentWrapper - riot compiler generated object
   * @returns {Object} component like interface
   */

  const memoizedCreateComponent = memoize(createComponent);
  /**
   * Evaluate the component properties either from its real attributes or from its initial user properties
   * @param   {HTMLElement} element - component root
   * @param   {Object}  initialProps - initial props
   * @returns {Object} component props key value pairs
   */

  function evaluateInitialProps(element, initialProps) {
    if (initialProps === void 0) {
      initialProps = {};
    }

    return Object.assign({}, DOMattributesToObject(element), callOrAssign(initialProps));
  }
  /**
   * Bind a DOM node to its component object
   * @param   {HTMLElement} node - html node mounted
   * @param   {Object} component - Riot.js component object
   * @returns {Object} the component object received as second argument
   */


  const bindDOMNodeToComponentObject = (node, component) => node[DOM_COMPONENT_INSTANCE_PROPERTY$1] = component;
  /**
   * Wrap the Riot.js core API methods using a mapping function
   * @param   {Function} mapFunction - lifting function
   * @returns {Object} an object having the { mount, update, unmount } functions
   */


  function createCoreAPIMethods(mapFunction) {
    return [MOUNT_METHOD_KEY, UPDATE_METHOD_KEY, UNMOUNT_METHOD_KEY].reduce((acc, method) => {
      acc[method] = mapFunction(method);
      return acc;
    }, {});
  }
  /**
   * Factory function to create the component templates only once
   * @param   {Function} template - component template creation function
   * @param   {RiotComponentWrapper} componentWrapper - riot compiler generated object
   * @returns {TemplateChunk} template chunk object
   */


  function componentTemplateFactory(template, componentWrapper) {
    const components = createSubcomponents(componentWrapper.exports ? componentWrapper.exports.components : {});
    return template(create, expressionTypes, bindingTypes, name => {
      // improve support for recursive components
      if (name === componentWrapper.name) return memoizedCreateComponent(componentWrapper); // return the registered components

      return components[name] || COMPONENTS_IMPLEMENTATION_MAP$1.get(name);
    });
  }
  /**
   * Create a pure component
   * @param   {Function} pureFactoryFunction - pure component factory function
   * @param   {Array} options.slots - component slots
   * @param   {Array} options.attributes - component attributes
   * @param   {Array} options.template - template factory function
   * @param   {Array} options.template - template factory function
   * @param   {any} options.props - initial component properties
   * @returns {Object} pure component object
   */


  function createPureComponent(pureFactoryFunction, _ref) {
    let {
      slots,
      attributes,
      props,
      css,
      template
    } = _ref;
    if (template) panic('Pure components can not have html');
    if (css) panic('Pure components do not have css');
    const component = defineDefaults(pureFactoryFunction({
      slots,
      attributes,
      props
    }), PURE_COMPONENT_API);
    return createCoreAPIMethods(method => function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // intercept the mount calls to bind the DOM node to the pure object created
      // see also https://github.com/riot/riot/issues/2806
      if (method === MOUNT_METHOD_KEY) {
        const [element] = args; // mark this node as pure element

        defineProperty(element, IS_PURE_SYMBOL, true);
        bindDOMNodeToComponentObject(element, component);
      }

      component[method](...args);
      return component;
    });
  }
  /**
   * Create the component interface needed for the @riotjs/dom-bindings tag bindings
   * @param   {RiotComponentWrapper} componentWrapper - riot compiler generated object
   * @param   {string} componentWrapper.css - component css
   * @param   {Function} componentWrapper.template - function that will return the dom-bindings template function
   * @param   {Object} componentWrapper.exports - component interface
   * @param   {string} componentWrapper.name - component name
   * @returns {Object} component like interface
   */


  function createComponent(componentWrapper) {
    const {
      css,
      template,
      exports,
      name
    } = componentWrapper;
    const templateFn = template ? componentTemplateFactory(template, componentWrapper) : MOCKED_TEMPLATE_INTERFACE;
    return _ref2 => {
      let {
        slots,
        attributes,
        props
      } = _ref2;
      // pure components rendering will be managed by the end user
      if (exports && exports[IS_PURE_SYMBOL]) return createPureComponent(exports, {
        slots,
        attributes,
        props,
        css,
        template
      });
      const componentAPI = callOrAssign(exports) || {};
      const component = defineComponent({
        css,
        template: templateFn,
        componentAPI,
        name
      })({
        slots,
        attributes,
        props
      }); // notice that for the components create via tag binding
      // we need to invert the mount (state/parentScope) arguments
      // the template bindings will only forward the parentScope updates
      // and never deal with the component state

      return {
        mount(element, parentScope, state) {
          return component.mount(element, state, parentScope);
        },

        update(parentScope, state) {
          return component.update(state, parentScope);
        },

        unmount(preserveRoot) {
          return component.unmount(preserveRoot);
        }

      };
    };
  }
  /**
   * Component definition function
   * @param   {Object} implementation - the componen implementation will be generated via compiler
   * @param   {Object} component - the component initial properties
   * @returns {Object} a new component implementation object
   */

  function defineComponent(_ref3) {
    let {
      css,
      template,
      componentAPI,
      name
    } = _ref3;
    // add the component css into the DOM
    if (css && name) cssManager.add(name, css);
    return curry(enhanceComponentAPI)(defineProperties( // set the component defaults without overriding the original component API
    defineDefaults(componentAPI, Object.assign({}, COMPONENT_LIFECYCLE_METHODS, {
      [PROPS_KEY]: {},
      [STATE_KEY]: {}
    })), Object.assign({
      // defined during the component creation
      [SLOTS_KEY]: null,
      [ROOT_KEY]: null
    }, COMPONENT_CORE_HELPERS, {
      name,
      css,
      template
    })));
  }
  /**
   * Create the bindings to update the component attributes
   * @param   {HTMLElement} node - node where we will bind the expressions
   * @param   {Array} attributes - list of attribute bindings
   * @returns {TemplateChunk} - template bindings object
   */

  function createAttributeBindings(node, attributes) {
    if (attributes === void 0) {
      attributes = [];
    }

    const expressions = attributes.map(a => create$4(node, a));
    const binding = {};
    return Object.assign(binding, Object.assign({
      expressions
    }, createCoreAPIMethods(method => scope => {
      expressions.forEach(e => e[method](scope));
      return binding;
    })));
  }
  /**
   * Create the subcomponents that can be included inside a tag in runtime
   * @param   {Object} components - components imported in runtime
   * @returns {Object} all the components transformed into Riot.Component factory functions
   */


  function createSubcomponents(components) {
    if (components === void 0) {
      components = {};
    }

    return Object.entries(callOrAssign(components)).reduce((acc, _ref4) => {
      let [key, value] = _ref4;
      acc[camelToDashCase(key)] = createComponent(value);
      return acc;
    }, {});
  }
  /**
   * Run the component instance through all the plugins set by the user
   * @param   {Object} component - component instance
   * @returns {Object} the component enhanced by the plugins
   */


  function runPlugins(component) {
    return [...PLUGINS_SET$1].reduce((c, fn) => fn(c) || c, component);
  }
  /**
   * Compute the component current state merging it with its previous state
   * @param   {Object} oldState - previous state object
   * @param   {Object} newState - new state givent to the `update` call
   * @returns {Object} new object state
   */


  function computeState(oldState, newState) {
    return Object.assign({}, oldState, callOrAssign(newState));
  }
  /**
   * Add eventually the "is" attribute to link this DOM node to its css
   * @param {HTMLElement} element - target root node
   * @param {string} name - name of the component mounted
   * @returns {undefined} it's a void function
   */


  function addCssHook(element, name) {
    if (getName(element) !== name) {
      set(element, IS_DIRECTIVE, name);
    }
  }
  /**
   * Component creation factory function that will enhance the user provided API
   * @param   {Object} component - a component implementation previously defined
   * @param   {Array} options.slots - component slots generated via riot compiler
   * @param   {Array} options.attributes - attribute expressions generated via riot compiler
   * @returns {Riot.Component} a riot component instance
   */


  function enhanceComponentAPI(component, _ref5) {
    let {
      slots,
      attributes,
      props
    } = _ref5;
    return autobindMethods(runPlugins(defineProperties(isObject(component) ? Object.create(component) : component, {
      mount(element, state, parentScope) {
        if (state === void 0) {
          state = {};
        }

        // any element mounted passing through this function can't be a pure component
        defineProperty(element, IS_PURE_SYMBOL, false);
        this[PARENT_KEY_SYMBOL] = parentScope;
        this[ATTRIBUTES_KEY_SYMBOL] = createAttributeBindings(element, attributes).mount(parentScope);
        defineProperty(this, PROPS_KEY, Object.freeze(Object.assign({}, evaluateInitialProps(element, props), evaluateAttributeExpressions(this[ATTRIBUTES_KEY_SYMBOL].expressions))));
        this[STATE_KEY] = computeState(this[STATE_KEY], state);
        this[TEMPLATE_KEY_SYMBOL] = this.template.createDOM(element).clone(); // link this object to the DOM node

        bindDOMNodeToComponentObject(element, this); // add eventually the 'is' attribute

        component.name && addCssHook(element, component.name); // define the root element

        defineProperty(this, ROOT_KEY, element); // define the slots array

        defineProperty(this, SLOTS_KEY, slots); // before mount lifecycle event

        this[ON_BEFORE_MOUNT_KEY](this[PROPS_KEY], this[STATE_KEY]); // mount the template

        this[TEMPLATE_KEY_SYMBOL].mount(element, this, parentScope);
        this[ON_MOUNTED_KEY](this[PROPS_KEY], this[STATE_KEY]);
        return this;
      },

      update(state, parentScope) {
        if (state === void 0) {
          state = {};
        }

        if (parentScope) {
          this[PARENT_KEY_SYMBOL] = parentScope;
          this[ATTRIBUTES_KEY_SYMBOL].update(parentScope);
        }

        const newProps = evaluateAttributeExpressions(this[ATTRIBUTES_KEY_SYMBOL].expressions);
        if (this[SHOULD_UPDATE_KEY](newProps, this[PROPS_KEY]) === false) return;
        defineProperty(this, PROPS_KEY, Object.freeze(Object.assign({}, this[PROPS_KEY], newProps)));
        this[STATE_KEY] = computeState(this[STATE_KEY], state);
        this[ON_BEFORE_UPDATE_KEY](this[PROPS_KEY], this[STATE_KEY]); // avoiding recursive updates
        // see also https://github.com/riot/riot/issues/2895

        if (!this[IS_COMPONENT_UPDATING]) {
          this[IS_COMPONENT_UPDATING] = true;
          this[TEMPLATE_KEY_SYMBOL].update(this, this[PARENT_KEY_SYMBOL]);
        }

        this[ON_UPDATED_KEY](this[PROPS_KEY], this[STATE_KEY]);
        this[IS_COMPONENT_UPDATING] = false;
        return this;
      },

      unmount(preserveRoot) {
        this[ON_BEFORE_UNMOUNT_KEY](this[PROPS_KEY], this[STATE_KEY]);
        this[ATTRIBUTES_KEY_SYMBOL].unmount(); // if the preserveRoot is null the template html will be left untouched
        // in that case the DOM cleanup will happen differently from a parent node

        this[TEMPLATE_KEY_SYMBOL].unmount(this, this[PARENT_KEY_SYMBOL], preserveRoot === null ? null : !preserveRoot);
        this[ON_UNMOUNTED_KEY](this[PROPS_KEY], this[STATE_KEY]);
        return this;
      }

    })), Object.keys(component).filter(prop => isFunction(component[prop])));
  }

  /**
   * Similar to compose but performs from left-to-right function composition.<br/>
   * {@link https://30secondsofcode.org/function#composeright see also}
   * @param   {...[function]} fns) - list of unary function
   * @returns {*} result of the computation
   */
  /**
   * Performs right-to-left function composition.<br/>
   * Use Array.prototype.reduce() to perform right-to-left function composition.<br/>
   * The last (rightmost) function can accept one or more arguments; the remaining functions must be unary.<br/>
   * {@link https://30secondsofcode.org/function#compose original source code}
   * @param   {...[function]} fns) - list of unary function
   * @returns {*} result of the computation
   */

  function compose() {
    for (var _len2 = arguments.length, fns = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      fns[_key2] = arguments[_key2];
    }

    return fns.reduce((f, g) => function () {
      return f(g(...arguments));
    });
  }

  const {
    DOM_COMPONENT_INSTANCE_PROPERTY,
    COMPONENTS_IMPLEMENTATION_MAP,
    PLUGINS_SET
  } = globals;
  /**
   * Riot public api
   */

  /**
   * Register a custom tag by name
   * @param   {string} name - component name
   * @param   {Object} implementation - tag implementation
   * @returns {Map} map containing all the components implementations
   */

  function register$1(name, _ref) {
    let {
      css,
      template,
      exports
    } = _ref;
    if (COMPONENTS_IMPLEMENTATION_MAP.has(name)) panic(`The component "${name}" was already registered`);
    COMPONENTS_IMPLEMENTATION_MAP.set(name, createComponent({
      name,
      css,
      template,
      exports
    }));
    return COMPONENTS_IMPLEMENTATION_MAP;
  }
  /**
   * Helper method to create component without relying on the registered ones
   * @param   {Object} implementation - component implementation
   * @returns {Function} function that will allow you to mount a riot component on a DOM node
   */

  function component(implementation) {
    return function (el, props, _temp) {
      let {
        slots,
        attributes,
        parentScope
      } = _temp === void 0 ? {} : _temp;
      return compose(c => c.mount(el, parentScope), c => c({
        props,
        slots,
        attributes
      }), createComponent)(implementation);
    };
  }

  var App = {
    css: null,

    exports: {
      content: '',
      checkingAuth: true,
      dictId: '',
      doctype: 'entry',
      doctypes: ['entry'],
      siteconfig: {},

      state: {
         authorized: false,
         userInfo: {username: '', consent: false},
         userAccess: false,
         dictDetails: {},
         showDictMenu: false,
         publicMoreEntries: [],
         dictConfigs: {},
         subPage: 'login',
         token: '',
      },

      getCookie(val) {
         if (document.cookie != undefined) {
            if (document.cookie.split('; ').find(row => row.startsWith(val+'=')) != undefined) {
               return document.cookie.split('; ').find(row => row.startsWith(val+'=')).split('=')[1].slice(1,-1);
            }
         } else {
            return "";
         }
      },

      checkAuthCookie() {
         if (this.getCookie('email') != '' && this.getCookie('sessionkey') != '' && this.state.userInfo.username == '') {
            // console.log('cookie auth')
            $.post(window.API_URL + "login.json", (response) => {
               if (response.success) {
                  this.state.userInfo.username = response.email;
                  this.state.userInfo.ske_username = response.ske_username;
                  this.state.userInfo.ske_apiKey = response.ske_apiKey;
                  this.state.userInfo.apiKey = response.apiKey;
                  this.state.userInfo.consent = response.consent;
                  this.state.authorized = true;
               }
            }).always(() => {
               this.checkingAuth = false;
               this.update();
            });
         }
      },

      accountOps(type) {
         return new Promise((resolve) => {
            if (type == 'login') {
               var email = $('#username').val();
               var password = $('#password').val();
               $.post(window.API_URL + "login.json", {email: email, password: password}, (response) => {
                  if (response.success) {
                     this.state.userInfo.username = this.getCookie('email');
                     this.state.userInfo.ske_username = response.ske_username;
                     this.state.userInfo.ske_apiKey = response.ske_apiKey;
                     this.state.userInfo.apiKey = response.apiKey;
                     this.state.userInfo.consent = response.consent;
                     this.state.authorized = true;
                  }
               }).always(() => {
                  this.checkingAuth = false;
                  this.update();
               });
            }

            if (type == 'register') {
               $.post(window.API_URL + "signup.json", {email: $('#email').val()}, (response) => {
                  if (response.success) {
                     resolve({success: true});
                  } else {
                     resolve({success: false, errorMessage: 'Incorrect e-mail.'});
                  }
               }).fail(() => {
                     resolve({success: false, errorMessage: 'Incorrect e-mail.'});
               });
            }

            if (type == 'forgot') {
               $.post(window.API_URL + "forgotpwd.json", {email: $('#email').val()}, (response) => {
                  if (response.success) {
                     resolve({success: true});
                  } else {
                     resolve({success: false, errorMessage: 'Incorrect e-mail.'});
                  }
               }).fail(() => {
                     resolve({success: false, errorMessage: 'Incorrect e-mail.'});
               });
            }

            if (type == 'registerPassword') {
               $.post(window.API_URL + "createaccount.json", {token: $('#token').val(), password: $('#password').val()}, (response) => {
                  if (response.success) {
                     resolve({success: true});
                  } else {
                     resolve({success: false, errorMessage: 'Error while creating account.'});
                  }
               }).fail(() => {
                     resolve({success: false, errorMessage: 'Error while creating account.'});
               });
            }

            if (type == 'forgotPassword') {
               $.post(window.API_URL + "recoverpwd.json", {token: $('#token').val(), password: $('#password').val()}, (response) => {
                  if (response.success) {
                     resolve({success: true});
                  } else {
                     resolve({success: false, errorMessage: 'Error while accessing account.'});
                  }
               }).fail(() => {
                     resolve({success: false, errorMessage: 'Error while accessing account.'});
               });
            }

            if (type == 'consent') {
               $.post(window.API_URL + "consent.json", {consent: 1}, (response) => {
                  if (response.success) {
                     this.state.userInfo.consent = true;
                     this.update();
                  }
               });
            }
         });
      },

      logOut() {
         this.state.authorized = false;
         this.state.userInfo = {username: ''};
         this.state.showDictMenu = false;
         this.state.userAccess = false;
         $.post(window.API_URL + "logout.json", {}, (response) => {
         }).always(() => {
            this.checkingAuth = false;
            this.update();
         });
      },

      loadDictDetail() {
         return $.get(window.API_URL + this.dictId + "/config.json", (response) => {
            console.log(response);
            if (response.success) {
               this.state.dictDetails.title = response.publicInfo.title;
               this.state.dictDetails.blurb = response.publicInfo.blurb;
               this.state.dictDetails.public = response.publicInfo.public;
               this.state.dictDetails.licence = response.publicInfo.licence;
               this.state.dictDetails.xemaOverride = false;
               this.state.dictDetails.xemplateOverride = false;
               this.state.dictDetails.editingOverride = false;
               this.state.userAccess = response.userAccess;
               this.state.dictConfigs = response.configs;
               if (response.userAccess != false && (response.userAccess.canEdit || response.userAccess.canConfig || response.userAccess.canDownload || response.userAccess.canUpload)) {
                  this.state.showDictMenu = true;
               }
               this.update();
            } else {
               route("/");
            }
         });
      },

      loadConfigData(configId) {
         // console.log('load config')
         return new Promise((resolve) => {
            $.post(window.API_URL + this.dictId + "/configread.json", {id: configId}, (response) => {
               resolve(response.content);
            }).fail(response => {
               M.toast({html: `Could not load the data ('${configId}'): ${response.statusText}`});
            });
         });
      },

      saveConfigData(configId, data) {
         $.post(window.API_URL + this.dictId + "/configupdate.json", {id: configId, content: JSON.stringify(data)}, (response) => {
            console.log(response);
            $('#submit_button').html('Saved...');
            setTimeout(() => {$('#submit_button').html('Save <i class="material-icons right">save</i>');}, 2000);
         });
      },

      onUpdated() {
         // console.log('content='+this.content)
      },

      onMounted() {
         $.ajaxSetup({
            xhrFields: { withCredentials: true }
         });
         this.checkAuthCookie();

         // console.log('mount')
         route('/api', () => {
            this.dictId = '';
            this.state.showDictMenu = false;
            this.state.userAccess = false;
            this.state.subPage = '';
            this.content = 'api';
            this.update();
         });
         route('/e404', () => {
            this.dictId = '';
            this.state.showDictMenu = false;
            this.state.userAccess = false;
            this.state.subPage = '';
            this.content = 'e404';
            this.update();
         });
         route('/opendictionaries', (token) => {
            this.dictId = '';
            this.state.showDictMenu = false;
            this.state.userAccess = false;
            this.state.subPage = '';
            this.content = 'open-dict-list';
            this.update();
         });
         route('/createaccount/*', (token) => {
            this.dictId = '';
            this.state.showDictMenu = false;
            this.state.userAccess = false;
            this.state.subPage = 'registerPassword';
            this.state.token = token;
            this.content = 'main-page';
            this.update();
         });
         route('/recoverpwd/*', (token) => {
            this.dictId = '';
            this.state.showDictMenu = false;
            this.state.userAccess = false;
            this.state.subPage = 'forgotPassword';
            this.state.token = token;
            this.content = 'main-page';
            this.update();
         });
         route('/register', () => {
            this.dictId = '';
            this.state.showDictMenu = false;
            this.state.userAccess = false;
            this.state.subPage = 'register';
            this.content = 'main-page';
            this.update();
         });
         route('/forgot', () => {
            this.dictId = '';
            this.state.showDictMenu = false;
            this.state.userAccess = false;
            this.state.subPage = 'forgot';
            this.content = 'main-page';
            this.update();
         });
         route('/userprofile', () => {
            this.dictId = '';
            this.state.showDictMenu = false;
            this.state.userAccess = false;
            this.state.subPage = 'userprofile';
            this.content = 'main-page';
            this.update();
         });
         route('/make', () => {
            this.dictId = '';
            this.state.showDictMenu = false;
            this.state.userAccess = false;
            this.state.subPage = 'new';
            this.content = 'main-page';
            this.update();
         });
         route('/*/edit', (dictId) => {
            console.log('edit ' + dictId);
            this.dictId = dictId;
            this.doctype = 'entry';
            $.get(window.API_URL + this.dictId + "/doctype.json", (response) => {
               console.log(response);
               if (response.success && response.userAccess.canEdit) {
                  if (response.doctype != "") {
                     this.doctype = response.doctype;
                     this.doctypes = response.doctypes;
                  }
                  route(this.dictId + "/edit/" + this.doctype);
               } else {
                  route("/");
               }
            });
         });
         route('/*/edit/*/*/*', (dictId, doctype, entryId, mode) => {
            console.log('edit ' + dictId + doctype + entryId);
            this.dictId = dictId;
            this.entryId = entryId;
            this.doctype = doctype;
            this.mode = mode;
           this.content = 'dict-edit';
            $.get(window.API_URL + this.dictId + "/doctype.json", (response) => {
               if (response.success && response.doctypes) {
                  this.doctypes = response.doctypes;
                  this.update();
               }
            });
         });
         route('/*/edit/*', (dictId, doctype) => {
            console.log('edit ' + dictId + doctype);
            this.dictId = dictId;
            this.doctype = doctype;
            $.get(window.API_URL + this.dictId + "/doctype.json", (response) => {
               console.log(response);
               if (response.success && response.doctypes) {
                  this.doctypes = response.doctypes;
                  this.update();
               }
            });
            this.content = 'dict-edit';
            this.update();
         });
         route('/*/([0-9]*)$', (dictId, entryId) => {
            console.log('public entry ' + dictId + '-' + entryId);
            this.dictId = dictId;
            this.entryId = entryId;
            this.content = 'dict-public-entry';
            this.update();
         });
         route('/*/config/*', (dictId, configId) => {
            console.log('config ' + dictId);
            this.dictId = dictId;
            this.configId = configId;
            this.content = 'dict-config-'+configId;
            this.update();
         });
         route('/*/config', (dictId) => {
            console.log('config ' + dictId);
            this.dictId = dictId;
            this.content = 'dict-config';
            this.update();
         });
         route('/*/download', (dictId) => {
            console.log('download ' + dictId);
            this.dictId = dictId;
            this.doctype = 'entry';
            $.get(window.API_URL + this.dictId + "/doctype.json", (response) => {
               console.log(response);
               if (response.success && response.userAccess.canDownload) {
                  if (response.doctype != "") {
                     this.doctype = response.doctype;
                     this.doctypes = response.doctypes;
                  }
                  this.content = 'dict-download';
                  this.update();
               } else {
                  route("/");
               }
            });
         });
         route('/*/upload', (dictId) => {
            console.log('upload ' + dictId);
            this.dictId = dictId;
            this.doctype = 'entry';
            $.get(window.API_URL + this.dictId + "/doctype.json", (response) => {
               console.log(response);
               if (response.success && response.userAccess.canUpload) {
                  if (response.doctype != "") {
                     this.doctype = response.doctype;
                     this.doctypes = response.doctypes;
                  }
                  this.content = 'dict-upload';
                  this.update();
               } else {
                  route("/");
               }
            });
         });
         route('/*', (dictId) => {
            console.log('testd ' + dictId);
            this.dictId = dictId;
            this.content = 'dict-public';
            this.update();
         });
         route('/', () => {
            console.log('main');
            this.dictId = '';
            this.state.showDictMenu = false;
            this.state.userAccess = false;
            this.state.subPage = 'login';
            this.content = 'main-page';
            $.get(window.API_URL + "siteconfigread.json", (response) => {
               this.siteconfig = response;
               this.update();
            });
            this.update();
         });
         route.start(true);
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<header expr0="expr0" is="header" ref="header"></header><div expr1="expr1" class="grey-text center-align"></div><div expr2="expr2" class="container content row"></div><footer expr3="expr3" is="footer"></footer>',
      [
        {
          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'class',
              evaluate: _scope => 'main'
            }
          ]
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'header',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'authorized',
              evaluate: _scope => _scope.state.authorized
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'user-info',
              evaluate: _scope => _scope.state.userInfo
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'log-out',
              evaluate: _scope => _scope.logOut
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'show-dict-menu',
              evaluate: _scope => _scope.state.showDictMenu
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dict-id',
              evaluate: _scope => _scope.dictId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'user-access',
              evaluate: _scope => _scope.state.userAccess
            }
          ],

          redundantAttribute: 'expr0',
          selector: '[expr0]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.checkingAuth,
          redundantAttribute: 'expr1',
          selector: '[expr1]',

          template: template(
            '<h3 style="margin-top: 20vh;">\n         loading...\n      </h3>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.checkingAuth,
          redundantAttribute: 'expr2',
          selector: '[expr2]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => _scope.content,
                slots: [],

                attributes: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'dict-id',
                    evaluate: _scope => _scope.dictId
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'authorized',
                    evaluate: _scope => _scope.state.authorized
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'account-ops',
                    evaluate: _scope => _scope.accountOps
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'user-info',
                    evaluate: _scope => _scope.state.userInfo
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'entry-id',
                    evaluate: _scope => _scope.entryId
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'load-dict-detail',
                    evaluate: _scope => _scope.loadDictDetail
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'load-config-data',
                    evaluate: _scope => _scope.loadConfigData
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'save-config-data',
                    evaluate: _scope => _scope.saveConfigData
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'dict-details',
                    evaluate: _scope => _scope.state.dictDetails
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'config-id',
                    evaluate: _scope => _scope.configId
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'dict-configs',
                    evaluate: _scope => _scope.state.dictConfigs
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'user-access',
                    evaluate: _scope => _scope.state.userAccess
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'doctype',
                    evaluate: _scope => _scope.doctype
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'doctypes',
                    evaluate: _scope => _scope.doctypes
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'main-sub-page',
                    evaluate: _scope => _scope.state.subPage
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'token',
                    evaluate: _scope => _scope.state.token
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'siteconfig',
                    evaluate: _scope => _scope.siteconfig
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'mode',
                    evaluate: _scope => _scope.mode
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'footer',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'siteconfig',
              evaluate: _scope => _scope.siteconfig
            }
          ],

          redundantAttribute: 'expr3',
          selector: '[expr3]'
        }
      ]
    ),

    name: 'main'
  };

  var api = {
    css: null,

    exports: {
      siteconfig: {},

      onMounted() {
  				if (Object.keys(this.props.siteconfig) == 0) {
              $.get("/siteconfigread.json", (response) => {
      this.siteconfig = response;
                  this.update();
              });
  				} else {
    this.siteconfig = this.props.siteconfig;
              this.update();
  				}
  },

      listLang() {
  var json = $("#input_listLang").val();
  				$.ajax("/api/listLang", {method: "POST", contentType: "application/json", data: json, processData: false, dataType: "json"}).done(function(data){
              console.log(data);
  				});
      },

      listDict() {
  				var json = $("#input_listDict").val();
  				$.ajax("/api/listDict", {method: "POST", contentType: "application/json", data: json, processData: false, dataType: "json"}).done(function(data){
              console.log(data);
  				});
      },

      listDict2() {
  				var json = $("#input_listDict2").val();
  				$.ajax("/api/listDict", {method: "POST", contentType: "application/json", data: json, processData: false, dataType: "json"}).done(function(data){
              console.log(data);
  				});
      },

      listDict3() {
  				var json = $("#input_listDict3").val();
  				$.ajax("/api/listDict", {method: "POST", contentType: "application/json", data: json, processData: false, dataType: "json"}).done(function(data){
              console.log(data);
  				});
      },

      listLinks1() {
  				var json = $("#input_listLinks1").val();
  				$.ajax("/api/listLinks", {method: "POST", contentType: "application/json", data: json, processData: false, dataType: "json"}).done(function(data){
              console.log(data);
  				});
      },

      listLinks2(){
  				var json=$("#input_listLinks2").val();
  				$.ajax("/api/listLinks", {method: "POST", contentType: "application/json", data: json, processData: false, dataType: "json"}).done(function(data){
              console.log(data);
  				});
      },

      listLinks3() {
  				var json = $("#input_listLinks3").val();
  				$.ajax("/api/listLinks", {method: "POST", contentType: "application/json", data: json, processData: false, dataType: "json"}).done(function(data){
              console.log(data);
  				});
  },

      makeDictTei() {
  				var json = $("#input_makeDictTei").val();
  				$.ajax("push.api", {method: "POST", contentType: "application/json", data: json, processData: false, dataType: "json"}).done(function(data){
              console.log(data);
  				});
      },

      createEntriesTei() {
  				var json = $("#input_createEntriesTei").val();
  				console.log(json);
  				$.ajax("push.api", {method: "POST", contentType: "application/json", data: json, processData: false, dataType: "json"}).done(function(data){
              console.log(data);
  				});
      },

      makeDict() {
  				var json = $("#input_makeDict").val();
  				$.ajax("push.api", {method: "POST", contentType: "application/json", data: json, processData: false, dataType: "json"}).done(function(data){
              console.log(data);
  				});
      },

      createEntries() {
  				var json = $("#input_createEntries").val();
  				console.log(json);
  				$.ajax("push.api", {method: "POST", contentType: "application/json", data: json, processData: false, dataType: "json"}).done(function(data){
              console.log(data);
  				});
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div class="container"><h4>Lexonomy API documentation and test</h4><p>Lexonomy also supports <a href="https://elexis-eu.github.io/elexis-rest/">ELEXIS REST API</a> - calls <tt expr7="expr7"></tt>. Use your API key as <tt expr8="expr8"></tt>.</p><hr/><p>Following calls are Lexonomy API with specific information.</p><p expr9="expr9"><b>API URL:</b> </p><hr/><h5>List languages used in dictionaries</h5><p expr10="expr10"> </p><textarea id="input_listLang" style="font-size: 1rem; width: 100%; height: 5em; resize: vertical" spellcheck="false">{\n      "email": "rambousek@gmail.com",\n      "apikey": "I0BNKTQEZUI9ZBMUX7ABQG1A6LMKUZOU"\n    }</textarea><button expr11="expr11">Post</button> and watch your console.\n    <hr/><h5>List all dictionaries metadata</h5><p expr12="expr12"> </p><textarea id="input_listDict" style="font-size: 1rem; width: 100%; height: 5em; resize: vertical" spellcheck="false">{\n      "email": "rambousek@gmail.com",\n      "apikey": "I0BNKTQEZUI9ZBMUX7ABQG1A6LMKUZOU"\n    }</textarea><button expr13="expr13">Post</button> and watch your console.\n\t\t<hr/><h5>List dictionaries metadata for selected language</h5><p expr14="expr14"> </p><textarea id="input_listDict2" style="font-size: 1rem; width: 100%; height: 7em; resize: vertical" spellcheck="false">{\n      "email": "rambousek@gmail.com",\n      "apikey": "I0BNKTQEZUI9ZBMUX7ABQG1A6LMKUZOU",\n      "lang": "sl"\n    }</textarea><button expr15="expr15">Post</button> and watch your console.\n\t\t<hr/><h5>List dictionaries metadata for selected language, with links only</h5><p expr16="expr16"> </p><textarea id="input_listDict3" style="font-size: 1rem; width: 100%; height: 7em; resize: vertical" spellcheck="false">{\n      "email": "rambousek@gmail.com",\n      "apikey": "I0BNKTQEZUI9ZBMUX7ABQG1A6LMKUZOU",\n      "lang": "sl",\n      "withLinks": true\n    }</textarea><button expr17="expr17">Post</button> and watch your console.\n    <hr/><h5>Find links, from headword in language</h5><p expr18="expr18"> </p><textarea id="input_listLinks1" style="font-size: 1rem; width: 100%; height: 7em; resize: vertical" spellcheck="false">{\n      "email": "rambousek@gmail.com",\n      "apikey": "I0BNKTQEZUI9ZBMUX7ABQG1A6LMKUZOU",\n      "headword": "zopet",\n      "sourceLanguage": "sl"\n    }</textarea><button expr19="expr19">Post</button> and watch your console.\n\t\t<hr/><h5>Find links, headword with specific dictionary</h5><p expr20="expr20"> </p><textarea id="input_listLinks2" style="font-size: 1rem; width: 100%; height: 7em; resize: vertical" spellcheck="false">{\n      "email": "rambousek@gmail.com",\n      "apikey": "I0BNKTQEZUI9ZBMUX7ABQG1A6LMKUZOU",\n      "headword": "zopet",\n      "sourceLanguage": "sl",\n      "sourceDict": "elexis-zrcsazu-pletersnik"\n    }</textarea><button expr21="expr21">Post</button> and watch your console.\n\t\t<hr/><h5>Find links, headword to target language</h5><p expr22="expr22"> </p><textarea id="input_listLinks3" style="font-size: 1rem; width: 100%; height: 7em; resize: vertical" spellcheck="false">{\n      "email": "rambousek@gmail.com",\n      "apikey": "I0BNKTQEZUI9ZBMUX7ABQG1A6LMKUZOU",\n      "headword": "zopet",\n      "sourceLanguage": "sl",\n      "targetLanguage": "en"\n    }</textarea><button expr23="expr23">Post</button> and watch your console.\n\n    <h4>Lexonomy Push API documentation and test</h4><p expr24="expr24"><b>PUSH API URL:</b> </p><h5>Make a dictionary, TEI Lex0 format</h5><textarea id="input_makeDictTei" style="font-size: 1rem; width: 100%; height: 11em; resize: vertical" spellcheck="false">{\n      "email": "rambousek@gmail.com",\n      "apikey": "I0BNKTQEZUI9ZBMUX7ABQG1A6LMKUZOU",\n      "command": "makeDict",\n      "format": "teilex0",\n      "dictTitle": "My TEI Lex0 Dictionary",\n      "dictBlurb": "Yet another dictionary draft."\n    }</textarea><button expr25="expr25">Post</button> and watch your console.\n\t\t<h5>Create entries, TEI Lex0 format</h5><textarea id="input_createEntriesTei" style="font-size: 1rem; width: 100%; height: 9em; resize: vertical" spellcheck="false">{\n      "email": "rambousek@gmail.com",\n      "apikey": "I0BNKTQEZUI9ZBMUX7ABQG1A6LMKUZOU",\n      "command": "createEntries",\n      "format": "teilex0",\n      "dictID": "jakobrno",\n      "entryXmls": ["<entry><form type=\'lemma\'><orth>Earth</orth></form></entry>", "<entry><form type=\'lemma\'><orth>Mars</orth></form></entry>"]\n    }</textarea><button expr26="expr26">Post</button> and watch your console.\n\t\t<h5>Make a dictionary</h5><textarea id="input_makeDict" style="font-size: 1rem; width: 100%; height: 11em; resize: vertical" spellcheck="false">{\n      "email": "rambousek@gmail.com",\n      "apikey": "I0BNKTQEZUI9ZBMUX7ABQG1A6LMKUZOU",\n      "command": "makeDict",\n      "dictTitle": "My Pushy Dictionary",\n      "dictBlurb": "Yet another dictionary draft.",\n      "poses": ["n", "v", "adj", "adv"],\n      "labels": ["colloquial", "formal", "mostly plural", "Irish English", "vulgar"]\n    }</textarea><button expr27="expr27">Post</button> and watch your console.\n\t\t<h5>Create entries</h5><textarea id="input_createEntries" style="font-size: 1rem; width: 100%; height: 9em; resize: vertical" spellcheck="false">{\n      "email": "rambousek@gmail.com",\n      "apikey": "I0BNKTQEZUI9ZBMUX7ABQG1A6LMKUZOU",\n      "command": "createEntries",\n      "dictID": "jakobrno",\n      "entryXmls": ["<heslo/>", "<heslo/>"]\n    }</textarea><button expr28="expr28">Post</button> and watch your console.\n\n\n  </div>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'tt',

          slots: [
            {
              id: 'default',
              html: 'dictionaries, about, list, lemma, tei',
              bindings: []
            }
          ],

          attributes: [],
          redundantAttribute: 'expr7',
          selector: '[expr7]'
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'tt',

          slots: [
            {
              id: 'default',
              html: 'X-API-KEY',
              bindings: []
            }
          ],

          attributes: [],
          redundantAttribute: 'expr8',
          selector: '[expr8]'
        },
        {
          redundantAttribute: 'expr9',
          selector: '[expr9]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 1,

              evaluate: _scope => [
                _scope.siteconfig.baseUrl,
                'api'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr10',
          selector: '[expr10]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: _scope => [
                'POST ',
                _scope.siteconfig.baseUrl,
                'api/listLang'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr11',
          selector: '[expr11]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.listLang
            }
          ]
        },
        {
          redundantAttribute: 'expr12',
          selector: '[expr12]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: _scope => [
                'POST ',
                _scope.siteconfig.baseUrl,
                'api/listDict'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr13',
          selector: '[expr13]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.listDict
            }
          ]
        },
        {
          redundantAttribute: 'expr14',
          selector: '[expr14]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: _scope => [
                'POST ',
                _scope.siteconfig.baseUrl,
                'api/listDict'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr15',
          selector: '[expr15]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.listDict2
            }
          ]
        },
        {
          redundantAttribute: 'expr16',
          selector: '[expr16]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: _scope => [
                'POST ',
                _scope.siteconfig.baseUrl,
                'api/listDict'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr17',
          selector: '[expr17]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.listDict3
            }
          ]
        },
        {
          redundantAttribute: 'expr18',
          selector: '[expr18]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: _scope => [
                'POST ',
                _scope.siteconfig.baseUrl,
                'api/listLinks'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr19',
          selector: '[expr19]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.listLinks1
            }
          ]
        },
        {
          redundantAttribute: 'expr20',
          selector: '[expr20]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: _scope => [
                'POST ',
                _scope.siteconfig.baseUrl,
                'api/listLinks'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr21',
          selector: '[expr21]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.listLinks2
            }
          ]
        },
        {
          redundantAttribute: 'expr22',
          selector: '[expr22]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: _scope => [
                'POST ',
                _scope.siteconfig.baseUrl,
                'api/listLinks'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr23',
          selector: '[expr23]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.listLinks3
            }
          ]
        },
        {
          redundantAttribute: 'expr24',
          selector: '[expr24]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 1,

              evaluate: _scope => [
                _scope.siteconfig.baseUrl,
                'push.api'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr25',
          selector: '[expr25]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.makeDictTei
            }
          ]
        },
        {
          redundantAttribute: 'expr26',
          selector: '[expr26]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.createEntriesTei
            }
          ]
        },
        {
          redundantAttribute: 'expr27',
          selector: '[expr27]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.makeDict
            }
          ]
        },
        {
          redundantAttribute: 'expr28',
          selector: '[expr28]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.createEntries
            }
          ]
        }
      ]
    ),

    name: 'api'
  };

  var dict_config_autonumber = {
    css: null,

    exports: {
      dictId: '',
      configId: '',
      configTitle: 'Auto-numbering',
      configData: {elements:[]},

      onMounted() {
         this.dictId = this.props.dictId;
         this.configId = this.props.configId;
         console.log('config dict '+ this.dictId + '-' + this.configId);
         this.props.loadDictDetail();
         console.log(this.props);
      },

      onUpdated() {
         if (this.props.dictConfigs.xema && this.props.dictConfigs.xema.elements) {
            if ($('#elements option').length == 0) {
               Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
                  $('#elements').append('<option value="' + key + '">' + key + '</option>');
               });
            }
            $('select').formSelect();
            M.updateTextFields();
         }
      },

      changeElem() {
         $("#children").find('option').remove();
         var elem = $("#elements").val();
         for(var atName in this.props.dictConfigs.xema.elements[elem]['attributes']){
            $("#children").append("<option value='@"+atName+"'>@"+atName+"</option>");
         }
         for(var child in this.props.dictConfigs.xema.elements[elem]['children']){
            $("#children").append("<option value='"+this.props.dictConfigs.xema.elements[elem]['children'][child].name+"'>"+this.props.dictConfigs.xema.elements[elem]['children'][child].name+"</option>");
         }
         $('select').formSelect();
      },

      addNumbers() {
         var countElem = $("#elements").val();
         var storeElem = $("#children").val();
         if (countElem != "" && storeElem != null && storeElem != "") {
            $("#numberinfo").show();
            $("#numberinfo .card-content").html('<p>Auto numbering in progress</p>');
            $.post(window.API_URL + this.dictId + "/autonumber.json", {"countElem": countElem, "storeElem": storeElem}, (response) => {
               if(!response.success) {
                  $("#numberinfo .card-content").html('<p>Auto numbering failed</p>');
               } else {
                  $("#numberinfo .card-content").html('<p>Auto-numbering finished, '+response.processed+' entries updated.</p>');
               }
            });
         }
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<dict-config-nav expr29="expr29"></dict-config-nav><h3>Auto-numbering of elements</h3><div class="row"><p>If you need to number some of entry elements automatically, Lexonomy can do that for you. First, go to Entry structure and add element/attribute where you want to store the number. Eg. in element <tt expr30="expr30"></tt> add attribute <tt expr31="expr31"></tt>. When you\'re ready, select element to number (eg. <tt expr32="expr32"></tt>) and element/attribute to store numbering (eg. <tt expr33="expr33"></tt>). Lexonomy will fill the numbers where missing.</p></div><div class="row"><div class="input-field col s4"><select expr34="expr34" id="elements"></select><label for="elements">Element to number</label></div><div class="input-field col s4"><select id="children"></select><label for="children">Add numbers to</label></div><div class="col s3"><a expr35="expr35" class="btn waves-effect waves-light" id="submit_button"><i class="material-icons right">add</i>Add numbers</a></div></div><div class="row" id="numberinfo" style="display:none"><div class="col s10"><div class="card red"><div class="card-content white-text"></div></div></div></div>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictId',
              evaluate: _scope => _scope.dictId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictTitle',
              evaluate: _scope => _scope.props.dictDetails.title
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configId',
              evaluate: _scope => _scope.configId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configTitle',
              evaluate: _scope => _scope.configTitle
            }
          ],

          redundantAttribute: 'expr29',
          selector: '[expr29]'
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'tt',

          slots: [
            {
              id: 'default',
              html: 'sense',
              bindings: []
            }
          ],

          attributes: [],
          redundantAttribute: 'expr30',
          selector: '[expr30]'
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'tt',

          slots: [
            {
              id: 'default',
              html: 'number',
              bindings: []
            }
          ],

          attributes: [],
          redundantAttribute: 'expr31',
          selector: '[expr31]'
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'tt',

          slots: [
            {
              id: 'default',
              html: 'sense',
              bindings: []
            }
          ],

          attributes: [],
          redundantAttribute: 'expr32',
          selector: '[expr32]'
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'tt',

          slots: [
            {
              id: 'default',
              html: '@number',
              bindings: []
            }
          ],

          attributes: [],
          redundantAttribute: 'expr33',
          selector: '[expr33]'
        },
        {
          redundantAttribute: 'expr34',
          selector: '[expr34]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onchange',
              evaluate: _scope => _scope.changeElem
            }
          ]
        },
        {
          redundantAttribute: 'expr35',
          selector: '[expr35]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.addNumbers
            }
          ]
        }
      ]
    ),

    name: 'dict-config-autonumber'
  };

  var dict_config_download = {
    css: null,

    exports: {
      dictId: '',
      configId: '',
      configTitle: 'Download settings',
      configData: {xslt: ''},

      onMounted() {
         this.dictId = this.props.dictId;
         this.configId = this.props.configId;
         console.log('config dict '+ this.dictId + '-' + this.configId);
         this.props.loadDictDetail();
         this.fillConfigForm();
         console.log(this.props);
      },

      async fillConfigForm() {
         this.props.loadConfigData(this.configId).then((response)=>{
            this.configData = response;
            this.update();
            M.updateTextFields();
            M.textareaAutoResize($('#download_xslt'));
         });
      },

      saveData() {
         var xslt = $('#download_xslt').val();
         try {
            var data = {xslt: xslt};
            parsed_xslt = $.parseXML(xslt);
            $('#submit_button').html('Saving...');
            this.props.saveConfigData(this.configId, data);
         } catch(e) {
            alert('Failed to parse XSLT');
         }
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<dict-config-nav expr4="expr4"></dict-config-nav><h3>Download settings</h3><div class="row"><div class="input-field"><textarea expr5="expr5" id="download_xslt" class="materialize-textarea"> </textarea><label for="download_xslt">XSLT transformation on download</label><span class="helper-text">You can use this functionality to automatically apply an XSLT transformation when the dictionary is downloaded. If you do not input valid XSLT here, no transformation will be applied.</span></div></div><dict-config-buttons expr6="expr6"></dict-config-buttons>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictId',
              evaluate: _scope => _scope.dictId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictTitle',
              evaluate: _scope => _scope.props.dictDetails.title
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configId',
              evaluate: _scope => _scope.configId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configTitle',
              evaluate: _scope => _scope.configTitle
            }
          ],

          redundantAttribute: 'expr4',
          selector: '[expr4]'
        },
        {
          redundantAttribute: 'expr5',
          selector: '[expr5]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.configData.xslt
            }
          ]
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-buttons',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'save-data',
              evaluate: _scope => _scope.saveData
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dict-id',
              evaluate: _scope => _scope.dictId
            }
          ],

          redundantAttribute: 'expr6',
          selector: '[expr6]'
        }
      ]
    ),

    name: 'dict-config-download'
  };

  var dict_config_editing = {
    css: null,

    exports: {
      dictId: '',
      configId: '',
      configTitle: 'Entry editor',
      override: false,

      configData: {
         xonomyMode: "nerd",
         xonomyTextEditor: "askString",
         _js: "",
         _css: ""
      },

      changeInfo() {
         if ($("#xonomyMode_laic").is(":checked")) {
            $('#info_nerd').hide();
            $('#info_laic').show();
           $('#info_graphical').hide();
         } else if ($("#xonomyMode_nerd").is(":checked")) {
            $('#info_nerd').show();
            $('#info_laic').hide();
            $('#info_graphical').hide();
         } else {
           $('#info_nerd').hide();
           $('#info_laic').hide();
           $('#info_graphical').show();
         }
         if ($("#xonomyTextEditor_longstring").is(":checked")) {
            $('#info_string').hide();
            $('#info_longstring').show();
         } else {
            $('#info_string').show();
            $('#info_longstring').hide();
         }
      },

      startOverride() {
         this.override = true;
         this.update();
      },

      stopOverride() {
         this.override = false;
         this.configData._js = '';
         this.configData._css = '';
         this.update();
      },

      backFromOverride(){
         this.override = false;
         this.update();
      },

      exampleJS() {
         $('#editor_js').val(
`{
editor: function(div, entry, uneditable){
//div = the div into which you should render the editor
//entry.id = the entry ID (a number, eg. 123), or zero if new entry
//entry.content = the entry's XML source code, eg. "<entry></headword>hello</headword></entry>"
//uneditable = true if we want the entry to be uneditable (read-only)
$(div).html("<div class='myEditor'>HEADWORD: <input class='headword' "+(uneditable?"disabled":"")+"/></div>");
$(div).find("input.headword").val($($.parseXML(entry.content)).find("headword").html());
},
harvester: function(div){
//div = the div from which you should harvest the contents of the editor
var headword=$(div).find("input.headword").val();
return "<entry><headword>"+headword+"</headword></entry>";
},
adjustDocSpec: function (docSpec) {
// NOTE: you normally want to use this method if you don't have a custom editor,
// but just want to change certain aspects of how Xonomy presents the document.
$.each(docSpec.elements, function (elementName, elementSpec) {
 // Expand <sense> elements by default.
 if (elementName === 'sense') {
   elementSpec.collapsed = function (jsElement) { return false; }
 }
 // Make <example> read-only
 if (elementName === 'example') {
   elementSpec.isReadOnly = true;
 }
 // Hide <partOfSpeech>.
 if (elementName === 'partOfSpeech') {
   elementSpec.isInvisible = true;
 }
});
}
}`  );
         M.textareaAutoResize($('#editor_js'));
      },

      exampleCSS() {
         $('#editor_css').val(
`div.myEditor {padding: 20px; font-size: 1.25em}
div.myEditor input {font-weight: bold}`
         );
         M.textareaAutoResize($('#editor_css'));
      },

      onMounted() {
         this.dictId = this.props.dictId;
         this.configId = this.props.configId;
         console.log('config dict '+ this.dictId + '-' + this.configId);
         this.props.loadDictDetail();
         this.fillConfigForm();
         console.log(this.props);
      },

      async fillConfigForm() {
         this.props.loadConfigData(this.configId).then((response)=>{
            this.configData = response;
            console.log(this.configData);
            if (response._js && response._js != "") {
               this.override = true;
            }
            this.update();
            this.changeInfo();
            M.updateTextFields();
            if (this.override) {
               M.textareaAutoResize($('#editor_css'));
               M.textareaAutoResize($('#editor_js'));
            }
         });
      },

      getConfigData() {
         var newData = {
            xonomyMode: "nerd",
            xonomyTextEditor: "askString",
            _js: "",
            _css: ""
         };
         if ($("#xonomyMode_laic").is(":checked")) {
            newData.xonomyMode = "laic";
         }
         if ($("#xonomyMode_graphical").is(":checked")) {
            newData.xonomyMode = "graphical";
         }
         if ($("#xonomyTextEditor_longstring").is(":checked")) {
            newData.xonomyTextEditor = "askLongString";
         }
         if (this.override) {
            newData._js = $('#editor_js').val();
            newData._css = $('#editor_css').val();
         }
         return newData;
      },

      saveData() {
         console.log(this.getConfigData());
         $('#submit_button').html('Saving...');
         this.props.saveConfigData(this.configId, this.getConfigData());
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<dict-config-nav expr57="expr57"></dict-config-nav><h3>Entry editor</h3><div expr58="expr58"></div><div expr66="expr66"></div>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictId',
              evaluate: _scope => _scope.dictId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictTitle',
              evaluate: _scope => _scope.props.dictDetails.title
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configId',
              evaluate: _scope => _scope.configId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configTitle',
              evaluate: _scope => _scope.configTitle
            }
          ],

          redundantAttribute: 'expr57',
          selector: '[expr57]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => (!_scope.configData._js || _scope.configData._js == "") && !_scope.override,
          redundantAttribute: 'expr58',
          selector: '[expr58]',

          template: template(
            '<div class="input-field"><p><label><input expr59="expr59" name="xonomyMode" id="xonomyMode_nerd" type="radio" class="with-gap"/><span>Nerd mode</span></label><label style="margin-left: 30px;"><input expr60="expr60" name="xonomyMode" id="xonomyMode_laic" type="radio" class="with-gap"/><span>Laic mode</span></label><label style="margin-left: 30px;"><input expr61="expr61" name="xonomyMode" id="xonomyMode_graphical" type="radio" class="with-gap"/><span>Graphical mode</span></label></p><span class="helper-text">Choose what the entry editor will look like.</span></div><div id="info_nerd" style="padding-left: 50px;"><p>When editing an entry in <b>nerd mode</b> the user sees the XML source code, angle brackets and all.<div class="instro"><img src="docs/mode-nerd.png" alt="Illustration"/></div><br/> Individual users can overide this setting by clicking an icon in the bottom-left corner of their screen.</p></div><div id="info_laic" style="padding-left: 50px;"><p>When editing an entry in <b>laic mode</b> the XML source code is hidden and the entry looks more like a bulleted list.<div class="instro"><img src="docs/mode-laic.png" alt="Illustration"/></div><br/> Individual users can overide this setting by clicking an icon in the bottom-left corner of their screen.</p></div><div id="info_graphical" style="padding-left: 50px;"><p>When editing an entry in <b>graphical mode</b> the XML source code is hidden and the entry uses settings configuration to display a more graphically friendly interface.\n          <div class="instro"><img src="docs/mode-laic.png" alt="Illustration"/></div></p></div><br/><div class="input-field"><p><label><input expr62="expr62" name="xonomyTextEditor" id="xonomyTextEditor_string" type="radio" class="with-gap"/><span>Single line</span></label><label style="margin-left: 30px;"><input expr63="expr63" name="xonomyTextEditor" id="xonomyTextEditor_longstring" type="radio" class="with-gap"/><span>Multi line</span></label></p><span class="helper-text">Choose the default text editor for node values.</span></div><div id="info_string" style="margin-left: 30px;"><p>When editing text in <b>single line mode</b> the user sees a smaller editor.<div class="instro"><img src="docs/text-editor-askstring.png" alt="Illustration"/></div></p></div><div id="info_longstring" style="margin-left: 30px;"><p>When editing text in <b>multi line mode</b> the user sees a full-fledged text editor.<div class="instro"><img src="docs/text-editor-asklongstring.png" alt="Illustration"/></div></p></div><div><br/><button expr64="expr64" class="btn waves-effect waves-light">Customize entry editor <i class="material-icons right">edit</i></button></div><br/><br/><dict-config-buttons expr65="expr65"></dict-config-buttons>',
            [
              {
                redundantAttribute: 'expr59',
                selector: '[expr59]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'checked',
                    evaluate: _scope => _scope.configData.xonomyMode == "nerd"
                  },
                  {
                    type: expressionTypes.EVENT,
                    name: 'onchange',
                    evaluate: _scope => _scope.changeInfo
                  }
                ]
              },
              {
                redundantAttribute: 'expr60',
                selector: '[expr60]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'checked',
                    evaluate: _scope => _scope.configData.xonomyMode == "laic"
                  },
                  {
                    type: expressionTypes.EVENT,
                    name: 'onchange',
                    evaluate: _scope => _scope.changeInfo
                  }
                ]
              },
              {
                redundantAttribute: 'expr61',
                selector: '[expr61]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'checked',
                    evaluate: _scope => _scope.configData.xonomyMode == "graphical"
                  },
                  {
                    type: expressionTypes.EVENT,
                    name: 'onchange',
                    evaluate: _scope => _scope.changeInfo
                  }
                ]
              },
              {
                redundantAttribute: 'expr62',
                selector: '[expr62]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'checked',
                    evaluate: _scope => _scope.configData.xonomyTextEditor == "askString"
                  },
                  {
                    type: expressionTypes.EVENT,
                    name: 'onchange',
                    evaluate: _scope => _scope.changeInfo
                  }
                ]
              },
              {
                redundantAttribute: 'expr63',
                selector: '[expr63]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'checked',
                    evaluate: _scope => _scope.configData.xonomyTextEditor == "askLongString"
                  },
                  {
                    type: expressionTypes.EVENT,
                    name: 'onchange',
                    evaluate: _scope => _scope.changeInfo
                  }
                ]
              },
              {
                redundantAttribute: 'expr64',
                selector: '[expr64]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.startOverride
                  }
                ]
              },
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'dict-config-buttons',
                slots: [],

                attributes: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'save-data',
                    evaluate: _scope => _scope.saveData
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'dict-id',
                    evaluate: _scope => _scope.dictId
                  }
                ],

                redundantAttribute: 'expr65',
                selector: '[expr65]'
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => (_scope.configData._js && _scope.configData._js != "") || _scope.override,
          redundantAttribute: 'expr66',
          selector: '[expr66]',

          template: template(
            '<div><label>JavaScript</label><div class="input-field"><textarea expr67="expr67" id="editor_js" class="materialize-textarea" placeholder> </textarea><span class="helper-text">You can customize the editor by defining two functions in JavaScript: one that will render the HTML editor from the XML entry and one that will harvest the (edited) HTML back into XML. If you would like to see an example, <a expr68="expr68">click here to load a sample JavaScript code</a>.</span></div></div><div><label for="editor_css">CSS</label><div class="input-field"><textarea expr69="expr69" id="editor_css" class="materialize-textarea" placeholder> </textarea><span class="helper-text">You can customize the editor look and feel by writing your own CSS styles. If you would like to see an example, <a expr70="expr70">click here to load a sample CSS style</a>.</span></div></div><div class="buttons"><a expr71="expr71" class="btn btn-secondary waves-effect waves-light">back</a><button expr72="expr72" class="btn waves-effect waves-light">Disable entry editor customizations <i class="material-icons right">edit</i></button><button expr73="expr73" class="btn waves-effect waves-light" id="submit_button">Save\n            <i class="material-icons right">save</i></button></div><br/><br/>',
            [
              {
                redundantAttribute: 'expr67',
                selector: '[expr67]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.configData._js
                  }
                ]
              },
              {
                redundantAttribute: 'expr68',
                selector: '[expr68]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.exampleJS
                  }
                ]
              },
              {
                redundantAttribute: 'expr69',
                selector: '[expr69]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.configData._css
                  }
                ]
              },
              {
                redundantAttribute: 'expr70',
                selector: '[expr70]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.exampleCSS
                  }
                ]
              },
              {
                redundantAttribute: 'expr71',
                selector: '[expr71]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.backFromOverride
                  }
                ]
              },
              {
                redundantAttribute: 'expr72',
                selector: '[expr72]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.stopOverride
                  }
                ]
              },
              {
                redundantAttribute: 'expr73',
                selector: '[expr73]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.saveData
                  }
                ]
              }
            ]
          )
        }
      ]
    ),

    name: 'dict-config-editing'
  };

  var dict_config_flagging = {
    css: `dict-config-flagging .delete-el,[is="dict-config-flagging"] .delete-el{ float: right; } dict-config-flagging tr,[is="dict-config-flagging"] tr{ border-bottom: none; } dict-config-flagging th,[is="dict-config-flagging"] th,dict-config-flagging td,[is="dict-config-flagging"] td{ padding: 3px 10px 3px 0; }`,

    exports: {
      isLoading: true,
      dictId: '',
      configId: '',
      configTitle: 'Entry flags',
      configData: {flag_elements: "", flags: []},

      doDeleteEl(idx) {
         this.configData = this.getConfigData();
         this.configData.flags.splice(idx, 1);
         this.update();
      },

      doAddEl(event) {
         this.configData.flags.push({key: "", name: "", label: "", color: ""});
         this.update();
      },

      addColor() {
         $('.flag-color').each(function() {
            var cid = $(this)[0].id;
            $('#'+cid).colorpicker().on('changeColor', function(ev) {
               $(this).css('background-color',ev.color.toHex());
            });
         });
      },

      onMounted() {
         this.dictId = this.props.dictId;
         this.configId = this.props.configId;
         console.log('config dict '+ this.dictId + '-' + this.configId);
         this.props.loadDictDetail();
         this.fillConfigForm();
         M.updateTextFields();
         console.log(this.props);
         this.addColor();
      },

      onUpdated() {
         if (this.props.dictConfigs.xema && this.props.dictConfigs.xema.elements) {
            if ($('#flag-element option').length == 0) {
               Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
                  $('#flag-element').append('<option value="' + key + '">' + key + '</option>');
               });
            }
            $('select').formSelect();
         }
         M.updateTextFields();
         this.addColor();
      },

      async fillConfigForm() {
         this.props.loadConfigData(this.configId).then((response)=>{
            this.configData = {flag_element: "", flags: []};
            if (response.flag_element && response.flag_element != "") {
               this.configData = response;
            }
            this.isLoading = false;
            this.update();
         });
      },

      getConfigData() {
         var newData = {flag_element: $('#flag-element').val(), flags: []};
         $('.flag-info').each(function() {
            newData.flags.push({
               key: $(this).find('.flag-key').val(),
               name: $(this).find('.flag-name').val(),
               label: $(this).find('.flag-label').val(),
               color: $(this).find('.flag-color').val()
            });
         });
         return newData;
      },

      saveData() {
         console.log(this.getConfigData());
         $('#submit_button').html('Saving...');
         this.props.saveConfigData(this.configId, this.getConfigData());
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<dict-config-nav expr36="expr36"></dict-config-nav><h3>Entry flags</h3><div expr37="expr37" class="center-align grey-text"></div><template expr38="expr38"></template><br/><br/><dict-config-buttons expr49="expr49"></dict-config-buttons>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictId',
              evaluate: _scope => _scope.dictId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictTitle',
              evaluate: _scope => _scope.props.dictDetails.title
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configId',
              evaluate: _scope => _scope.configId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configTitle',
              evaluate: _scope => _scope.configTitle
            }
          ],

          redundantAttribute: 'expr36',
          selector: '[expr36]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.isLoading,
          redundantAttribute: 'expr37',
          selector: '[expr37]',

          template: template(
            '<h3>Loading entry flags...</h3>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.isLoading,
          redundantAttribute: 'expr38',
          selector: '[expr38]',

          template: template(
            '<div expr39="expr39" class="center-align grey-text"></div><template expr41="expr41"></template>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => !_scope.configData.flags.length,
                redundantAttribute: 'expr39',
                selector: '[expr39]',

                template: template(
                  '<h3>no entry flags</h3><br/><a expr40="expr40" class="btn btn-primary waves-effect waves-light">\n            add flag\n            <i class="material-icons right">add</i></a>',
                  [
                    {
                      redundantAttribute: 'expr40',
                      selector: '[expr40]',

                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onclick',
                          evaluate: _scope => _scope.doAddEl
                        }
                      ]
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.configData.flags.length,
                redundantAttribute: 'expr41',
                selector: '[expr41]',

                template: template(
                  '<table><thead><tr><th>\n                     Keyboard shortcut\n                  </th><th>\n                     Value\n                  </th><th>\n                     Label\n                  </th><th>\n                     Color\n                  </th><th></th></tr></thead><tbody><tr expr42="expr42" class="flag-info"></tr></tbody></table><div><a expr48="expr48" class="btn waves-effect waves-light">\n               add flag\n               <i class="material-icons right">add</i></a></div><br/><br/><div class="input-field" style="max-width: 400px;"><select id="flag-element"></select><label for="flag-element">Flag element</label><span class="helper-text">Select the element which the flags should be put into.</span></div>',
                  [
                    {
                      type: bindingTypes.EACH,
                      getKey: null,
                      condition: null,

                      template: template(
                        '<td><input expr43="expr43" type="text" placeholder="key" class="flag-key"/></td><td><input expr44="expr44" type="text" placeholder="value" class="flag-name"/></td><td><input expr45="expr45" type="text" placeholder="label" class="flag-label"/></td><td><input expr46="expr46" type="text" placeholder="color" class="flag-color"/></td><td><a expr47="expr47" class="btn btn-floating delete-el"><i class="material-icons">delete</i></a></td>',
                        [
                          {
                            redundantAttribute: 'expr43',
                            selector: '[expr43]',

                            expressions: [
                              {
                                type: expressionTypes.VALUE,
                                evaluate: _scope => _scope.flag.key
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr44',
                            selector: '[expr44]',

                            expressions: [
                              {
                                type: expressionTypes.VALUE,
                                evaluate: _scope => _scope.flag.name
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr45',
                            selector: '[expr45]',

                            expressions: [
                              {
                                type: expressionTypes.VALUE,
                                evaluate: _scope => _scope.flag.label
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr46',
                            selector: '[expr46]',

                            expressions: [
                              {
                                type: expressionTypes.VALUE,
                                evaluate: _scope => _scope.flag.color
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'id',

                                evaluate: _scope => [
                                  'flag-color',
                                  _scope.index
                                ].join(
                                  ''
                                )
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'style',

                                evaluate: _scope => [
                                  'background-color: ',
                                  _scope.flag.color
                                ].join(
                                  ''
                                )
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr47',
                            selector: '[expr47]',

                            expressions: [
                              {
                                type: expressionTypes.EVENT,
                                name: 'onclick',
                                evaluate: _scope => _scope.doDeleteEl.bind(_scope, _scope.index)
                              }
                            ]
                          }
                        ]
                      ),

                      redundantAttribute: 'expr42',
                      selector: '[expr42]',
                      itemName: 'flag',
                      indexName: 'index',
                      evaluate: _scope => _scope.configData.flags
                    },
                    {
                      redundantAttribute: 'expr48',
                      selector: '[expr48]',

                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onclick',
                          evaluate: _scope => _scope.doAddEl
                        }
                      ]
                    }
                  ]
                )
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-buttons',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'save-data',
              evaluate: _scope => _scope.saveData
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dict-id',
              evaluate: _scope => _scope.dictId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'show-save',
              evaluate: _scope => _scope.configData.flags.length
            }
          ],

          redundantAttribute: 'expr49',
          selector: '[expr49]'
        }
      ]
    ),

    name: 'dict-config-flagging'
  };

  var dict_config_gapi = {
    css: `dict-config-gapi .input-field,[is="dict-config-gapi"] .input-field{ max-width: 500px; }`,

    exports: {
      dictId: '',
      configId: '',
      configTitle: 'Multimedia API',
      configData: {},

      addImages() {
         var addElem = $("#add_element").val();
         var addNumber = $("#add_number").val();
         if (addElem != "" && parseInt(addNumber) > 0) {
            $('#addinfo').show();
            $("#addinfo").html("Adding images to dictionary, please wait...");
            $.post(window.API_URL + this.dictId + "/autoimage.json", {"addElem": addElem, "addNumber": addNumber}, (response) => {
               $("#addimages").data("bgjob", response.bgjob);
            });
            this.waitImages(this.dictId);
         }
      },

      waitImages(dictId) {
         var imageTimer = setInterval(checkImages, 1000);
         function checkImages() {
            var jobid = $("#addimages").data("bgjob");
            if (jobid != "") {
               $.get(window.API_URL + dictId + "/autoimageprogress.json", {"jobid": jobid}, (response) => {
                  if (response.status == "finished") {
                     clearInterval(imageTimer);
                     $("#addinfo").show();
                     $("#addinfo").html("Dictionary now contains automatically added images. <a href='#"+dictId+"/edit'>See results.</a>");
                  } else if (response.status == "failed") {
                     $("#addinfo").show();
                     clearInterval(imageTimer);
                     $("#addinfo").html("Adding images failed :(");
                  }
               });
            }
         }
      },

      onMounted() {
         this.dictId = this.props.dictId;
         this.configId = this.props.configId;
         console.log('config dict '+ this.dictId + '-' + this.configId);
         this.props.loadDictDetail();
         this.fillConfigForm();
         console.log(this.props);
         M.updateTextFields();
         $('select').formSelect({dropdownOptions: {coverTrigger: false, constrainWidth: false}});
      },

      async fillConfigForm() {
         this.props.loadConfigData(this.configId).then((response)=>{
            this.configData = response;
            console.log(this.configData);
            this.update();
            if (this.configData.image_licence) {
               $('#img_licence').val(this.configData.image_licence);
            }
            $('#voice_lang').val(this.configData.voicelang);
            M.updateTextFields();
            $('select').formSelect({dropdownOptions: {coverTrigger: false, constrainWidth: false}});
         });
      },

      onUpdated() {
         if (this.props.dictConfigs.xema && this.props.dictConfigs.xema.elements) {
            if ($('#add_element option').length == 0) {
               Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
                  if (info.filling == "med") {
                     $('#add_element').append('<option value="' + key + '">' + key + '</option>');
                  }
               });
            }
            $('select').formSelect({dropdownOptions: {coverTrigger: false, constrainWidth: false}});
         }
      },

      getConfigData() {
         var newData = {
            image_licence: $('#img_licence').val(),
            apikey: $('#gapi_key').val(),
            cx: $('#gapi_cx').val(),
            pixabaykey: $('#pixabay_key').val(),
            voicekey: $('#voice_key').val(),
            voicelang: $('#voice_lang').val()
         };
         return newData;
      },

      saveData() {
         console.log(this.getConfigData());
         $('#submit_button').html('Saving...');
         this.props.saveConfigData(this.configId, this.getConfigData());
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<dict-config-nav expr96="expr96"></dict-config-nav><h3>Multimedia API</h3><div class="row"><div class="input-field"><select id="img_licence" "><option value="any" selected>any licence</option><option value="comm">permits commercial use</option><option value="der">permits derivative works</option><option value="code">permits commercial and derivative use</option><option value="public">public domain</option></select><label>Image licence</label><span class="helper-text">Select licence type when searching for images.</span></div></div><div class="row"><div class="input-field"><input expr97="expr97" type="text" id="gapi_key"/><label>Google Custom Search API key</label><span class="helper-text">Insert your Google Custom Search API key to allow multimedia search.</span></div></div><div class="row"><div class="input-field"><input expr98="expr98" type="text" id="gapi_cx"/><label>Google Custom Search ID</label><span class="helper-text">Insert ID of your Custom Search - see <a href="https://developers.google.com/custom-search/v1/introduction">documentation</a>.</span></div></div><div class="row"><div class="input-field"><input expr99="expr99" type="text" id="pixabay_key"/><label>Pixabay API key</label><span class="helper-text">Insert your <a href="https://pixabay.com/api/docs/">Pixabay API key</a>.</span></div></div><div class="row"><div class="input-field"><input expr100="expr100" type="text" id="voice_key"/><label>VoiceRSS API key</label><span class="helper-text">Insert your <a href="http://www.voicerss.org/api/">VoiceRSS</a> API key to enable text-to-speech.</span></div></div><div class="row"><div class="input-field"><select id="voice_lang"><option value>.</option><option value="ar-eg">Arabic (Egypt)</option><option value="ar-sa">Arabic (Saudi Arabia)</option><option value="bg-bg">Bulgarian</option><option value="ca-es">Catalan</option><option value="zh-cn">Chinese (China)</option><option value="zh-hk">Chinese (Hong Kong)</option><option value="zh-tw">Chinese (Taiwan)</option><option value="hr-hr">Croatian</option><option value="cs-cz">Czech</option><option value="da-dk">Danish</option><option value="nl-be">Dutch (Belgium)</option><option value="nl-nl">Dutch (Netherlands)</option><option value="en-au">English (Australia)</option><option value="en-ca">English (Canada)</option><option value="en-gb">English (Great Britain)</option><option value="en-in">English (India)</option><option value="en-ie">English (Ireland)</option><option value="en-us">English (United States)</option><option value="fi-fi">Finnish</option><option value="fr-ca">French (Canada)</option><option value="fr-fr">French (France)</option><option value="fr-ch">French (Switzerland)</option><option value="de-at">German (Austria)</option><option value="de-de">German (Germany)</option><option value="de-ch">German (Switzerland)</option><option value="el-gr">Greek</option><option value="he-il">Hebrew</option><option value="hi-in">Hindi</option><option value="hu-hu">Hungarian</option><option value="id-id">Indonesian</option><option value="it-it">Italian</option><option value="ja-jp">Japanese</option><option value="ko-kr">Korean</option><option value="ms-my">Malay</option><option value="nb-no">Norwegian</option><option value="pl-pl">Polish</option><option value="pt-br">Portuguese (Brazil)</option><option value="pt-pt">Portuguese (Portugal)</option><option value="ro-ro">Romanian</option><option value="ru-ru">Russian</option><option value="sk-sk">Slovak</option><option value="sl-si">Slovenian</option><option value="es-mx">Spanish (Mexico)</option><option value="es-es">Spanish (Spain)</option><option value="sv-se">Swedish</option><option value="ta-in">Tamil</option><option value="th-th">Thai</option><option value="tr-tr">Turkish</option><option value="vi-vn">Vietnamese</option></select><label>VoiceRSS language</label></div></div><button expr101="expr101" class="btn waves-effect waves-light" id="submit_button">\n         Save\n         <i class="material-icons right">save</i></button><br/><br/><hr/><br/><div><h5>Auto download images to each entry</h5><p class="grey-text">If you want to add images to each entry automatically, Lexonomy can do that for you. First, go to Entry structure and add element with content type <i>media</i>. When you\'re ready, select element and number of images you want to add.</p><div style="display: flex; gap: 10px; vertical-align: middle;"><div style="max-width: 200px;"><div class="input-field"><select id="add_element"></select><label>Image element to add</label></div></div><div style="max-width: 150px;"><div class="input-field"><input type="number" id="add_number" value="3"/><label>Add X images</label></div></div><button expr102="expr102" class="btn waves-effect waves-light" id="addimages" data-bgjob style="margin-top: 28px;">Add images</button></div></div><div><p id="addinfo" style="display:none">...</p></div><br/><a expr103="expr103" class="btn btn-secondary btn-flat">Back</a>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictId',
              evaluate: _scope => _scope.dictId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictTitle',
              evaluate: _scope => _scope.props.dictDetails.title
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configId',
              evaluate: _scope => _scope.configId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configTitle',
              evaluate: _scope => _scope.configTitle
            }
          ],

          redundantAttribute: 'expr96',
          selector: '[expr96]'
        },
        {
          redundantAttribute: 'expr97',
          selector: '[expr97]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.configData.apikey
            }
          ]
        },
        {
          redundantAttribute: 'expr98',
          selector: '[expr98]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.configData.cx
            }
          ]
        },
        {
          redundantAttribute: 'expr99',
          selector: '[expr99]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.configData.pixabaykey
            }
          ]
        },
        {
          redundantAttribute: 'expr100',
          selector: '[expr100]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.configData.voicekey
            }
          ]
        },
        {
          redundantAttribute: 'expr101',
          selector: '[expr101]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.saveData
            }
          ]
        },
        {
          redundantAttribute: 'expr102',
          selector: '[expr102]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.addImages
            }
          ]
        },
        {
          redundantAttribute: 'expr103',
          selector: '[expr103]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#',
                _scope.dictId,
                '/config'
              ].join(
                ''
              )
            }
          ]
        }
      ]
    ),

    name: 'dict-config-gapi'
  };

  var dict_config_ident = {
    css: null,

    exports: {
      dictId: '',
      configId: '',
      configTitle: 'Description',
      configData: {},

      onMounted() {
         this.dictId = this.props.dictId;
         this.configId = this.props.configId;
         console.log('config dict '+ this.dictId + '-' + this.configId);
         this.props.loadDictDetail();
         this.fillConfigForm();
         console.log(this.props);
      },

      async fillConfigForm() {
         this.props.loadConfigData(this.configId).then((response)=>{
            this.configData = response;
            this.update();
            M.updateTextFields();
            M.textareaAutoResize($('#ident_blurb'));
            var langs_data = {};
            this.configData.langs.forEach(lang => {
               langs_data[lang['lang']] = null;
            });
            $('#ident_lang').autocomplete({data: langs_data});
         });
      },

      getConfigData() {
         var newData = {
            'title': $('#ident_title').val(),
            'blurb': $('#ident_blurb').val(),
            'lang': $('#ident_lang').val(),
            'handle': $('#ident_handle').val()
         };
         return newData;
      },

      saveData() {
         console.log(this.getConfigData());
         $('#submit_button').html('Saving...');
         this.props.saveConfigData(this.configId, this.getConfigData());
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<dict-config-nav expr50="expr50"></dict-config-nav><h3>Description</h3><div><form><div class="row"><div class="input-field"><input expr51="expr51" placeholder="My Dictionary" id="ident_title" type="text" class="validate" style="width:300px"/><label for="ident_title">Dictionary name</label><span class="helper-text">A human-readable title for your dictionary, such as <i>My Esperanto Dictionary</i>.</span></div></div><div class="row"><div class="input-field"><textarea expr52="expr52" id="ident_blurb" class="materialize-textarea" placeholder="Yet another Lexonomy dictionary." rows="3"> </textarea><label for="ident_blurb">Dictionary description</label><span class="helper-text">This will appear on your dictionary\'s home page. You can leave it blank if you prefer.<br/>You can use <a href="https://daringfireball.net/projects/markdown/" target="_blank">Markdown</a> here.</span></div></div><div class="row"><div class="input-field"><input expr53="expr53" type="text" id="ident_lang" class="autocomplete" placeholder="Type to search for language, or write your custom info" style="width:300px"/><label for="ident_lang">Main language</label><span class="helper-text">Language of dictionary entries, used to sort dictionaries on your home page. You can select language from the list, or write down your own.</span></div></div><div class="row"><div class="input-field"><input expr54="expr54" placeholder="URL" id="ident_handle" type="text" class="validate"/><label for="ident_title">Metadata from CLARIN repository</label><span class="helper-text">Link to metadata recorded in CLARIN repository, provide URL to \'handle\' link, eg. <tt expr55="expr55"></tt>.</span></div></div><dict-config-buttons expr56="expr56"></dict-config-buttons></form></div>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictId',
              evaluate: _scope => _scope.dictId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictTitle',
              evaluate: _scope => _scope.props.dictDetails.title
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configId',
              evaluate: _scope => _scope.configId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configTitle',
              evaluate: _scope => _scope.configTitle
            }
          ],

          redundantAttribute: 'expr50',
          selector: '[expr50]'
        },
        {
          redundantAttribute: 'expr51',
          selector: '[expr51]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.configData.title
            }
          ]
        },
        {
          redundantAttribute: 'expr52',
          selector: '[expr52]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.configData.blurb
            }
          ]
        },
        {
          redundantAttribute: 'expr53',
          selector: '[expr53]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.configData.lang
            }
          ]
        },
        {
          redundantAttribute: 'expr54',
          selector: '[expr54]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.configData.handle
            }
          ]
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'tt',

          slots: [
            {
              id: 'default',
              html: 'http://hdl.handle.net/11356/1094',
              bindings: []
            }
          ],

          attributes: [],
          redundantAttribute: 'expr55',
          selector: '[expr55]'
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-buttons',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'save-data',
              evaluate: _scope => _scope.saveData
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dict-id',
              evaluate: _scope => _scope.dictId
            }
          ],

          redundantAttribute: 'expr56',
          selector: '[expr56]'
        }
      ]
    ),

    name: 'dict-config-ident'
  };

  var dict_config_kontext = {
    css: `dict-config-kontext #searchElements,[is="dict-config-kontext"] #searchElements{ width: 10em; }`,

    exports: {
      dictId: '',
      configId: '',
      configTitle: 'KonText connection',

      configData: {
         url: 'https://www.clarin.si/kontext/', searchElements: [],
         container: '', template: '', markup: ''
      },

      onMounted() {
         this.dictId = this.props.dictId;
         this.configId = this.props.configId;
         console.log('config dict '+ this.dictId + '-' + this.configId);
         this.props.loadDictDetail();
         this.fillConfigForm();
         M.updateTextFields();
      },

      onUpdated() {
         if (this.props.dictConfigs.xema && this.props.dictConfigs.xema.elements) {
            if ($('#searchElements option').length == 0) {
               Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
                  if (info.filling == 'txt' || info.filling == 'lst') {
                     var checked = this.configData.searchElements.includes(key)? 'checked':'';
                     $('#searchElements').append('<option value="' + key + '" ' + checked + '>' + key + '</option>');
                  }
               });
            }
            if ($('#container option').length == 1) {
               Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
                     var checked = (this.configData.container == key)? 'checked':'';
                     $('#container').append('<option value="' + key + '" ' + checked + '>' + key + '</option>');
               });
            }
            if ($('#markup option').length == 1) {
               Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
                     var checked = (this.configData.markup == key)? 'checked':'';
                     $('#markup').append('<option value="' + key + '" ' + checked + '>' + key + '</option>');
               });
            }
            $('select').formSelect();
         }
      },

      async fillConfigForm() {
         this.props.loadConfigData(this.configId).then((response)=>{
            this.configData = response;
            if (!response.url || response.url == '') {
               this.configData.url = 'https://www.clarin.si/kontext/';
            }
            if (!response.searchElements) {
               this.configData.searchElements = [];
            }
            M.updateTextFields();
            M.textareaAutoResize($('#template'));
            $('#corpus').autocomplete({data: {}});
            $('#corpus').data('corpora', {});
            if (this.configData.corpus != '') {
               $('#corpus').data('selected-corpora', this.configData.corpus);
            }
            $.get({
               url: window.API_URL + this.dictId + '/kontext/corpora'
            }).done(function(res) {
               var corporaList = {};
               var corporaData = {};
               var selected = '';
               res.corpus_list.forEach(e => {
                  var eInfo = e.name + " (" + e.desc + "; " + e.size_info + ")";
                  corporaData[eInfo] = e.corpus_id;
                  corporaList[eInfo] = null;
                  if ($('#corpus').data('selected-corpus') == e.corpus_id) {
                     selected = eInfo;
                     $('#corpusInfo').html('Currently selected corpus: ' + e.name + ".");
                     $('#corpusInfo').show();
                  }
               });
               $('#corpus').autocomplete({data: corporaList});
               $('#corpus').data('corpora', corporaData);
               $('#corpus').attr('placeholder', 'Type to search in the list of corpora');
               if (selected != '') {
                  $('#corpus').val(selected);
               }
            });
            $('#corpus').on('change', function() {
               var corporaData = $(this).data('corpora');
               $(this).data('selected-corpus', corporaData[$(this).val()]);
               $('#corpusInfo').html('Currently selected corpus: ' + $(this).val() + ".");
               $('#corpusInfo').show();
            });

            this.configData.searchElements.forEach(el => {
               $('#searchElements option[value='+el+']').attr('selected','selected');
            });
            if (this.configData.container != '') {
               $('#container option[value='+this.configData.container+']').attr('selected','selected');
            }
            if (this.configData.markup != '') {
               $('#markup option[value='+this.configData.markup+']').attr('selected','selected');
            }
            $('select').formSelect();
            this.update();
         });
      },

      getConfigData() {
         var newData = {
            url: $('#kontext_url').val(),
            corpus: $('#corpus').data('selected-corpus'),
            concquery: $('#concquery').val(),
            searchElements: $('#searchElements').val(),
            container: $('#container').val(),
            template: $('#template').val(),
            markup: $('#markup').val(),
         };
         return newData;
      },

      saveData() {
         console.log(this.getConfigData());
         $('#submit_button').html('Saving...');
         this.props.saveConfigData(this.configId, this.getConfigData());
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<dict-config-nav expr104="expr104"></dict-config-nav><h3>KonText connection</h3><div class="row"><div class="input-field"><input expr105="expr105" placeholder id="kontext_url" type="text" class/><label for="kontext_url">KonText URL</label><span class="helper-text">The URL of the KonText installation where external links should point. Defaults to <tt expr106="expr106"></tt>. Do not change this unless you are using a local installation of KonText.</span></div></div><div class="row"><div class="input-field"><input expr107="expr107" type="text" id="corpus" class="autocomplete" placeholder="Retrieving available corpora from KonText, please wait..."/><label for="corpus">Corpus name</label><span class="helper-text">Select a Sketch Engine corpus from the list of corpora available to you.</span><span expr108="expr108" class="helper-text" id="corpusInfo"></span></div></div><div class="row"><div class="input-field"><input expr109="expr109" placeholder id="concquery" type="text" class/><label for="concquery">Concordance query</label><span class="helper-text">The CQL query that will be used to obtain concordance from KonText. You can use placeholders for elements in the form of \'%(element)\', e.g. \'[lemma="%(headword)"]\'. If left empty the \'simple\' query type will be used as configured for the respective corpus. Please note that you cannot use CQL syntax with default attribute because it is not specified.</span></div></div><div class="row"><div class="input-field"><select id="searchElements" multiple></select><label for="searchElements">Additional search elements</label><span class="helper-text">You can select any textual elements here whose content you would like to search for in KonText. A menu will be displayed next to all these elements like for the root entry element.</span></div></div><div class="row"><h4>Examples</h4></div><div class="row"><div class="input-field"><select id="container"><option value>(not set)</option></select><label for="container">Example container</label><span class="helper-text">Select the element which should wrap each individual example. When you pull example sentences automatically from a corpus, Lexonomy will insert one of these elements for each example sentence.</span></div></div><div class="row"><div class="input-field"><textarea expr110="expr110" id="template" class="materialize-textarea" placeholder="XML template"> </textarea><label for="template">XML template</label><span class="helper-text">This is the XML that will be inserted into your entries with each corpus example. The actual text will be where the placeholder <tt expr111="expr111"></tt> is.</span></div></div><div class="row"><div class="input-field"><select id="markup"><option value>(not set)</option></select><label for="markup">Headword mark-up</label><span class="helper-text">Select the element which should mark up the headword in inserted corpus examples. This setting is optional: if you make no selection, corpus examples will be inserted without mark-up.</span></div></div><dict-config-buttons expr112="expr112"></dict-config-buttons>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictId',
              evaluate: _scope => _scope.dictId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictTitle',
              evaluate: _scope => _scope.props.dictDetails.title
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configId',
              evaluate: _scope => _scope.configId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configTitle',
              evaluate: _scope => _scope.configTitle
            }
          ],

          redundantAttribute: 'expr104',
          selector: '[expr104]'
        },
        {
          redundantAttribute: 'expr105',
          selector: '[expr105]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.configData.url
            }
          ]
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'tt',

          slots: [
            {
              id: 'default',
              html: 'https://www.clarin.si/kontext/',
              bindings: []
            }
          ],

          attributes: [],
          redundantAttribute: 'expr106',
          selector: '[expr106]'
        },
        {
          redundantAttribute: 'expr107',
          selector: '[expr107]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'data-selected-corpus',
              evaluate: _scope => _scope.configData.corpus
            }
          ]
        },
        {
          redundantAttribute: 'expr108',
          selector: '[expr108]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'hide',
              evaluate: _scope => true
            }
          ]
        },
        {
          redundantAttribute: 'expr109',
          selector: '[expr109]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.configData.concquery
            }
          ]
        },
        {
          redundantAttribute: 'expr110',
          selector: '[expr110]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.configData.template
            }
          ]
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'tt',

          slots: [
            {
              id: 'default',
              html: '$text',
              bindings: []
            }
          ],

          attributes: [],
          redundantAttribute: 'expr111',
          selector: '[expr111]'
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-buttons',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'save-data',
              evaluate: _scope => _scope.saveData
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dict-id',
              evaluate: _scope => _scope.dictId
            }
          ],

          redundantAttribute: 'expr112',
          selector: '[expr112]'
        }
      ]
    ),

    name: 'dict-config-kontext'
  };

  var dict_config_links = {
    css: `dict-config-links tbody tr,[is="dict-config-links"] tbody tr{ border-bottom: none; } dict-config-links th,[is="dict-config-links"] th,dict-config-links td,[is="dict-config-links"] td{ padding: 10px 10px 0 0; } dict-config-links td,[is="dict-config-links"] td{ vertical-align: top; } dict-config-links td .input-field,[is="dict-config-links"] td .input-field{ margin: 0; }`,

    exports: {
      isLoading: true,
      dictId: '',
      configId: '',
      configTitle: 'Linking',
      configData: {elements:[]},
      unusedElements: [],

      doDeleteEl(element) {
         this.configData.elements = this.configData.elements.filter(val => val.linkElement != element);
         this.update();
      },

      doAddEl(event) {
         this.configData.elements.push({linkElement: this.unusedElements[0], identifier: "", preview: ""});
         this.update();
      },

      onMounted() {
         this.dictId = this.props.dictId;
         this.configId = this.props.configId;
         this.props.loadDictDetail();
         this.fillConfigForm();
         M.updateTextFields();
         console.log(this.props);

         //check NAISC status
         $.get(window.API_URL + this.dictId + "/linking.json", (response) => {
            if (response.bgjob != -1) {
               $("#naisc_link").html("Linking to '" + response.otherdictID + "' already in progress, please wait...");
            } else {
               $("#naisc_link").html("Start linking");
            }
         });
      },

      onBeforeUpdate(){
         this.refreshUnusedElements();
      },

      onUpdated() {
         if (this.props.dictConfigs.xema && this.props.dictConfigs.xema.elements) {
            $("select").each(function(idx, el){
               var $select = $(el);
               var instance = M.FormSelect.getInstance(el);
               $select.off("change", this.onElementChange);
               instance && instance.destroy();
               $select.empty();
               var key = $select.attr("linkelement");
               $select.append(`<option value="${key}" selected}>${key}</option>`);
               this.unusedElements.forEach(key => {
                  $select.append(`<option value="${key}">${key}</option>`);
               });
               $('select').formSelect()
                  .on("change", this.onElementChange);
            }.bind(this));
         }
      },

      onElementChange(evt){
         var idx = $(evt.target).closest("tr").attr("idx");
         this.configData.elements[idx].linkElement = $(evt.target).find("option:selected").attr("value");
         this.update();
      },

      onItemChange(evt){
         var idx = $(evt.target).closest("tr").attr("idx");
         this.configData.elements[idx][evt.target.name] = evt.target.value;
      },

      refreshUnusedElements(){
         var savedElements = this.configData.elements.map(e => e.linkElement);
         this.unusedElements = Object.keys(this.props.dictConfigs.xema.elements).filter(el => {
            return !savedElements.includes(el)
         });
      },

      checkOtherDict() {
         $("#naisc_link").prop("disabled", $("#otherdict").val().length == 0);
      },

      startLinking() {
         var otherdict = $("#otherdict").val();
         $("#naisc_link").html("Initiating linking ...");
         $("#naisc_link").prop("disabled", true);
         $.get(window.API_URL + this.dictId + "/linknaisc.json", {"otherdictID": otherdict}).done(function(data) {
            $("#naisc_link").html("Linking in progress, please wait...");
            $("#naisc_link").data("bgjob", data["bgjob"]);
         });
         this.waitForLinking(otherdict, this.dictId);
      },

      waitForLinking(otherdict, dictId) {
         var naiscTimer = setInterval(checkNaisc, 1000);
         function checkNaisc() {
            var jobid = $("#naisc_link").data("bgjob");
            if (jobid != "") {
               $.get(window.API_URL + dictId + "/naiscprogress.json", {"otherdictID": otherdict, "jobid": jobid}).done(function(data) {
                  if (data["status"] == "finished") {
                     clearInterval(naiscTimer);
                     $("#naisc_link").html("Linking done. <a href='#/" + this.dictId + "/links'>See results.</a>");
                     $("#naisc_link").data("bgjob", "");
                  } else if (data["status"] == "failed") {
                     clearInterval(naiscTimer);
                     $("#naisc_link").html("Linking failed :(");
                     $("#naisc_link").data("bgjob", "");
                  }
               });
            }
         }
      },

      async fillConfigForm() {
         this.props.loadConfigData(this.configId).then((response)=>{
            this.isLoading = false;
            this.configData = {elements:[]};
            for (var key in response) {
               this.configData.elements.push(response[key]);
            }
            this.update();
         });
      },

      saveData() {
         var data = {};
         this.configData.elements.forEach(item => {
            data[item.linkElement] = item;
         });
         $('#submit_button').html('Saving...');
         this.props.saveConfigData(this.configId, data);
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<dict-config-nav expr74="expr74"></dict-config-nav><h3>Manual linking between entries</h3><div><p>Elements listed here can be used as target of cross-reference link. For each element, specify unique identifier in the form of placeholders <tt expr75="expr75"></tt>. Eg. element <tt expr76="expr76"></tt> can have identifier <tt expr77="expr77"></tt>, element <tt expr78="expr78"></tt> can have identifier <tt expr79="expr79"></tt>. Optionally, specify element you want to show as preview when selecting links.</p><div expr80="expr80" class="center-align grey-text"></div><template expr81="expr81"></template><br/><br/><div><h4>Automatic linking using NAISC</h4></div><div><div><label for="otherdict">Other dictionary code</label></div><div class="input-field inlineBlock" style="max-width: 400px;"><input expr90="expr90" type="text" id="otherdict"/></div><div class="input-field inlineBlock"><button expr91="expr91" class="btn waves-effect waves-light" id="naisc_link" data-bgjob disabled style="margin-left: 10px;">Checking status, wait...</button></div></div></div><br/><a expr92="expr92" class="btn btn-secondary btn-flat">Back</a>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictId',
              evaluate: _scope => _scope.dictId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictTitle',
              evaluate: _scope => _scope.props.dictDetails.title
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configId',
              evaluate: _scope => _scope.configId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configTitle',
              evaluate: _scope => _scope.configTitle
            }
          ],

          redundantAttribute: 'expr74',
          selector: '[expr74]'
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'tt',

          slots: [
            {
              id: 'default',
              html: '\'%(element)\'',
              bindings: []
            }
          ],

          attributes: [],
          redundantAttribute: 'expr75',
          selector: '[expr75]'
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'tt',

          slots: [
            {
              id: 'default',
              html: 'entry',
              bindings: []
            }
          ],

          attributes: [],
          redundantAttribute: 'expr76',
          selector: '[expr76]'
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'tt',

          slots: [
            {
              id: 'default',
              html: '%(lemma)-%(pos)',
              bindings: []
            }
          ],

          attributes: [],
          redundantAttribute: 'expr77',
          selector: '[expr77]'
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'tt',

          slots: [
            {
              id: 'default',
              html: 'sense',
              bindings: []
            }
          ],

          attributes: [],
          redundantAttribute: 'expr78',
          selector: '[expr78]'
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'tt',

          slots: [
            {
              id: 'default',
              html: '%(lemma)-%(number)',
              bindings: []
            }
          ],

          attributes: [],
          redundantAttribute: 'expr79',
          selector: '[expr79]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.isLoading,
          redundantAttribute: 'expr80',
          selector: '[expr80]',

          template: template(
            '<h3>loading elements...</h3>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.isLoading,
          redundantAttribute: 'expr81',
          selector: '[expr81]',

          template: template(
            '<table expr82="expr82"></table><div class="buttons"><button expr88="expr88">\n               add element\n               <i class="material-icons right">add</i></button><button expr89="expr89" class="btn waves-effect waves-light" id="submit_button">\n               Save\n               <i class="material-icons right">save</i></button></div>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.configData.elements.length,
                redundantAttribute: 'expr82',
                selector: '[expr82]',

                template: template(
                  '<thead><tr><th>Linking element</th><th>Idenitifier</th><th>Preview</th><th></th></tr></thead><tbody><tr expr83="expr83"></tr></tbody>',
                  [
                    {
                      type: bindingTypes.EACH,
                      getKey: null,
                      condition: null,

                      template: template(
                        '<td><div class="input-field"><select expr84="expr84"></select></div></td><td><div class="input-field"><input expr85="expr85" type="text" name="identifier"/></div></td><td><div class="input-field"><input expr86="expr86" type="text" name="preview"/></div></td><td><a expr87="expr87" class="btn btn-floating right"><i class="material-icons">delete</i></a></td>',
                        [
                          {
                            expressions: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'idx',
                                evaluate: _scope => _scope.idx
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr84',
                            selector: '[expr84]',

                            expressions: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'linkelement',
                                evaluate: _scope => _scope.element.linkElement
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr85',
                            selector: '[expr85]',

                            expressions: [
                              {
                                type: expressionTypes.VALUE,
                                evaluate: _scope => _scope.element.identifier
                              },
                              {
                                type: expressionTypes.EVENT,
                                name: 'onchange',
                                evaluate: _scope => _scope.onItemChange
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr86',
                            selector: '[expr86]',

                            expressions: [
                              {
                                type: expressionTypes.VALUE,
                                evaluate: _scope => _scope.element.preview
                              },
                              {
                                type: expressionTypes.EVENT,
                                name: 'onchange',
                                evaluate: _scope => _scope.onItemChange
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr87',
                            selector: '[expr87]',

                            expressions: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'data-element',
                                evaluate: _scope => _scope.element.linkElement
                              },
                              {
                                type: expressionTypes.EVENT,
                                name: 'onclick',
                                evaluate: _scope => _scope.doDeleteEl.bind(_scope, _scope.element.linkElement)
                              }
                            ]
                          }
                        ]
                      ),

                      redundantAttribute: 'expr83',
                      selector: '[expr83]',
                      itemName: 'element',
                      indexName: 'idx',
                      evaluate: _scope => _scope.configData.elements
                    }
                  ]
                )
              },
              {
                redundantAttribute: 'expr88',
                selector: '[expr88]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'class',

                    evaluate: _scope => [
                      'btn ',
                      _scope.unusedElements.length ? '' : 'disabled'
                    ].join(
                      ''
                    )
                  },
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.doAddEl
                  }
                ]
              },
              {
                redundantAttribute: 'expr89',
                selector: '[expr89]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.saveData
                  }
                ]
              }
            ]
          )
        },
        {
          redundantAttribute: 'expr90',
          selector: '[expr90]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'oninput',
              evaluate: _scope => _scope.checkOtherDict
            }
          ]
        },
        {
          redundantAttribute: 'expr91',
          selector: '[expr91]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.startLinking
            }
          ]
        },
        {
          redundantAttribute: 'expr92',
          selector: '[expr92]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#',
                _scope.dictId,
                '/config'
              ].join(
                ''
              )
            }
          ]
        }
      ]
    ),

    name: 'dict-config-links'
  };

  var dict_config_nav = {
    css: null,
    exports: null,

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<nav class="nav-breadcrumbs"><div class="nav-wrapper"><a expr93="expr93" class="breadcrumb"> </a><a expr94="expr94" class="breadcrumb">Configure</a><a expr95="expr95" class="breadcrumb"></a></div></nav>',
      [
        {
          redundantAttribute: 'expr93',
          selector: '[expr93]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.props.dictTitle
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.props.dictId
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr94',
          selector: '[expr94]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.props.dictId,
                '/config'
              ].join(
                ''
              )
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.props.configId,
          redundantAttribute: 'expr95',
          selector: '[expr95]',

          template: template(
            ' ',
            [
              {
                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.props.configTitle
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'href',

                    evaluate: _scope => [
                      '#/',
                      _scope.props.dictId,
                      '/config/',
                      _scope.props.configId
                    ].join(
                      ''
                    )
                  }
                ]
              }
            ]
          )
        }
      ]
    ),

    name: 'dict-config-nav'
  };

  var dict_config_buttons = {
    css: `dict-config-buttons,[is="dict-config-buttons"]{ margin-top: 20px; }`,
    exports: null,

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<a expr113="expr113">\n      Back\n   </a><button expr114="expr114" class="btn waves-effect waves-light" id="submit_button"></button>',
      [
        {
          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'class',
              evaluate: _scope => 'buttons'
            }
          ]
        },
        {
          redundantAttribute: 'expr113',
          selector: '[expr113]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#',
                _scope.props.dictId,
                '/config'
              ].join(
                ''
              )
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'class',

              evaluate: _scope => [
                'btn btn-secondary ',
                !_scope.props.showSave ? '' : 'btn-flat'
              ].join(
                ''
              )
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => typeof _scope.props.showSave == "undefined" ? true : _scope.props.showSave,
          redundantAttribute: 'expr114',
          selector: '[expr114]',

          template: template(
            ' <i class="material-icons right">save</i>',
            [
              {
                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,

                    evaluate: _scope => [
                      _scope.props.label || "Save"
                    ].join(
                      ''
                    )
                  },
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.props.saveData
                  }
                ]
              }
            ]
          )
        }
      ]
    ),

    name: 'dict-config-buttons'
  };

  var dict_config_publico = {
    css: null,

    exports: {
      isLoading: true,
      dictId: '',
      configId: '',
      configTitle: 'Publishing',
      configData: {},

      licences: [
         {
            id: 'cc-by-4.0',
            title: 'Creative Commons Attribution 4.0 International',
            url: 'https://creativecommons.org/licenses/by/4.0/'
         },
         {
            id: 'cc-by-sa-4.0',
            title: 'Creative Commons Attribution Share-Alike 4.0 International',
            url: 'https://creativecommons.org/licenses/by-sa/4.0/'
         },
         {
            id: 'odbl-1.0',
            title: 'Open Database Licence 1.0',
            url: 'https://opendatacommons.org/licenses/odbl/summary/'
         }
      ],

      onCheckboxChange(evt){
         this.configData.public = evt.target.value == "1";
         if(!this.configData.public){
            this.configData.licence = "";
         } else {
            this.configData.licence = "cc-by-4.0";
         }
         this.update();
      },

      onMounted() {
         this.dictId = this.props.dictId;
         this.configId = this.props.configId;
         this.props.loadDictDetail();
         this.fillConfigForm();
      },

      refreshLicenceInfo(){
         var url = $('#publico_licence option:selected').data('url');
         $('#publico_licence_info .helper-text').html('More information about this licence: <a target="_blank" href="' + url + '">' + url + "</a>.");
      },

      onUpdated(){
         $('#publico_licence').formSelect()
               .off("change")
               .on('change', this.refreshLicenceInfo.bind(this));       this.refreshLicenceInfo();
      },

      async fillConfigForm() {
         this.props.loadConfigData(this.configId).then(response=>{
            this.isLoading = false;
            this.configData = response;
            this.update();
         });
      },

      saveData() {
         $('#submit_button').html('Saving...');
         this.props.saveConfigData(this.configId, this.configData);
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<dict-config-nav expr123="expr123"></dict-config-nav><h3>Publishing</h3><div expr124="expr124" class="center-align grey-text"></div><template expr125="expr125"></template>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictId',
              evaluate: _scope => _scope.dictId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictTitle',
              evaluate: _scope => _scope.props.dictDetails.title
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configId',
              evaluate: _scope => _scope.configId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configTitle',
              evaluate: _scope => _scope.configTitle
            }
          ],

          redundantAttribute: 'expr123',
          selector: '[expr123]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.isLoading,
          redundantAttribute: 'expr124',
          selector: '[expr124]',

          template: template(
            '<h3>Loading...</h3>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.isLoading,
          redundantAttribute: 'expr125',
          selector: '[expr125]',

          template: template(
            '<div class="row"><div class="input-field"><p><label><input expr126="expr126" name="publico_public" type="radio" class="with-gap" value="0"/><span>Private</span></label><label style="margin-left: 30px;"><input expr127="expr127" name="publico_public" type="radio" class="with-gap" value="1"/><span>Public</span></label></p><span class="helper-text"><i>Private</i> means that the dictionary is not publicly viewable. <i>Public</i> means that the dictionary is publicly viewable.\n            </span></div></div><div expr128="expr128" class="row"></div><dict-config-buttons expr130="expr130"></dict-config-buttons>',
            [
              {
                redundantAttribute: 'expr126',
                selector: '[expr126]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'checked',
                    evaluate: _scope => !_scope.configData.public
                  },
                  {
                    type: expressionTypes.EVENT,
                    name: 'onchange',
                    evaluate: _scope => _scope.onCheckboxChange
                  }
                ]
              },
              {
                redundantAttribute: 'expr127',
                selector: '[expr127]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'checked',
                    evaluate: _scope => _scope.configData.public
                  },
                  {
                    type: expressionTypes.EVENT,
                    name: 'onchange',
                    evaluate: _scope => _scope.onCheckboxChange
                  }
                ]
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.configData.public,
                redundantAttribute: 'expr128',
                selector: '[expr128]',

                template: template(
                  '<div class="input-field" id="publico_licence_info" style="max-width: 500px;"><select id="publico_licence"><option expr129="expr129"></option></select><label>Licence</label><span class="helper-text"></span></div>',
                  [
                    {
                      type: bindingTypes.EACH,
                      getKey: null,
                      condition: null,

                      template: template(
                        ' ',
                        [
                          {
                            expressions: [
                              {
                                type: expressionTypes.TEXT,
                                childNodeIndex: 0,
                                evaluate: _scope => _scope.licence.title
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'value',
                                evaluate: _scope => _scope.licence.id
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'data-url',
                                evaluate: _scope => _scope.licence.url
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'selected',
                                evaluate: _scope => _scope.configData.licence == _scope.licence.id
                              }
                            ]
                          }
                        ]
                      ),

                      redundantAttribute: 'expr129',
                      selector: '[expr129]',
                      itemName: 'licence',
                      indexName: null,
                      evaluate: _scope => _scope.licences
                    }
                  ]
                )
              },
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'dict-config-buttons',
                slots: [],

                attributes: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'save-data',
                    evaluate: _scope => _scope.saveData
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'dict-id',
                    evaluate: _scope => _scope.dictId
                  }
                ],

                redundantAttribute: 'expr130',
                selector: '[expr130]'
              }
            ]
          )
        }
      ]
    ),

    name: 'dict-config-publico'
  };

  var dict_config_searchability = {
    css: null,

    exports: {
      isLoading: true,
      hasElements: false,
      dictId: '',
      configId: '',
      configTitle: 'Searching',
      configData: {searchableElements: []},

      onMounted() {
         this.dictId = this.props.dictId;
         this.configId = this.props.configId;
         console.log('config dict '+ this.dictId + '-' + this.configId);
         this.props.loadDictDetail();
         this.fillConfigForm();
         console.log(this.props);
      },

      onUpdated() {
         this.hasElements = this.props.dictConfigs.xema && this.props.dictConfigs.xema.elements && this.props.dictConfigs.xema.elements;
      },

      async fillConfigForm() {
         this.props.loadConfigData(this.configId).then((response)=>{
            this.configData = response;
            this.isLoading = false;
            this.update();
         });
      },

      getConfigData() {
         let searchableElements = $('input[type="checkbox"]:checked').toArray().map(function(elem){
            return $(elem).attr("value")
         });
         return {
            searchableElements: searchableElements
         }
      },

      saveData() {
         console.log(this.getConfigData());
         $('#submit_button').html('Saving...');
         this.props.saveConfigData(this.configId, this.getConfigData());
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<dict-config-nav expr115="expr115"></dict-config-nav><h3>Searching</h3><div expr116="expr116" class="center-align grey-text"></div><div expr117="expr117" class="center-align grey-text"></div><div expr118="expr118"></div><br/><br/><dict-config-buttons expr122="expr122"></dict-config-buttons>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictId',
              evaluate: _scope => _scope.dictId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictTitle',
              evaluate: _scope => _scope.props.dictDetails.title
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configId',
              evaluate: _scope => _scope.configId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configTitle',
              evaluate: _scope => _scope.configTitle
            }
          ],

          redundantAttribute: 'expr115',
          selector: '[expr115]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.isLoading,
          redundantAttribute: 'expr116',
          selector: '[expr116]',

          template: template(
            '<h3>\n         loading searchable elements...\n      </h3>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.isLoading && !_scope.hasElements,
          redundantAttribute: 'expr117',
          selector: '[expr117]',

          template: template(
            '<h3>No elements found</h3>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.isLoading && _scope.hasElements,
          redundantAttribute: 'expr118',
          selector: '[expr118]',

          template: template(
            '<label for="search-element">Searchable elements</label><div class="helper-text">\n         The contents of elements you select here will be searchable (in addition to each entry\'s headword).\n      </div><br/><div expr119="expr119"></div>',
            [
              {
                type: bindingTypes.EACH,
                getKey: null,
                condition: null,

                template: template(
                  '<label><input expr120="expr120" type="checkbox"/><span expr121="expr121"> </span></label>',
                  [
                    {
                      redundantAttribute: 'expr120',
                      selector: '[expr120]',

                      expressions: [
                        {
                          type: expressionTypes.VALUE,
                          evaluate: _scope => _scope.element
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'checked',
                          evaluate: _scope => _scope.configData.searchableElements && _scope.configData.searchableElements.includes(_scope.element)
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'disabled',
                          evaluate: _scope => _scope.element == _scope.props.dictConfigs.titling.headword
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr121',
                      selector: '[expr121]',

                      expressions: [
                        {
                          type: expressionTypes.TEXT,
                          childNodeIndex: 0,
                          evaluate: _scope => _scope.element
                        }
                      ]
                    }
                  ]
                ),

                redundantAttribute: 'expr119',
                selector: '[expr119]',
                itemName: 'element',
                indexName: null,
                evaluate: _scope => Object.keys(_scope.props.dictConfigs.xema.elements)
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-buttons',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'save-data',
              evaluate: _scope => _scope.saveData
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dict-id',
              evaluate: _scope => _scope.dictId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'show-save',
              evaluate: _scope => _scope.hasElements
            }
          ],

          redundantAttribute: 'expr122',
          selector: '[expr122]'
        }
      ]
    ),

    name: 'dict-config-searchability'
  };

  var dict_config_ske = {
    css: `dict-config-ske #kex_concsampling,[is="dict-config-ske"] #kex_concsampling{ width: 4em; } dict-config-ske #kex_searchElements,[is="dict-config-ske"] #kex_searchElements{ width: 10em; }`,

    exports: {
      dictId: '',
      configId: '',
      configTitle: 'Sketch Engine connection',

      configData: {
         kex: {url: 'https://app.sketchengine.eu', apiurl: 'https://api.sketchengine.eu/bonito/run.cgi', concsampling: 0, searchElements: []},
         xampl: {container: '', template: '', markup: ''},
         collx: {container: '', template: ''},
         defo: {container: '', template: ''},
         thes: {container: '', template: ''},
      },

      onMounted() {
         this.dictId = this.props.dictId;
         this.configId = this.props.configId;
         console.log('config dict '+ this.dictId + '-' + this.configId);
         this.props.loadDictDetail();
         this.fillConfigForm();
         M.updateTextFields();
      },

      onUpdated() {
         if (this.props.dictConfigs.xema && this.props.dictConfigs.xema.elements) {
            if ($('#kex_searchElements option').length == 0) {
               Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
                  if (info.filling == 'txt' || info.filling == 'lst') {
                     var checked = this.configData.kex.searchElements.includes(key)? 'checked':'';
                     $('#kex_searchElements').append('<option value="' + key + '" ' + checked + '>' + key + '</option>');
                  }
               });
            }
            if ($('#xampl_container option').length == 1) {
               Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
                  var checked = (this.configData.xampl.container == key)? 'checked':'';
                  $('#xampl_container').append('<option value="' + key + '" ' + checked + '>' + key + '</option>');
               });
            }
            if ($('#xampl_markup option').length == 1) {
               Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
                  var checked = (this.configData.xampl.markup == key)? 'checked':'';
                  $('#xampl_markup').append('<option value="' + key + '" ' + checked + '>' + key + '</option>');
               });
            }
            if ($('#collx_container option').length == 1) {
               Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
                  var checked = (this.configData.collx.container == key)? 'checked':'';
                  $('#collx_container').append('<option value="' + key + '" ' + checked + '>' + key + '</option>');
               });
            }
            if ($('#defo_container option').length == 1) {
               Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
                  var checked = (this.configData.defo.container == key)? 'checked':'';
                  $('#defo_container').append('<option value="' + key + '" ' + checked + '>' + key + '</option>');
               });
            }
            if ($('#thes_container option').length == 1) {
               Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
                  var checked = (this.configData.thes.container == key)? 'checked':'';
                  $('#thes_container').append('<option value="' + key + '" ' + checked + '>' + key + '</option>');
               });
            }
            $('select').formSelect();
         }
      },

      async fillConfigForm() {
         this.props.loadConfigData(this.configId).then((response)=>{
            this.configData = response;
            if (!this.configData.kex.concsampling || this.configData.kex.concsampling == '') {
               this.configData.kex.concsampling = 0;
            }
            if (!response.kex.searchElements) {
               this.configData.kex.searchElements = [];
            }
            M.updateTextFields();
            M.textareaAutoResize($('#xampl_template'));
            $('#kex_corpus').autocomplete({data: {}});
            $('#kex_corpus').data('corpora', {});
            if (this.configData.kex.corpus != '') {
               $('#kex_corpus').data('selected-corpora', this.configData.kex.corpus);
            }
            $.get({
               url: window.API_URL + 'skeget/corpora'
            }).done(function(res) {
               var corporaList = {};
               var corporaData = {};
               var selected = '';
               res.data.forEach(e => {
                  var size = "";
                  if (e.sizes) {
                     size = ", " + (e.sizes.tokencount / 1000000).toFixed(2) + "M tokens";
                  }
                  var eInfo = e.name + " (" + e.language_name + size + ")";
                  corporaData[eInfo] = e.corpname;
                  corporaList[eInfo] = null;
                  if ($('#kex_corpus').data('selected-corpora') == e.corpname) {
                     selected = eInfo;
                     $('#corpusInfo').html('Currently selected corpus: ' + e.name + ", show <a href='" + $.trim($("#kex_url").val()) + "#dashboard?corp_info=1&corpname=" + encodeURIComponent(e.corpname) + "' target='ske'>detailed corpus info</a>.");
                     $('#corpusInfo').show();
                  }
               });
               $('#kex_corpus').autocomplete({data: corporaList});
               $('#kex_corpus').data('corpora', corporaData);
               $('#kex_corpus').attr('placeholder', 'Type to search in the list of corpora');
               if (selected != '') {
                  $('#kex_corpus').val(selected);
               }
            });
            $('#kex_corpus').on('change', function() {
               var corporaData = $(this).data('corpora');
               var corpname = $(this).val();
               $(this).data('selected-corpus', corporaData[$(this).val()]);
               if(corpname === ""){
                  $('#corpusInfo').hide();
               } else {
                  $('#corpusInfo').html('Currently selected corpus: ' + corpname + ", show <a href='" + $.trim($("#kex_url").val()) + "#dashboard?corp_info=1&corpname=" + encodeURIComponent(corporaData[corpname]) + "' target='ske'>detailed corpus info</a>.");
                  $('#corpusInfo').show();
               }
            });

            this.configData.kex.searchElements.forEach(el => {
               $('#kex_searchElements option[value='+el+']').attr('selected','selected');
            });
            if (this.configData.xampl.container != '') {
               $('#xampl_container option[value='+this.configData.xampl.container+']').attr('selected','selected');
            }
            if (this.configData.xampl.markup != '') {
               $('#xampl_markup option[value='+this.configData.xampl.markup+']').attr('selected','selected');
            }
            if (this.configData.collx.container != '') {
               $('#collx_container option[value='+this.configData.collx.container+']').attr('selected','selected');
            }
            if (this.configData.thes.container != '') {
               $('#thes_container option[value='+this.configData.thes.container+']').attr('selected','selected');
            }
            if (this.configData.defo.container != '') {
               $('#defo_container option[value='+this.configData.defo.container+']').attr('selected','selected');
            }
            $('select').formSelect();
            this.update();
         });
      },

      getConfigData() {
         var newData = {
            kex: {
               url: $('#kex_url').val(),
               apiurl: $('#kex_apiurl').val(),
               corpus: $('#kex_corpus').data('selected-corpus'),
               concquery: $('#kex_concquery').val(),
               concsampling:$('#kex_concsampling').val(),
               searchElements: $('#kex_searchElements').val()
            },
            xampl: {
               container: $('#xampl_container').val(),
               template: $('#xampl_template').val(),
               markup: $('#xampl_markup').val(),
            },
            collx: {
               container: $('#collx_container').val(),
               template: $('#collx_template').val(),
            },
            defo: {
               container: $('#defo_container').val(),
               template: $('#defo_template').val(),
            },
            thes: {
               container: $('#thes_container').val(),
               template: $('#thes_template').val(),
            },
         };
         return newData;
      },

      saveData() {
         console.log(this.getConfigData());
         $('#submit_button').html('Saving...');
         this.props.saveConfigData(this.configId, this.getConfigData());
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<dict-config-nav expr131="expr131"></dict-config-nav><h3>Sketch Engine connection</h3><div class="row"><div class="input-field"><input expr132="expr132" placeholder id="kex_url" type="text" class/><label for="kex_url">Sketch Engine URL</label><span class="helper-text">The URL of the Sketch Engine installation where external links should point. Defaults to <tt expr133="expr133"></tt>. Do not change this unless you are using a local installation of Sketch Engine.</span></div></div><div class="row"><div class="input-field"><input expr134="expr134" placeholder id="kex_apiurl" type="text" class/><label for="kex_apiurl">Sketch Engine API URL</label><span class="helper-text">The path to the <tt expr135="expr135"></tt> API script in Sketch Engine. Defaults to <tt expr136="expr136"></tt>. Do not change this unless you are using a local installation of Sketch Engine.</span></div></div><template expr137="expr137"></template><template expr141="expr141"></template><div class="row"><h4>Examples</h4></div><div class="row"><div class="input-field"><select id="xampl_container"><option value>(not set)</option></select><label for="xampl_container">Example container</label><span class="helper-text">Select the element which should wrap each individual example. When you pull example sentences automatically from a corpus, Lexonomy will insert one of these elements for each example sentence.</span></div></div><div class="row"><div class="input-field"><textarea expr142="expr142" id="xampl_template" class="materialize-textarea" placeholder="XML template"> </textarea><label for="xampl_template">XML template</label><span class="helper-text">This is the XML that will be inserted into your entries with each corpus example. The actual text will be where the placeholder <tt expr143="expr143"></tt> is.</span></div></div><div class="row"><div class="input-field"><select id="xampl_markup"><option value>(not set)</option></select><label for="xampl_markup">Headword mark-up</label><span class="helper-text">Select the element which should mark up the headword in inserted corpus examples. This setting is optional: if you make no selection, corpus examples will be inserted without mark-up.</span></div></div><div class="row"><h4>Collocations</h4></div><div class="row"><div class="input-field"><select id="collx_container"><option value>(not set)</option></select><label for="collx_container">Collocation container</label><span class="helper-text">Select the element which should wrap each collocation (the collocate plus any other data). When you pull collocations automatically from a corpus, Lexonomy will insert one of these elements for each collocation.</span></div></div><div class="row"><div class="input-field"><textarea expr144="expr144" id="collx_template" class="materialize-textarea" placeholder="XML template"> </textarea><label for="collx_template">XML template</label><span class="helper-text">This is the XML that will be inserted into your entries with each collocation. The actual text will be where the placeholder <tt expr145="expr145"></tt> is.</span></div></div><div class="row"><h4>Thesaurus items</h4></div><div class="row"><div class="input-field"><select id="thes_container"><option value>(not set)</option></select><label for="thes_container">Thesaurus item container</label><span class="helper-text">Select the element which should wrap each individual thesaurus item (a word). When you pull thesaurus items automatically from a corpus, Lexonomy will insert one of these elements for each thesaurus item.</span></div></div><div class="row"><div class="input-field"><textarea expr146="expr146" id="thes_template" class="materialize-textarea" placeholder="XML template"> </textarea><label for="thes_template">XML template</label><span class="helper-text">This is the XML that will be inserted into your entries with each thesaurus item. The actual text will be where the placeholder <tt expr147="expr147"></tt> is.</span></div></div><div class="row"><h4>Definitions</h4></div><div class="row"><div class="input-field"><select id="defo_container"><option value>(not set)</option></select><label for="defo_container">Definition container</label><span class="helper-text">Select the element which should wrap each definition. When you pull definitions automatically from a corpus, Lexonomy will insert one of these elements for each definition.</span></div></div><div class="row"><div class="input-field"><textarea expr148="expr148" id="defo_template" class="materialize-textarea" placeholder="XML template"> </textarea><label for="defo_template">XML template</label><span class="helper-text">This is the XML that will be inserted into your entries with each definition. The actual text will be where the placeholder <tt expr149="expr149"></tt> is.</span></div></div><dict-config-buttons expr150="expr150"></dict-config-buttons>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictId',
              evaluate: _scope => _scope.dictId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictTitle',
              evaluate: _scope => _scope.props.dictDetails.title
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configId',
              evaluate: _scope => _scope.configId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configTitle',
              evaluate: _scope => _scope.configTitle
            }
          ],

          redundantAttribute: 'expr131',
          selector: '[expr131]'
        },
        {
          redundantAttribute: 'expr132',
          selector: '[expr132]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.configData.kex.url
            }
          ]
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'tt',

          slots: [
            {
              id: 'default',
              html: 'https://app.sketchengine.eu',
              bindings: []
            }
          ],

          attributes: [],
          redundantAttribute: 'expr133',
          selector: '[expr133]'
        },
        {
          redundantAttribute: 'expr134',
          selector: '[expr134]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.configData.kex.apiurl
            }
          ]
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'tt',

          slots: [
            {
              id: 'default',
              html: 'run.cgi',
              bindings: []
            }
          ],

          attributes: [],
          redundantAttribute: 'expr135',
          selector: '[expr135]'
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'tt',

          slots: [
            {
              id: 'default',
              html: 'https://api.sketchengine.eu/bonito/run.cgi',
              bindings: []
            }
          ],

          attributes: [],
          redundantAttribute: 'expr136',
          selector: '[expr136]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.props.userInfo.ske_username && _scope.props.userInfo.ske_apiKey && _scope.props.userInfo.ske_username != "" && _scope.props.userInfo.ske_apiKey != "",
          redundantAttribute: 'expr137',
          selector: '[expr137]',

          template: template(
            '<div class="row"><div class="input-field"><input expr138="expr138" type="text" id="kex_corpus" class="autocomplete" placeholder="Retrieving available corpora from Sketch Engine, please wait..."/><label for="kex_corpus">Corpus name</label><span class="helper-text">Select a Sketch Engine corpus from the list of corpora available to you.</span><span class="helper-text" id="corpusInfo" style="display: none"></span></div></div><div class="row"><div class="input-field"><input expr139="expr139" placeholder id="kex_concquery" type="text" class/><label for="kex_concquery">Concordance query</label><span class="helper-text">The CQL query that will be used to obtain concordance from Sketch Engine. You can use placeholders for elements in the form of \'%(element)\', e.g. \'[lemma="%(headword)"]\'. If left empty the \'simple\' query type will be used as configured for the respective corpus. Please note that you cannot use CQL syntax with default attribute because it is not specified.</span></div></div><div class="row"><div class="input-field"><input expr140="expr140" placeholder id="kex_concsampling" type="number" class/><label for="kex_concsampling">Sample size</label><span class="helper-text">Whether to apply automatic sampling of the concordance. Any non-zero value means to automatically create a random sample of that size.</span></div></div><div class="row"><div class="input-field"><select id="kex_searchElements" multiple></select><label for="kex_searchElements">Additional search elements</label><span class="helper-text">You can select any textual elements here whose content you would like to search for in Sketch Engine. A menu will be displayed next to all these elements like for the root entry element.</span></div></div>',
            [
              {
                redundantAttribute: 'expr138',
                selector: '[expr138]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'data-selected-corpus',
                    evaluate: _scope => _scope.configData.kex.corpus
                  }
                ]
              },
              {
                redundantAttribute: 'expr139',
                selector: '[expr139]',

                expressions: [
                  {
                    type: expressionTypes.VALUE,
                    evaluate: _scope => _scope.configData.kex.concquery
                  }
                ]
              },
              {
                redundantAttribute: 'expr140',
                selector: '[expr140]',

                expressions: [
                  {
                    type: expressionTypes.VALUE,
                    evaluate: _scope => _scope.configData.kex.concsampling
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.props.userInfo.ske_username || !_scope.props.userInfo.ske_apiKey || _scope.props.userInfo.ske_apiKey == "" || _scope.props.userInfo.ske_username == "",
          redundantAttribute: 'expr141',
          selector: '[expr141]',

          template: template(
            '<div class="card-panel amber lighten-2">\n         Please setup your Sketch Engine account in your <a href="#/userprofile">profile</a> settings to be able to select a corpus.\n      </div>',
            []
          )
        },
        {
          redundantAttribute: 'expr142',
          selector: '[expr142]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.configData.xampl.template
            }
          ]
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'tt',

          slots: [
            {
              id: 'default',
              html: '$text',
              bindings: []
            }
          ],

          attributes: [],
          redundantAttribute: 'expr143',
          selector: '[expr143]'
        },
        {
          redundantAttribute: 'expr144',
          selector: '[expr144]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.configData.collx.template
            }
          ]
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'tt',

          slots: [
            {
              id: 'default',
              html: '$text',
              bindings: []
            }
          ],

          attributes: [],
          redundantAttribute: 'expr145',
          selector: '[expr145]'
        },
        {
          redundantAttribute: 'expr146',
          selector: '[expr146]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.configData.thes.template
            }
          ]
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'tt',

          slots: [
            {
              id: 'default',
              html: '$text',
              bindings: []
            }
          ],

          attributes: [],
          redundantAttribute: 'expr147',
          selector: '[expr147]'
        },
        {
          redundantAttribute: 'expr148',
          selector: '[expr148]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.configData.defo.template
            }
          ]
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'tt',

          slots: [
            {
              id: 'default',
              html: '$text',
              bindings: []
            }
          ],

          attributes: [],
          redundantAttribute: 'expr149',
          selector: '[expr149]'
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-buttons',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'save-data',
              evaluate: _scope => _scope.saveData
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dict-id',
              evaluate: _scope => _scope.dictId
            }
          ],

          redundantAttribute: 'expr150',
          selector: '[expr150]'
        }
      ]
    ),

    name: 'dict-config-ske'
  };

  var dict_config_subbing = {
    css: null,

    exports: {
      isLoading: true,
      dictId: '',
      configId: '',
      configTitle: 'Subentries',
      configData: {elements:[]},

      onRemoveElementClick(el, evt) {
         evt.stopPropagation();
         this.configData.elements = this.configData.elements.filter(val => val != el);
         this.update();
      },

      doAddEl(event) {
         this.configData.elements.push($('#new-element').val());
         this.update();
      },

      onMounted() {
         this.dictId = this.props.dictId;
         this.configId = this.props.configId;
         this.props.loadDictDetail();
         this.fillConfigForm();
      },

      onBeforeUpdate(){
         this.selectOptions = Object.keys(this.props.dictConfigs.xema.elements).filter(key => {
            return !this.configData.elements.includes(key)
         });
      },

      onUpdated() {
         if (this.props.dictConfigs.xema && this.props.dictConfigs.xema.elements) {
            var $select = $('select');
            if(this.selectOptions.length && $select.length){
               var instance = M.FormSelect.getInstance($select);
               instance && instance.destroy();
               $select.empty();
               this.selectOptions.forEach(key => {
                  $('#new-element').append('<option value="' + key + '">' + key + '</option>');
               });
               $select.formSelect();
            }
         }
      },

      async fillConfigForm() {
         this.props.loadConfigData(this.configId).then((response)=>{
            this.isLoading = false;
            this.configData = {elements: Object.keys(response)};
            this.update();
         });
      },

      saveData() {
         let data = {};
         this.configData.elements.forEach(el => {
            data[el] = {};
         });
         $('#submit_button').html('Saving...');
         this.props.saveConfigData(this.configId, data);
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<dict-config-nav expr181="expr181"></dict-config-nav><h3>Subentries</h3><div expr182="expr182" class="center-align grey-text"></div><template expr183="expr183"></template><br/><br/><dict-config-buttons expr190="expr190"></dict-config-buttons>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictId',
              evaluate: _scope => _scope.dictId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictTitle',
              evaluate: _scope => _scope.props.dictDetails.title
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configId',
              evaluate: _scope => _scope.configId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configTitle',
              evaluate: _scope => _scope.configTitle
            }
          ],

          redundantAttribute: 'expr181',
          selector: '[expr181]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.isLoading,
          redundantAttribute: 'expr182',
          selector: '[expr182]',

          template: template(
            '<h3>Loading elements...</h3>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.isLoading,
          redundantAttribute: 'expr183',
          selector: '[expr183]',

          template: template(
            '<div><label>\n            Selected subentries\n         </label><div expr184="expr184" class="grey-text"></div><div expr185="expr185"></div><br/></div><template expr188="expr188"></template>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => !_scope.configData.elements.length,
                redundantAttribute: 'expr184',
                selector: '[expr184]',

                template: template(
                  '<i>no subentry element selected</i>',
                  []
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.configData.elements.length,
                redundantAttribute: 'expr185',
                selector: '[expr185]',

                template: template(
                  '<div expr186="expr186" class="chip"></div><br/>',
                  [
                    {
                      type: bindingTypes.EACH,
                      getKey: null,
                      condition: null,

                      template: template(
                        ' <i expr187="expr187" class="close material-icons">close</i>',
                        [
                          {
                            expressions: [
                              {
                                type: expressionTypes.TEXT,
                                childNodeIndex: 0,

                                evaluate: _scope => [
                                  _scope.element
                                ].join(
                                  ''
                                )
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr187',
                            selector: '[expr187]',

                            expressions: [
                              {
                                type: expressionTypes.EVENT,
                                name: 'onclick',
                                evaluate: _scope => _scope.onRemoveElementClick.bind(_scope, _scope.element)
                              }
                            ]
                          }
                        ]
                      ),

                      redundantAttribute: 'expr186',
                      selector: '[expr186]',
                      itemName: 'element',
                      indexName: null,
                      evaluate: _scope => _scope.configData.elements
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.selectOptions.length,
                redundantAttribute: 'expr188',
                selector: '[expr188]',

                template: template(
                  '<label for="new-element">Add subentry element</label><div class="input-field"><div class="buttons" style="max-width: 500px;"><select id="new-element"></select><a expr189="expr189" class="btn" style="margin-top: 4px;">\n                  add\n                  <i class="material-icons right">add</i></a></div><span class="helper-text">Elements listed here function as subentries which can be shared by multiple entries.</span></div>',
                  [
                    {
                      redundantAttribute: 'expr189',
                      selector: '[expr189]',

                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onclick',
                          evaluate: _scope => _scope.doAddEl
                        }
                      ]
                    }
                  ]
                )
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-buttons',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'save-data',
              evaluate: _scope => _scope.saveData
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dict-id',
              evaluate: _scope => _scope.dictId
            }
          ],

          redundantAttribute: 'expr190',
          selector: '[expr190]'
        }
      ]
    ),

    name: 'dict-config-subbing'
  };

  var dict_config = {
    css: `dict-config .columnContainer,[is="dict-config"] .columnContainer{ display: flex; gap: 4vw; justify-content: space-between; max-width: 800px; margin: auto; } dict-config li,[is="dict-config"] li{ padding: 0 0 10px 10px; }`,

    exports: {
      dictId: '',

      onMounted() {
         this.dictId = this.props.dictId;
         console.log('config dict '+ this.dictId);
         this.props.loadDictDetail();
         console.log(this.props);
         this.update();
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<dict-config-nav expr151="expr151"></dict-config-nav><h3>Configuration</h3><div class="columnContainer" style="margin-left: 20px;"><div><h5 class="header">Manage dictionary</h5><ul><li><a expr152="expr152">Description</a></li><li><a expr153="expr153">Users</a></li><li><a expr154="expr154">Publishing</a></li><li><a expr155="expr155">Change URL</a></li></ul></div><div><h5 class="header">Entry settings</h5><ul><li><a expr156="expr156">Structure</a></li><li expr157="expr157"></li><li expr159="expr159"></li><li><a expr161="expr161">Headword list</a></li><li><a expr162="expr162">Searching</a></li></ul></div><div><h5 class="header">Expert settings</h5><ul><li><a expr163="expr163">Entry editor</a></li><li><a expr164="expr164">Flags</a></li><li><a expr165="expr165">Auto-numbering</a></li><li><a expr166="expr166">Linking</a></li><li><a expr167="expr167">Download settings</a></li><li><a expr168="expr168">Subentries</a></li><li><a expr169="expr169">Sketch Engine</a></li><li><a expr170="expr170">KonText</a></li><li><a expr171="expr171">Multimedia API</a></li></ul></div></div>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictId',
              evaluate: _scope => _scope.dictId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictTitle',
              evaluate: _scope => _scope.props.dictDetails.title
            }
          ],

          redundantAttribute: 'expr151',
          selector: '[expr151]'
        },
        {
          redundantAttribute: 'expr152',
          selector: '[expr152]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictId,
                '/config/ident'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr153',
          selector: '[expr153]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictId,
                '/config/users'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr154',
          selector: '[expr154]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictId,
                '/config/publico'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr155',
          selector: '[expr155]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictId,
                '/config/url'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr156',
          selector: '[expr156]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictId,
                '/config/xema'
              ].join(
                ''
              )
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.props.dictDetails.xemplateOverride,
          redundantAttribute: 'expr157',
          selector: '[expr157]',

          template: template(
            '<a expr158="expr158">Formatting</a>',
            [
              {
                redundantAttribute: 'expr158',
                selector: '[expr158]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'href',

                    evaluate: _scope => [
                      '#/',
                      _scope.dictId,
                      '/config/xemplate'
                    ].join(
                      ''
                    )
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.props.dictDetails.xemplateOverride,
          redundantAttribute: 'expr159',
          selector: '[expr159]',

          template: template(
            '<a expr160="expr160">Formatting</a>',
            [
              {
                redundantAttribute: 'expr160',
                selector: '[expr160]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'href',

                    evaluate: _scope => [
                      '#/',
                      _scope.dictId,
                      '/config/xemplate-override'
                    ].join(
                      ''
                    )
                  }
                ]
              }
            ]
          )
        },
        {
          redundantAttribute: 'expr161',
          selector: '[expr161]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictId,
                '/config/titling'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr162',
          selector: '[expr162]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictId,
                '/config/searchability'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr163',
          selector: '[expr163]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictId,
                '/config/editing'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr164',
          selector: '[expr164]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictId,
                '/config/flagging'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr165',
          selector: '[expr165]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictId,
                '/config/autonumber'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr166',
          selector: '[expr166]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictId,
                '/config/links'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr167',
          selector: '[expr167]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictId,
                '/config/download'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr168',
          selector: '[expr168]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictId,
                '/config/subbing'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr169',
          selector: '[expr169]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictId,
                '/config/ske'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr170',
          selector: '[expr170]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictId,
                '/config/kontext'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr171',
          selector: '[expr171]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictId,
                '/config/gapi'
              ].join(
                ''
              )
            }
          ]
        }
      ]
    ),

    name: 'dict-config'
  };

  var dict_config_titling = {
    css: null,

    exports: {
      dictId: '',
      configId: '',
      configTitle: 'Headword list',
      configData: {headwordAnnotationsType: 'simple', headwordAnnotations: []},

      changeAnnotation() {
         if ($('[name=hwannotype][value=advanced]').is(':checked')) {
            $('#headwordAnnotations').attr('disabled', 'disabled');
            $('#advancedAnnotations').removeAttr('disabled');
            $('#headwordAnnotations').formSelect();
         } else {
            $('#advancedAnnotations').attr('disabled', 'disabled');
            $('#headwordAnnotations').removeAttr('disabled');
            $('#headwordAnnotations').formSelect();
         }
      },

      onMounted() {
         this.dictId = this.props.dictId;
         this.configId = this.props.configId;
         console.log('config dict '+ this.dictId + '-' + this.configId);
         this.props.loadDictDetail();
         this.fillConfigForm();
         M.updateTextFields();
         M.textareaAutoResize($('#advancedAnnotations'));
      },

      onUpdated() {
         if (this.props.dictConfigs.xema && this.props.dictConfigs.xema.elements) {
            if ($('#headword option').length == 1) {
               Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
                  $('#headword').append('<option value="' + key + '">' + key + '</option>');
               });
            }
            if ($('#headwordSorting option').length == 1) {
               Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
                  $('#headwordSorting').append('<option value="' + key + '">' + key + '</option>');
               });
            }
            if ($('#headwordAnnotations option').length == 0) {
               Object.entries(this.props.dictConfigs.xema.elements).forEach(([key, info]) => {
                  if (key != this.configData.headword) {
                     $('#headwordAnnotations').append('<option value="' + key + '">' + key + '</option>');
                  }
               });
            }
            if (this.configData.headword != '') {
               $('#headword option[value='+this.configData.headword+']').attr('selected','selected');
            }
            if (this.configData.headwordSorting != '') {
               $('#headwordSorting option[value='+this.configData.headwordSorting+']').attr('selected','selected');
            }
            this.configData.headwordAnnotations.forEach(el => {
               $('#headwordAnnotations option[value='+el+']').attr('selected','selected');
            });


            $('select').formSelect();
         }
      },

      async fillConfigForm() {
         this.props.loadConfigData(this.configId).then((response)=>{
            this.configData = response;
            if (!this.configData.numberEntries) this.configData.numberEntries = 1000;
            if (!this.configData.headwordAnnotationsType) this.configData.headwordAnnotationsType = 'simple';
            if (!this.configData.headwordAnnotations) this.configData.headwordAnnotations = [];
            M.updateTextFields();
            M.textareaAutoResize($('#advancedAnnotations'));

            // fill locale list for autocomplete
            if (this.configData.sort_locale && this.configData.sort_locale != '') {
               $('#sort_locale').data('selected-locale', this.configData.sort_locale);
            }
            var localeList = {};
            var localeData = {};
            var selected = '';
            this.configData.locales.forEach(loc => {
               localeList[loc['lang']] = null;
               localeData[loc['lang']] = loc['code'];
               if (loc['code'] == this.configData.locale) {
                  selected = loc['lang'];
               }
            });
            $('#sort_locale').autocomplete({data: localeList});
            $('#sort_locale').data('locales', localeData);
            if (selected != '') {
               $('#sort_locale').val(selected);
            }
            $('#sort_locale').on('change', function() {
               var localeData = $(this).data('locales');
               $(this).data('selected-locale', localeData[$(this).val()]);
            });
            this.update();
         });
      },

      getConfigData() {
         var newData = {
            headword: $('#headword').val(),
            headwordSorting: $('#headwordSorting').val(),
            sortDesc: $('#sortDesc').is(':checked'),
            numberEntries: $('#numberEntries').val(),
            locale: $('#sort_locale').data('selected-locale')
         };
         if ($('[name=hwannotype][value=advanced]').is(':checked')) {
            newData.headwordAnnotationsType = 'advanced';
            newData.headwordAnnotationsAdvanced = $('#advancedAnnotations').val();
         } else {
            newData.headwordAnnotationsType = 'simple';
            newData.headwordAnnotations = $('#headwordAnnotations').val();
         }
         return newData;
      },

      saveData() {
         console.log(this.getConfigData());
         $('#submit_button').html('Saving...');
         this.props.saveConfigData(this.configId, this.getConfigData());
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<dict-config-nav expr172="expr172"></dict-config-nav><h3>Headword</h3><div class="row"><div class="input-field col s6"><select id="headword"><option value>(not set)</option></select><label for="headword">Headword</label><span class="helper-text">Select the element which contains the entry\'s headword. If you make no selection here Lexonomy will try to guess what the headword of each entry is.</span></div></div><div class="row"><div class="input-field col s6"><select id="headwordSorting"><option value>(not set)</option></select><label for="headwordSorting">Headword sorting</label><span class="helper-text">Select the element which will be used for sorting of headwords in the entry list. If you make no selection here Lexonomy will use the element you chose for headword.</span></div><div class="input-field col s6"><label style="padding-top: 30px;"><input expr173="expr173" type="checkbox" id="sortDesc"/><span>Sort in descending order</span></label></div></div><div class="row"><h6>Headword annotations</h6></div><div class="row"><div class="col s5"><label><input expr174="expr174" name="hwannotype" type="radio" value="simple"/><span>simple</span></label><br/><div class="input-field"><select expr175="expr175" id="headwordAnnotations" multiple></select><span class="helper-text">You can select any elements here whose content you want displayed beside the headword in the entry list, such as homograph numbers or part-of-speech labels.</span></div></div><div class="col s5"><label><input expr176="expr176" name="hwannotype" type="radio" value="advanced"/><span>advanced</span></label><br/><div class="input-field"><textarea expr177="expr177" id="advancedAnnotations" class="materialize-textarea" placeholder="headword annotations"> </textarea><span class="helper-text">You can insert any HTML containing placeholders for elements in the form of \'%(element)\', e.g. \'&lt;b>%(headword)&lt;/b>\'.</span></div></div></div><div class="row"><div class="input-field col s8"><input expr178="expr178" type="text" id="sort_locale" class="autocomplete" placeholder="Type to search for language"/><label for="sort_locale">Alphabetical order</label><span class="helper-text">Select language to sort entries alphabetically in the entry list.</span></div></div><div class="row"><div class="input-field col s6"><input expr179="expr179" placeholder id="numberEntries" type="number" class/><label for="numberEntries">Number of entries to be shown in the entry list at once</label><span class="helper-text">If your dictionary contains large entries (large XML files), it is recommended to reduce this number for quicker loading of entry list.</span></div></div><dict-config-buttons expr180="expr180"></dict-config-buttons>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictId',
              evaluate: _scope => _scope.dictId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictTitle',
              evaluate: _scope => _scope.props.dictDetails.title
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configId',
              evaluate: _scope => _scope.configId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configTitle',
              evaluate: _scope => _scope.configTitle
            }
          ],

          redundantAttribute: 'expr172',
          selector: '[expr172]'
        },
        {
          redundantAttribute: 'expr173',
          selector: '[expr173]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'checked',
              evaluate: _scope => _scope.configData.sortDesc
            }
          ]
        },
        {
          redundantAttribute: 'expr174',
          selector: '[expr174]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'checked',
              evaluate: _scope => _scope.configData.headwordAnnotationsType == "simple"
            },
            {
              type: expressionTypes.EVENT,
              name: 'onchange',
              evaluate: _scope => _scope.changeAnnotation
            }
          ]
        },
        {
          redundantAttribute: 'expr175',
          selector: '[expr175]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'disabled',
              evaluate: _scope => _scope.configData.headwordAnnotationsType == 'advanced'
            }
          ]
        },
        {
          redundantAttribute: 'expr176',
          selector: '[expr176]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'checked',
              evaluate: _scope => _scope.configData.headwordAnnotationsType == "advanced"
            },
            {
              type: expressionTypes.EVENT,
              name: 'onchange',
              evaluate: _scope => _scope.changeAnnotation
            }
          ]
        },
        {
          redundantAttribute: 'expr177',
          selector: '[expr177]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.configData.headwordAnnotationsAdvanced
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'disabled',
              evaluate: _scope => _scope.configData.headwordAnnotationsType == 'simple'
            }
          ]
        },
        {
          redundantAttribute: 'expr178',
          selector: '[expr178]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'data-selected-locale',
              evaluate: _scope => _scope.configData.locale
            }
          ]
        },
        {
          redundantAttribute: 'expr179',
          selector: '[expr179]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.configData.numberEntries
            }
          ]
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-buttons',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'save-data',
              evaluate: _scope => _scope.saveData
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dict-id',
              evaluate: _scope => _scope.dictId
            }
          ],

          redundantAttribute: 'expr180',
          selector: '[expr180]'
        }
      ]
    ),

    name: 'dict-config-titling'
  };

  var dict_config_url = {
    css: null,

    exports: {
      dictId: '',
      configId: '',
      configTitle: 'Change URL',
      configData: {searchableElements:[]},

      onMounted() {
         this.dictId = this.props.dictId;
         this.configId = this.props.configId;
         console.log('config dict '+ this.dictId + '-' + this.configId);
         this.props.loadDictDetail();
         M.updateTextFields();
      },

      onUpdated() {
      },

      async fillConfigForm() {
         this.props.loadConfigData(this.configId).then((response)=>{
            this.configData = response;
            $('#search-element').val(this.configData.searchableElements);
            this.update();
         });
      },

      saveData() {
         var newurl = $('#url').val();
         if (newurl != "" && $('#url').hasClass('valid')) {
            $('#submit_button').html('Saving...');
            $.post(window.API_URL + this.dictId+"/move.json", {url: newurl}, (response) => {
               if (response.success) {
                  $('#success').show();
                  $('#newlink').attr('href', '#/'+newurl+'/edit');
               } else {
                  $('#error').show();
                  $('#submit_button').html('Change');
               }
            });
         }
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<dict-config-nav expr225="expr225"></dict-config-nav><h3>Change URL</h3><div class="row"><label for="url">Current URL</label><div style="margin: 0 0 30px;"><span expr226="expr226"> </span></div></div><div class="row"><label for="url">New URL</label><div><div style="display: flex; align-items: baseline;"><span id="baseUrl">https://www.lexonomy.eu/</span><span><input id="url" type="text" class="validate inlineBlock" required minlength="5" pattern="[a-zA-Z0-9\\-_]*" style="max-width: 300px;"/></span></div><div class="input-field" style="margin-top: 0;"><span class="helper-text">This will be your dictionary\'s address on the web. You will be able to change this later. Allowed: letters, numbers, - and _</span></div></div></div><dict-config-buttons expr227="expr227" label="Change"></dict-config-buttons><br/><div><span id="error" style="display:none">This URL is already taken.</span><span id="success" style="display:none">Your dictionary has been moved to a new URL. <a href id="newlink">Go to new dictionary URL</a>.</span></div>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictId',
              evaluate: _scope => _scope.dictId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictTitle',
              evaluate: _scope => _scope.props.dictDetails.title
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configId',
              evaluate: _scope => _scope.configId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configTitle',
              evaluate: _scope => _scope.configTitle
            }
          ],

          redundantAttribute: 'expr225',
          selector: '[expr225]'
        },
        {
          redundantAttribute: 'expr226',
          selector: '[expr226]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: _scope => [
                'https://www.lexonomy.eu/',
                _scope.props.dictId
              ].join(
                ''
              )
            }
          ]
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-buttons',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'save-data',
              evaluate: _scope => _scope.saveData
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dict-id',
              evaluate: _scope => _scope.dictId
            }
          ],

          redundantAttribute: 'expr227',
          selector: '[expr227]'
        }
      ]
    ),

    name: 'dict-config-url'
  };

  var dict_config_users = {
    css: `dict-config-users .user-checkbox,[is="dict-config-users"] .user-checkbox{ padding-right: 2em; } dict-config-users .delete-user,[is="dict-config-users"] .delete-user,dict-config-users .add-user,[is="dict-config-users"] .add-user{ float: right; } dict-config-users #userConfigError,[is="dict-config-users"] #userConfigError{ margin-left: 1em; color: red; }`,

    exports: {
      isLoading: true,
      dictId: '',
      configId: '',
      configTitle: 'Users',
      configData: {users:[]},

      onEmailInput(idx, evt){
         this.configData.users[idx].email = evt.target.value;
      },

      onPermissionChange(idx, evt){
         this.configData.users[idx][evt.target.name] = evt.target.checked;
      },

      doDeleteUser(idx) {
         this.configData.users.splice(idx, 1);
         this.update();
      },

      doAddUser(event) {
         this.configData.users.push({
            id: this.configData.users.length,
            email: "",
            canEdit: false,
            canConfig: false,
            canDownload: false,
            canUpload: false,
            isEditable: true
         });
         this.update();
         $('table input[type="email"]', this.root).last().focus();
      },

      onMounted() {
         this.dictId = this.props.dictId;
         this.configId = this.props.configId;
         console.log('config dict '+ this.dictId + '-' + this.configId);
         this.props.loadDictDetail();
         this.fillConfigForm();
         console.log(this.props);
      },

      async fillConfigForm() {
         this.props.loadConfigData(this.configId).then((response)=>{
            this.isLoading = false;
            this.configData = {users:[]};
            let id = 0;
            for (var key in response) {
               var info = response[key];
               info.email = key;
               info.id = id;
               id++;
               this.configData.users.push(info);
            }
            this.update();
         });
      },

      saveData() {
         if (Object.values(this.configData.users).find(row => row.canConfig) == undefined) {
            $('#userConfigError').html('At least one user must have <i>Configure</i> permission.');
         } else {
            $('#userConfigError').html('');
            $('#submit_button').html('Saving...');
            let data = {};
            this.configData.users.forEach(u => {
               data[u.email] = {
                  canEdit: u.canEdit,
                  canConfig: u.canConfig,
                  canDownload: u.canDownload,
                  canUpload: u.canUpload
               };
            });
            this.props.saveConfigData(this.configId, data);
         }
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<dict-config-nav expr207="expr207"></dict-config-nav><h3>Users</h3><div expr208="expr208" class="center-align grey-text"></div><template expr209="expr209"></template>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictId',
              evaluate: _scope => _scope.dictId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictTitle',
              evaluate: _scope => _scope.props.dictDetails.title
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configId',
              evaluate: _scope => _scope.configId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configTitle',
              evaluate: _scope => _scope.configTitle
            }
          ],

          redundantAttribute: 'expr207',
          selector: '[expr207]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.isLoading,
          redundantAttribute: 'expr208',
          selector: '[expr208]',

          template: template(
            '<h3>Loading users...</h3>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.isLoading,
          redundantAttribute: 'expr209',
          selector: '[expr209]',

          template: template(
            '<div expr210="expr210" class="grey-text center-align"></div><div><div expr213="expr213"></div></div>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => !_scope.configData.users.length,
                redundantAttribute: 'expr210',
                selector: '[expr210]',

                template: template(
                  '<h4>No users</h4><br/><button expr211="expr211" class="btn btn-primary"><i class="material-icons right">add</i>\n            Add new user\n         </button><br/><br/><br/><br/><div class="buttons" style="justify-content: center;"><dict-config-buttons expr212="expr212"></dict-config-buttons></div>',
                  [
                    {
                      redundantAttribute: 'expr211',
                      selector: '[expr211]',

                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onclick',
                          evaluate: _scope => _scope.doAddUser
                        }
                      ]
                    },
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'dict-config-buttons',
                      slots: [],

                      attributes: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'save-data',
                          evaluate: _scope => _scope.saveData
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'dict-id',
                          evaluate: _scope => _scope.dictId
                        }
                      ],

                      redundantAttribute: 'expr212',
                      selector: '[expr212]'
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.configData.users.length,
                redundantAttribute: 'expr213',
                selector: '[expr213]',

                template: template(
                  '<table><thead><tr style="border-bottom: none;"><th></th><th colspan="5">Privileges</th></tr><tr><th>User email</th><th>Edit</th><th>Configure</th><th>Download</th><th>Upload</th><th></th></tr></thead><tbody><tr expr214="expr214" no-reorder></tr></tbody></table><br/><div><button expr223="expr223" class="btn"><i class="material-icons right">add</i>\n               Add new user\n            </button></div><br/><br/><dict-config-buttons expr224="expr224"></dict-config-buttons><div id="userConfigError"></div>',
                  [
                    {
                      type: bindingTypes.EACH,
                      getKey: _scope => _scope.user.id,
                      condition: null,

                      template: template(
                        '<td><span expr215="expr215"></span><span expr217="expr217"></span></td><td><label><input expr218="expr218" type="checkbox" name="canEdit"/><span></span></label></td><td><label><input expr219="expr219" type="checkbox" name="canConfig"/><span></span></label></td><td><label><input expr220="expr220" type="checkbox" name="canDownload"/><span></span></label></td><td><label><input expr221="expr221" type="checkbox" name="canEdit"/><span></span></label></td><td><a expr222="expr222" class="btn btn-floating delete-user"><i class="material-icons">delete</i></a></td>',
                        [
                          {
                            type: bindingTypes.IF,
                            evaluate: _scope => _scope.user.isEditable,
                            redundantAttribute: 'expr215',
                            selector: '[expr215]',

                            template: template(
                              '<input expr216="expr216" id="new-email" type="email" class="validate" style="max-width: 300px;"/>',
                              [
                                {
                                  redundantAttribute: 'expr216',
                                  selector: '[expr216]',

                                  expressions: [
                                    {
                                      type: expressionTypes.EVENT,
                                      name: 'oninput',
                                      evaluate: _scope => _scope.onEmailInput.bind(_scope, _scope.idx)
                                    }
                                  ]
                                }
                              ]
                            )
                          },
                          {
                            type: bindingTypes.IF,
                            evaluate: _scope => !_scope.user.isEditable,
                            redundantAttribute: 'expr217',
                            selector: '[expr217]',

                            template: template(
                              ' ',
                              [
                                {
                                  expressions: [
                                    {
                                      type: expressionTypes.TEXT,
                                      childNodeIndex: 0,

                                      evaluate: _scope => [
                                        _scope.user.email
                                      ].join(
                                        ''
                                      )
                                    }
                                  ]
                                }
                              ]
                            )
                          },
                          {
                            redundantAttribute: 'expr218',
                            selector: '[expr218]',

                            expressions: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'checked',
                                evaluate: _scope => _scope.user.canEdit
                              },
                              {
                                type: expressionTypes.EVENT,
                                name: 'onchange',
                                evaluate: _scope => _scope.onPermissionChange.bind(_scope, _scope.idx)
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr219',
                            selector: '[expr219]',

                            expressions: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'checked',
                                evaluate: _scope => _scope.user.canConfig
                              },
                              {
                                type: expressionTypes.EVENT,
                                name: 'onchange',
                                evaluate: _scope => _scope.onPermissionChange.bind(_scope, _scope.idx)
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr220',
                            selector: '[expr220]',

                            expressions: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'checked',
                                evaluate: _scope => _scope.user.canDownload
                              },
                              {
                                type: expressionTypes.EVENT,
                                name: 'onchange',
                                evaluate: _scope => _scope.onPermissionChange.bind(_scope, _scope.idx)
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr221',
                            selector: '[expr221]',

                            expressions: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'checked',
                                evaluate: _scope => _scope.user.canUpload
                              },
                              {
                                type: expressionTypes.EVENT,
                                name: 'onchange',
                                evaluate: _scope => _scope.onPermissionChange.bind(_scope, _scope.idx)
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr222',
                            selector: '[expr222]',

                            expressions: [
                              {
                                type: expressionTypes.EVENT,
                                name: 'onclick',
                                evaluate: _scope => _scope.doDeleteUser.bind(_scope, _scope.idx)
                              }
                            ]
                          }
                        ]
                      ),

                      redundantAttribute: 'expr214',
                      selector: '[expr214]',
                      itemName: 'user',
                      indexName: 'idx',
                      evaluate: _scope => _scope.configData.users
                    },
                    {
                      redundantAttribute: 'expr223',
                      selector: '[expr223]',

                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onclick',
                          evaluate: _scope => _scope.doAddUser
                        }
                      ]
                    },
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'dict-config-buttons',
                      slots: [],

                      attributes: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'save-data',
                          evaluate: _scope => _scope.saveData
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'dict-id',
                          evaluate: _scope => _scope.dictId
                        }
                      ],

                      redundantAttribute: 'expr224',
                      selector: '[expr224]'
                    }
                  ]
                )
              }
            ]
          )
        }
      ]
    ),

    name: 'dict-config-users'
  };

  var dict_config_xema = {
    css: `dict-config-xema #editor,[is="dict-config-xema"] #editor{ position: relative !important; min-height: 750px; display: flex; flex-wrap: nowrap; } dict-config-xema #editor .details,[is="dict-config-xema"] #editor .details{flex-grow: 1;} dict-config-xema .editor .list,[is="dict-config-xema"] .editor .list{ flex-basis: 0; } dict-config-xema #editor.designer input.textbox.cap,[is="dict-config-xema"] #editor.designer input.textbox.cap{ width: 15em !important; } dict-config-xema #editor.designer input[type=radio],[is="dict-config-xema"] #editor.designer input[type=radio]{ opacity: 1 !important; } dict-config-xema { display: block; }`,

    exports: {
      /**
       * @typedef {Object} XemaElementChild
       * @property {number} min minimum number of occurances, 0 = optional
       * @property {number|null} max maximum number of occurances, null = unbounded
       * @property {string} name id of the element (note: NOT the element name per se)
       */

      /**
       * @typedef {Object} XemaAttributeValue
       * @property {string} value the value
       * @property {string} caption the human-readable display name
       */

      /**
       * @typedef {Object} XemaAttribute
       * @property {'optional'|'obligatory'} optionality
       * @property {'txt'|'lst'} filling - text for any text, lst if only a predefined set of values is allowed, which is defined in the values property
       * @property {XemaAttributeValue[]} [values] (optional) list of values. Check filling property 
       */

      /**
       * @typedef {Object} XemaElement
       * @property {string} [elementName] the xml element name, use the key of this element in Xema.elements if not set.
       * @property {'inl'|'txt'|'chd'|'emp'} filling inl = mixed text and elements, txt = text only, chd = element only, emp = empty (no children)
       * @property {string[]} values list of options if this element can only have predefined values
       * @property {XemaElementChild[]} children
       * @property {Object.<string, XemaAttribute>} attributes
       */

      /**
       * @typedef {Object} Xema
       * @property {string} root the id of the root element
       * @property {Object.<string, XemaElement>} elements
      */



      async onBeforeMount(props, state) {
         this.state.xema = await this.props.loadConfigData(this.props.configId);
         this.state.override = !!(this.state.xema._xonomyDocSpec || this.state.xema._dtd);
         this.state.currentElement = this.state.xema.root;
         this.state.currentAttribute = undefined;
         this.update();
         if (this.state.override) { // init text field resizing. wait until after update so they exist.
            M.updateTextFields();
            M.textareaAutoResize($('#editor_doc'));
            M.textareaAutoResize($('#editor_xml'));
            M.textareaAutoResize($('#editor_dtd'));
         }
      },

      onBeforeUpdate() {
         if (!this.state.xema) return;
         const roots = new Set(Object.keys(this.state.xema.elements));
         Object.values(this.state.xema.elements).forEach(/** @param {XemaElement} el */ el => el.children.forEach(c => roots.delete(c.name)));
         this.state.roots = [...roots].map(id => ({...this.state.xema.elements[id], id})); // add ID so tree renderer knows the id of every element
      },

      configTitle: 'Entry structure',

      toggleOverride() {
         this.state.override = !this.state.override;
         if (!this.state.override) {
            delete this.state.xema._xonomyDocSpec;
            delete this.state.xema._dtd;
            delete this.state.xema._newXml;
         }
         this.update();
      },

      getConfigData() {
         var newData = { ...this.state.xema };
         if (this.override) {
            if ($('#editor_doc').val()) newData._xonomyDocSpec = $('#editor_doc').val();
            if ($('#editor_xml').val()) newData._newXml = $('#editor_xml').val();
            if ($('#editor_dtd').val()) newData._dtd = $('#editor_dtd').val();
         }
         return newData;
      },

      saveData() {
         console.log(this.getConfigData());
         $('#submit_button').html('Saving...');
         this.props.saveConfigData(this.props.configId, this.getConfigData());
      },

      selectElementOrAttribute(currentElement, currentAttribute) {
         this.state.currentElement = currentElement;
         this.state.currentAttribute = currentAttribute;
         console.log(`Updating actives, ${this.state.currentElement} @${this.state.currentAttribute}`);
         this.update();
      },

      onXemaElementUpdated(id, newConfig) {
         this.state.xema.elements[id] = newConfig;
         this.update();
      },

      onXemaElementDeleted(id) {
         delete this.state.xema.elements[id];
         this.update();
      },

      onXemaAttributeUpdated(newConfig) {
         const el = this.state.xema.elements[this.state.currentElement];
         el.attributes[this.state.currentAttribute] = newConfig;
         this.update();
      },

      onXemaAttributeRenamed(newName) {
         const el = this.state.xema.elements[this.state.currentElement];
         el.attributes[newName] = el.attributes[this.state.currentAttribute];
         delete el.attributes[this.state.currentAttribute];
         this.state.currentAttribute = newName;
         this.update();
      },

      exampleDoc() {
         this.state.xema._xonomyDocSpec = JSON.stringify({ elements: { "entry": {}, "headword": {hasText: true} }}, undefined, 2);
         this.update();   
      },

      exampleXML() {
         this.state.xema._xml = `<entry><headword></headword></entry>`;
         this.update();
      },

      exampleDTD() {
         this.state.xema._dtd = `<!ELEMENT entry (headword)>\n<!ELEMENT headword (#PCDATA)>`;
         this.update;
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<dict-config-nav expr191="expr191"></dict-config-nav><h3>Entry structure</h3><div expr192="expr192"></div><template expr193="expr193"></template>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictId',
              evaluate: _scope => _scope.props.dictId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictTitle',
              evaluate: _scope => _scope.props.dictDetails.title
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configId',
              evaluate: _scope => _scope.props.configId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configTitle',
              evaluate: _scope => _scope.configTitle
            }
          ],

          redundantAttribute: 'expr191',
          selector: '[expr191]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.state.xema,
          redundantAttribute: 'expr192',
          selector: '[expr192]',

          template: template(
            'Loading...',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.xema,
          redundantAttribute: 'expr193',
          selector: '[expr193]',

          template: template(
            '<div expr194="expr194" id="editor" class="editor designer"></div><div expr198="expr198"></div><div><button expr205="expr205" class="btn waves-effect waves-light"> <i class="material-icons right">edit</i></button></div><dict-config-buttons expr206="expr206"></dict-config-buttons>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => !_scope.state.override,
                redundantAttribute: 'expr194',
                selector: '[expr194]',

                template: template(
                  '<div class="list"><dict-config-element-in-tree expr195="expr195"></dict-config-element-in-tree></div><div class="details"><dict-config-xema-element expr196="expr196"></dict-config-xema-element><dict-config-xema-attribute expr197="expr197"></dict-config-xema-attribute></div>',
                  [
                    {
                      type: bindingTypes.EACH,
                      getKey: null,
                      condition: null,

                      template: template(
                        null,
                        [
                          {
                            type: bindingTypes.TAG,
                            getComponent: getComponent,
                            evaluate: _scope => 'dict-config-element-in-tree',
                            slots: [],

                            attributes: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'data',
                                evaluate: _scope => _scope.root
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'xema',
                                evaluate: _scope => _scope.state.xema
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'current-element',
                                evaluate: _scope => _scope.state.currentElement
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'current-attribute',
                                evaluate: _scope => _scope.state.currentAttribute
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'selectElementOrAttribute',
                                evaluate: _scope => _scope.selectElementOrAttribute
                              }
                            ]
                          }
                        ]
                      ),

                      redundantAttribute: 'expr195',
                      selector: '[expr195]',
                      itemName: 'root',
                      indexName: null,
                      evaluate: _scope => _scope.state.roots
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.state.currentElement && !_scope.state.currentAttribute,
                      redundantAttribute: 'expr196',
                      selector: '[expr196]',

                      template: template(
                        null,
                        [
                          {
                            type: bindingTypes.TAG,
                            getComponent: getComponent,
                            evaluate: _scope => 'dict-config-xema-element',
                            slots: [],

                            attributes: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'elementId',
                                evaluate: _scope => _scope.state.currentElement
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'xema',
                                evaluate: _scope => _scope.state.xema
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'config',
                                evaluate: _scope => _scope.state.xema.elements[_scope.state.currentElement]
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'applyLocalData',
                                evaluate: _scope => _scope.onXemaElementUpdated
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'createElement',
                                evaluate: _scope => _scope.onXemaElementUpdated
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'selectElementOrAttribute',
                                evaluate: _scope => _scope.selectElementOrAttribute
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'deleteElement',
                                evaluate: _scope => _scope.onXemaElementDeleted
                              }
                            ]
                          }
                        ]
                      )
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.state.currentElement && _scope.state.currentAttribute,
                      redundantAttribute: 'expr197',
                      selector: '[expr197]',

                      template: template(
                        null,
                        [
                          {
                            type: bindingTypes.TAG,
                            getComponent: getComponent,
                            evaluate: _scope => 'dict-config-xema-attribute',
                            slots: [],

                            attributes: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'elementId',
                                evaluate: _scope => _scope.state.currentElement
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'attributeId',
                                evaluate: _scope => _scope.state.currentAttribute
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'xema',
                                evaluate: _scope => _scope.state.xema
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'config',
                                evaluate: _scope => _scope.state.xema.elements[_scope.state.currentElement].attributes[_scope.state.currentAttribute]
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'applyLocalData',
                                evaluate: _scope => _scope.onXemaAttributeUpdated
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'renameAttribute',
                                evaluate: _scope => _scope.onXemaAttributeRenamed
                              }
                            ]
                          }
                        ]
                      )
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.state.override,
                redundantAttribute: 'expr198',
                selector: '[expr198]',

                template: template(
                  '<div class="row"><div class="col s10"><p>To specify your custom Lexonomy schema use either <i>Xonomy Document Specification</i>, or <i>DTD</i>.</p><h5>Xonomy Document Specification</h5><p>A <a href="http://www.lexiconista.com/xonomy/" target="_blank">Xonomy Document Specification</a> is a JavaScript object which configures the Xonomy XML editor used in Lexonomy.</p></div></div><div class="row"><div class="input-field col s10"><textarea expr199="expr199" id="editor_doc" class="materialize-textarea" placeholder> </textarea><label for="editor_doc">Document specification</label><span class="helper-text">Xonomy Document Specification. If you would like to see an example, <a expr200="expr200">click here to load a sample specification</a>.</span></div></div><div class="row"><div class="input-field col s10"><textarea expr201="expr201" id="editor_xml" class="materialize-textarea" placeholder> </textarea><label for="editor_xml">Template for new entries</label><span class="helper-text">XML template for newly created entries. If you would like to see an example, <a expr202="expr202">click here to load a sample XML template</a>.</span></div></div><div class="row"><div class="col s10"><h5>DTD (Document Type Defition)</h5><p><a href="https://en.wikipedia.org/wiki/Document_type_definition" target="_blank">Document Type Definitions</a> are a popular formalism for defining the structure of XML documents.</p></div></div><div class="row"><div class="input-field col s10"><textarea expr203="expr203" id="editor_dtd" class="materialize-textarea" placeholder> </textarea><label for="editor_dtd">Your DTD</label><span class="helper-text">If you would like to see an example, <a expr204="expr204">click here to load a sample DTD</a>.</span></div></div>',
                  [
                    {
                      redundantAttribute: 'expr199',
                      selector: '[expr199]',

                      expressions: [
                        {
                          type: expressionTypes.TEXT,
                          childNodeIndex: 0,
                          evaluate: _scope => _scope.state.xema._xonomyDocSpec || ""
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr200',
                      selector: '[expr200]',

                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onclick',
                          evaluate: _scope => _scope.exampleDoc
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr201',
                      selector: '[expr201]',

                      expressions: [
                        {
                          type: expressionTypes.TEXT,
                          childNodeIndex: 0,
                          evaluate: _scope => _scope.state.xema._css || ""
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr202',
                      selector: '[expr202]',

                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onclick',
                          evaluate: _scope => _scope.exampleXML
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr203',
                      selector: '[expr203]',

                      expressions: [
                        {
                          type: expressionTypes.TEXT,
                          childNodeIndex: 0,
                          evaluate: _scope => _scope.state.xema._dtd || ""
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr204',
                      selector: '[expr204]',

                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onclick',
                          evaluate: _scope => _scope.exampleDTD
                        }
                      ]
                    }
                  ]
                )
              },
              {
                redundantAttribute: 'expr205',
                selector: '[expr205]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,

                    evaluate: _scope => [
                      _scope.state.override ? 'Stop using your own schema' : 'Use your own schema'
                    ].join(
                      ''
                    )
                  },
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.toggleOverride
                  }
                ]
              },
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'dict-config-buttons',
                slots: [],

                attributes: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'save-data',
                    evaluate: _scope => _scope.saveData
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'dict-id',
                    evaluate: _scope => _scope.props.dictId
                  }
                ],

                redundantAttribute: 'expr206',
                selector: '[expr206]'
              }
            ]
          )
        }
      ]
    ),

    name: 'dict-config-xema'
  };

  var dict_config_xema_element = {
    css: null,

    exports: {
      onBeforeMount() {
          this.resetIfSelectedElementChanged();
      },

      onBeforeUpdate(prop, state) {
          this.resetIfSelectedElementChanged();
      },

      resetIfSelectedElementChanged(forceReset) { // on different element selected in tree.
          if (forceReset || (this.props.elementId && ((this.props.elementId !== this.state.elementId) || !this.state.config.elementName))) {
              this.state.elementId = this.props.elementId;
              this.state.config = JSON.parse(JSON.stringify({...this.props.config})); // deep clone.
              this.state.config.elementName = this.state.config.elementName || this.props.elementId;
              this.state.isAddingAttribute = false;
              this.state.newAttributeName = '';

              const xemaEntries = Object.entries(this.props.xema.elements).map(([id, config]) => ({
                  ...config,
                  id, 
                  elementName: config.elementName || id
              }));

              // Do some preprocessing on this element's children
              // So we can easily see which children are also used elsewhere
              // and which children have similarly named children elsewhere
              this.state.computedChildren = this.state.config.children.map(({name, min, max}) => {
                  const id = name;
                  const elementName = this.props.xema.elements[name].elementName || id;
                  // check if other elements (than this one) may contain this precise child
                  const isUsedElsewhere = xemaEntries.some(e => e.children.some(c => c.name === id) && e.id !== this.props.elementId);
                  // Find other elements with the same name as this child, that have a different ID
                  // So in essence: different configs for the same element. 
                  const nameSiblings = xemaEntries
                      .filter(e => e.elementName === elementName && e.id !== id) // all with the same elementName but different ID
                      .map(nameSibling => {
                          const firstParent = xemaEntries.find(e => e.children.some(c => c.name === nameSibling.id));
                          return {
                              ...nameSibling, 
                              parentElementName: firstParent ? firstParent.elementName : '[no parent]'
                          }
                      });
                  const hasNameSiblings = nameSiblings.length > 0;
                  return {
                      id, elementName, isUsedElsewhere, hasNameSiblings, nameSiblings
                  }
              });
          }
      },

      /** 
       * Update a property in our local data copy. 
       * The new value is event.target.value
       * The parent data is also updated if either:
       * 1. the triggering element has [data-apply] attribute.
       * 2. the event is a keypress and the key is Enter.
       */
      updateLocalData(event) {
          // data-path is a string representing a javascript property accessor. such as 'someObject.someProperty[someIndex]'
          const path = event.target.getAttribute('data-path');
          
          this._setOrGetPath(this.state, path);
          this._setOrGetPath(this.state, path, event.target.value);
          if (event.target.hasAttribute('data-apply') || event.keyCode === 13) this.applyLocalData();
          else this.update();
      },

      /** Like updateLocalData, but delete the property instead. */
      deleteLocalData(event) {
          const path = event.target.getAttribute('data-path');
          this._deletePath(this.state, path);
          if (event.target.hasAttribute('data-apply')) this.applyLocalData();
          else this.update();
      },

      /** Like updateLocalData, but reset to the (initial) value from our prop */
      resetLocalData(event) {
          const path = event.target.getAttribute('data-path');
          this._setOrGetPath(this.state, path, this._setOrGetPath(this.props, path));
          this.update();
      },

      /** Submit our local (changed) data to the parent component */
      applyLocalData(event) {
          // sanitize
          const newConfig = JSON.parse(JSON.stringify(this.state.config));
          if (!this.isValidXmlName(newConfig.elementName)) {
              newConfig.elementName = this.props.config.elementName || this.props.elementId; // not valid - reset to whatever it was prior to saving
          }

          this.props.applyLocalData(this.props.elementId, newConfig);
      },

      /** User is creating a new attribute */
      beginNewAttribute(event) {
          this.state.isAddingAttribute = true;
          this.update();
      },

      /** User cancelend adding a new attribute */
      cancelNewAttribute(event) {
          this.state.isAddingAttribute = false;
          this.update();
      },

      /** User commits new attribute */
      saveNewAttribute(event) {
          // sanity check.
          if (!this.state.config.attributes[this.state.newAttributeName] && this.state.newAttributeName && this.isValidXmlName(this.state.newAttributeName)) {
              this.state.config.attributes[this.state.newAttributeName] = {
                  optionality: 'optional',
                  filling: 'txt',
                  values: []
              };
              this.state.newAttributeName = '';
              this.state.isAddingAttribute = false;
              this.applyLocalData();
              this.update();
          }
      },

      /** User is adding a new element child */
      beginNewElement(event) {
          this.state.isAddingElement = true;
          this.update();
      },

      /** User canceled adding a new element child */
      cancelNewElement(event) {
          this.state.isAddingElement = false;
          this.update();
      },

      /** User commits new element child */
      saveNewElement(event) {
          if (!this.isValidXmlName(this.state.newElementName)) {
              return; 
          }
          const idOfNewChild = this.state.newElementName;
          if (!this.props.xema.elements[idOfNewChild]) { // doesn't exist (yet) - create!
              this.props.createElement(newId, {
                  elementName: this.state.newElementName,
                  filling: 'emp',
                  children: [],
                  values: [],
                  attributes: {}
              });
          }

          this.state.newElementName = '';
          this.state.isAddingElement = false;
          this.state.config.children.push({name: idOfNewChild});
          this.applyLocalData();
      },

      /** 
       * For a child element of this element:
       * if the child may also occur in other elements, make a local copy of the child.
       * Essentially go from
       * {
       *    thisElement: { children: [{name: someChild}] },
       *    someOtherElement: { children: [{name: someChild}] }, // same child!
       * 
       *    someChild: {...}
       * }
       * To: 
       * {
       *    thisElement: { children: [{name: someChildCopy}] },
       *    someOtherElement: { children: [{name: someChild}] }, // now a different child!
       * 
       *    someChild: {...},
       *    someChildCopy: {...}
       * }
       */
      makeUnique(event) {
          const currentChildId = event.target.getAttribute('data-name');
          const currentChildConfig = JSON.parse(JSON.stringify(this.props.xema.elements[currentChildId]));
          currentChildConfig.elementName = currentChildConfig.elementName || currentChildId; // make sure we set the element name, since the ID will change and so will no longer work as fallback.

          // create a unique id for the clone by appending numbers
          let n = 0;
          let newChildId = currentChildId + n;
          while (this.props.xema.elements[newChildId]) {
              newChildId = currentChildId + (++n);
          }
          
          // now clone the child under the new id
          this.props.createElement(newChildId, currentChildConfig);
          // replace the current child with the new (unique) child.
          this.state.config.children.forEach(c => {
              if (c.name == currentChildId) c.name = newChildId;
          });
          // and save!
          this.applyLocalData(); // propagate to parent
          this.resetIfSelectedElementChanged(true); // manually rerun computed/derived values
          this.update(); // update DOM
      },

      /**
       * The opposite of makeUnique
       * Replace one of our children with another child that has the same elementName, but a different definition
       * From: 
       * {
       *    thisElement: { children: [{name: someChildWithTheSameElementName}] },
       *    someOtherElement: { children: [{name: someChild}] }, 
       * 
       *    someChild: { elementName: 'foo' },
       *    someChildWithTheSameElementName: { elementName: 'foo' }
       * }
       * To: 
       * {
       *    thisElement: { children: [{name: someChild}] },
       *    someOtherElement: { children: [{name: someChild}] }, 
       * 
       *    someChild: { elementName: 'foo' },
       *    // someChildWithTheSameElementName is deleted because it became an orphan
       * } 
       */
      replaceWithNameSibling(event) {
          const childIdToReplace = event.target.getAttribute('data-name');
          const childIdToReplaceWith = this.$(`select[data-name="${childIdToReplace}"]`).value; // this.$ is scope selector
          if (!childIdToReplaceWith) return; // user should make a selection first.

          const childHasOtherParents = Object.entries(this.props.xema.elements).some(([id, element]) => id !== this.props.elementId && element.children.some(c => c.name === childIdToReplace));
          
          // now replace
          // first replace our own child with the chosen one
          this.state.config.children.forEach(c => {
              if (c.name === childIdToReplace) c.name = childIdToReplaceWith;
          });
          
          this.applyLocalData();
          if (!childHasOtherParents) this.props.deleteElement(childIdToReplace);
          this.resetIfSelectedElementChanged(true);
          this.update();
      },

      /**
       * Set or return the value at an arbitrary property path
       * @param object any object 
       * @param {string} path any path like "some.property.path[in].the.object"
       * @param {any} [newValue] (optional) the new value to set to the property
       */
      _setOrGetPath() { 
          const [object, path] = arguments;
          // see if we actually got a new value to set, to differentiate between _setOrGet(state, path) and _setOrGet(state, path, undefined).
          let newValue = undefined;
          let newValueProvided = false;
          if (arguments.length > 2) { 
              newValue = arguments[2];
              newValueProvided = true;
          }

          const pathParts = path.split(/[\.\[\]\'\"]/).filter(p => p);
          const lastIndex = newValueProvided ? pathParts.pop() : undefined;
          const v = pathParts.reduce((o, p) => o ? o[p] : undefined, object);
          return newValueProvided ? v[lastIndex] = JSON.parse(JSON.stringify(newValue)) : v;
      },

      /** Delete the property at the path. If path points at an array entry, remove it in place. */
      _deletePath(object, path) {
          const pathParts = path.split(/[\.\[\]\'\"]/).filter(p => p);
          const lastIndex = pathParts.pop();
          const v = pathParts.reduce((o, p) => o ? o[p] : undefined, object);
          if (Array.isArray(v)) v.splice(lastIndex, 1);
          else delete v[lastIndex];
      },

      selectAttribute(event) {
          // focus attribute
          this.props.selectElementOrAttribute(this.props.elementId, event.currentTarget.getAttribute('data-name'));
      },

      selectElement(event) {
          this.props.selectElementOrAttribute(event.currentTarget.getAttribute('data-name'), undefined);
      },

      isValidXmlName(str) {
          if (!str) return false;
          if (/[=\s\"\']/.test(str)) return false;
          try { $.parseXML("<" + str + "/>"); } catch (err) { return false; }
          return true;
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div class="block"><div class="title">Element</div><input expr424="expr424" class="textbox tech elName" data-path="config.elementName"/><template expr425="expr425"></template></div><div class="block"><div class="title tight">Attributes</div><table><tr expr429="expr429"></tr></table><button expr435="expr435" class="butAtNewOpener iconAdd"></button><template expr436="expr436"></template></div><div class="block"><div class="title">Content</div><label class="radio"><input expr443="expr443" type="radio" name="filling" value="chd" data-apply data-path="config.filling"/>Child elements</label><label class="radio"><input expr444="expr444" type="radio" name="filling" value="txt" data-apply data-path="config.filling"/>Text</label><label class="radio"><input expr445="expr445" type="radio" name="filling" value="inl" data-apply data-path="config.filling"/>Text with markup</label><label class="radio"><input expr446="expr446" type="radio" name="filling" value="lst" data-apply data-path="config.filling"/>Value from list</label><label class="radio"><input expr447="expr447" type="radio" name="filling" value="emp" data-apply data-path="config.filling"/>Empty</label><label class="radio"><input expr448="expr448" type="radio" name="filling" value="med" data-apply data-path="config.filling"/>Media</label></div><div class="block"><div class="title tight">Child elements</div><table expr449="expr449"></table><button expr461="expr461" class="butElNewOpener iconAdd"></button><template expr462="expr462"></template></div>',
      [
        {
          redundantAttribute: 'expr424',
          selector: '[expr424]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.state.config.elementName
            },
            {
              type: expressionTypes.EVENT,
              name: 'onkeypress',
              evaluate: _scope => _scope.updateLocalData
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.config.elementName !== (_scope.props.config.elementName || _scope.props.elementId),
          redundantAttribute: 'expr425',
          selector: '[expr425]',

          template: template(
            '<button expr426="expr426" type="button" class="butRename iconAccept"></button><button expr427="expr427" type="button" class="butRenameCancel iconCancel" data-path="config.elementName">\n                Cancel renaming\n            </button><div expr428="expr428" class="warn"></div>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.isValidXmlName(_scope.state.config.elementName),
                redundantAttribute: 'expr426',
                selector: '[expr426]',

                template: template(
                  '\n                Rename\n            ',
                  [
                    {
                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onclick',
                          evaluate: _scope => _scope.applyLocalData
                        }
                      ]
                    }
                  ]
                )
              },
              {
                redundantAttribute: 'expr427',
                selector: '[expr427]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.resetLocalData
                  }
                ]
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => !_scope.isValidXmlName(_scope.state.config.elementName),
                redundantAttribute: 'expr428',
                selector: '[expr428]',

                template: template(
                  ' ',
                  [
                    {
                      expressions: [
                        {
                          type: expressionTypes.TEXT,
                          childNodeIndex: 0,

                          evaluate: _scope => [
                            _scope.state.config.elementName,
                            ' is not a valid element name'
                          ].join(
                            ''
                          )
                        }
                      ]
                    }
                  ]
                )
              }
            ]
          )
        },
        {
          type: bindingTypes.EACH,
          getKey: null,
          condition: null,

          template: template(
            '<td expr430="expr430" class="cell1"><span class="tech"><span class="ats">@</span><span expr431="expr431" class="att"> </span></span></td><td class="cell2"><span><label class="radio"><input expr432="expr432" type="radio" value="optional" data-apply/>optional</label><label class="radio"><input expr433="expr433" type="radio" value="obligatory" data-apply/>obligatory</label></span></td><td class="cell9"><button expr434="expr434" class="iconOnly iconCross" data-apply>&nbsp;</button></td>',
            [
              {
                redundantAttribute: 'expr430',
                selector: '[expr430]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.selectAttribute
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'data-name',
                    evaluate: _scope => _scope.att[0]
                  }
                ]
              },
              {
                redundantAttribute: 'expr431',
                selector: '[expr431]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.att[0]
                  }
                ]
              },
              {
                redundantAttribute: 'expr432',
                selector: '[expr432]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'name',
                    evaluate: _scope => `optionality[${_scope.att[0]}]`
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'checked',
                    evaluate: _scope => _scope.att[1].optionality === "optional"
                  },
                  {
                    type: expressionTypes.EVENT,
                    name: 'onchange',
                    evaluate: _scope => _scope.updateLocalData
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'data-path',
                    evaluate: _scope => `config.attributes.${_scope.att[0]}.optionality`
                  }
                ]
              },
              {
                redundantAttribute: 'expr433',
                selector: '[expr433]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'name',
                    evaluate: _scope => `optionality[${_scope.att[0]}]`
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'checked',
                    evaluate: _scope => _scope.att[1].optionality === "obligatory"
                  },
                  {
                    type: expressionTypes.EVENT,
                    name: 'onchange',
                    evaluate: _scope => _scope.updateLocalData
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'data-path',
                    evaluate: _scope => `config.attributes.${_scope.att[0]}.optionality`
                  }
                ]
              },
              {
                redundantAttribute: 'expr434',
                selector: '[expr434]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.deleteLocalData
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'data-path',
                    evaluate: _scope => `config.attributes.${_scope.att[0]}`
                  }
                ]
              }
            ]
          ),

          redundantAttribute: 'expr429',
          selector: '[expr429]',
          itemName: 'att',
          indexName: null,
          evaluate: _scope => Object.entries(_scope.state.config.attributes).sort((a, b) => a[0].localeCompare(b[0]))
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.state.isAddingAttribute,
          redundantAttribute: 'expr435',
          selector: '[expr435]',

          template: template(
            '\n            Add...\n        ',
            [
              {
                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.beginNewAttribute
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isAddingAttribute,
          redundantAttribute: 'expr436',
          selector: '[expr436]',

          template: template(
            '<form expr437="expr437"><input expr438="expr438" class="textbox tech atName txtAtNew" data-path="newAttributeName" focus/><button expr439="expr439" class="butAtNew iconAccept"></button><button expr440="expr440" class="butAtNewCancel iconCancel">Cancel</button></form><div expr441="expr441" class="warn errInvalidAtName"></div><div expr442="expr442" class="warn errAtNameExists"></div>',
            [
              {
                redundantAttribute: 'expr437',
                selector: '[expr437]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onsubmit',
                    evaluate: _scope => _scope.saveNewAttribute
                  }
                ]
              },
              {
                redundantAttribute: 'expr438',
                selector: '[expr438]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'oninput',
                    evaluate: _scope => _scope.updateLocalData
                  }
                ]
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.state.newAttributeName && _scope.isValidXmlName(_scope.state.newAttributeName),
                redundantAttribute: 'expr439',
                selector: '[expr439]',

                template: template(
                  'Add',
                  [
                    {
                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onclick',
                          evaluate: _scope => _scope.saveNewAttribute
                        }
                      ]
                    }
                  ]
                )
              },
              {
                redundantAttribute: 'expr440',
                selector: '[expr440]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.cancelNewAttribute
                  }
                ]
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => !_scope.isValidXmlName(_scope.state.newAttributeName),
                redundantAttribute: 'expr441',
                selector: '[expr441]',

                template: template(
                  'Cannot add, not a valid XML name.',
                  []
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.state.config.attributes[_scope.state.newAttributeName],
                redundantAttribute: 'expr442',
                selector: '[expr442]',

                template: template(
                  'Cannot add, such attribute already exists.',
                  []
                )
              }
            ]
          )
        },
        {
          redundantAttribute: 'expr443',
          selector: '[expr443]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onchange',
              evaluate: _scope => _scope.updateLocalData
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'checked',
              evaluate: _scope => _scope.state.config.filling === "chd"
            }
          ]
        },
        {
          redundantAttribute: 'expr444',
          selector: '[expr444]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onchange',
              evaluate: _scope => _scope.updateLocalData
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'checked',
              evaluate: _scope => _scope.state.config.filling === "txt"
            }
          ]
        },
        {
          redundantAttribute: 'expr445',
          selector: '[expr445]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onchange',
              evaluate: _scope => _scope.updateLocalData
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'checked',
              evaluate: _scope => _scope.state.config.filling === "inl"
            }
          ]
        },
        {
          redundantAttribute: 'expr446',
          selector: '[expr446]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onchange',
              evaluate: _scope => _scope.updateLocalData
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'checked',
              evaluate: _scope => _scope.state.config.filling === "lst"
            }
          ]
        },
        {
          redundantAttribute: 'expr447',
          selector: '[expr447]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onchange',
              evaluate: _scope => _scope.updateLocalData
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'checked',
              evaluate: _scope => _scope.state.config.filling === "emp"
            }
          ]
        },
        {
          redundantAttribute: 'expr448',
          selector: '[expr448]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onchange',
              evaluate: _scope => _scope.updateLocalData
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'checked',
              evaluate: _scope => _scope.state.config.filling === "med"
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.config.children.length,
          redundantAttribute: 'expr449',
          selector: '[expr449]',

          template: template(
            '<tr expr450="expr450"></tr>',
            [
              {
                type: bindingTypes.EACH,
                getKey: null,
                condition: null,

                template: template(
                  '<td expr451="expr451" class="cell1"><span class="tech"><span class="brak">&lt;</span><span expr452="expr452" class="elm"> </span><span class="brak">&gt;</span></span></td><td class="cell2" style="white-space: nowrap;"><label>min <input expr453="expr453" class="textbox min" type="number" data-apply/></label><label>max <input expr454="expr454" class="textbox max" type="number" data-apply/></label></td><td class="cell9"><button expr455="expr455" class="iconOnly iconCross" data-apply>&nbsp;</button></td><td><div><button expr456="expr456"></button><template expr457="expr457"></template></div></td>',
                  [
                    {
                      redundantAttribute: 'expr451',
                      selector: '[expr451]',

                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onclick',
                          evaluate: _scope => _scope.selectElement
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'data-name',
                          evaluate: _scope => _scope.child.id
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr452',
                      selector: '[expr452]',

                      expressions: [
                        {
                          type: expressionTypes.TEXT,
                          childNodeIndex: 0,
                          evaluate: _scope => _scope.child.elementName
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr453',
                      selector: '[expr453]',

                      expressions: [
                        {
                          type: expressionTypes.VALUE,
                          evaluate: _scope => _scope.child.min
                        },
                        {
                          type: expressionTypes.EVENT,
                          name: 'onchange',
                          evaluate: _scope => _scope.updateLocalData
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'data-path',
                          evaluate: _scope => `config.children[${_scope.index}].min`
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr454',
                      selector: '[expr454]',

                      expressions: [
                        {
                          type: expressionTypes.VALUE,
                          evaluate: _scope => _scope.child.max
                        },
                        {
                          type: expressionTypes.EVENT,
                          name: 'onchange',
                          evaluate: _scope => _scope.updateLocalData
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'data-path',
                          evaluate: _scope => `config.children[${_scope.index}].max`
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr455',
                      selector: '[expr455]',

                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onclick',
                          evaluate: _scope => _scope.deleteLocalData
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'data-path',
                          evaluate: _scope => `config.children[${_scope.index}]`
                        }
                      ]
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.child.isUsedElsewhere,
                      redundantAttribute: 'expr456',
                      selector: '[expr456]',

                      template: template(
                        'make&nbsp;unique',
                        [
                          {
                            expressions: [
                              {
                                type: expressionTypes.EVENT,
                                name: 'onclick',
                                evaluate: _scope => _scope.makeUnique
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'data-name',
                                evaluate: _scope => _scope.child.id
                              }
                            ]
                          }
                        ]
                      )
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.child.hasNameSiblings,
                      redundantAttribute: 'expr457',
                      selector: '[expr457]',

                      template: template(
                        ' <select expr458="expr458"><option expr459="expr459"></option></select><button expr460="expr460">use instead</button>',
                        [
                          {
                            expressions: [
                              {
                                type: expressionTypes.TEXT,
                                childNodeIndex: 0,

                                evaluate: _scope => [
                                  'Element ',
                                  _scope.child.elementName,
                                  ' has different configurations:'
                                ].join(
                                  ''
                                )
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr458',
                            selector: '[expr458]',

                            expressions: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'data-name',
                                evaluate: _scope => _scope.child.id
                              }
                            ]
                          },
                          {
                            type: bindingTypes.EACH,
                            getKey: null,
                            condition: null,

                            template: template(
                              ' ',
                              [
                                {
                                  expressions: [
                                    {
                                      type: expressionTypes.TEXT,
                                      childNodeIndex: 0,

                                      evaluate: _scope => [
                                        _scope.sibling.parentElementName,
                                        '/',
                                        _scope.sibling.elementName
                                      ].join(
                                        ''
                                      )
                                    },
                                    {
                                      type: expressionTypes.ATTRIBUTE,
                                      name: 'value',
                                      evaluate: _scope => _scope.sibling.id
                                    }
                                  ]
                                }
                              ]
                            ),

                            redundantAttribute: 'expr459',
                            selector: '[expr459]',
                            itemName: 'sibling',
                            indexName: null,
                            evaluate: _scope => _scope.child.nameSiblings
                          },
                          {
                            redundantAttribute: 'expr460',
                            selector: '[expr460]',

                            expressions: [
                              {
                                type: expressionTypes.EVENT,
                                name: 'onclick',
                                evaluate: _scope => _scope.replaceWithNameSibling
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'data-name',
                                evaluate: _scope => _scope.child.id
                              }
                            ]
                          }
                        ]
                      )
                    }
                  ]
                ),

                redundantAttribute: 'expr450',
                selector: '[expr450]',
                itemName: 'child',
                indexName: 'index',
                evaluate: _scope => _scope.state.computedChildren
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.state.isAddingElement,
          redundantAttribute: 'expr461',
          selector: '[expr461]',

          template: template(
            'Add...',
            [
              {
                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.beginNewElement
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isAddingElement,
          redundantAttribute: 'expr462',
          selector: '[expr462]',

          template: template(
            '<input expr463="expr463" class="textbox tech elName txtElNew" data-path="newElementName"/><button expr464="expr464" class="butElNew iconAccept"></button><button expr465="expr465" class="butElNewCancel iconCancel">Cancel</button><div expr466="expr466" class="warn errInvalidElName"></div>',
            [
              {
                redundantAttribute: 'expr463',
                selector: '[expr463]',

                expressions: [
                  {
                    type: expressionTypes.VALUE,
                    evaluate: _scope => _scope.state.newElementName
                  },
                  {
                    type: expressionTypes.EVENT,
                    name: 'oninput',
                    evaluate: _scope => _scope.updateLocalData
                  }
                ]
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.state.newElementName && _scope.isValidXmlName(_scope.state.newElementName),
                redundantAttribute: 'expr464',
                selector: '[expr464]',

                template: template(
                  'Add',
                  [
                    {
                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onclick',
                          evaluate: _scope => _scope.saveNewElement
                        }
                      ]
                    }
                  ]
                )
              },
              {
                redundantAttribute: 'expr465',
                selector: '[expr465]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.cancelNewElement
                  }
                ]
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.state.newElementName && !_scope.isValidXmlName(_scope.state.newElementName),
                redundantAttribute: 'expr466',
                selector: '[expr466]',

                template: template(
                  'Cannot add, not a valid XML name.',
                  []
                )
              }
            ]
          )
        }
      ]
    ),

    name: 'dict-config-xema-element'
  };

  var dict_config_xema_attribute = {
    css: `dict-config-xema-attribute { display: block; }`,

    exports: {
      onBeforeMount() {
          this.resetIfSelectedElementChanged();
      },

      onBeforeUpdate(prop, state) {
          this.resetIfSelectedElementChanged();
      },

      resetIfSelectedElementChanged(forceReset) { // on different element selected in tree.
          if (forceReset || this.props.elementId !== this.state.elementId || this.props.attributeId !== this.state.attributeId) {
              this.state.elementId = this.props.elementId;
              this.state.attributeId = this.props.attributeId;
              this.state.config = JSON.parse(JSON.stringify({...this.props.config})); // deep clone.
              
              this.state.newAttributeId = this.state.attributeId; // temp variable while user is editing it

              this.state.isAddingValue = false;
              this.state.newValue = '';
              this.state.newCaption = '';
          }
      },

      /** 
       * Update a property in our local data copy. 
       * The new value is event.target.value
       * The parent data is also updated if either:
       * 1. the triggering element has [data-apply] attribute.
       * 2. the event is a keypress and the key is Enter.
       */
      updateLocalData(event) {
         // data-path is a string representing a javascript property accessor. such as 'someObject.someProperty[someIndex]'
         const path = event.target.getAttribute('data-path');
         
         this._setOrGetPath(this.state, path);
         this._setOrGetPath(this.state, path, event.target.value);
         if (event.target.hasAttribute('data-apply') || event.keyCode === 13) this.applyLocalData();
         else this.update();
     },

      /** Like updateLocalData, but delete the property instead. */
      deleteLocalData(event) {
          const path = event.target.getAttribute('data-path');
          this._deletePath(this.state, path);
          if (event.target.hasAttribute('data-apply')) this.applyLocalData();
          else this.update();
      },

      /** Like updateLocalData, but reset to the (initial) value from our prop */
      resetLocalData(event) {
          const path = event.target.getAttribute('data-path');
          this._setOrGetPath(this.state, path, this._setOrGetPath(this.props, path));
          this.update();
      },

      /** Submit our local (changed) data to the parent component */
      applyLocalData(event) {
          const newConfig = JSON.parse(JSON.stringify(this.state.config));
          this.props.applyLocalData(newConfig);
      },

      saveNewId(event) {
          const parentEl = this.props.xema.elements[this.props.elementId];
          if (this.state.newAttributeId === this.props.newAttributeId) 
              return;
          if (parentEl.attributes[this.state.newAttributeId])
              return;
          if (!this.isValidXmlName(this.state.newAttributeId)) 
              return;
          
          this.props.renameAttribute(this.state.newAttributeId);
          // change should flow down automatically.
      },

      /** User is adding a new value */
      beginNewValue(event) {
          this.state.isAddingValue = true;
          this.update();
      },

      /** User canceled adding a new value */
      cancelNewValue(event) {
          this.state.isAddingValue = false;
          this.state.newValue = '';
          this.state.newCaption = '';
          this.update();
      },

      /** User commits new value */
      saveNewValue(event) {
          this.state.config.values.push({
              value: this.state.newValue,
              caption: this.state.newCaption,
          });
          this.isAddingValue = false;
          this.state.newValue = '';
          this.state.newCaption = '';
          this.applyLocalData();
      },

      /**
       * Set or return the value at an arbitrary property path
       * @param object any object 
       * @param {string} path any path like "some.property.path[in].the.object"
       * @param {any} [newValue] (optional) the new value to set to the property
       */
      _setOrGetPath() { 
         const [object, path] = arguments;
         // see if we actually got a new value to set, to differentiate between _setOrGet(state, path) and _setOrGet(state, path, undefined).
         let newValue = undefined;
         let newValueProvided = false;
         if (arguments.length > 2) { 
             newValue = arguments[2];
             newValueProvided = true;
         }

         const pathParts = path.split(/[\.\[\]\'\"]/).filter(p => p);
         const lastIndex = newValueProvided ? pathParts.pop() : undefined;
         const v = pathParts.reduce((o, p) => o ? o[p] : undefined, object);
         return newValueProvided ? v[lastIndex] = JSON.parse(JSON.stringify(newValue)) : v;
     },

      /** Delete the property at the path. If path points at an array entry, remove it in place. */
      _deletePath(object, path) {
          const pathParts = path.split(/[\.\[\]\'\"]/).filter(p => p);
          const lastIndex = pathParts.pop();
          const v = pathParts.reduce((o, p) => o ? o[p] : undefined, object);
          if (Array.isArray(v)) v.splice(lastIndex, 1);
          else delete v[lastIndex];
      },

      isValidXmlName(str) {
          if (!str) return false;
          if (/[=\s\"\']/.test(str)) return false;
          try { $.parseXML("<" + str + "/>"); } catch (err) { return false; }
          return true;
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div class="block"><div class="title">Attribute</div><form expr401="expr401"><input expr402="expr402" class="textbox tech atName" data-path="newAttributeId"/><button expr403="expr403" class="butRename iconAccept" type="submit"></button><div expr404="expr404" class="warn errInvalidAtName"></div><div expr405="expr405" class="warn errAtNameExists"></div></form></div><div class="block"><div class="title">Content</div><label class="radio"><input expr406="expr406" type="radio" name="filling" value="txt" data-path="config.filling" data-apply/>Text</label><label class="radio"><input expr407="expr407" type="radio" name="filling" value="lst" data-path="config.filling" data-apply/>Value from list</label></div><div expr408="expr408" class="block"></div>',
      [
        {
          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'class',
              evaluate: _scope => 'details'
            }
          ]
        },
        {
          redundantAttribute: 'expr401',
          selector: '[expr401]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onsubmit',
              evaluate: _scope => _scope.saveNewId
            }
          ]
        },
        {
          redundantAttribute: 'expr402',
          selector: '[expr402]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.state.newAttributeId
            },
            {
              type: expressionTypes.EVENT,
              name: 'oninput',
              evaluate: _scope => _scope.updateLocalData
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.props.attributeId !== _scope.state.newAttributeId && _scope.isValidXmlName(_scope.state.newAttributeId) && _scope.props.xema.elements[_scope.props.elementId].attributes[_scope.state.newAttributeId] == null,
          redundantAttribute: 'expr403',
          selector: '[expr403]',

          template: template(
            'Rename',
            [
              {
                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.saveNewId
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.isValidXmlName(_scope.state.newAttributeId),
          redundantAttribute: 'expr404',
          selector: '[expr404]',

          template: template(
            'Cannot rename, not a valid XML name.',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.newAttributeId != _scope.props.attributeId && _scope.props.xema.elements[_scope.props.elementId].attributes[_scope.state.newAttributeId],
          redundantAttribute: 'expr405',
          selector: '[expr405]',

          template: template(
            'Cannot rename, such attribute already exists.',
            []
          )
        },
        {
          redundantAttribute: 'expr406',
          selector: '[expr406]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.updateLocalData
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'checked',
              evaluate: _scope => _scope.state.config.filling === 'txt'
            }
          ]
        },
        {
          redundantAttribute: 'expr407',
          selector: '[expr407]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.updateLocalData
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'checked',
              evaluate: _scope => _scope.state.config.filling === 'lst'
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.config.filling === "lst",
          redundantAttribute: 'expr408',
          selector: '[expr408]',

          template: template(
            '<div class="title">Values</div><table><tr expr409="expr409"></tr></table><template expr417="expr417"></template><form expr419="expr419" style="white-space: nowrap;"></form>',
            [
              {
                type: bindingTypes.EACH,
                getKey: null,
                condition: null,

                template: template(
                  '<td class="cell1"><form expr410="expr410" style="white-space: nowrap;"><input expr411="expr411" class="textbox val" placeholder="value"/><input expr412="expr412" class="textbox cap" placeholder="caption"/><template expr413="expr413"></template></form></td><td class="cell9"><button expr416="expr416" class="iconOnly iconCross" data-apply>&nbsp;</button></td>',
                  [
                    {
                      redundantAttribute: 'expr410',
                      selector: '[expr410]',

                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onsubmit',
                          evaluate: _scope => _scope.applyLocalData
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr411',
                      selector: '[expr411]',

                      expressions: [
                        {
                          type: expressionTypes.VALUE,
                          evaluate: _scope => _scope.value.value
                        },
                        {
                          type: expressionTypes.EVENT,
                          name: 'oninput',
                          evaluate: _scope => _scope.updateLocalData
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'data-path',

                          evaluate: _scope => [
                            'config.values[',
                            _scope.index,
                            '].value'
                          ].join(
                            ''
                          )
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr412',
                      selector: '[expr412]',

                      expressions: [
                        {
                          type: expressionTypes.VALUE,
                          evaluate: _scope => _scope.value.caption
                        },
                        {
                          type: expressionTypes.EVENT,
                          name: 'oninput',
                          evaluate: _scope => _scope.updateLocalData
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'data-path',

                          evaluate: _scope => [
                            'config.values[',
                            _scope.index,
                            '].caption'
                          ].join(
                            ''
                          )
                        }
                      ]
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.value.value !== _scope.props.config.values[_scope.index].value || _scope.value.caption !== _scope.props.config.values[_scope.index].caption,
                      redundantAttribute: 'expr413',
                      selector: '[expr413]',

                      template: template(
                        '<button expr414="expr414" class="change iconAccept" type="submit">Change</button><button expr415="expr415" class="cancel iconCancel" type="button">Cancel</button>',
                        [
                          {
                            redundantAttribute: 'expr414',
                            selector: '[expr414]',

                            expressions: [
                              {
                                type: expressionTypes.EVENT,
                                name: 'onclick',
                                evaluate: _scope => _scope.applyLocalData
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr415',
                            selector: '[expr415]',

                            expressions: [
                              {
                                type: expressionTypes.EVENT,
                                name: 'onclick',
                                evaluate: _scope => _scope.resetLocalData
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'data-path',

                                evaluate: _scope => [
                                  'config.values[',
                                  _scope.index,
                                  ']'
                                ].join(
                                  ''
                                )
                              }
                            ]
                          }
                        ]
                      )
                    },
                    {
                      redundantAttribute: 'expr416',
                      selector: '[expr416]',

                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onclick',
                          evaluate: _scope => _scope.deleteLocalData
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'data-path',

                          evaluate: _scope => [
                            'config.values[',
                            _scope.index,
                            ']'
                          ].join(
                            ''
                          )
                        }
                      ]
                    }
                  ]
                ),

                redundantAttribute: 'expr409',
                selector: '[expr409]',
                itemName: 'value',
                indexName: 'index',
                evaluate: _scope => _scope.state.config.values
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => !_scope.state.isAddingValue,
                redundantAttribute: 'expr417',
                selector: '[expr417]',

                template: template(
                  '<button expr418="expr418" class="butNewValue iconAdd">Add...</button>',
                  [
                    {
                      redundantAttribute: 'expr418',
                      selector: '[expr418]',

                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onclick',
                          evaluate: _scope => _scope.beginNewValue
                        }
                      ]
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.state.isAddingValue,
                redundantAttribute: 'expr419',
                selector: '[expr419]',

                template: template(
                  '<input expr420="expr420" class="textbox new val" data-path="newValue" placeholder="value" autofocus/><input expr421="expr421" class="textbox new cap" data-path="newCaption" placeholder="caption"/><button expr422="expr422" class="butNewValueOK iconAccept"></button><button expr423="expr423" class="butNewValueCancel iconCancel" type="button">Cancel</button>',
                  [
                    {
                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onsubmit',
                          evaluate: _scope => _scope.saveNewValue
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr420',
                      selector: '[expr420]',

                      expressions: [
                        {
                          type: expressionTypes.VALUE,
                          evaluate: _scope => _scope.state.newValue
                        },
                        {
                          type: expressionTypes.EVENT,
                          name: 'oninput',
                          evaluate: _scope => _scope.updateLocalData
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr421',
                      selector: '[expr421]',

                      expressions: [
                        {
                          type: expressionTypes.VALUE,
                          evaluate: _scope => _scope.state.newCaption
                        },
                        {
                          type: expressionTypes.EVENT,
                          name: 'oninput',
                          evaluate: _scope => _scope.updateLocalData
                        }
                      ]
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.state.newValue,
                      redundantAttribute: 'expr422',
                      selector: '[expr422]',

                      template: template(
                        'Add',
                        []
                      )
                    },
                    {
                      redundantAttribute: 'expr423',
                      selector: '[expr423]',

                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onclick',
                          evaluate: _scope => _scope.cancelNewValue
                        }
                      ]
                    }
                  ]
                )
              }
            ]
          )
        }
      ]
    ),

    name: 'dict-config-xema-attribute'
  };

  var dict_config_element_in_tree = {
    css: `dict-config-element-in-tree { position: relative; display: block; width: auto!important; } dict-config-element-in-tree:last-child:before { content: ""; display: block; position: absolute; left: -16px; bottom: 0; width: 2px; top: 16px; background: white; }`,

    exports: {
      // props: xema, current, data (xema element)

      onBeforeMount(props, state) {
          // console.log(this.props);

          this.state.showChildren = true;

          this.compute();
      },

      onMounted(props, state) {
          // right after the component is mounted on the page
      },

      onBeforeUpdate(props, state) {
          // allows recalculation of context data before the update
          this.compute();
          // console.log(`Updating element ${this.props.data.id} - active: ${this.props.currentElement} @${this.props.currentAttribute}`)
      },

      onUpdated(props, state) {
          // right after the component template is updated after an update call
      },

      onBeforeUnmount(props, state) {
          // before the component is removed
      },

      onUnmounted(props, state) {
          // when the component is removed from the page
      },

      compute() {
          this.state.children = this.props.data.children.map(c => ({...this.props.xema.elements[c.name], id: c.name}));
          this.state.attributes = Object.entries(this.props.data.attributes).map(([id, att]) => ({...att, id})).sort((a,b) => a.id.localeCompare(b.id));
          this.state.hasChildren = this.state.children.length > 0;
          this.state.hasAttributes = this.state.attributes.length > 0;
          
          this.state.rootClasses = 
              'container ' + 
              (this.state.showChildren ? '' : 'collapsed ') +
              (this.state.hasChildren ? 'hasChildren ' : '');
          this.state.classes = 
              'clickable element ' +
              // (this.state.hasChildren ? 'hasChildren ' : '') + 
              // (this.props.isRoot ? 'root ' : '') + 
              (this.props.currentElement === this.props.data.id && !this.props.currentAttribute ? 'current ' : '');
          // console.log(this.props, this.state)
      },

      toggleChildren() {
          this.state.showChildren = !this.state.showChildren;
          this.update();
      },

      selectElementOrAttribute() { this.props.selectElementOrAttribute(this.props.data.id, undefined); }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div class="horizontal"><span expr478="expr478" class="plusminus"></span></div><div expr479="expr479"><span class="tech"><span class="brak">&lt;</span><span expr480="expr480" class="elm"> </span><span class="brak">&gt;</span></span></div><div expr481="expr481" class="children"></div>',
      [
        {
          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'class',
              evaluate: _scope => _scope.state.rootClasses
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.hasChildren,
          redundantAttribute: 'expr478',
          selector: '[expr478]',

          template: template(
            null,
            [
              {
                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.toggleChildren
                  }
                ]
              }
            ]
          )
        },
        {
          redundantAttribute: 'expr479',
          selector: '[expr479]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'class',
              evaluate: _scope => _scope.state.classes
            },
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.selectElementOrAttribute
            }
          ]
        },
        {
          redundantAttribute: 'expr480',
          selector: '[expr480]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.props.data.elementName || _scope.props.data.id
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => (_scope.state.hasChildren || _scope.hasAttributes) && _scope.state.showChildren,
          redundantAttribute: 'expr481',
          selector: '[expr481]',

          template: template(
            '<dict-config-attribute-in-tree expr482="expr482"></dict-config-attribute-in-tree><dict-config-element-in-tree expr483="expr483"></dict-config-element-in-tree>',
            [
              {
                type: bindingTypes.EACH,
                getKey: null,
                condition: null,

                template: template(
                  null,
                  [
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'dict-config-attribute-in-tree',
                      slots: [],

                      attributes: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'data',
                          evaluate: _scope => _scope.att
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'xema',
                          evaluate: _scope => _scope.props.xema
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'parentElement',
                          evaluate: _scope => _scope.props.data
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'currentElement',
                          evaluate: _scope => _scope.props.currentElement
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'currentAttribute',
                          evaluate: _scope => _scope.props.currentAttribute
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'selectElementOrAttribute',
                          evaluate: _scope => _scope.props.selectElementOrAttribute
                        }
                      ]
                    }
                  ]
                ),

                redundantAttribute: 'expr482',
                selector: '[expr482]',
                itemName: 'att',
                indexName: null,
                evaluate: _scope => _scope.state.attributes
              },
              {
                type: bindingTypes.EACH,
                getKey: null,
                condition: null,

                template: template(
                  null,
                  [
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'dict-config-element-in-tree',
                      slots: [],

                      attributes: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'data',
                          evaluate: _scope => _scope.child
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'xema',
                          evaluate: _scope => _scope.props.xema
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'currentElement',
                          evaluate: _scope => _scope.props.currentElement
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'currentAttribute',
                          evaluate: _scope => _scope.props.currentAttribute
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'selectElementOrAttribute',
                          evaluate: _scope => _scope.props.selectElementOrAttribute
                        }
                      ]
                    }
                  ]
                ),

                redundantAttribute: 'expr483',
                selector: '[expr483]',
                itemName: 'child',
                indexName: null,
                evaluate: _scope => _scope.state.children
              }
            ]
          )
        }
      ]
    ),

    name: 'dict-config-element-in-tree'
  };

  var dict_config_attribute_in_tree = {
    css: `dict-config-attribute-in-tree { position: relative; display: inline-block; }`,

    exports: {
      // props: xema, current, data (xema attribute)

      onBeforeMount(props, state) {
          this.compute();
      },

      onMounted(props, state) {
          // right after the component is mounted on the page
      },

      onBeforeUpdate(props, state) {
          // allows recalculation of context data before the update
          this.compute();
          // console.log(`Updating attribute ${this.props.data.id} - active: ${this.props.currentElement} @${this.props.currentAttribute}`)
      },

      onUpdated(props, state) {
          // right after the component template is updated after an update call
      },

      onBeforeUnmount(props, state) {
          // before the component is removed
      },

      onUnmounted(props, state) {
          // when the component is removed from the page
      },

      compute() {
          this.state.classes = 
              'clickable attribute ' +
              // (this.state.hasChildren ? 'hasChildren ' : '') + 
              // (this.props.isRoot ? 'root ' : '') + 
              (this.props.currentAttribute === this.props.data.id && this.props.currentElement === this.props.parentElement.id ? 'current ' : '');
      },

      selectElementOrAttribute() {this.props.selectElementOrAttribute(this.props.parentElement.id, this.props.data.id);}
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div class="horizontal"></div><div expr228="expr228"><span class="tech"><span class="ats">@</span><span expr229="expr229" class="att"> </span></span></div>',
      [
        {
          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'class',
              evaluate: _scope => 'container'
            }
          ]
        },
        {
          redundantAttribute: 'expr228',
          selector: '[expr228]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'class',
              evaluate: _scope => _scope.state.classes
            },
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.selectElementOrAttribute
            }
          ]
        },
        {
          redundantAttribute: 'expr229',
          selector: '[expr229]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.props.data.id
            }
          ]
        }
      ]
    ),

    name: 'dict-config-attribute-in-tree'
  };

  var displayStyles = {
    css: `display-styles .display-styles,[is="display-styles"] .display-styles{ margin: 0 8px; } display-styles .break,[is="display-styles"] .break{ width: 100%; margin: 15px 0; border-bottom: 1px solid #eee; } display-styles .toggle-input,[is="display-styles"] .toggle-input{ margin: 16px 0; } display-styles .select-input,[is="display-styles"] .select-input{ margin: 8px 0; } display-styles .display-styles > select option,[is="display-styles"] .display-styles > select option{ color: black; } display-styles select option,[is="display-styles"] select option{ color: black; } display-styles select option:first-child,[is="display-styles"] select option:first-child,display-styles select:invalid,[is="display-styles"] select:invalid{ color: #aaa; }`,

    exports: {
      configData: null,
      elementName: "",
      attributeName: null,

      state: {
        elementData: {
          shown: false,
          enablePositionChange: false,
          enableCopying: false,
          displayType: null,
          valueRenderType: null,
          captioning: null,
          interactivity: null,
          innerPunc: null,
          textsize: null,
          weight: null,
          slant: null,
          color: null,
          outerPunc: null,
          background: null,
          border: null,
          gutter: null,
          separation: null
        }
      },

      editorConfigOptions: [],

      onMounted() {
        this.setInitialData();
      },

      onBeforeUpdate(prop, state) {
        if (this.props.elementName !== this.elementName || this.props.attributeName !== this.attributeName) {
          this.elementName = this.props.elementName;
          this.attributeName = this.props.attributeName;
          this.resetElementData();
        }
      },

      onUpdated() {

      },

      toggleVisibility() {
        this.state.elementData.shown = !this.state.elementData.shown;
        this.props.saveData(this.elementName, this.attributeName, "shown", this.state.elementData.shown);
        this.update();

      },

      sendData(event) {
        let attribute = event.srcElement.id;
        let value = $("#" + attribute).val();
        if (event.srcElement.type === "checkbox") {
          value = !this.state.elementData[attribute];
        }

        this.state.elementData[attribute] = value;
        this.props.saveData(this.elementName, this.attributeName, attribute, value);
      },

      setInitialData() {
        this.props.loadConfigData(this.props.configId).then((response) => {
          this.configData = response;
          this.resetElementData();
          this.update();
        });
      },

      resetElementData() {
        if (!this.configData || !this.props.elementName) {
          return
        }
        let existingData = this.configData[this.elementName];
        let elementConfigData = this.props.elementConfigData;
        if (this.attributeName) {
          existingData = existingData && existingData.attributes && existingData.attributes[this.attributeName];
          elementConfigData = elementConfigData.attributes && elementConfigData.attributes[this.attributeName];
        }
        if (!existingData) {
          existingData = {};
        }
        if (!elementConfigData) {
          elementConfigData = {};
        }
        for (const key of Object.keys(this.state.elementData)) {
          let value = existingData[key] || null;
          if (elementConfigData[key] != null) {
            value = elementConfigData[key];
          }
          this.state.elementData[key] = value;
        }
      },

      shouldRenderStyle(style) {
        if (!this.props.structureConfig || !this.elementName) {
          return false
        }
        const structureConfig = this.props.structureConfig;

        if ((style === "separation" || style === "gutter")
          && structureConfig.root == this.elementName) {
          return false
        }
        if (
          (style === "innerPunc"
            || style === "weight"
            || style === "slant"
            || style === "colour"
            || style === "textsize"
          ) && (
            !structureConfig.elements[this.elementName]
            || structureConfig.elements[this.elementName].filling === "chd"
            || structureConfig.elements[this.elementName].filling === "med"
          )
        ) {
          return false
        }
        if (
          (style === "captioning")
          && (!structureConfig.elements[this.elementName]
            || structureConfig.elements[this.elementName].filling !== "lst")
        ) {
          return false
        }
        return true
      },

      possibleToggles: [
        {
          type: "enablePositionChange",
          label: "Enable reordering of elements of same type"
        },
        {
          type: "enableCopying",
          label: "Enable making copies of element"
        }
      ],

      possibleStyles: [
        {
          type: "displayType",
          title: "Display type of element",
          values: [
            {
              value: "popup",
              label: "Popup on click"
            },
            {
              value: "inline",
              label: "Display in parent element"
            }
          ]
        },
        {
          type: "valueRenderType",
          title: "Value type",
          values: [
            {
              value: "read-only",
              label: "Read-only"
            },
            {
              value: "text-input",
              label: "Singleline text input"
            },
            {
              value: "textarea-input",
              label: "Multiline text input"
            },
            {
              value: "dropdown",
              label: "Dropdown"
            },
            {
              value: "media",
              label: "Media browser"
            },
            {
              value: "text-input-with-markup",
              label: "Text input with markup"
            },
            {
              value: "id-link",
              label: "Id to another element"
            },
            {
              value: "number-input",
              label: "Number input?"
            }
          ]
        },
        {
          type: "captioning",
          title: "Caption display",
          values: [
            {
              value: "replace",
              label: "Show caption instead of value"
            },
            {
              value: "mouseover",
              label: "Show caption on mouse-over"
            }
          ]
        },
        {
          type: "interactivity",
          title: "Interactivity",
          values: [
            {
              value: "xref",
              label: "Clickable cross-reference"
            },
            {
              value: "xlink",
              label: "External URL link"
            }
          ]
        },
        {
          type: "innerPunc",
          title: "Inner punctuation",
          values: [
            {
              value: "roundBrackets",
              label: "Round brackets"
            },
            {
              value: "squareBrackets",
              label: "Square brackets"
            },
            {
              value: "curlyBrackets",
              label: "Curly brackets"
            },
            {
              value: "comma",
              label: "Comma"
            },
            {
              value: "semicolon",
              label: "Semicolon"
            },
            {
              value: "colon",
              label: "Colon"
            }
          ]
        },
        {
          type: "textsize",
          title: "Text size",
          values: [
            {
              value: "smaller",
              label: "Smaller"
            },
            {
              value: "bigger",
              label: "Bigger"
            }
          ]
        },
        {
          type: "weight",
          title: "Text weight",
          values: [
            {
              value: "bold",
              label: "Bold"
            }
          ]
        },
        {
          type: "slant",
          title: "Text slant",
          values: [
            {
              value: "italic",
              label: "Italic"
            }
          ]
        },
        {
          type: "color",
          title: "Text color",
          values: [
            {
              value: "red",
              label: "Red"
            },
            {
              value: "blue",
              label: "Blue"
            },
            {
              value: "green",
              label: "Green"
            },
            {
              value: "grey",
              label: "Grey"
            }
          ]
        },
        {
          type: "outerPunc",
          title: "Outer punctuation",
          values: [
            {
              value: "roundBrackets",
              label: "Round brackets"
            },
            {
              value: "squareBrackets",
              label: "Square brackets"
            },
            {
              value: "curlyBrackets",
              label: "Curly brackets"
            },
            {
              value: "comma",
              label: "Comma"
            },
            {
              value: "semicolon",
              label: "Semicolon"
            },
            {
              value: "colon",
              label: "Colon"
            }
          ]
        },
        {
          type: "background",
          title: "Background color",
          values: [
            {
              value: "yellow",
              label: "Yellow"
            },
            {
              value: "blue",
              label: "Blue"
            },
            {
              value: "grey",
              label: "Grey"
            }
          ]
        },
        {
          type: "border",
          title: "Box border",
          values: [
            {
              value: "dotted",
              label: "Dotted"
            },
            {
              value: "solid",
              label: "Solid"
            },
            {
              value: "thick",
              label: "Thick"
            }
          ]
        },
        {
          type: "gutter",
          title: "Indentation and bulleting",
          values: [
            {
              value: "disk",
              label: "Round bullet"
            },
            {
              value: "square",
              label: "Square bullet"
            },
            {
              value: "diamond",
              label: "Diamond bullet"
            },
            {
              value: "arrow",
              label: "Arrow bullet"
            },
            {
              value: "indent",
              label: "Indent"
            },
            {
              value: "handing",
              label: "Hanging indent"
            },
            {
              value: "sensenum0",
              label: "Sense number I, II, III..."
            },
            {
              value: "sensenum1",
              label: "Sense number 1, 2, 3..."
            },
            {
              value: "sensenum2",
              label: "Sense number a, b, c..."
            },
            {
              value: "sensenum3",
              label: "Sense number i, ii, iii..."
            }
          ]
        },
        {
          type: "separation",
          title: "Separation from other content",
          values: [
            {
              value: "space",
              label: "Whitespace"
            }
          ]
        }
      ]
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div class="display-styles"><div><h4 expr678="expr678"> </h4><div class="toggle-input"><label>Visibility</label><div class="switch"><label>\n            Off\n            <input expr679="expr679" id="shown" type="checkbox"/><span class="lever"></span>\n            On\n          </label></div></div><div expr680="expr680" class="toggle-input"></div></div><div class="break"></div><div expr683="expr683"></div></div>',
      [
        {
          redundantAttribute: 'expr678',
          selector: '[expr678]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: _scope => [
                'Configuration for ',
                _scope.elementName
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr679',
          selector: '[expr679]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onchange',
              evaluate: _scope => _scope.toggleVisibility
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'checked',
              evaluate: _scope => _scope.state.elementData.shown === true
            }
          ]
        },
        {
          type: bindingTypes.EACH,
          getKey: null,
          condition: _scope => _scope.state.elementData.shown,

          template: template(
            '<label expr681="expr681"> </label><div class="switch"><label>\n            Off\n            <input expr682="expr682" type="checkbox"/><span class="lever"></span>\n            On\n          </label></div>',
            [
              {
                redundantAttribute: 'expr681',
                selector: '[expr681]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.setting.label
                  }
                ]
              },
              {
                redundantAttribute: 'expr682',
                selector: '[expr682]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'id',
                    evaluate: _scope => _scope.setting.type
                  },
                  {
                    type: expressionTypes.EVENT,
                    name: 'onchange',
                    evaluate: _scope => _scope.sendData
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'checked',
                    evaluate: _scope => _scope.state.elementData[_scope.setting.type] === true
                  }
                ]
              }
            ]
          ),

          redundantAttribute: 'expr680',
          selector: '[expr680]',
          itemName: 'setting',
          indexName: null,
          evaluate: _scope => _scope.possibleToggles
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.elementData.shown,
          redundantAttribute: 'expr683',
          selector: '[expr683]',

          template: template(
            '<div expr684="expr684" class="select-input"></div>',
            [
              {
                type: bindingTypes.EACH,
                getKey: null,
                condition: _scope => _scope.shouldRenderStyle(_scope.style.type),

                template: template(
                  '<label expr685="expr685"> </label><select expr686="expr686" required style="display: block"><option expr687="expr687" value>\n            Select option\n          </option><option expr688="expr688"></option></select>',
                  [
                    {
                      redundantAttribute: 'expr685',
                      selector: '[expr685]',

                      expressions: [
                        {
                          type: expressionTypes.TEXT,
                          childNodeIndex: 0,
                          evaluate: _scope => _scope.style.title
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'for',
                          evaluate: _scope => _scope.style.type
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr686',
                      selector: '[expr686]',

                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'id',
                          evaluate: _scope => _scope.style.type
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'name',
                          evaluate: _scope => _scope.style.type
                        },
                        {
                          type: expressionTypes.VALUE,
                          evaluate: _scope => _scope.state.elementData[_scope.style.type]
                        },
                        {
                          type: expressionTypes.EVENT,
                          name: 'onchange',
                          evaluate: _scope => _scope.sendData
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr687',
                      selector: '[expr687]',

                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'selected',
                          evaluate: _scope => _scope.state.elementData[_scope.style.type] == null
                        }
                      ]
                    },
                    {
                      type: bindingTypes.EACH,
                      getKey: null,
                      condition: null,

                      template: template(
                        ' ',
                        [
                          {
                            expressions: [
                              {
                                type: expressionTypes.TEXT,
                                childNodeIndex: 0,

                                evaluate: _scope => [
                                  _scope.option.label
                                ].join(
                                  ''
                                )
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'value',
                                evaluate: _scope => _scope.option.value
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'selected',
                                evaluate: _scope => _scope.option.value === _scope.state.elementData[_scope.style.type]
                              }
                            ]
                          }
                        ]
                      ),

                      redundantAttribute: 'expr688',
                      selector: '[expr688]',
                      itemName: 'option',
                      indexName: null,
                      evaluate: _scope => _scope.style.values
                    }
                  ]
                ),

                redundantAttribute: 'expr684',
                selector: '[expr684]',
                itemName: 'style',
                indexName: null,
                evaluate: _scope => _scope.possibleStyles
              }
            ]
          )
        }
      ]
    ),

    name: 'display-styles'
  };

  var dict_config_xemplate = {
    css: `dict-config-xemplate #editor.designer input[type=radio],[is="dict-config-xemplate"] #editor.designer input[type=radio]{ opacity: 1 !important; }`,

    exports: {
      components: {
        displayStyles
      },

      state: {},
      dictId: '',
      configId: '',
      configTitle: 'Entry formatting',
      override: false,
      configData: {},
      elementName: null,
      attributeName: null,

      startOverride() {
        this.override = true;
        this.update();
      },

      stopOverride() {
        this.override = false;
        delete this.configData._xsl;
        delete this.configData._css;
        this.update();
        XemplateDesigner.start(this.props.dictConfigs.xema, this.configData, this.dictId, true);
      },

      exampleXsl() {
        $('#editor_xsl').val(
          `<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
 <xsl:template match="entry">
    <div class='myEntry'><xsl:apply-templates/></div>
 </xsl:template>
 <xsl:template match="headword">
    <span class='myHeadword'><xsl:apply-templates/></span>
 </xsl:template>
</xsl:stylesheet>
`);
        M.textareaAutoResize($('#editor_xsl'));
        M.updateTextFields();
      },

      exampleCss() {
        $('#editor_css').val(
          `div.myEntry {font-family: serif; font-size: 1.25em}
div.myEntry span.myHeadword {font-weight: bold}
`);
        M.textareaAutoResize($('#editor_css'));
        M.updateTextFields();
      },

      onMounted() {
        this.dictId = this.props.dictId;
        this.configId = this.props.configId;
        this.props.loadDictDetail();
        this.fillConfigForm();
        // document.addEventListener("selectedXMLElement", this.handleSelectedXMLElement)
      },

      onBeforeUpdate() {
        const xema = (this.props.dictConfigs || {}).xema;
        if (!xema || !xema.elements) return;
        const roots = new Set(Object.keys(xema.elements));
        Object.values(xema.elements).forEach(el => el.children.forEach(c => roots.delete(c.name)));
        this.state.roots = [...roots].map(id => ({...xema.elements[id], id})); // add ID so tree renderer knows the id of every element
      },

      async fillConfigForm() {
        this.props.loadConfigData(this.configId).then((response) => {
          this.configData = response;
          this.override = !!(this.configData._xsl || this.configData._css);
          if (this.override) {
            this.update();
            M.updateTextFields();
            M.textareaAutoResize($('#editor_css'));
            M.textareaAutoResize($('#editor_xsl'));
          } else {
            this.update();
          }
        });
      },

      getConfigData() {
        var newData = {};
        if (XemplateDesigner.xemplate) {
          newData = XemplateDesigner.xemplate;
        }
        if (this.override) {
          if ($('#editor_css').val() != "") newData._css = $('#editor_css').val();
          if ($('#editor_xsl').val() != "") newData._xsl = $('#editor_xsl').val();
        }
        return newData
      },

      selectElementOrAttribute(elementId, attributeId) {
        this.elementName = elementId;
        this.attributeName = attributeId || null;
        this.update();
      },

      handleElementData(elementName, attributeName, attribute, value) {
        if (attributeName) {
          const elementAttributes = this.configData[elementName].attributes;
          if (elementAttributes) {
            elementAttributes[attributeName][attribute] = value;
          } else {
            elementAttributes.attributes = {[attribute]: value};
          }
        } else {
          if (!this.configData[elementName]) {
            this.configData[elementName] = {};
          }
          this.configData[elementName][attribute] = value;
        }
      },

      saveData() {
        $('#submit_button').html('Saving...');
        this.props.saveConfigData(this.configId, this.configData);
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<dict-config-nav expr666="expr666"></dict-config-nav><h3>Entry formatting</h3><div expr667="expr667"></div><div expr671="expr671"></div><dict-config-buttons expr677="expr677"></dict-config-buttons>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictId',
              evaluate: _scope => _scope.dictId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictTitle',
              evaluate: _scope => _scope.props.dictDetails.title
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configId',
              evaluate: _scope => _scope.configId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'configTitle',
              evaluate: _scope => _scope.configTitle
            }
          ],

          redundantAttribute: 'expr666',
          selector: '[expr666]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => (!_scope.configData._xsl || _scope.configData._xsl == "") && (!_scope.configData._css || _scope.configData._css == "") && !_scope.override,
          redundantAttribute: 'expr667',
          selector: '[expr667]',

          template: template(
            '<div style="display: flex"><div style="flex-basis: 0; width: auto; position: static; overflow: initial!important; margin-right: 15px;!important" id="editor" class="designer"><div class="list"><dict-config-element-in-tree expr668="expr668"></dict-config-element-in-tree></div></div><display-styles expr669="expr669" name="displayStylesComponent"></display-styles></div><div class="row"><div class="col s10"><button expr670="expr670" class="btn waves-effect waves-light">Use your own stylesheet <i class="material-icons right">edit</i></button></div></div>',
            [
              {
                type: bindingTypes.EACH,
                getKey: null,
                condition: null,

                template: template(
                  null,
                  [
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'dict-config-element-in-tree',
                      slots: [],

                      attributes: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'data',
                          evaluate: _scope => _scope.root
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'xema',
                          evaluate: _scope => _scope.props.dictConfigs.xema
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'current-element',
                          evaluate: _scope => _scope.elementName
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'current-attribute',
                          evaluate: _scope => _scope.attributeName
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'selectElementOrAttribute',
                          evaluate: _scope => _scope.selectElementOrAttribute
                        }
                      ]
                    }
                  ]
                ),

                redundantAttribute: 'expr668',
                selector: '[expr668]',
                itemName: 'root',
                indexName: null,
                evaluate: _scope => _scope.state.roots
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.elementName,
                redundantAttribute: 'expr669',
                selector: '[expr669]',

                template: template(
                  null,
                  [
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'display-styles',
                      slots: [],

                      attributes: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'elementName',
                          evaluate: _scope => _scope.elementName
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'attributeName',
                          evaluate: _scope => _scope.attributeName
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'elementConfigData',
                          evaluate: _scope => _scope.configData[_scope.elementName]
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'structureConfig',
                          evaluate: _scope => _scope.props.dictConfigs.xema
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'loadConfigData',
                          evaluate: _scope => _scope.props.loadConfigData
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'configId',
                          evaluate: _scope => _scope.props.configId
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'save-data',
                          evaluate: _scope => _scope.handleElementData
                        }
                      ]
                    }
                  ]
                )
              },
              {
                redundantAttribute: 'expr670',
                selector: '[expr670]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.startOverride
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => (_scope.configData._xsl && _scope.configData._xsl != "") || (_scope.configData._css && _scope.configData._css != "") || _scope.override,
          redundantAttribute: 'expr671',
          selector: '[expr671]',

          template: template(
            '<div class="row"><div class="input-field col s10"><textarea expr672="expr672" id="editor_xsl" class="materialize-textarea" placeholder> </textarea><label for="editor_xsl">XSL</label><span class="helper-text">Custom XSL stylesheet. If you would like to see an example, <a expr673="expr673">click here to load a sample XSL</a>.</span></div></div><div class="row"><div class="input-field col s10"><textarea expr674="expr674" id="editor_css" class="materialize-textarea" placeholder> </textarea><label for="editor_css">CSS</label><span class="helper-text">Custom CSS stylesheet. If you would like to see an example, <a expr675="expr675">click here to load a sample CSS</a>.</span></div></div><div class="row"><div class="col s10"><button expr676="expr676" class="btn waves-effect waves-light">Stop using your own stylesheet <i class="material-icons right">edit</i></button></div></div>',
            [
              {
                redundantAttribute: 'expr672',
                selector: '[expr672]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.configData._xsl
                  }
                ]
              },
              {
                redundantAttribute: 'expr673',
                selector: '[expr673]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.exampleXsl
                  }
                ]
              },
              {
                redundantAttribute: 'expr674',
                selector: '[expr674]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.configData._css
                  }
                ]
              },
              {
                redundantAttribute: 'expr675',
                selector: '[expr675]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.exampleCss
                  }
                ]
              },
              {
                redundantAttribute: 'expr676',
                selector: '[expr676]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.stopOverride
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-config-buttons',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'save-data',
              evaluate: _scope => _scope.saveData
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dict-id',
              evaluate: _scope => _scope.dictId
            }
          ],

          redundantAttribute: 'expr677',
          selector: '[expr677]'
        }
      ]
    ),

    name: 'dict-config-xemplate'
  };

  var dict_download = {
    css: null,

    exports: {
      dictId: '',

      onMounted() {
         this.dictId = this.props.dictId;
         console.log('download dict '+ this.dictId);
         this.props.loadDictDetail();
         console.log(this.props);
         this.update();
         $(document).ready(function() {
            $('.noAttributes').change(function() {
               var href = $('.download-link').attr('href');
               if (this.checked) {
                  $('.download-link').attr('href', href + '?clean=true');
               } else {
                  $('.download-link').attr('href', href.replace('?clean=true', ''));
               }
            });
         });
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<nav class="nav-breadcrumbs"><div class="nav-wrapper"><a expr230="expr230" class="breadcrumb"> </a><a expr231="expr231" class="breadcrumb">Download</a></div></nav><h3>Download</h3><div class="input-field"><a expr232="expr232" class="waves-effect waves-light btn btn-primary download-link" target="_blank"><i class="material-icons left">file_download</i> </a></div><div><label><input type="checkbox" class="noAttributes" name="noAttributes"/><span>XML without Lexonomy attributes</span></label></div><small class="helper-text">\n      If you want to import the XML file back to Lexonomy, you need Lexonomy attributes.\n   </small>',
      [
        {
          redundantAttribute: 'expr230',
          selector: '[expr230]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.props.dictDetails.title
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.props.dictId
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr231',
          selector: '[expr231]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.props.dictId,
                '/download'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr232',
          selector: '[expr232]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 1,

              evaluate: _scope => [
                'Download ',
                _scope.props.dictId,
                '.xml'
              ].join(
                ''
              )
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '/',
                _scope.props.dictId,
                '/download.xml'
              ].join(
                ''
              )
            }
          ]
        }
      ]
    ),

    name: 'dict-download'
  };

  var dict_edit_entry = {
    css: null,

    exports: {
      moreEntries: [],
      entryId: '',
      dictId: '',
      dictConfigs: {},
      selectedMode: 'view',
      content: "",
      graphicalEditorLoading: false,
      graphicalEditorLoaded: false,

      state: {
        entryId: ""
      },

      onMounted() {
        this.loadGraphicalEditorDevServer();
      },

      onUpdated() {
        console.log('list dict edit entry ' + this.props.dictId + '-' + this.props.entryId/*+'-'+this.props.selectedId*/);
        this.entryId = this.props.entryId;
        this.selectedMode = this.props.mode || "view";
        /*if (this.props.selectedId != '') {
           if (this.props.selectedId.toString().match(/^view[0-9]*$/)) {
              this.entryId = this.props.selectedId.substring(4);
              this.selectedMode = 'view';
           } else {
              this.entryId = this.props.selectedId;
              this.selectedMode = 'edit';
           }
        }*/
        this.dictId = this.props.dictId;
        this.dictConfigs = this.props.dictConfigs;
        if (this.entryId != '') {
          $.post(window.API_URL + this.dictId + "/entryread.json", {id: this.entryId}, (response) => {
            console.log('response');
            console.log(response);
            this.content = response.content;
            Screenful.Editor.createUrl = this.dictId + "/entrycreate.json";
            Screenful.Editor.readUrl = this.dictId + "/entryread.json";
            Screenful.Editor.updateUrl = this.dictId + "/entryupdate.json";
            Screenful.Editor.deleteUrl = this.dictId + "/entrydelete.json";
            var xema = this.dictConfigs.xema;
            var xemplate = this.dictConfigs.xemplate;
            kontext = this.dictConfigs.kontext;
            kex = this.dictConfigs.kex;
            subbing = this.dictConfigs.subbing;
            xampl = this.dictConfigs.xampl;
            thes = this.dictConfigs.thes;
            collx = this.dictConfigs.collx;
            defo = this.dictConfigs.defo;
            titling = this.dictConfigs.titling;
            flagging = this.dictConfigs.flagging;
            linking = this.dictConfigs.linking;
            editing = this.dictConfigs.editing;
            var userAccess = this.props.userAccess;
            userDicts = this.props.userDicts;
            dictId = this.dictId;
            ske_username = this.props.userInfo.ske_username;
            ske_apiKey = this.props.userInfo.ske_apiKey;

            if (editing["_js"]) {
              var customizeEditor = editing["_js"];
              var usingOwnEditor = customizeEditor.editor && customizeEditor.harvester;
            } else {
              var customizeEditor = null;
              var usingOwnEditor = false;
            }

            if (!xemplate[xema.root]) xemplate[xema.root] = {shown: false};
            if (xemplate[xema.root].shown == "false") xemplate[xema.root].shown = false;
            Screenful.Editor.viewer = null;

            if (xemplate._xsl || xemplate._css || xemplate[xema.root].shown) {
              Screenful.Editor.viewer = function (div, entry) {
                if (entry.contentHtml.length == 0) {
                  var doc = (new DOMParser()).parseFromString(entry.content, 'text/xml');
                  entry.contentHtml = Xemplatron.xml2html(doc, xemplate, xema);
                }
                $(div).addClass("viewer").html(entry.contentHtml);
                $(div).find("a.xref").on("click", function (e) {
                  var text = $(e.delegateTarget).attr("data-text");
                  window.parent.$("#searchbox").val(text);
                  window.parent.Screenful.Navigator.list();
                });
              };
            }

            Screenful.Editor.editor = (div, entry, uneditable) => {
              if (!userAccess.canEdit) {
                uneditable = true;
              }
              Xonomy.lang = "en";

              newXml = "";
              if (xema["_xonomyDocSpec"]) {
                var docSpec = xema["_xonomyDocSpec"];
                if (xema["_newXml"]) {
                  newXml = xema["_newXml"];
                }
              } else if (xema["_dtd"]) {
                var xmlStructure = parseDTD(xema["_dtd"]);
                var docSpec = struct2Xonomy(xmlStructure);
                newXml = initialDocument(xmlStructure);
              } else {
                var docSpec = Xematron.xema2docspec(xema, editing["xonomyTextEditor"]);
              }
              if (!newXml) {
                newXml = Xematron.xema2xml(xema);
              }

              docSpec.allowModeSwitching = true;
              docSpec.onModeSwitch = function (mode) {
                Cookies.set("xonomyMode_" + dictId, mode);
                window.parent.$(".doctypes").removeClass("laic");
                window.parent.$(".doctypes").removeClass("nerd");
                window.parent.$(".doctypes").addClass(mode);
              };
              if (!uneditable) {
                docSpec.allowLayby = true;
                docSpec.laybyMessage = "This is your temporary lay-by for entry fragments. You can drag and drop XML elements here.";
              }
              if (editing["xonomyMode"] !== "graphical") {
                Xonomy.setMode(Cookies.get("xonomyMode_" + dictId) || editing["xonomyMode"]);
              } else {
                Xonomy.setMode(editing["xonomyMode"]);
              }
              Xrefs.extendDocspec(docSpec, xema);
              Ske.extendDocspec(docSpec, xema);
              Kontext.extendDocspec(docSpec, xema);
              Sub.extendDocspec(docSpec, xema);
              docSpec.onchange = Screenful.Editor.changed;
              if (uneditable) {
                for (elName in docSpec.elements) docSpec.elements[elName].isReadOnly = true;
                if (docSpec.unknownElement && typeof (docSpec.unknownElement) == "object") docSpec.unknownElement.isReadOnly = true;
                if (docSpec.unknownElement && typeof (docSpec.unknownElement) == "function") {
                  var func = docSpec.unknownElement;
                  docSpec.unknownElement = function (elName) {
                    var ret = func(elName);
                    ret.isReadOnly = true;
                    return ret
                  };
                }
              }

              if (!usingOwnEditor) {
                if (customizeEditor && customizeEditor.adjustDocSpec) customizeEditor.adjustDocSpec(docSpec);

                if (editing.xonomyMode === "graphical") {
                  // Destroy Vue editor so we only keep 1 instance - prevents from multiple watch calls because they don't remove themselves properly when removing dom element
                  if (window.editor._isVue) {
                    editor.$destroy();
                  }
                  this.openGraphicalEditor(entry ? entry.content : newXml);
                  return
                } else {
                  Xonomy.render((entry ? entry.content : newXml), div, docSpec);
                }
                if (!Xonomy.keyNav) Xonomy.startKeyNav(document, document.getElementById("container"));
              } else {
                customizeEditor.editor(div, entry ? entry : {content: newXml, id: 0}, uneditable);
              }
            };
            Screenful.Editor.harvester = function (div) {
              if (!usingOwnEditor) {
                if (editing["xonomyMode"] === "graphical") {
                  return window.harvestGraphicalEditorData()
                }
                return Xonomy.harvest()
              } else {
                return customizeEditor.harvester(div)
              }
            };
            Screenful.Editor.allowSourceCode = true;
            Screenful.Editor.formatSourceCode = function (str) {
              return Screenful.formatXml(str)
            };
            Screenful.Editor.validateSourceCode = function (str) {
              return Screenful.isWellFormedXml(str)
            };
            Screenful.Editor.cleanupSourceCode = function (str) {
              return Screenful.cleanupXml(str)
            };

            // history
            Screenful.History.historyUrl = "/" + this.dictId + "/history.json";
            Screenful.History.isDeletion = function (revision) {
              return revision.action == "delete" || revision.action == "purge"
            };
            Screenful.History.getRevisionID = function (revision) {
              return revision.revision_id
            };
            Screenful.History.printAction = function (revision) {
              var content = "";
              //actions: delete | create | update | purge
              //historiography: {apikey: apikey} | {uploadStart: uploadStart, filename: filename}
              content += "<div style='white-space: nowrap'>";
              if (revision.action == "create") content += "<b>Created</b>";
              else if (revision.action == "update") content += "<b>Changed</b>";
              else if (revision.action == "delete") content += "<b>Deleted</b>";
              else if (revision.action == "purge") content += "<b>Bulk-deleted</b>";
              if (revision.historiography.uploadStart) content += " while uploading";
              if (revision.historiography.apikey) content += " through API";
              if (revision.historiography.refactoredFrom) content += " as a subentry of <a href='javascript:void(null)' onclick='parent.Screenful.Editor.open(null, " + revision.historiography.refactoredFrom + ")'>" + revision.historiography.refactoredFrom + "</a>";
              content += "</div>";
              if (revision.email) content += "<div style='white-space: nowrap'><b>By:</b> " + revision.email + "</div>";
              content += "<div style='white-space: nowrap'><b>When:</b> " + revision.when + "</div>";
              return content
            };
            Screenful.History.fakeEntry = function (revision) {
              return {id: revision.entry_id, content: revision.content, contentHtml: revision.contentHtml}
            };

            if (response.content != undefined) {
              Screenful.Editor.populateToolbar();
              Screenful.status(Screenful.Loc.ready);
              Screenful.Editor.updateToolbar();
              Screenful.Editor.open(null, this.entryId);
              if (this.selectedMode == 'edit') {
                Screenful.Editor.edit(null, this.entryId);
              } else {
                Screenful.Editor.view(null, this.entryId);
              }
            }
          });
        }
      },

      loadGraphicalEditorDevServer() {
        this.graphicalEditorLoading = true;
        if (!document.getElementById("editor-app-chunk-vendors") || !document.getElementById("editor-app-script")) {
          fetch('http://localhost:8081/js/chunk-vendors.js').then(r => r.text()).then(vendorContent => {
            const newScript = document.createElement("script");
            newScript.setAttribute("id", "editor-app-chunk-vendors");
            newScript.append(document.createTextNode(vendorContent));
            document.querySelector('body').appendChild(newScript);
            fetch('http://localhost:8081/js/app.js').then(r => r.text()).then(content => {
              const newScript = document.createElement("script");
              newScript.setAttribute("id", "editor-app-script");
              newScript.append(document.createTextNode(content));
              document.querySelector('body').appendChild(newScript);
              this.graphicalEditorLoaded = true;
            });
          });
        }
      },

      openGraphicalEditor(entry) {
        if (!this.graphicalEditorLoaded) {
          if (this.graphicalEditorLoading) {
            setTimeout(() => {
              this.openGraphicalEditor(entry);
            }, 500);
          } else {
            this.loadGraphicalEditorDevServer();
          }
        } else {
          window.entryData = {
            selectedMode: this.selectedMode,
            entryId: this.entryId,
            dictId: this.dictId,
            dictConfigs: this.props.dictConfigs,
            userAccess: this.props.userAccess,
            userInfo: this.props.userInfo,
            content: entry || ""
          };
          window.mountGraphicalEditor();
        }
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div><div class="row"><div class="xonomy-envelope"><div id="toolbar"></div><div id="container" class="empty"></div><div id="history" style="display: none"></div><div id="waiter" style="display: none"></div><div id="statusbar"></div></div></div></div>',
      []
    ),

    name: 'dict-edit-entry'
  };

  var dict_edit = {
    css: `dict-edit ul.select-dropdown,[is="dict-edit"] ul.select-dropdown,dict-edit ul.dropdown-content,[is="dict-edit"] ul.dropdown-content{ width: 200% !important; } dict-edit li > span,[is="dict-edit"] li > span{ white-space: nowrap; } dict-edit .entry-list,[is="dict-edit"] .entry-list{ max-height: 80%; overflow-y: auto; } dict-edit .doctypes,[is="dict-edit"] .doctypes{ margin-bottom: 0px; } dict-edit li.tab[active],[is="dict-edit"] li.tab[active]{ background-color: transparent; color: #ee6e73; border-bottom: 2px solid; } dict-edit li.tab a,[is="dict-edit"] li.tab a{ cursor: pointer; }`,

    exports: {
      dictId: '',
      dictConfigs: {},
      doctype: 'entry',
      doctypes: ['entry'],
      entryList: [],
      entryCount: 0,

      //selectedEntry: '',
      entryId: '',

      userDicts: [],

      loadList() {
        var searchtext = '';
        var modifier = 'start';
        if ($('#searchType').val() != null) {
          modifier = $('#searchType').val();
        }
        if ($('#searchBox').val() != '') {
          searchtext = $('#searchBox').val();
        }
        $.post(window.API_URL + this.dictId + "/" + this.doctype + "/entrylist.json", {
          searchtext: searchtext,
          modifier: modifier,
          howmany: 100
        }, (response) => {
          console.log(response);
          this.entryList = response.entries;
          this.entryCount = response.total;
          //this.selectedEntry = this.entryList.length ? this.entryList[0].id : ""
          this.update();
        });
      },

      changeEntryEdit(entryId) {
        console.log('onclick');
        console.log(entryId);
        //$('#editor').html(i)
        //this.selectedEntry = i;
        this.entryId = entryId;
        // this.update()
      },

      runSearch(e) {
        if (e.keyCode == 13) {
          this.loadList();
        }
      },

      doChangeDoctype(e) {
        var newdoctype = e.target.getAttribute('doctype');
        if (newdoctype != this.doctype) {
          this.doctype = newdoctype;
          route(this.dictId + "/edit/" + newdoctype);
          this.loadList();
          this.update();
        }
      },

      onMounted() {
        this.dictId = this.props.dictId;
        this.doctype = this.props.doctype;
        this.doctypes = this.props.doctypes;
        console.log('list edit dict ' + this.dictId + this.doctype + this.props.entryId);
        this.props.loadDictDetail();
        this.loadList();
        $.get(window.API_URL + "userdicts.json", (response) => {
          this.userDicts = response.dicts;
        });
      },

      onBeforeUpdate() {
        this.doctypes = this.props.doctypes;
        this.entryId = this.props.entryId;
        console.log('list edit dict update' + this.dictId + this.doctype + this.props.entryId);
        $('select').formSelect({dropdownOptions: {coverTrigger: false, constrainWidth: false}});
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<h3 expr246="expr246" class="header"> </h3><div expr247="expr247" class="row doctypes"></div><div class="row"><div class="col s3"><div style="display: flex; gap: 10px"><input expr250="expr250" type="text" id="searchBox" placeholder="search" class="input-field" style="width: 100px;"/><select id="searchType"><option value disabled selected>?</option><option value="start">starts like this</option><option value="exact">is exactly</option><option value="wordstart">contains a word that starts like this</option><option value="substring">contains this sequence of characters</option></select></div><div class="entry-list collection"><list-headword expr251="expr251"></list-headword></div></div><div class="col s9"><dict-edit-entry expr252="expr252"></dict-edit-entry></div></div>',
      [
        {
          redundantAttribute: 'expr246',
          selector: '[expr246]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.props.dictDetails.title
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.doctypes.length > 1,
          redundantAttribute: 'expr247',
          selector: '[expr247]',

          template: template(
            '<div class="col s12"><ul class="tabs"><li expr248="expr248" class="tab col s2"></li></ul></div>',
            [
              {
                type: bindingTypes.EACH,
                getKey: null,
                condition: null,

                template: template(
                  '<a expr249="expr249"> </a>',
                  [
                    {
                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'active',
                          evaluate: _scope => _scope.type == _scope.doctype
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr249',
                      selector: '[expr249]',

                      expressions: [
                        {
                          type: expressionTypes.TEXT,
                          childNodeIndex: 0,
                          evaluate: _scope => _scope.type
                        },
                        {
                          type: expressionTypes.EVENT,
                          name: 'onclick',
                          evaluate: _scope => _scope.doChangeDoctype
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'doctype',
                          evaluate: _scope => _scope.type
                        }
                      ]
                    }
                  ]
                ),

                redundantAttribute: 'expr248',
                selector: '[expr248]',
                itemName: 'type',
                indexName: null,
                evaluate: _scope => _scope.doctypes
              }
            ]
          )
        },
        {
          redundantAttribute: 'expr250',
          selector: '[expr250]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onkeypress',
              evaluate: _scope => _scope.runSearch
            }
          ]
        },
        {
          type: bindingTypes.EACH,
          getKey: null,
          condition: null,

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'list-headword',
                slots: [],

                attributes: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'entryData',
                    evaluate: _scope => _scope.entry
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'active',
                    evaluate: _scope => _scope.entry.id == _scope.entryId
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'link',

                    evaluate: _scope => [
                      '#',
                      _scope.dictId,
                      '/edit/',
                      _scope.doctype,
                      '/',
                      _scope.entry.id,
                      '/view'
                    ].join(
                      ''
                    )
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'change-entry-edit',
                    evaluate: _scope => _scope.changeEntryEdit
                  }
                ]
              }
            ]
          ),

          redundantAttribute: 'expr251',
          selector: '[expr251]',
          itemName: 'entry',
          indexName: null,
          evaluate: _scope => _scope.entryList
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-edit-entry',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'entryId',
              evaluate: _scope => _scope.entryId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'mode',
              evaluate: _scope => _scope.mode
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictId',
              evaluate: _scope => _scope.dictId
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dictConfigs',
              evaluate: _scope => _scope.props.dictConfigs
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'userAccess',
              evaluate: _scope => _scope.props.userAccess
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'userInfo',
              evaluate: _scope => _scope.props.userInfo
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'userDicts',
              evaluate: _scope => _scope.userDicts
            }
          ],

          redundantAttribute: 'expr252',
          selector: '[expr252]'
        }
      ]
    ),

    name: 'dict-edit'
  };

  var dict_list = {
    css: `dict-list .dict-lang,[is="dict-list"] .dict-lang{ padding-left: 0.5em; }`,

    exports: {
      isLoading: true,
      userdicts: [],

      onMounted() {
         $.ajax({
            url: window.API_URL + "userdicts.json",
            type: "GET",
            success: (response) => {
               this.userdicts = response.dicts || [];
            },
            error: () => {
               M.toast("Dictionary list could not be loaded.");
            },
            complete: () => {
               this.isLoading = false;
               this.update();
            }
         });
      },

      doEditDict(event) {
         var dictId = event.target.parentNode.getAttribute('data-dict-id');
         route(dictId + "/edit");
      },

      doConfigDict(event) {
         var dictId = event.target.parentNode.getAttribute('data-dict-id');
         route(dictId + "/config");
      },

      doCloneDict(event) {
         var dictId = event.target.parentNode.getAttribute('data-dict-id');
         $.post(window.API_URL + dictId + "/clone.json", (response) => {
            if (response.success) {
               this.userdicts = response.dicts;
               this.update();
            }
         });
      },

      doDeleteDict(event) {
         var dictId = event.target.parentNode.getAttribute('data-dict-id');
         var dictTitle = event.target.parentNode.getAttribute('data-dict-title');
         if (confirm("Are you sure you want to delete dictionary " + dictTitle + "? You will not be able to undo this.")) {
            $.post(window.API_URL + dictId + "/destroy.json", (response) => {
               if (response.success) {
                  this.userdicts = response.dicts;
                  this.update();
               }
            });
         }
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div expr259="expr259" class="grey-text center-align"></div><template expr260="expr260"></template>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.isLoading,
          redundantAttribute: 'expr259',
          selector: '[expr259]',

          template: template(
            '<h3>loading dictionaries...</h3>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.isLoading,
          redundantAttribute: 'expr260',
          selector: '[expr260]',

          template: template(
            '<div expr261="expr261"></div><div expr270="expr270" class="grey-text center-align"></div>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.userdicts.length,
                redundantAttribute: 'expr261',
                selector: '[expr261]',

                template: template(
                  '<h3>your dictionaries</h3><ul class="collection"><li expr262="expr262" class="collection-item "></li></ul><a href="#/make" class="btn waves-effect waves-light"><i class="material-icons left">add</i>\n            create new dictionary\n         </a>',
                  [
                    {
                      type: bindingTypes.EACH,
                      getKey: null,
                      condition: null,

                      template: template(
                        '<div><a expr263="expr263" style="cursor: pointer"> </a><span expr264="expr264" class="dict-lang"></span><span expr265="expr265" class="dict-lang"> </span><a expr266="expr266" style="cursor: pointer" class="secondary-content" title="delete dictionary"></a><a expr267="expr267" style="cursor: pointer" class="secondary-content" title="clone dictionary"><i class="material-icons">content_copy</i></a><a expr268="expr268" style="cursor: pointer" class="secondary-content" title="config dictionary"></a><a expr269="expr269" style="cursor: pointer" class="secondary-content" title="edit dictionary"></a></div>',
                        [
                          {
                            redundantAttribute: 'expr263',
                            selector: '[expr263]',

                            expressions: [
                              {
                                type: expressionTypes.TEXT,
                                childNodeIndex: 0,
                                evaluate: _scope => _scope.dict.title
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'href',

                                evaluate: _scope => [
                                  '#/',
                                  _scope.dict.id
                                ].join(
                                  ''
                                )
                              }
                            ]
                          },
                          {
                            type: bindingTypes.IF,
                            evaluate: _scope => _scope.dict.lang,
                            redundantAttribute: 'expr264',
                            selector: '[expr264]',

                            template: template(
                              ' ',
                              [
                                {
                                  expressions: [
                                    {
                                      type: expressionTypes.TEXT,
                                      childNodeIndex: 0,
                                      evaluate: _scope => _scope.dict.lang
                                    }
                                  ]
                                }
                              ]
                            )
                          },
                          {
                            redundantAttribute: 'expr265',
                            selector: '[expr265]',

                            expressions: [
                              {
                                type: expressionTypes.TEXT,
                                childNodeIndex: 0,

                                evaluate: _scope => [
                                  _scope.dict.size,
                                  ' entries'
                                ].join(
                                  ''
                                )
                              }
                            ]
                          },
                          {
                            type: bindingTypes.IF,
                            evaluate: _scope => _scope.dict.currentUserCanDelete,
                            redundantAttribute: 'expr266',
                            selector: '[expr266]',

                            template: template(
                              '<i class="material-icons">delete</i>',
                              [
                                {
                                  expressions: [
                                    {
                                      type: expressionTypes.ATTRIBUTE,
                                      name: 'data-dict-id',
                                      evaluate: _scope => _scope.dict.id
                                    },
                                    {
                                      type: expressionTypes.ATTRIBUTE,
                                      name: 'data-dict-title',
                                      evaluate: _scope => _scope.dict.title
                                    },
                                    {
                                      type: expressionTypes.EVENT,
                                      name: 'onclick',
                                      evaluate: _scope => _scope.doDeleteDict
                                    }
                                  ]
                                }
                              ]
                            )
                          },
                          {
                            redundantAttribute: 'expr267',
                            selector: '[expr267]',

                            expressions: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'data-dict-id',
                                evaluate: _scope => _scope.dict.id
                              },
                              {
                                type: expressionTypes.EVENT,
                                name: 'onclick',
                                evaluate: _scope => _scope.doCloneDict
                              }
                            ]
                          },
                          {
                            type: bindingTypes.IF,
                            evaluate: _scope => _scope.dict.currentUserCanDelete,
                            redundantAttribute: 'expr268',
                            selector: '[expr268]',

                            template: template(
                              '<i class="material-icons">settings</i>',
                              [
                                {
                                  expressions: [
                                    {
                                      type: expressionTypes.ATTRIBUTE,
                                      name: 'data-dict-id',
                                      evaluate: _scope => _scope.dict.id
                                    },
                                    {
                                      type: expressionTypes.ATTRIBUTE,
                                      name: 'data-dict-title',
                                      evaluate: _scope => _scope.dict.title
                                    },
                                    {
                                      type: expressionTypes.EVENT,
                                      name: 'onclick',
                                      evaluate: _scope => _scope.doConfigDict
                                    }
                                  ]
                                }
                              ]
                            )
                          },
                          {
                            type: bindingTypes.IF,
                            evaluate: _scope => _scope.dict.currentUserCanEdit,
                            redundantAttribute: 'expr269',
                            selector: '[expr269]',

                            template: template(
                              '<i class="material-icons">edit</i>',
                              [
                                {
                                  expressions: [
                                    {
                                      type: expressionTypes.ATTRIBUTE,
                                      name: 'data-dict-id',
                                      evaluate: _scope => _scope.dict.id
                                    },
                                    {
                                      type: expressionTypes.EVENT,
                                      name: 'onclick',
                                      evaluate: _scope => _scope.doEditDict
                                    }
                                  ]
                                }
                              ]
                            )
                          }
                        ]
                      ),

                      redundantAttribute: 'expr262',
                      selector: '[expr262]',
                      itemName: 'dict',
                      indexName: null,
                      evaluate: _scope => _scope.userdicts
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => !_scope.userdicts.length,
                redundantAttribute: 'expr270',
                selector: '[expr270]',

                template: template(
                  '<h3>no dictionaries</h3><div>\n            You have no dictionary yet. Create one using button below.\n         </div><br/><a href="#/make" class="btn waves-effect waves-light"><i class="material-icons left">add</i>\n            create new dictionary\n         </a>',
                  []
                )
              }
            ]
          )
        }
      ]
    ),

    name: 'dict-list'
  };

  var dict_main = {
    css: null,
    exports: null,

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<dict-public expr271="expr271"></dict-public>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-public',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'dict-id',
              evaluate: _scope => _scope.props.dictId
            }
          ],

          redundantAttribute: 'expr271',
          selector: '[expr271]'
        }
      ]
    ),

    name: 'dict-main'
  };

  var dict_new = {
    css: null,

    exports: {
      errorMessage: '',

      onMounted() {
         console.log('list dict');
         $.get(window.API_URL + "makesuggest.json", (response) => {
            $('#url').val(response.suggested);
            $('#baseUrl').html(response.baseUrl);
            M.updateTextFields();
         });
         $('select').formSelect();
      },

      doMake(event) {
         if ($('#url').val() != '' && $('#title').val() != '') {
            $.post(window.API_URL + "make.json", {url: $('#url').val(), template: $('#template').val(), title: $('#title').val()}, (response) => {
               if (response.success) {
                  this.errorMessage = '';
                  route('/'+response.url);
               } else {
                  this.errorMessage = 'Selected URL is already taken.';
                  this.update();
               }
            });
         }
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<h3>\n      New dictionary\n   </h3><div class="row"><div class="input-field"><input id="title" type="text" class="validate inlineBlock" required style="max-width: 300px;"/><label for="title">Title</label><span class="helper-text">Enter a human-readable title such as "My Esperanto Dictionary". You will be able to change this later.</span></div></div><div><label for="url">URL</label></div><div class="row"><div style="display: flex; align-items: baseline;"><span id="baseUrl" class="grey-text">https://www.lexonomy.eu/</span><span class="input-field" style="margin-top: 0;"><input id="url" type="text" class="validate inlineBlock" required minlength="5" pattern="[a-zA-Z0-9\\-_]*" style="max-width: 300px;"/><span class="helper-text">This will be your dictionary\'s address on the web. You will be able to change this later. Allowed:  letters, numbers, - and _</span></span></div></div><div></div><div class="input-field"><div style="max-width: 300px;"><select id="template"><option value="blank">(none)</option><option value="smd">Simple Monolingual Dictionary</option><option value="sbd">Simple Bilingual Dictionary</option></select></div><label>Template</label><span class="helper-text">You can choose a template here to start you off. Each template comes with a few sample entries. You will be able to change or delete those and to customize the template.</span></div><div expr278="expr278" class="row"></div><div class="buttons"><button expr280="expr280" class="btn waves-effect waves-light" type="submit" name="makeDict" id="makeButton">Create dictionary\n         <i class="material-icons left">add</i></button><a href="#" class="btn btn-flat">cancel</a></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.errorMessage != '',
          redundantAttribute: 'expr278',
          selector: '[expr278]',

          template: template(
            '<div class="col s8"><div class="card red darken-2"><div class="card-content white-text"><p expr279="expr279"> </p></div></div></div>',
            [
              {
                redundantAttribute: 'expr279',
                selector: '[expr279]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.errorMessage
                  }
                ]
              }
            ]
          )
        },
        {
          redundantAttribute: 'expr280',
          selector: '[expr280]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.doMake
            }
          ]
        }
      ]
    ),

    name: 'dict-new'
  };

  var dict_public_entry = {
    css: `dict-public-entry .nabes li a:hover,[is="dict-public-entry"] .nabes li a:hover{text-decoration: underline;} dict-public-entry .nabes li[active=active] a,[is="dict-public-entry"] .nabes li[active=active] a{background-color: #ffccbc;}`,

    exports: {
      moreEntries: [],
      entryId: '',

      loadMoreEntries() {
         $.get(window.API_URL + this.props.dictId + "/" + this.props.entryId + "/nabes.json", (response) => {
            if (response.nabes) {
               this.moreEntries = response.nabes;
               this.update();
            }
         });
      },

      onMounted() {
         console.log('list dict entry '+ this.props.dictId+'-'+this.props.entryId);
         this.entryId = this.props.entryId;
         this.props.loadDictDetail();
         this.loadMoreEntries();
         console.log(this.props);
      },

      onUpdated() {
         if (this.entryId != this.props.entryId) {
            this.entryId = this.props.entryId;
            this.loadMoreEntries();
         }
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<h3 class="header"><a expr272="expr272"> </a></h3><template expr273="expr273"></template>',
      [
        {
          redundantAttribute: 'expr272',
          selector: '[expr272]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.props.dictDetails.title
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.props.dictId
              ].join(
                ''
              )
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.props.dictDetails.public,
          redundantAttribute: 'expr273',
          selector: '[expr273]',

          template: template(
            '<div class="divider"></div><div class="row"><div class="col s9"><entry-view expr274="expr274" is="entry-view"></entry-view></div><div class="col s3"><ul class="nabes"><li expr275="expr275"></li></ul></div></div><div class="divider"></div><div expr277="expr277" class="section"> </div>',
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'entry-view',
                slots: [],

                attributes: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'dict-id',
                    evaluate: _scope => _scope.props.dictId
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'entry-id',
                    evaluate: _scope => _scope.props.entryId
                  }
                ],

                redundantAttribute: 'expr274',
                selector: '[expr274]'
              },
              {
                type: bindingTypes.EACH,
                getKey: null,
                condition: null,

                template: template(
                  '<a expr276="expr276"> </a>',
                  [
                    {
                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'active',
                          evaluate: _scope => _scope.entry.id == _scope.props.entryId
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr276',
                      selector: '[expr276]',

                      expressions: [
                        {
                          type: expressionTypes.TEXT,
                          childNodeIndex: 0,
                          evaluate: _scope => _scope.entry.titlePlain
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'href',

                          evaluate: _scope => [
                            '#/',
                            _scope.props.dictId,
                            '/',
                            _scope.entry.id
                          ].join(
                            ''
                          )
                        }
                      ]
                    }
                  ]
                ),

                redundantAttribute: 'expr275',
                selector: '[expr275]',
                itemName: 'entry',
                indexName: null,
                evaluate: _scope => _scope.moreEntries
              },
              {
                redundantAttribute: 'expr277',
                selector: '[expr277]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,

                    evaluate: _scope => [
                      _scope.props.dictDetails.licence
                    ].join(
                      ''
                    )
                  }
                ]
              }
            ]
          )
        }
      ]
    ),

    name: 'dict-public-entry'
  };

  var dict_public = {
    css: `dict-public .random-entries li,[is="dict-public"] .random-entries li{display: inline; padding: 5px 10px;} dict-public .random-entries li a:hover,[is="dict-public"] .random-entries li a:hover{text-decoration: underline;}`,

    exports: {
      dictId: '',
      randomEntries: [],
      loadingExamples: true,

      onReloadExamplesClick(){
         this.reloadRandom();
         this.update();
      },

      reloadRandom() {
         this.loadingExamples = true;
         $.post(window.API_URL + this.dictId + "/random.json", (response) => {
            console.log(response);
            this.loadingExamples = false;
            this.randomEntries = response.entries;
            this.update();
         });
      },

      onMounted() {
         this.dictId = this.props.dictId;
         console.log('list dict '+ this.dictId);
         this.props.loadDictDetail().then(()=>{
            if (this.props.dictDetails.public && this.randomEntries.length == 0) {
               this.reloadRandom();
            }
         });
         console.log(this.props);
      },

      onUpdated() {
         console.log('list dict update'+ this.dictId);
         $('.blurb').html(this.props.dictDetails.blurb);
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<h3 expr281="expr281" class="header"> <div class="buttons right" style="margin-top: 5px;"><a expr282="expr282" class="btn"></a><a expr283="expr283" class="btn"></a><a expr284="expr284" class="btn"></a><a expr285="expr285" class="btn"></a></div></h3><p expr286="expr286" class="blurb"> </p><div expr287="expr287" class="section"></div>',
      [
        {
          redundantAttribute: 'expr281',
          selector: '[expr281]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: _scope => [
                _scope.props.dictDetails.title
              ].join(
                ''
              )
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.props.userAccess.canEdit,
          redundantAttribute: 'expr282',
          selector: '[expr282]',

          template: template(
            'edit',
            [
              {
                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'href',

                    evaluate: _scope => [
                      '#/',
                      _scope.dictId,
                      '/edit'
                    ].join(
                      ''
                    )
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.props.userAccess.canConfig,
          redundantAttribute: 'expr283',
          selector: '[expr283]',

          template: template(
            'config',
            [
              {
                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'href',

                    evaluate: _scope => [
                      '#/',
                      _scope.dictId,
                      '/config'
                    ].join(
                      ''
                    )
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.props.userAccess.canUpload,
          redundantAttribute: 'expr284',
          selector: '[expr284]',

          template: template(
            'upload',
            [
              {
                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'href',

                    evaluate: _scope => [
                      '#/',
                      _scope.dictId,
                      '/upload'
                    ].join(
                      ''
                    )
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.props.userAccess.canDownload,
          redundantAttribute: 'expr285',
          selector: '[expr285]',

          template: template(
            'download',
            [
              {
                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'href',

                    evaluate: _scope => [
                      '#/',
                      _scope.dictId,
                      '/download'
                    ].join(
                      ''
                    )
                  }
                ]
              }
            ]
          )
        },
        {
          redundantAttribute: 'expr286',
          selector: '[expr286]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.props.dictDetails.blurb
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.props.dictDetails.public,
          redundantAttribute: 'expr287',
          selector: '[expr287]',

          template: template(
            '<br/><div class="divider"></div><a expr288="expr288" class="btn btn-floating waves-effect waves-light right" style="margin-top: 15px;"><i class="material-icons">refresh</i></a><h5 style="margin-left: 8px;">Examples</h5><div expr289="expr289" class="grey-text" style="min-height: 20px; margin: 15px 10px;"></div><ul expr290="expr290" class="random-entries s10"></ul><div class="divider"></div><div expr293="expr293" class="section right" style="opacity: .5;"> </div>',
            [
              {
                redundantAttribute: 'expr288',
                selector: '[expr288]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.onReloadExamplesClick
                  }
                ]
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.loadingExamples,
                redundantAttribute: 'expr289',
                selector: '[expr289]',

                template: template(
                  '\n         Loading...\n      ',
                  []
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => !_scope.loadingExamples && _scope.randomEntries,
                redundantAttribute: 'expr290',
                selector: '[expr290]',

                template: template(
                  '<li expr291="expr291"></li>',
                  [
                    {
                      type: bindingTypes.EACH,
                      getKey: null,
                      condition: null,

                      template: template(
                        '<a expr292="expr292"> </a>',
                        [
                          {
                            redundantAttribute: 'expr292',
                            selector: '[expr292]',

                            expressions: [
                              {
                                type: expressionTypes.TEXT,
                                childNodeIndex: 0,
                                evaluate: _scope => _scope.entry.titlePlain
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'href',

                                evaluate: _scope => [
                                  '#/',
                                  _scope.dictId,
                                  '/',
                                  _scope.entry.id
                                ].join(
                                  ''
                                )
                              }
                            ]
                          }
                        ]
                      ),

                      redundantAttribute: 'expr291',
                      selector: '[expr291]',
                      itemName: 'entry',
                      indexName: null,
                      evaluate: _scope => _scope.randomEntries
                    }
                  ]
                )
              },
              {
                redundantAttribute: 'expr293',
                selector: '[expr293]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,

                    evaluate: _scope => [
                      _scope.props.dictDetails.licence
                    ].join(
                      ''
                    )
                  }
                ]
              }
            ]
          )
        }
      ]
    ),

    name: 'dict-public'
  };

  var dict_upload = {
    css: null,

    exports: {
      dictId: '',

      onMounted() {
         this.dictId = this.props.dictId;
         console.log('upload dict '+ this.dictId);
         this.props.loadDictDetail();
         console.log(this.props);
         this.update();
      },

      doUpload() {
         var purge = $('#purge').is(':checked');
         console.log($('#file'));
         console.log($('#file').val());
         console.log(purge);
         var fd = new FormData();
         var files = $('#file')[0].files[0];
         fd.append('myfile', files);
         if (purge) fd.append('purge', 'on');
         $('#startButton').attr('disabled', 'disabled');
         $('#info').html('Upload started, please keep the window open.');
         $.ajax({
            url: window.API_URL + this.dictId + '/upload.html',
            data: fd,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function(response) {
               console.log(response);
               if (response.success) {
                  $('#info').data('file', response.file);
                  $('#info').data('uploadStart', response.uploadStart);
               } else {
                  $('#info').html('Error while uploading file');
               }
            }
         });
         this.startImport(this.dictId);
      },

      startImport(dictId) {
         var importTimer = setInterval(checkImport, 500);
         function checkImport() {
            var file = $('#info').data('file');
            var uploadStart = $('#info').data('uploadStart');
            if (file != '') {
               $.get(window.API_URL + dictId + '/import.json', {filename: file, uploadStart: uploadStart}, (response) => {
                  console.log(response);
                  $('#info').html(response.progressMessage);
                  if (response.finished) {
                     $('#info').html(response.progressMessage + '<br/>Dictionary import finished. <a href="/#'+dictId+'/edit">See dictionary</a>');
                     clearInterval(importTimer);
                     $('#startButton').removeAttr('disabled');
                  }
                  if (response.errors) {
                     $('#info').html('There were some errors during XML parsing');
                     $.get(window.API_URL + dictId + '/import.json', {filename: file, uploadStart: uploadStart, showErrors: true, truncate: 10000}, (response) => {
                        $('#errors pre').html(response.errorData);
                     });
                     clearInterval(importTimer);
                     $('#startButton').removeAttr('disabled');
                  }
               });
            }
         }
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<nav class="nav-breadcrumbs"><div class="nav-wrapper"><a expr294="expr294" class="breadcrumb"> </a><a expr295="expr295" class="breadcrumb">Upload</a></div></nav><h3>Upload</h3><div><div class="file-field input-field buttons" style="max-width: 700px;"><div class="btn"><span>Choose XML file</span><input type="file" id="file"/></div><div class="file-path-wrapper"><input class="file-path validate" type="text"/></div><div><a expr296="expr296" class="waves-effect waves-light btn btn-primary" id="startButton"><i class="material-icons left">file_upload</i>Upload file\n            </a></div></div></div><div><label><input type="checkbox" id="purge"/><span>Purge dictionary before upload</span></label></div><br/><br/><div><div class="col s10" id="info"></div></div><div><div class="col s10" id="errors"><pre>\n         </pre></div></div>',
      [
        {
          redundantAttribute: 'expr294',
          selector: '[expr294]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.props.dictDetails.title
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.props.dictId
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr295',
          selector: '[expr295]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.props.dictId,
                '/upload'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr296',
          selector: '[expr296]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.doUpload
            }
          ]
        }
      ]
    ),

    name: 'dict-upload'
  };

  var e404 = {
    css: null,
    exports: null,

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div class="container">\n    Page not found\n  </div>',
      []
    ),

    name: 'e404'
  };

  var entry_view = {
    css: null,

    exports: {
      entryId: '',

      readEntry() {
         if (this.props.dictId != '') {
            $.post(window.API_URL + this.props.dictId + "/entryread.json", {id: this.props.entryId}, (response) => {
               console.log(response);
               if (response.success) {
                  $('.viewer').html(response.contentHtml);
               }
            });
         }
      },

      onMounted() {
         this.entryId = this.props.entryId;
         console.log('view '+this.props.dictId+'-'+this.props.entryId);
         this.readEntry();
      },

      onUpdated() {
         console.log('up view '+this.props.dictId+'-'+this.props.entryId+'-'+this.entryId);
         if (this.entryId != this.props.entryId) {
            this.entryId = this.props.entryId;
            this.readEntry();
         }
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div class="viewer" id="viewer"></div>',
      []
    ),

    name: 'entry-view'
  };

  var footer = {
    css: `footer .footer-logos,[is="footer"] .footer-logos{ padding: 15px 20px 50px 50px; background: #d9d9d8; } footer .footer-copyright,[is="footer"] .footer-copyright{ font-weight: 300; padding: 15px 15px 30px 50px; background: #b8b8b8; } footer .logolint a,[is="footer"] .logolint a{ height: 30px; display: inline-block; vertical-align: middle; } footer .logolint a::after,[is="footer"] .logolint a::after{ height: 30px; display: inline-block; content: " "; border-right: 1px solid #fff; margin: 0 10px; } footer .logolint a img,[is="footer"] .logolint a img{ height: 30px; filter: brightness(0) invert(1); } footer .logolint a:hover img,[is="footer"] .logolint a:hover img{ filter: none; } footer .version,[is="footer"] .version{ font-weight: 100; }`,

    exports: {
      onMounted() {
         this.props.siteconfig.version ="as";
         // console.log('foo')
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div class="footer-logos"><div class="logolint"><a target="_blank" href="https://www.muni.cz/" title="Masaryk University"><img class="mulogo" src="img/logo_muni_small.png"/></a><a target="_blank" href="https://www.sketchengine.co.uk/" title="Sketch Engine"><img class="skelogo" src="img/logo_ske_small.png"/></a></div><div expr330="expr330" class="version right white-text"></div></div><div class="footer-copyright">\n      Lexonomy is developed as part of <a href="https://elex.is/">ELEXIS</a> project.\n      <a class="right" href="https://github.com/elexis-eu/lexonomy" title="GitHub" target="_blank"><img src="img/github.png"/></a></div>',
      [
        {
          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'class',
              evaluate: _scope => 'Xpage-footer'
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.props.siteconfig.version,
          redundantAttribute: 'expr330',
          selector: '[expr330]',

          template: template(
            ' ',
            [
              {
                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,

                    evaluate: _scope => [
                      'Version: ',
                      _scope.props.siteconfig.version
                    ].join(
                      ''
                    )
                  }
                ]
              }
            ]
          )
        }
      ]
    ),

    name: 'footer'
  };

  var forgot_password = {
    css: null,

    exports: {
      messageSent: false,
      tokenValid: false,
      checkingToken: true,
      errorMessage: '',

      validateToken(token) {
         console.log('validate '+token);
         $.post(window.API_URL + "verifytoken.json", {token: token, type: "recovery"}, (response) => {
            if (response.success) {
               this.tokenValid = true;
            }
         }).always(() => {
            this.checkingToken = false;
            this.update();
         });
      },

      onMounted() {
         this.validateToken(this.props.token);
      },

      doLogin(event) {
         if ((event.target.id == "password") && event.keyCode != 13) return false;

         this.props.accountOps('forgotPassword').then((result)=>{
            if (result.success) {
               this.messageSent = true;
               this.update();
            } else {
               this.messageSent = false;
               this.errorMessage = result.errorMessage;
               this.update();
            }
         });
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div expr297="expr297"></div><div expr301="expr301" class="row"></div><div expr302="expr302" class="row"></div><div expr303="expr303" class="row"></div><div expr304="expr304" class="row"></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.messageSent && _scope.tokenValid,
          redundantAttribute: 'expr297',
          selector: '[expr297]',

          template: template(
            '<div class="row"><div class="input-field col s12"><input expr298="expr298" id="password" type="password" class="validate"/><label for="password">Your password</label><span class="helper-text">Set your password to access Lexonomy.</span><input expr299="expr299" id="token" type="hidden"/></div></div><div class="row"><button expr300="expr300" class="btn waves-effect waves-light" type="submit" name="login" id="loginButton">Set password\n            <i class="material-icons right">send</i></button></div>',
            [
              {
                redundantAttribute: 'expr298',
                selector: '[expr298]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onkeypress',
                    evaluate: _scope => _scope.doLogin
                  }
                ]
              },
              {
                redundantAttribute: 'expr299',
                selector: '[expr299]',

                expressions: [
                  {
                    type: expressionTypes.VALUE,
                    evaluate: _scope => _scope.props.token
                  }
                ]
              },
              {
                redundantAttribute: 'expr300',
                selector: '[expr300]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.doLogin
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.tokenValid && !_scope.checkingToken,
          redundantAttribute: 'expr301',
          selector: '[expr301]',

          template: template(
            '<div class="col s12"><div class="card red darken-2"><div class="card-content white-text"><p>This recovery link is invalid. It may have expired or has been used before.</p></div></div></div>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.checkingToken,
          redundantAttribute: 'expr302',
          selector: '[expr302]',

          template: template(
            '<p>Validating recovery token...</p>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.messageSent,
          redundantAttribute: 'expr303',
          selector: '[expr303]',

          template: template(
            '<p>Your password is updated. You can now <a href="#/">log in</a> with your e-mail address and password.</p>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.errorMessage != '',
          redundantAttribute: 'expr304',
          selector: '[expr304]',

          template: template(
            '<div class="col s6"><div class="card red darken-2"><div class="card-content white-text"><p expr305="expr305"> </p></div></div></div>',
            [
              {
                redundantAttribute: 'expr305',
                selector: '[expr305]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.errorMessage
                  }
                ]
              }
            ]
          )
        }
      ]
    ),

    name: 'forgot-password'
  };

  var forgot = {
    css: null,

    exports: {
      messageSent: false,
      errorMessage: '',

      doLogin(event) {
         if ((event.target.id == "email") && event.keyCode != 13) return false;
         this.props.accountOps('forgot').then((result)=>{
            if (result.success) {
               this.messageSent = true;
               this.update();
            } else {
               this.messageSent = false;
               this.errorMessage = result.errorMessage;
               this.update();
            }
         });
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div expr306="expr306" class="section"></div><div expr309="expr309" class="section"></div><div expr310="expr310" class="row"></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.messageSent,
          redundantAttribute: 'expr306',
          selector: '[expr306]',

          template: template(
            '<div class="input-field"><input expr307="expr307" id="email" type="email"/><label for="email">Your e-mail</label><span class="helper-text">If you have forgotten your password, enter your e-mail address and we will send you instructions on how to create a new one.</span></div><div><button expr308="expr308" class="btn waves-effect waves-light" type="submit" name="login" id="loginButton">Get a new password\n            <i class="material-icons right">send</i></button></div>',
            [
              {
                redundantAttribute: 'expr307',
                selector: '[expr307]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onkeypress',
                    evaluate: _scope => _scope.doLogin
                  }
                ]
              },
              {
                redundantAttribute: 'expr308',
                selector: '[expr308]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.doLogin
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.messageSent,
          redundantAttribute: 'expr309',
          selector: '[expr309]',

          template: template(
            '<p>We have sent you an e-mail with instructions on how to reset your password.</p>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.errorMessage != '',
          redundantAttribute: 'expr310',
          selector: '[expr310]',

          template: template(
            '<div class="col s6"><div class="card red darken-2"><div class="card-content white-text"><p expr311="expr311"> </p></div></div></div>',
            [
              {
                redundantAttribute: 'expr311',
                selector: '[expr311]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.errorMessage
                  }
                ]
              }
            ]
          )
        }
      ]
    ),

    name: 'forgot'
  };

  $(document).ready(function() {
     $(".dropdown-trigger").dropdown({coverTrigger: false, constrainWidth: false});
  });

  var header = {
    css: `header .brand-logo,[is="header"] .brand-logo{ padding: 0 20px 0 40px; } header .site-logo,[is="header"] .site-logo{ height: 50px; position: relative; top: 20px } header nav,[is="header"] nav{ border-bottom: 1px solid black; box-shadow: none; }`,

    exports: {
      doLogout(event) {
         this.props.logOut();
      },

      onUpdated() {
         $(document).ready(function() {
            $(".dropdown-trigger").dropdown({coverTrigger: false, constrainWidth: false});
         });
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<ul expr312="expr312" id="dropdown-menu-dict" class="dropdown-content"></ul><ul expr323="expr323" id="dropdown-menu-anon" class="dropdown-content"></ul><ul expr324="expr324" id="dropdown-menu-user" class="dropdown-content"></ul><nav class="white"><div class="nav-wrapper"><a href="#" class="brand-logo"><img class="site-logo" src="img/logo_50.png"/></a><ul id="nav-mobile" class="right hide-on-med-and-down"><li expr326="expr326"></li><li expr327="expr327"></li><li expr328="expr328"></li></ul></div></nav>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => true,
          redundantAttribute: 'expr312',
          selector: '[expr312]',

          template: template(
            '<li expr313="expr313"></li><li expr315="expr315"></li><li expr317="expr317"></li><li expr319="expr319"></li><li expr321="expr321"></li>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.props.userAccess && _scope.props.userAccess.canEdit,
                redundantAttribute: 'expr313',
                selector: '[expr313]',

                template: template(
                  '<a expr314="expr314">View</a>',
                  [
                    {
                      redundantAttribute: 'expr314',
                      selector: '[expr314]',

                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'href',

                          evaluate: _scope => [
                            '#/',
                            _scope.props.dictId
                          ].join(
                            ''
                          )
                        }
                      ]
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.props.userAccess && _scope.props.userAccess.canEdit,
                redundantAttribute: 'expr315',
                selector: '[expr315]',

                template: template(
                  '<a expr316="expr316">Edit</a>',
                  [
                    {
                      redundantAttribute: 'expr316',
                      selector: '[expr316]',

                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'href',

                          evaluate: _scope => [
                            '#/',
                            _scope.props.dictId,
                            '/edit'
                          ].join(
                            ''
                          )
                        }
                      ]
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.props.userAccess && _scope.props.userAccess.canConfig,
                redundantAttribute: 'expr317',
                selector: '[expr317]',

                template: template(
                  '<a expr318="expr318">Configure</a>',
                  [
                    {
                      redundantAttribute: 'expr318',
                      selector: '[expr318]',

                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'href',

                          evaluate: _scope => [
                            '#/',
                            _scope.props.dictId,
                            '/config'
                          ].join(
                            ''
                          )
                        }
                      ]
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.props.userAccess && _scope.props.userAccess.canDownload,
                redundantAttribute: 'expr319',
                selector: '[expr319]',

                template: template(
                  '<a expr320="expr320">Download</a>',
                  [
                    {
                      redundantAttribute: 'expr320',
                      selector: '[expr320]',

                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'href',

                          evaluate: _scope => [
                            '#/',
                            _scope.props.dictId,
                            '/download'
                          ].join(
                            ''
                          )
                        }
                      ]
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.props.userAccess && _scope.props.userAccess.canUpload,
                redundantAttribute: 'expr321',
                selector: '[expr321]',

                template: template(
                  '<a expr322="expr322">Upload</a>',
                  [
                    {
                      redundantAttribute: 'expr322',
                      selector: '[expr322]',

                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'href',

                          evaluate: _scope => [
                            '#/',
                            _scope.props.dictId,
                            '/upload'
                          ].join(
                            ''
                          )
                        }
                      ]
                    }
                  ]
                )
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.props.authorized,
          redundantAttribute: 'expr323',
          selector: '[expr323]',

          template: template(
            '<li><a href="#/">Log in</a></li><li><a href="#/register">Get an account</a></li><li><a href="#/forgot">Forgot your password?</a></li>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.props.authorized,
          redundantAttribute: 'expr324',
          selector: '[expr324]',

          template: template(
            '<li><a expr325="expr325" href="#/">Log out</a></li><li><a href="#/userprofile">Your profile</a></li>',
            [
              {
                redundantAttribute: 'expr325',
                selector: '[expr325]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.doLogout
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.props.showDictMenu,
          redundantAttribute: 'expr326',
          selector: '[expr326]',

          template: template(
            '<a class="dropdown-trigger" href="#/" data-target="dropdown-menu-dict">Dictionary<i class="material-icons right">arrow_drop_down</i></a>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.props.authorized,
          redundantAttribute: 'expr327',
          selector: '[expr327]',

          template: template(
            '<a class="dropdown-trigger" href="#/" data-target="dropdown-menu-anon">anonymous user<i class="material-icons right">arrow_drop_down</i></a>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.props.authorized,
          redundantAttribute: 'expr328',
          selector: '[expr328]',

          template: template(
            '<a expr329="expr329" class="dropdown-trigger" href="#/" data-target="dropdown-menu-user"> <i class="material-icons right">arrow_drop_down</i></a>',
            [
              {
                redundantAttribute: 'expr329',
                selector: '[expr329]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.props.userInfo.username
                  }
                ]
              }
            ]
          )
        }
      ]
    ),

    name: 'header'
  };

  var list_headword = {
    css: null,

    exports: {
      setInnerHTML() {
         $('.headword-link', this.root).html(this.props.entryData.title);
      },

      onMounted() {
         this.setInnerHTML();
      },

      onUpdated() {
         this.setInnerHTML();
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<a expr345="expr345"></a>',
      [
        {
          redundantAttribute: 'expr345',
          selector: '[expr345]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',
              evaluate: _scope => _scope.props.link
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'class',

              evaluate: _scope => [
                'headword-link collection-item ',
                _scope.props.active ? 'red-text' : ''
              ].join(
                ''
              )
            }
          ]
        }
      ]
    ),

    name: 'list-headword'
  };

  var login = {
    css: `login .skelogin,[is="login"] .skelogin{ width: 80px; height: 30px; vertical-align: middle; } login small,[is="login"] small{ position: relative; top: -10px; }`,

    exports: {
      doLogin(event) {
         if ((event.target.id == "username" || event.target.id == "password") && event.keyCode != 13) return false;
         this.props.accountOps('login');
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div class="section"><div class="input-field"><input id="username" type="email" class="validate" value/><label for="username">Username</label><small>\n            No account? <a href="#register" tabindex="-1">Sign up</a></small></div><div class="input-field"><input expr346="expr346" id="password" type="password"/><label for="password">Password</label><small><a href="#forgot" tabindex="-1">Forgot password?</a></small></div><button expr347="expr347" class="btn btn-primary waves-effect waves-light" type="submit" name="login" id="loginButton">Log in\n         <i class="material-icons right">send</i></button></div><div expr348="expr348" class="section"></div>',
      [
        {
          redundantAttribute: 'expr346',
          selector: '[expr346]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onkeypress',
              evaluate: _scope => _scope.doLogin
            }
          ]
        },
        {
          redundantAttribute: 'expr347',
          selector: '[expr347]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.doLogin
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => 'sketchengineLoginPage' in _scope.props.siteconfig && _scope.props.siteconfig.sketchengineLoginPage != "",
          redundantAttribute: 'expr348',
          selector: '[expr348]',

          template: template(
            '<a expr349="expr349" class="btn waves-effect waves-light">Sign up or log in with\n         <img class="skelogin" alt="Sketch Engine" title="Sketch Engine" src="img/logo_ske_white.png"/><i class="material-icons right">send</i></a>',
            [
              {
                redundantAttribute: 'expr349',
                selector: '[expr349]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'href',
                    evaluate: _scope => _scope.props.siteconfig.sketchengineLoginPage
                  }
                ]
              }
            ]
          )
        }
      ]
    ),

    name: 'login'
  };

  var main_page = {
    css: `main-page,[is="main-page"]{ margin-top: 20px; }`,
    exports: null,

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div expr331="expr331"></div><div expr338="expr338" class="row"></div><div class="divider" style="margin-top: 50px;"></div><div class="section" style="opacity: 0.6;"><h5>Reference</h5><p>Měchura, M. B. (2017) ‘<a href="docs/elex2017.pdf">Introducing Lexonomy: an open-source dictionary writing and publishing system</a>’ in <i>Electronic Lexicography in the 21st Century: Lexicography from Scratch. Proceedings of the eLex 2017 conference, 19-21 September 2017, Leiden, The Netherlands.</i><br/><span class>If you are referring to Lexonomy from an academic publication, it is recommended that you cite this paper.</span></p></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.props.authorized,
          redundantAttribute: 'expr331',
          selector: '[expr331]',

          template: template(
            '<template expr332="expr332"></template><template expr334="expr334"></template>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.props.siteconfig.consent && _scope.props.siteconfig.consent.terms && !_scope.props.userInfo.consent,
                redundantAttribute: 'expr332',
                selector: '[expr332]',

                template: template(
                  '<user-consent expr333="expr333"></user-consent>',
                  [
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'user-consent',
                      slots: [],

                      attributes: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'user-info',
                          evaluate: _scope => _scope.props.userInfo
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'siteconfig',
                          evaluate: _scope => _scope.props.siteconfig
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'account-ops',
                          evaluate: _scope => _scope.props.accountOps
                        }
                      ],

                      redundantAttribute: 'expr333',
                      selector: '[expr333]'
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => !_scope.props.siteconfig.consent || !_scope.props.siteconfig.consent.terms || _scope.props.userInfo.consent,
                redundantAttribute: 'expr334',
                selector: '[expr334]',

                template: template(
                  '<dict-list expr335="expr335"></dict-list><dict-new expr336="expr336"></dict-new><userprofile expr337="expr337"></userprofile>',
                  [
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.props.mainSubPage != 'new' && _scope.props.mainSubPage != 'userprofile',
                      redundantAttribute: 'expr335',
                      selector: '[expr335]',

                      template: template(
                        null,
                        [
                          {
                            type: bindingTypes.TAG,
                            getComponent: getComponent,
                            evaluate: _scope => 'dict-list',
                            slots: [],
                            attributes: []
                          }
                        ]
                      )
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.props.mainSubPage == 'new',
                      redundantAttribute: 'expr336',
                      selector: '[expr336]',

                      template: template(
                        null,
                        [
                          {
                            type: bindingTypes.TAG,
                            getComponent: getComponent,
                            evaluate: _scope => 'dict-new',
                            slots: [],
                            attributes: []
                          }
                        ]
                      )
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.props.mainSubPage == 'userprofile',
                      redundantAttribute: 'expr337',
                      selector: '[expr337]',

                      template: template(
                        null,
                        [
                          {
                            type: bindingTypes.TAG,
                            getComponent: getComponent,
                            evaluate: _scope => 'userprofile',
                            slots: [],

                            attributes: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'user-info',
                                evaluate: _scope => _scope.props.userInfo
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'siteconfig',
                                evaluate: _scope => _scope.props.siteconfig
                              }
                            ]
                          }
                        ]
                      )
                    }
                  ]
                )
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.props.authorized,
          redundantAttribute: 'expr338',
          selector: '[expr338]',

          template: template(
            '<div class="col m7 s12"><welcome expr339="expr339"></welcome></div><div class="col m5 s12"><login expr340="expr340"></login><register expr341="expr341"></register><register-password expr342="expr342"></register-password><forgot expr343="expr343"></forgot><forgot-password expr344="expr344"></forgot-password></div>',
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'welcome',
                slots: [],
                attributes: [],
                redundantAttribute: 'expr339',
                selector: '[expr339]'
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.props.mainSubPage == 'login',
                redundantAttribute: 'expr340',
                selector: '[expr340]',

                template: template(
                  null,
                  [
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'login',
                      slots: [],

                      attributes: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'account-ops',
                          evaluate: _scope => _scope.props.accountOps
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'siteconfig',
                          evaluate: _scope => _scope.props.siteconfig
                        }
                      ]
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.props.mainSubPage == 'register',
                redundantAttribute: 'expr341',
                selector: '[expr341]',

                template: template(
                  null,
                  [
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'register',
                      slots: [],

                      attributes: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'account-ops',
                          evaluate: _scope => _scope.props.accountOps
                        }
                      ]
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.props.mainSubPage == 'registerPassword',
                redundantAttribute: 'expr342',
                selector: '[expr342]',

                template: template(
                  null,
                  [
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'register-password',
                      slots: [],

                      attributes: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'account-ops',
                          evaluate: _scope => _scope.props.accountOps
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'token',
                          evaluate: _scope => _scope.props.token
                        }
                      ]
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.props.mainSubPage == 'forgot',
                redundantAttribute: 'expr343',
                selector: '[expr343]',

                template: template(
                  null,
                  [
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'forgot',
                      slots: [],

                      attributes: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'account-ops',
                          evaluate: _scope => _scope.props.accountOps
                        }
                      ]
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.props.mainSubPage == 'forgotPassword',
                redundantAttribute: 'expr344',
                selector: '[expr344]',

                template: template(
                  null,
                  [
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'forgot-password',
                      slots: [],

                      attributes: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'account-ops',
                          evaluate: _scope => _scope.props.accountOps
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'token',
                          evaluate: _scope => _scope.props.token
                        }
                      ]
                    }
                  ]
                )
              }
            ]
          )
        }
      ]
    ),

    name: 'main-page'
  };

  var open_dict_list = {
    css: null,

    exports: {
      isLoading: true,
      visibleDicts: [],
      allDicts: [],
      languageList: [],
      language: "",
      query: "",

      loadData(){
         $.get({url: "/publicdicts.json",
            success: payload => {
               this.allDicts = payload.entries;
               this.visibleDicts = this.allDicts;
               this.isLoading = false;
               this.languageList = [...new Set(this.allDicts.map(d => d.lang))].filter(l => l != "");
               this.update();
               this.initializeLanguageSelect();
               $("#search").focus();
            },
            error: payload => {
               M.toast({html: "Could not load the data."});
            }
         });
      },

      onSearchInput(evt){
         this.query = evt.target.value;
         this.filter();
      },

      onLanguageChange(evt){
         this.language = evt.target.value;
         this.filter();
      },

      filter(){
         this.allDicts.forEach(c => {
            delete c.h_title;
            delete c.h_lang;
            delete c.h_author;
            delete c.h_licence;
         });
         this.visibleDicts = this.allDicts;
         if(this.language){
            this.visibleDicts = this.visibleDicts.filter(d => d.lang == this.language);
         }
         if(this.query !== ""){
            let sortResult = FuzzySort.go(this.query, this.visibleDicts, {
               key: "id",
               keys: ["title", "lang", "author", "licence"]
            });
            this.visibleDicts = sortResult.map(fs => {
               fs.obj.h_title = FuzzySort.highlight(fs[0], '<b class="red-text">', "</b>");
               fs.obj.h_lang = FuzzySort.highlight(fs[1], '<b class="red-text">', "</b>");
               fs.obj.h_author = FuzzySort.highlight(fs[2], '<b class="red-text">', "</b>");
               fs.obj.h_licence = FuzzySort.highlight(fs[3], '<b class="red-text">', "</b>");
               return fs.obj
            }).sort((a, b) => {
               return a.score == b.score ? a.title.localeCompare(b.title) : Math.sign(b.score - a.score)
            });
         }
         this.update();
         this.highlightOccurrences();
      },

      highlightOccurrences(){
         let el, row;
         this.visibleDicts.forEach((c, idx) => {
            row = this.$(`#r_${idx}`);
            if(row){
               el = this.$(`#t_${idx}`);
               el.innerHTML = c.h_title ? c.h_title : el.innerHTML.replace(/<b class="red-text">|<\/b>/g, '');
               el = this.$(`#l_${idx}`);
               el.innerHTML = c.h_lang ? c.h_lang : el.innerHTML.replace(/<b class="red-text">|<\/b>/g, '');
               el = this.$(`#a_${idx}`);
               el.innerHTML = c.h_author ? c.h_author : el.innerHTML.replace(/<b class="red-text">|<\/b>/g, '');
               el = this.$(`#i_${idx}`);
               el.innerHTML = c.h_licence ? c.h_licence : el.innerHTML.replace(/<b class="red-text">|<\/b>/g, '');
            }
         }, this);
      },

      initializeLanguageSelect(){
          $("#languageSelect").formSelect({
               dropdownOptions: {
                  constrainWidth: false
               }
            })
            .on("change", this.onLanguageChange);
      },

      onMounted(){
         this.loadData();
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<h4>\n      Open dictionaries\n   </h4><div expr365="expr365"></div><div expr366="expr366"></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.isLoading,
          redundantAttribute: 'expr365',
          selector: '[expr365]',

          template: template(
            '<div class="progress" style="margin: 20vh auto; max-width: 50%;"><div class="indeterminate"></div></div>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.isLoading,
          redundantAttribute: 'expr366',
          selector: '[expr366]',

          template: template(
            '<div><div class="input-field" style="display: inline-block; margin-right: 40px;"><i class="material-icons prefix grey-text">search</i><input expr367="expr367" id="search" type="text" style="width: 200px;"/><label for="search">Find</label></div><div class="input-field" style="display: inline-block;"><i class="material-icons prefix grey-text">translate</i><select id="languageSelect" style="width: 200px;"><option value>All languages</option><option expr368="expr368"></option></select><label>Language</label></div></div><div expr369="expr369" class="center" style="margin: 20vh auto;"></div><table expr370="expr370" class="striped highlight" style="margin: 0 15px;"></table>',
            [
              {
                redundantAttribute: 'expr367',
                selector: '[expr367]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'oninput',
                    evaluate: _scope => _scope.onSearchInput
                  }
                ]
              },
              {
                type: bindingTypes.EACH,
                getKey: null,
                condition: null,

                template: template(
                  ' ',
                  [
                    {
                      expressions: [
                        {
                          type: expressionTypes.TEXT,
                          childNodeIndex: 0,
                          evaluate: _scope => _scope.language
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'value',
                          evaluate: _scope => _scope.language
                        }
                      ]
                    }
                  ]
                ),

                redundantAttribute: 'expr368',
                selector: '[expr368]',
                itemName: 'language',
                indexName: null,
                evaluate: _scope => _scope.languageList
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => !_scope.visibleDicts.length,
                redundantAttribute: 'expr369',
                selector: '[expr369]',

                template: template(
                  '<h3 class="grey-text lighten-2">Nothing found</h3>',
                  []
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.visibleDicts.length,
                redundantAttribute: 'expr370',
                selector: '[expr370]',

                template: template(
                  '<thead><th>\n               Title\n            </th><th>\n               Language\n            </th><th>\n               Size\n            </th><th>\n               Author\n            </th><th>\n               Licence\n            </th></thead><tbody><tr expr371="expr371"></tr></tbody>',
                  [
                    {
                      type: bindingTypes.EACH,
                      getKey: null,
                      condition: null,

                      template: template(
                        '<td><a expr372="expr372"><span expr373="expr373"> </span></a><a expr374="expr374" title="edit dictionary"></a></td><td><span expr375="expr375"> </span></td><td><span expr376="expr376"> </span></td><td><span expr377="expr377"> </span></td><td><span expr378="expr378"> </span></td>',
                        [
                          {
                            expressions: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'id',

                                evaluate: _scope => [
                                  'r_',
                                  _scope.idx
                                ].join(
                                  ''
                                )
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr372',
                            selector: '[expr372]',

                            expressions: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'href',

                                evaluate: _scope => [
                                  '#/',
                                  _scope.row.id
                                ].join(
                                  ''
                                )
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr373',
                            selector: '[expr373]',

                            expressions: [
                              {
                                type: expressionTypes.TEXT,
                                childNodeIndex: 0,

                                evaluate: _scope => [
                                  _scope.row.title
                                ].join(
                                  ''
                                )
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'id',

                                evaluate: _scope => [
                                  't_',
                                  _scope.idx
                                ].join(
                                  ''
                                )
                              }
                            ]
                          },
                          {
                            type: bindingTypes.IF,
                            evaluate: _scope => _scope.row.isAdmin,
                            redundantAttribute: 'expr374',
                            selector: '[expr374]',

                            template: template(
                              '<i class="material-icons">edit</i>',
                              [
                                {
                                  expressions: [
                                    {
                                      type: expressionTypes.ATTRIBUTE,
                                      name: 'href',

                                      evaluate: _scope => [
                                        '#/',
                                        _scope.row.id,
                                        '/edit'
                                      ].join(
                                        ''
                                      )
                                    }
                                  ]
                                }
                              ]
                            )
                          },
                          {
                            redundantAttribute: 'expr375',
                            selector: '[expr375]',

                            expressions: [
                              {
                                type: expressionTypes.TEXT,
                                childNodeIndex: 0,

                                evaluate: _scope => [
                                  _scope.row.lang
                                ].join(
                                  ''
                                )
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'id',

                                evaluate: _scope => [
                                  'l_',
                                  _scope.idx
                                ].join(
                                  ''
                                )
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr376',
                            selector: '[expr376]',

                            expressions: [
                              {
                                type: expressionTypes.TEXT,
                                childNodeIndex: 0,

                                evaluate: _scope => [
                                  _scope.row.size
                                ].join(
                                  ''
                                )
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'id',

                                evaluate: _scope => [
                                  'l_',
                                  _scope.idx
                                ].join(
                                  ''
                                )
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr377',
                            selector: '[expr377]',

                            expressions: [
                              {
                                type: expressionTypes.TEXT,
                                childNodeIndex: 0,

                                evaluate: _scope => [
                                  _scope.row.author
                                ].join(
                                  ''
                                )
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'id',

                                evaluate: _scope => [
                                  'a_',
                                  _scope.idx
                                ].join(
                                  ''
                                )
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr378',
                            selector: '[expr378]',

                            expressions: [
                              {
                                type: expressionTypes.TEXT,
                                childNodeIndex: 0,

                                evaluate: _scope => [
                                  _scope.row.licence
                                ].join(
                                  ''
                                )
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'id',

                                evaluate: _scope => [
                                  'i_',
                                  _scope.idx
                                ].join(
                                  ''
                                )
                              }
                            ]
                          }
                        ]
                      ),

                      redundantAttribute: 'expr371',
                      selector: '[expr371]',
                      itemName: 'row',
                      indexName: 'idx',
                      evaluate: _scope => _scope.visibleDicts
                    }
                  ]
                )
              }
            ]
          )
        }
      ]
    ),

    name: 'open-dict-list'
  };

  var register_password = {
    css: null,

    exports: {
      messageSent: false,
      tokenValid: false,
      checkingToken: true,
      errorMessage: '',

      validateToken(token) {
         console.log('validate '+token);
         $.post(window.API_URL + "verifytoken.json", {token: token, type: "register"}, (response) => {
            if (response.success) {
               this.tokenValid = true;
            }
         }).always(() => {
            this.checkingToken = false;
            this.update();
         });
      },

      onMounted() {
         this.validateToken(this.props.token);
      },

      doLogin(event) {
         if ((event.target.id == "password") && event.keyCode != 13) return false;

         this.props.accountOps('registerPassword').then((result)=>{
            if (result.success) {
               this.messageSent = true;
               this.update();
            } else {
               this.messageSent = false;
               this.errorMessage = result.errorMessage;
               this.update();
            }
         });
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div expr356="expr356"></div><div expr360="expr360" class="row"></div><div expr361="expr361" class="row"></div><div expr362="expr362" class="row"></div><div expr363="expr363" class="row"></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.messageSent && _scope.tokenValid,
          redundantAttribute: 'expr356',
          selector: '[expr356]',

          template: template(
            '<div class="row"><div class="input-field col s12"><input expr357="expr357" id="password" type="password" class="validate"/><label for="password">Your password</label><span class="helper-text">Set your password to access Lexonomy.</span><input expr358="expr358" id="token" type="hidden"/></div></div><div class="row"><button expr359="expr359" class="btn waves-effect waves-light" type="submit" name="login" id="loginButton">Set password\n            <i class="material-icons right">send</i></button></div>',
            [
              {
                redundantAttribute: 'expr357',
                selector: '[expr357]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onkeypress',
                    evaluate: _scope => _scope.doLogin
                  }
                ]
              },
              {
                redundantAttribute: 'expr358',
                selector: '[expr358]',

                expressions: [
                  {
                    type: expressionTypes.VALUE,
                    evaluate: _scope => _scope.props.token
                  }
                ]
              },
              {
                redundantAttribute: 'expr359',
                selector: '[expr359]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.doLogin
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.tokenValid && !_scope.checkingToken,
          redundantAttribute: 'expr360',
          selector: '[expr360]',

          template: template(
            '<div class="col s12"><div class="card red darken-2"><div class="card-content white-text"><p>This signup link is invalid. It may have expired or has been used before.</p></div></div></div>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.checkingToken,
          redundantAttribute: 'expr361',
          selector: '[expr361]',

          template: template(
            '<p>Validating signup token...</p>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.messageSent,
          redundantAttribute: 'expr362',
          selector: '[expr362]',

          template: template(
            '<p>We have created your account. You can now <a href="#/">log in</a> with your e-mail address and password.</p>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.errorMessage != '',
          redundantAttribute: 'expr363',
          selector: '[expr363]',

          template: template(
            '<div class="col s6"><div class="card red darken-2"><div class="card-content white-text"><p expr364="expr364"> </p></div></div></div>',
            [
              {
                redundantAttribute: 'expr364',
                selector: '[expr364]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.errorMessage
                  }
                ]
              }
            ]
          )
        }
      ]
    ),

    name: 'register-password'
  };

  var register = {
    css: null,

    exports: {
      messageSent: false,
      errorMessage: '',

      doLogin(event) {
         if ((event.target.id == "email") && event.keyCode != 13) return false;

         this.props.accountOps('register').then((result)=>{
            if (result.success) {
               this.messageSent = true;
               this.update();
            } else {
               this.messageSent = false;
               this.errorMessage = result.errorMessage;
               this.update();
            }
         });
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div expr350="expr350" class="section"></div><div expr353="expr353"></div><div expr354="expr354"></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.messageSent,
          redundantAttribute: 'expr350',
          selector: '[expr350]',

          template: template(
            '<div class="input-field"><input expr351="expr351" id="email" type="email" class="validate"/><label for="email">Your e-mail</label><span class="helper-text">To get a new account, enter your e-mail address and we will send you instructions.</span></div><button expr352="expr352" class="btn waves-effect waves-light" type="submit" name="login" id="loginButton">Register\n         <i class="material-icons right">send</i></button>',
            [
              {
                redundantAttribute: 'expr351',
                selector: '[expr351]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onkeypress',
                    evaluate: _scope => _scope.doLogin
                  }
                ]
              },
              {
                redundantAttribute: 'expr352',
                selector: '[expr352]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.doLogin
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.messageSent,
          redundantAttribute: 'expr353',
          selector: '[expr353]',

          template: template(
            '<p>We have sent you an e-mail with instructions on how to create a new account.</p>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.errorMessage != '',
          redundantAttribute: 'expr354',
          selector: '[expr354]',

          template: template(
            '<div class="card red darken-2"><div class="card-content white-text"><p expr355="expr355"> </p></div></div>',
            [
              {
                redundantAttribute: 'expr355',
                selector: '[expr355]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.errorMessage
                  }
                ]
              }
            ]
          )
        }
      ]
    ),

    name: 'register'
  };

  var userprofile = {
    css: null,

    exports: {
      passMessage: '',
      apiMessage: '',
      skeuserMessage: '',
      skeapiMessage: '',
      siteconfig: {},

      onMounted() {
         if (Object.keys(this.props.siteconfig) == 0) {
            $.get(window.API_URL + "siteconfigread.json", (response) => {
               this.siteconfig = response;
               this.update();
            });
         } else {
            this.siteconfig = this.props.siteconfig;
            this.update();
         }
         M.updateTextFields();
      },

      doChangePass(event) {
         if ($('#password').val() != '') {
            $.post(window.API_URL + "changepwd.json", {password: $('#password').val()}, (response) => {
               if (response.success) {
                  this.passMessage = 'Password changed.';
                  this.update();
               } else {
                  this.passMessage = 'There was an error saving the password.';
                  this.update();
               }
            });
         }
      },

      doChangeUser(event) {
         if ($('#skeusername').val() != '') {
            $.post(window.API_URL + "changeskeusername.json", {ske_userName: $('#skeusername').val()}, (response) => {
               if (response.success) {
                  this.skeuserMessage = 'Username changed.';
                  this.update();
               } else {
                  this.skeuserMessage = 'There was an error saving the username.';
                  this.update();
               }
            });
         }
      },

      doChangeKey(event) {
         if ($('#skeapi').val() != '') {
            $.post(window.API_URL + "changeskeapi.json", {ske_apiKey: $('#skeapi').val()}, (response) => {
               if (response.success) {
                  this.skeapiMessage = 'API key changed.';
                  this.update();
               } else {
                  this.skeapiMessage = 'There was an error saving the API key.';
                  this.update();
               }
            });
         }
      },

      doNewKey(event) {
         var newkey = this.generateKey();
         $.post(window.API_URL + "changeoneclickapi.json", {apiKey: newkey}, (response) => {
            if (response.success) {
               this.apiMessage = 'API key changed.';
               this.props.userInfo.apiKey = newkey;
               this.update();
            } else {
               this.apiMessage = 'There was an error saving the API key.';
               this.update();
            }
         });
      },

      doDeleteKey(event) {
         $.post(window.API_URL + "changeoneclickapi.json", {apiKey: ""}, (response) => {
            if (response.success) {
               this.apiMessage = 'API key deleted.';
               this.props.userInfo.apiKey = "";
               this.update();
            } else {
               this.apiMessage = 'There was an error saving the API key.';
               this.update();
            }
         });
      },

      generateKey() {
         var alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
         var key="";
         while(key.length<32) {
            var i=Math.floor(Math.random() * alphabet.length);
            key+=alphabet[i];
         }
         return key;
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<h3>Account settings</h3><div class="row"><label>Sketch Engine login</label><div expr379="expr379"></div><div expr382="expr382"></div><div expr384="expr384"></div></div><div class="row"><label>Sketch Engine API key</label><p expr388="expr388"></p><p expr389="expr389"></p><div class="input-field" style="margin-top: 0;"><div style="display: flex; gap: 10px; align-items: center;"><input expr391="expr391" id="skeapi" type="text" class="validate" style="width: 350px;"/><button expr392="expr392" class="btn waves-effect waves-light" type="submit" style="margin-bottom: 10px;">Change API key\n               <i class="material-icons right">send</i></button></div><span class="helper-text">Set your API key for Sketch Engine.</span></div></div><div class="row"><p expr393="expr393"> </p><label>Lexonomy API key</label><div class="input-field" style="margin-top: 0;"><div style="display: flex; gap: 10px; align-items: center;"><input expr394="expr394" type="text" disabled style="width: 350px;"/><button expr395="expr395" class="btn waves-effect waves-light" type="submit" style="margin-bottom: 10px;">Generate new API key\n               <i class="material-icons right">autorenew</i></button><button expr396="expr396" class="btn waves-effect waves-light" type="submit" style="margin-bottom: 10px;">Remove API key\n               <i class="material-icons right">delete</i></button></div><span class="helper-text">This key allows external tools such as Sketch Engine to create a dictionary in your account and to populate it with pre-generated entries.</span></div></div><div class="row"><p expr397="expr397"> </p><label>New password</label><div class="input-field" style="margin-top: 0;"><div style="display: flex; gap: 10px; align-items: center;"><input id="password" type="password" class="validate" style="width: 350px;"/><button expr398="expr398" class="btn waves-effect waves-light" type="submit" style="margin-bottom: 10px;">Change password\n               <i class="material-icons right">send</i></button></div><span class="helper-text">Set your password to access Lexonomy.</span></div></div><div><a class="btn" href="#/" onclick="window.history.back()">Back</a></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.siteconfig.sketchengineLoginPage && _scope.props.userInfo.ske_username,
          redundantAttribute: 'expr379',
          selector: '[expr379]',

          template: template(
            '<p>Your Lexonomy account is linked to your Sketch Engine account <b expr380="expr380"> </b><br/><a expr381="expr381">Link to a different Sketch Engine account&nbsp;»</a></p>',
            [
              {
                redundantAttribute: 'expr380',
                selector: '[expr380]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.props.userInfo.ske_username
                  }
                ]
              },
              {
                redundantAttribute: 'expr381',
                selector: '[expr381]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'href',
                    evaluate: _scope => _scope.siteconfig.sketchengineLoginPage
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.siteconfig.sketchengineLoginPage && !_scope.props.userInfo.ske_username,
          redundantAttribute: 'expr382',
          selector: '[expr382]',

          template: template(
            '<p><strong>Sketch Engine login</strong></p><p><a expr383="expr383">Link Lexonomy to your Sketch Engine account&nbsp;»</a></p>',
            [
              {
                redundantAttribute: 'expr383',
                selector: '[expr383]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'href',
                    evaluate: _scope => _scope.siteconfig.sketchengineLoginPage
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.siteconfig.sketchengineLoginPage,
          redundantAttribute: 'expr384',
          selector: '[expr384]',

          template: template(
            '<p expr385="expr385"></p><div class="input-field" style="margin-top: 0;"><div style="display: flex; gap: 10px; align-items: center;"><input expr386="expr386" id="skeusername" type="text" class="validate" style="width: 350px;"/><button expr387="expr387" class="btn waves-effect waves-light" type="submit" style="margin-bottom: 10px;">Change username\n                  <i class="material-icons right">send</i></button></div><span class="helper-text">Set your login username to Sketch Engine.</span></div>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.skeuserMessage != '',
                redundantAttribute: 'expr385',
                selector: '[expr385]',

                template: template(
                  ' ',
                  [
                    {
                      expressions: [
                        {
                          type: expressionTypes.TEXT,
                          childNodeIndex: 0,
                          evaluate: _scope => _scope.skeuserMessage
                        }
                      ]
                    }
                  ]
                )
              },
              {
                redundantAttribute: 'expr386',
                selector: '[expr386]',

                expressions: [
                  {
                    type: expressionTypes.VALUE,
                    evaluate: _scope => _scope.props.userInfo.ske_username
                  }
                ]
              },
              {
                redundantAttribute: 'expr387',
                selector: '[expr387]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.doChangeUser
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.skeapiMessage != '',
          redundantAttribute: 'expr388',
          selector: '[expr388]',

          template: template(
            ' ',
            [
              {
                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.skeapiMessage
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => 'sketchengineLoginPage' in _scope.siteconfig && _scope.siteconfig.sketchengineLoginPage != "",
          redundantAttribute: 'expr389',
          selector: '[expr389]',

          template: template(
            '\n         Unless you need special setup, Please, <a expr390="expr390">login via Sketch Engine</a> to set API key automatically.\n      ',
            [
              {
                redundantAttribute: 'expr390',
                selector: '[expr390]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'href',
                    evaluate: _scope => _scope.siteconfig.sketchengineLoginPage
                  }
                ]
              }
            ]
          )
        },
        {
          redundantAttribute: 'expr391',
          selector: '[expr391]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.props.userInfo.ske_apiKey
            }
          ]
        },
        {
          redundantAttribute: 'expr392',
          selector: '[expr392]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.doChangeKey
            }
          ]
        },
        {
          redundantAttribute: 'expr393',
          selector: '[expr393]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.apiMessage
            }
          ]
        },
        {
          redundantAttribute: 'expr394',
          selector: '[expr394]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.props.userInfo.apiKey ? _scope.props.userInfo.apiKey : "not set"
            }
          ]
        },
        {
          redundantAttribute: 'expr395',
          selector: '[expr395]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.doNewKey
            }
          ]
        },
        {
          redundantAttribute: 'expr396',
          selector: '[expr396]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.doDeleteKey
            }
          ]
        },
        {
          redundantAttribute: 'expr397',
          selector: '[expr397]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.passMessage
            }
          ]
        },
        {
          redundantAttribute: 'expr398',
          selector: '[expr398]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.doChangePass
            }
          ]
        }
      ]
    ),

    name: 'userprofile'
  };

  var welcome = {
    css: `welcome ul li,[is="welcome"] ul li{padding-top: 1em;}`,
    exports: null,

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div class="welcome"><h5>Welcome to <strong>Lexonomy</strong>, a cloud-based, open-source platform for writing and publishing dictionaries.</h5><ul><li><a href="https://www.lexonomy.eu/docs/intro">Gentle introduction to Lexonomy</a><br/>A short and sweet guided tour of Lexonomy for beginners.</li><li><a href="docs/elex2017.pdf">Introducing Lexonomy: an open-source dictionary writing and publishing system&nbsp;<span class="pdf">PDF</span></a><br/>A conference paper offering a detailed review of Lexonomy\'s features.</li><li><a href="#/opendictionaries">Public dictionaries</a><br/>Have a look at publicly available dictionaries created with Lexonomy.</li></ul></div>',
      []
    ),

    name: 'welcome'
  };

  var user_consent = {
    css: null,

    exports: {
      siteconfig: {},

      onMounted() {
         if (Object.keys(this.props.siteconfig) == 0) {
            $.get("/siteconfigread.json", (response) => {
               this.siteconfig = response;
               this.update();
            });
         } else {
            this.siteconfig = this.props.siteconfig;
            this.update();
         }
      },

      doConsent() {
         this.props.accountOps('consent');
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div><div class="row"><div expr399="expr399" class="col"> </div></div><div class="row"><div class="col"><button expr400="expr400" class="btn waves-effect waves-light" type="submit"> <i class="material-icons right">check</i></button></div></div></div>',
      [
        {
          redundantAttribute: 'expr399',
          selector: '[expr399]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: _scope => [
                _scope.props.siteconfig.consent.terms
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr400',
          selector: '[expr400]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: _scope => [
                _scope.props.siteconfig.consent.confirm
              ].join(
                ''
              )
            },
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.doConsent
            }
          ]
        }
      ]
    ),

    name: 'user-consent'
  };

  register$1('api', api);
  register$1('dict-config-autonumber', dict_config_autonumber);
  register$1('dict-config-download', dict_config_download);
  register$1('dict-config-editing', dict_config_editing);
  register$1('dict-config-flagging', dict_config_flagging);
  register$1('dict-config-gapi', dict_config_gapi);
  register$1('dict-config-ident', dict_config_ident);
  register$1('dict-config-kontext', dict_config_kontext);
  register$1('dict-config-links', dict_config_links);
  register$1('dict-config-nav', dict_config_nav);
  register$1('dict-config-buttons', dict_config_buttons);
  register$1('dict-config-publico', dict_config_publico);
  register$1('dict-config-searchability', dict_config_searchability);
  register$1('dict-config-ske', dict_config_ske);
  register$1('dict-config-subbing', dict_config_subbing);
  register$1('dict-config', dict_config);
  register$1('dict-config-titling', dict_config_titling);
  register$1('dict-config-url', dict_config_url);
  register$1('dict-config-users', dict_config_users);
  register$1('dict-config-xema', dict_config_xema);
  register$1('dict-config-xema-element', dict_config_xema_element);
  register$1('dict-config-xema-attribute', dict_config_xema_attribute);
  register$1('dict-config-element-in-tree', dict_config_element_in_tree);
  register$1('dict-config-attribute-in-tree', dict_config_attribute_in_tree);
  register$1('dict-config-xemplate', dict_config_xemplate);
  register$1('dict-download', dict_download);
  register$1('dict-edit-entry', dict_edit_entry);
  register$1('dict-edit', dict_edit);
  register$1('dict-list', dict_list);
  register$1('dict-main', dict_main);
  register$1('dict-new', dict_new);
  register$1('dict-public-entry', dict_public_entry);
  register$1('dict-public', dict_public);
  register$1('dict-upload', dict_upload);
  register$1('e404', e404);
  register$1('entry-view', entry_view);
  register$1('footer', footer);
  register$1('forgot-password', forgot_password);
  register$1('forgot', forgot);
  register$1('header', header);
  register$1('list-headword', list_headword);
  register$1('login', login);
  register$1('main-page', main_page);
  register$1('main', App);
  register$1('open-dict-list', open_dict_list);
  register$1('register-password', register_password);
  register$1('register', register);
  register$1('userprofile', userprofile);
  register$1('welcome', welcome);
  register$1('user-consent', user_consent);

  component(App)(document.getElementById('root'));

})();
