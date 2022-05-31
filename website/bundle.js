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
   * Define a riot plugin
   * @param   {Function} plugin - function that will receive all the components created
   * @returns {Set} the set containing all the plugins installed
   */

  function install(plugin) {
    if (!isFunction(plugin)) panic('Plugins must be of type function');
    if (PLUGINS_SET.has(plugin)) panic('This plugin was already installed');
    PLUGINS_SET.add(plugin);
    return PLUGINS_SET;
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

  class StoreClass {
     constructor(){
        observable(this);

        this.data = {
           isSiteconfigLoading: false,
           isDictionaryListLoading: false,
           isDictionaryListLoaded: false,
           siteconfig: null,
           dictionaryList: [],
           isPublicDictionaryListLoaded: false,
           isPublicDictionaryListLoading: false,
           publicDictionaryList: null
        };

        this.resetDictionary();
     }

     getDictionary(dictId){
        return this.data.dictionaryList.find(d => d.id == dictId)
     }

     open(dictId, doctype, entryId, mode){
        this.changeDictionary(dictId);
        this.changeDoctype(doctype);
        entryId && this.changeEntryId(entryId);
        if(mode){
           this.data.mode = mode;
        }
     }

     changeDictionary(dictId){
        if(dictId != this.data.dictId){
           this.resetDictionary();
           this.data.dictId = dictId;
           window.dictId = dictId;  // global variable xema is used by some custom editors
           if(dictId){
              this.loadActualDictionary();
           } else {
              this.trigger("dictionaryChanged");
           }
        }
     }

     changeDoctype(doctype){
        if(this.data.isDictionaryLoading){
           this.one("dictionaryChanged", this.changeDoctype.bind(this, doctype));
        } else {
           doctype = doctype || this.data.doctypes[0];
           if(doctype != this.data.doctype){
              this.data.doctype = doctype;
              this.data.config.xema.root = doctype;
              this.trigger("doctypeChanged");
           }
        }
     }

     changeSearchParams(searchParams){
        if(this.data.isDictionaryLoading){
           this.one("dictionaryChanged", this.changeSearchParams.bind(this, searchParams));
        } else {
           let searchtext = searchParams.searchtext || "";
           let modifier = searchParams.modifier || "start";
           if(searchtext !== this.data.searchtext || modifier !== this.data.modifier){
              this.data.searchtext = searchtext;
              this.data.modifier = modifier;
              this.loadEntryList();
           }
        }
     }

     changeEntryId(entryId){
        if(this.data.isDictionaryLoading){
           this.one("dictionaryChanged", this.changeEntryId.bind(this, entryId));
        } else {
           if(entryId != this.data.entryId){
              this.data.entryId = entryId;
              this.trigger("entryIdChanged");
           }
        }
     }

     searchEntryList(){
        this.loadEntryList();
        url.setQuery(this.data.searchtext ? {
           s: this.data.searchtext,
           m: this.data.modifier
        } : {}, true);
     }

     setEntryFlag(entryId, flag){
        let entry = this.data.entryList.find(e => e.id == entryId);
        entry.isSaving = true;
        this.trigger("entryListChanged", entryId);
        return $.ajax({
           url: `${window.API_URL}${this.data.dictId}/entryflag.json`,
           method: 'POST',
           data: {
              id: entryId,
              flag: flag
           }
        })
              .done(function(flag, response) {
                 if(response.success){
                    entry.flag = flag;
                 }
              }.bind(this, flag))
              .fail(response => {
                    M.toast({html: "Flag was not saved."});
              })
              .always(response => {
                 delete entry.isSaving;
                 this.trigger("entryListChanged", entryId);
              })
     }

     getFlag(flagName){
        if(flagName){
           return this.data.config.flagging.flags.find(f => f.name == flagName)
        }
        return null
     }

     getFlagLabel(flagName){
        let flag = this.getFlag(flagName);
        return flag ? flag.label : ""
     }

     getFlagColor(flagName){
        let flag = this.getFlag(flagName);
        return flag ? flag.color : ""
     }

     getFlagTextColor(flagColor){
        let tmp = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(flagColor);
        if(tmp){
           let red = parseInt(tmp[1], 16);
           let green = parseInt(tmp[2], 16);
           let blue = parseInt(tmp[3], 16);
           return (red * 0.299 + green * 0.587 + blue * 0.114) > 186 ? "#000000" : "#ffffff"
        }
        return "#000000"
     }

     resetDictionary(){
        Object.assign(this.data, {
           isDictionaryLoading: false,
           isDictionaryLoaded: false,
           isEntryListLoading: false,
           isEntryListLoaded: false,
           isEntryLoading: false,
           isEntryLoaded: false,
           isDictionaryExamplesLoading: false,
           config: null,
           doctype: null,
           doctypes: null,
           entryList: null,
           entry: null,
           dictId: null,
           entryId: null,
           searchtext: '',
           modifier: 'start',
           mode: 'view',
           userAccess: {
              canEdit: false,
              canConfig: false,
              canUpload: false,
              canDownload: false
           },
           dictionaryExamples: null,
           dictionaryExamplesHasMore: null
        });
     }

     loadSiteconfig(){
        this.data.isSiteconfigLoading = true;
        return $.ajax({url: `${window.API_URL}siteconfigread.json`})
              .done(response => {
                 this.data.siteconfig = response;
                 //this.trigger("siteconfigChanged")
              })
              .fail(response => {
                 M.toast({html: "Could not load app configuration."});
              })
              .always(response => {
                 this.data.isSiteconfigLoading = false;
              })
     }

     loadDictionaryList(){
        this.data.isDictionaryListLoading = true;
        this.trigger("dictionaryListLoadingChanged");
        return $.ajax(`${window.API_URL}userdicts.json`)
              .done(response => {
                 this.data.dictionaryList = response.dicts || [];
                 this.data.isDictionaryListLoaded = true;
                 this.trigger("dictionaryListChanged");
              })
              .fail(response => {
                 M.toast({html: "Dictionary list could not be loaded."});
              })
              .always(response => {
                 this.data.isDictionaryListLoading = false;
                 this.trigger("dictionaryListLoadingChanged");
              })
     }

     loadPublicDictionaryList(){
        this.data.isPublicDictionaryListLoading = true;
        this.trigger("isPublicDictionaryListLoadingChanged");
        return $.ajax(`${window.API_URL}publicdicts.json`)
              .done(response => {
                 this.data.isPublicDictionaryListLoaded = true;
                 this.data.publicDictionaryList = response.entries || [];
                 this.data.publicDictionaryLanguageList = [...new Set(this.data.publicDictionaryList.map(d => d.lang))].filter(l => !!l);
              })
              .fail(response => {
                 M.toast({html: "Dictionary list could not be loaded."});
              })
              .always(response => {
                 this.data.isPublicDictionaryListLoading = false;
                 this.trigger("isPublicDictionaryListLoadingChanged");
              })
     }

     loadActualDictionary(){
        if(!this.data.dictId || this.data.isDictionaryLoading){
           return
        }
        this.data.isDictionaryLoading = true;
        this.data.isDictionaryLoaded = false;
        this.trigger("isDictionaryLoadingChanged");
        this.loadDictionary(this.data.dictId)
              .done(response => {
                 if(response.success){
                    Object.assign(this.data, {
                          config: response.configs,
                          userAccess: response.userAccess,
                          xemaOverride: false,
                          xemplateOverride: false,
                          editingOverride: false,
                          userAccess: response.userAccess,
                          dictConfigs: response.configs,
                          doctype: response.doctype,
                          doctypes: response.doctypes
                       },
                       response.publicInfo
                    );
                    window.xema = this.data.config.xema;  // global variable xema is used by some custom editors
                    this.data.isDictionaryLoaded = true;
                    this.data.isDictionaryLoading = false;
                    this.trigger("dictionaryChanged");
                    this.loadEntryList();
                 } else {
                    this.data.isDictionaryLoading = false;
                    route("#/");
                 }
              })
              .fail(response => {
                 this.data.isDictionaryLoading = false;
                 route("#/");
              })
              .always(response => {
                 this.trigger("isDictionaryLoadingChanged");
              });
     }

     loadDictionary(dictId){
        return $.ajax(`${window.API_URL}${dictId}/config.json`)
              .done(response => {
                 !response.success && M.toast({html: `Could not load ${dictId} dictionary.`});
              })
              .fail(function(response) {
                 M.toast({html: `Could not load ${dictId} dictionary.`});
              }.bind(this, dictId))
     }

     loadEntryList(howmany){
        let authorized = window.auth.data.authorized;
        if(!this.data.dictId || (authorized && !this.data.doctype)){
           return
        }
        this.data.isEntryListLoading = true;
        this.trigger("entryListLoadingChanged");
        let url;
        let data = {
           searchtext: this.data.searchtext,
           modifier: this.data.modifier,
           howmany: howmany ? howmany : (this.data.dictConfigs.titling.numberEntries || 1000)
        };
        if(authorized){
           url = `${window.API_URL}${this.data.dictId}/${this.data.doctype}/entrylist.json`;
        } else {
           url = `${window.API_URL}${this.data.dictId}/search.json`;
        }
        return $.ajax({
           url: url,
           method: "POST",
           data: data
        })
              .done(response => {
                 this.data.entryList = response.entries;
                 this.data.entryCount = response.total;
                 this.data.isEntryListLoaded = true;
                 this.trigger("entryListChanged");
              })
              .fail(response => {
                 M.toast({html: "Entry list could not be loaded."});
              })
              .always(response => {
                 this.data.isEntryListLoading = false;
                 this.trigger("entryListLoadingChanged");
              })
     }

     loadEntry(){
        if(!this.data.entryId){
           return
        }
        this.data.isEntryLoading = true;
        this.trigger("isEntryLoadingChanged");
        return $.ajax({
           url: `${window.API_URL}${this.data.dictId}/entryread.json`,
           method: "POST",
           data: {
              id: this.data.entryId
           }
        })
              .done(response => {
                 this.data.entry = response;
                 this.data.isEntryLoaded = true;
                 this.trigger("entryChanged");
              })
              .fail(response => {
                 M.toast({html: "Entry could not be loaded."});
              })
              .always(() => {
                 this.data.isEntryLoading = false;
                 this.trigger("isEntryLoadingChanged");
              })
     }

     loadDictionaryLinks(){
        return $.ajax({
           url: `${window.API_URL}${this.data.dictId}/links.json`
        })
              .fail(response => {
                 M.toast({html: "Dictionary links could not be loaded."});
              })
     }

     loadDictionaryConfig(configId){
        return $.ajax({
           url: `${window.API_URL}${this.data.dictId}/configread.json`,
           method: "POST",
           data: {
              id: configId
           }
        })
              .done(response => {
              })
              .fail(response => {
                 M.toast({html: `Could not load the data ('${configId}'): ${response.statusText}`});
              })
              .always(response => {

              })
     }

     updateDictionaryConfig(configId, data){
        return $.ajax({
           url: `${window.API_URL}${this.data.dictId}/configupdate.json`,
           method: 'POST',
           data: {
              id: configId,
              content: JSON.stringify(data)
           }
        })
              .done(response => {
                 this.loadActualDictionary();
                 M.toast({html: "Saved"});
              })
              .fail(response => {
                 M.toast({html: `Could not save the data ('${configId}'): ${response.statusText}`});
              })
              .always(response => {})
     }

     createDictionary(data){
        return $.ajax({
           url: `${window.API_URL}make.json`,
           method: 'POST',
           data: data
        })
              .done(response => {
                 if (response.success) {
                    this.loadDictionaryList();
                 }
              })
              .fail(response => {
                 M.toast({html: "Could not create dictionary."});
              })
              .always(repsonse => {

              })
     }

     cloneDictionary(dictId){
        return $.ajax({
           url: `${window.API_URL}${dictId}/clone.json`,
           method: 'POST'
        })
              .done(response => {
                 this.data.dictionaryList = response.dicts;
                 M.toast({html: "Dictionary was cloned."});
                 this.trigger("dictionaryListChanged");
                 this.changeDictionary(response.dictID);
                 this.one("dictionaryChanged", () => {
                    route(response.dictID);
                 });
              })
              .fail(response => {
                 M.toast({html: "Dictionary clone creation failed."});
              })
              .always(repsonse => {
              })
     }

     deleteDictionary(dictId){
        return $.ajax({
           url: `${window.API_URL}${dictId}/destroy.json`,
           method: 'POST'
        })
              .done(response => {
                 this.data.dictionaryList = response.dicts;
                 M.toast({html: "Dictionary was deleted."});
                 this.trigger("dictionaryListChanged");
              })
              .fail(response => {
                 M.toast({html: "Dictionary clone creation failed."});
              })
              .always(repsonse => {

              })
     }

     uploadXML(data){
        return $.ajax({
              url: `${window.API_URL}${this.data.dictId}/upload.html`,
              method: 'POST',
              data: data,
              processData: false,
              contentType: false
           })
     }

     importXML(data){
        return $.ajax({
           url: `${window.API_URL}${this.data.dictId}/import.json`,
           data: data
        })
              .done(response => {
                 if(response.finished){
                    this.loadDictionaryList();
                    this.loadEntryList();
                 }
              })
     }

     reloadDictionaryExamples(){
        if(!this.data.dictId || this.data.isDictionaryExamplesLoading){
           return
        }
        this.data.isDictionaryExamplesLoading = true;
        this.trigger("isDictionaryExamplesLoading");
        return $.ajax({
           url: `${window.API_URL}${this.data.dictId}/random.json`,
           method: 'POST'
        })
              .done(response => {
                 this.data.dictionaryExamples = response.entries;
                 this.data.dictionaryExamplesHasMore = response.more;
                 this.trigger("dictionaryExamplesChanged");
              })
              .fail(response => {
                 M.toast({html: "Could not load the examples."});
              })
              .always(response => {
                 this.data.isDictionaryExamplesLoading = false;
                 this.trigger("isDictionaryExamplesLoading");
              })
     }

     loadCorpora(){
        return $.ajax({
           url: `${window.API_URL}skeget/corpora`
        })
              .fail(response => {
                 M.toast({html: "Could not load Sketch Engine corpora."});
              })
     }

     loadKontextCorpora(){
        return $.ajax({
           url: `${window.API_URL}kontext/corpora`
        })
              .fail(response => {
                 M.toast({html: "Could not load Kontext corpora."});
              })
     }

     suggestUrl(){
        return $.ajax({
           url: `${window.API_URL}makesuggest.json`
        })
              .fail(response => {
                 M.toast({html: "Could not generate URL of the new dictionary."});
              })
     }

     autoAddImages(addElem, addNumber){
        return $.ajax({
           url: `${window.API_URL}${this.data.dictId}/autoimage.json`,
           method: 'POST',
           data: {
              "addElem": addElem,
              "addNumber": addNumber
           }
        })
              .fail(response => {
                 M.toast({html: "Could not automatically add images."});
              })
     }

     autoAddImagesGetProgress(jobId){
        return $.ajax({
           url: `${window.API_URL}${this.data.dictId}/autoimageprogress.json`,
           data: {jobId: jobId}
        })
              .fail(response => {
                 M.toast({html: "Could not check image generation progress."});
              })

     }

     startLinking(otherDictID){
        return $.ajax({
           url: `${window.API_URL}${this.data.dictId}/linknaisc.json`,
           data: {otherdictID: otherDictID}
        })
              .fail(response => {
                 M.toast({html: "Could not initiate linking process."});
              })
     }

     linkingCheckIfRunning(){
        return $.ajax({
           url: `${window.API_URL}${this.data.dictId}/linking.json`
        })
              .fail(response => {
                 M.toast({html: "Could not check linking process."});
              })
     }

     linkingGetProgress(otherDictID, jobID){
        return $.ajax({
           url: `${window.API_URL}${this.data.dictId}/naiscprogress.json`,
           data: {
              otherdictID: otherDictID,
              jobid: jobID
           }
        })
              .fail(response => {
                 M.toast({html: "Could not check the linking progress."});
              })
     }

     autonumberElements(countElem, storeElem){
        return $.ajax({
           url: `${window.API_URL}${this.data.dictId}/autonumber.json`,
           method: 'POST',
           data: {
              "countElem": countElem,
              "storeElem": storeElem
           }
        })
              .fail(response => {
                 M.toast({html: "Autonumbering failed."});
              })
     }
  }

  window.store = new StoreClass();

  class AuthClass {
     constructor(){
        observable(this);

        this.data = {
           authorized: false
        };
        this.resetUser();
     }

     resetUser(){
        Object.assign(this.data, {
           username: null,
           apiKey: null,
           consent: null,
           email: null,
           sessionkey: null,
           ske_apiKey: null,
           ske_username: null
        });
     }

     checkAuthCookie(){
        if (!this.data.username) {
           this.data.isCheckingAuth = true;
           this.trigger("checkingAuthChanged");
           return $.ajax({
              url: `${window.API_URL}login.json`,
              method: 'POST'
           })
                 .done(response => {
                    if (response.success) {
                       Object.assign(this.data, response, {username: response.email});
                       this.data.authorized = true;
                       this.trigger("authChanged");
                    }
                 })
                 .fail(response => {})
                 .always(() => {
                    this.data.isCheckingAuth = false;
                    this.trigger("checkingAuthChanged");
                 })
        }
     }

     login(email, password){
        this.data.isCheckingAuth = true;
        this.trigger("checkingAuthChanged");
        return $.ajax({
              url: `${window.API_URL}login.json`,
              method: 'POST',
              data: {
                 email: email,
                 password: password
              }
           })
                 .done(response => {
                    if (response.success) {
                       Object.assign(this.data, response, {username: response.email});
                       this.data.authorized = true;
                       this.trigger("authChanged");
                    }
                 })
                 .fail(response => {})
                 .always(() => {
                    this.data.isCheckingAuth = false;
                    this.trigger("checkingAuthChanged");
                 })
     }

     register(email){
        return $.ajax({
              url: `${window.API_URL}signup.json`,
              method: 'POST',
              data: {
                 email: email
              }
           })
                 .done(response => {
                    this.trigger("registrationComplete", {error: response.success ? "" : "Incorrect e-mail."});
                 })
                 .fail(response => {
                    this.trigger("registrationComplete", {error: "Incorrect e-mail."});
                 })
                 .always(response => {
                 })
     }

     registerPassword(token, password){
        return $.ajax({
              url: `${window.API_URL}createaccount.json`,
              method: 'POST',
              data: {
                 token: token,
                 password: password
              }
           })
                 .done(response => {
                    this.trigger("registerPasswordComplete", {error: response.success ? "" : "Error while creating account."});
                 })
                 .fail(response => {
                    this.trigger("registerPasswordComplete", {error: "Error while creating account."});
                 })
                 .always(response => {
                 })
     }

     requestResetPassword(email){
        return $.ajax({
              url: `${window.API_URL}forgotpwd.json`,
              method: 'POST',
              data: {
                 email: email
              }
           })
     }

     resetPassword(token, password){
        return $.ajax({
              url: `${window.API_URL}recoverpwd.json`,
              method: 'POST',
              data: {
                 token: token,
                 password: password
              }
           })
                 .done(response => {
                    this.trigger("passwordResetComplete", {error: response.success ? "" : "Error while accessing account."});
                 })
                 .fail(response => {
                    this.trigger("passwordResetComplete", {error: "Error while accessing account."});
                 })
                 .always(response => {
                 })
     }

     verifyToken(token, type){
        return $.ajax({
              url: `${window.API_URL}verifytoken.json`,
              method: 'POST',
              data: {
                 token: token,
                 type: type
              }
           })
     }

     consent(){
        this.data.isCheckingAuth = true;
        this.trigger("checkingAuthChanged");
        return $.ajax({
           url: `${window.API_URL}consent.json`,
           method: 'POST',
           data: {
              consent: 1
           }
        })
              .done(response => {
                 this.data.consent = true;
                 this.trigger("authChanged");
              })
              .fail(response => {
                 M.toast("Could not save the consent.");
              })
              .always(response => {
                 this.data.isCheckingAuth = false;
                 this.trigger("checkingAuthChanged");
              })
     }

     logout(){
        this.data.isCheckingAuth = true;
        this.trigger("checkingAuthChanged");
        return $.ajax({
           url: `${window.API_URL}logout.json`,
           method: 'POST'
        })
              .done(() => {
                 this.data.authorized = false;
                 this.resetUser();
                 this.trigger("authChanged");
              })
              .fail(response => {
                 M.toast({html: "Could not log out."});
              })
              .always(() => {
                 this.data.isCheckingAuth = false;
                 this.trigger("checkingAuthChanged");
              })
     }

     _getCookie(val) {
        if (document.cookie != undefined) {
           if (document.cookie.split('; ').find(row => row.startsWith(val+'=')) != undefined) {
              return document.cookie.split('; ').find(row => row.startsWith(val+'=')).split('=')[1].slice(1,-1)
           }
        }
        return ""
     }
  }

  window.auth = new AuthClass();

  install(function(component) {
     component.store = window.store;
     component.dictData = window.store.data;
     component.auth = window.auth;
     component.authData = window.auth.data;

     if(component.bindings){
        component.boundFunctions = {};
        let oldOnMounted = component.onMounted;
        let oldOnBeforeUnmount = component.onBeforeUnmount;
        let boundFunction;
        component.onMounted = () => {
           oldOnMounted.apply(component);
           component.bindings.forEach(b => {
              boundFunction = component[b[2]].bind(component);
              component[b[0]].on(b[1], boundFunction);
              component.boundFunctions[`${b[1]}_${b[2]}`] = boundFunction;
           });
        };
        component.onBeforeUnmount = () => {
           component.bindings.forEach(b => {
              component[b[0]].off(b[1], component.boundFunctions[`${b[1]}_${b[2]}`]);
           });
           oldOnBeforeUnmount.apply(component);
        };
     }
     return component
  });

  class AppUpdaterClass {

      constructor(params){
          this.URL = params.url;
          this.CHECK_INTERVAL = (params.interval || 24) * 60 * 60 * 1000;
          this.onNewVersion = params.onNewVersion;
          this._intervalHandle = null;
          this.windowVersionKey = params.windowVersionKey || "version";
          if(window[this.windowVersionKey] != "@VERSION@"){
              this.startTimer();
          }
      }

      startTimer(){
          this._intervalHandle = setInterval(this.loadVersion.bind(this), this.CHECK_INTERVAL);
      }

      stopTimer(){
          clearInterval(this._intervalHandle);
          this._intervalHandle = null;
      }

      loadVersion(){
          let random = (Math.random(1000000) + "").substr(2);
          $.ajax({
              url: `${this.URL}?${random}`
          })
                  .done(this.onData.bind(this));
      }

      onData(actualVersion){
          if(typeof actualVersion != "string") {
              return
          }
          if((window[this.windowVersionKey] + "").trim() != actualVersion.trim()){
              this.stopTimer();
              if(typeof this.onNewVersion == "function"){
                  this.onNewVersion();
              } else {
                  this.showNotification();
              }
          }
      }

      showNotification(){
          $(`<div class="newVersionNotification"
                    style="position: fixed; top: 0; left: 0; right: 0; z-index: 99999; padding: 20px; text-align: center; background-color: #fff; box-shadow: 0 3px 3px 0 rgb(0 0 0 / 14%), 0 1px 7px 0 rgb(0 0 0 / 12%), 0 3px 1px -1px rgb(0 0 0 / 20%);">
            <div class="newVersionNotificationTitle" style="font-size: 1.8rem; margin-bottom: 1rem;">New version available!</div>
            <div class="newVersionNotificationDesc">Please, reload the page to use the latest version.
                <button id="reloadPageButton" class="newVersionNotificationButton btn" style="margin-left: 1.5rem">
                    reload
                </button>
            </div>
        </div>`).appendTo($("body"));

          $("body").css("margin-top", $(".newVersionNotification").outerHeight() + "px");
          $("#reloadPageButton").click( () => {
              window.location.reload();
          });
      }
  }

  window.AppUpdaterClass = AppUpdaterClass;

  class UrlClass {
     constructor(){
     }

     setQuery(query, addToHistory){
        let parts = window.location.href.split(/\?(.*)/s);
        let queryStr = this.stringifyQuery(query);
        let url = `${parts[0]}${queryStr}`;

        if(addToHistory){
            history.pushState(null, null, url);
            route.base(); // need to update route's "current" value in
                         //order to browser back button works correctly
        } else {
            history.replaceState(null, null, url);
        }
     }

     stringifyQuery(query){
        let str = "";
        let value;
        let urlValue;

        for(let key in query){
           value = query[key];
           urlValue = (typeof value == "boolean") ? (value * 1) : value;
           if(key){
              str += (str ? "&" : "") + key + "=" + encodeURIComponent(urlValue);
           }
        }

        return str ? ("?" + str) : ""
     }

     /*parseQuery(str){
          let query = {}
          if(str && str.indexOf("=") != -1){
              str.split('&').forEach(part => {
                  let pair = part.split('=')
                  query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1])
              })
          }
          return query
      }*/

  }

  window.url = new UrlClass();

  window.Screenful={
    createEnvelope: function(scrollable){
      //if($("#footer").length>0) $("#footer").before(html); else $("body").append(html);
      //$("#statusbar .alertmessage .closeIcon").on("click", function () { $("#statusbar .alertmessage").hide(); });
      //Screenful.resize();
      //$(window).on("resize", Screenful.resize);
      //$("body").append("<div id='curtain' style='display: none'></div>")
    },
    resize: function(){
      var headerHeight=$("#header").outerHeight() | 0;
      var footerHeight=$("#footer").outerHeight() | 0;
      var statusbarHeight=$("#statusbar").outerHeight() | 0;
      $("#statusbar").css("bottom", (footerHeight)+"px");
      $("#envelope").css("top", headerHeight+"px");
      $("#envelope").css("bottom", (footerHeight+statusbarHeight+2)+"px");
    },
    status: function(str, style){
      if(window.parent!=window && window.parent.Screenful) window.parent.Screenful.status(str, style);
      else {
        if(style==="alert") {
          $("#statusbar .alertmessage .text").html(str);
          $("#statusbar .alertmessage").show();
        } else {
          if(style=="wait") str="<span class='wait'></span>"+str;
          if(style=="warn") str="<span class='warn'></span>"+str;
          $("#statusbar .statusmessage").html(str);
        }
      }
    },

    wycLastID: 0,
    wycCache: {},
    wyc: function(url, callback){ //a "when-you-can" function for delayed rendering: gets json from url, passes it to callback, and delayed-returns html-as-string from callback
    	Xonomy.wycLastID++;
    	var wycID="screenful_wyc_"+Xonomy.wycLastID;
    	if(Xonomy.wycCache[url]) return callback(Xonomy.wycCache[url]);
    	$.ajax({url: url, dataType: "json", method: "POST"}).done(function(data){
    			$("#"+wycID).replaceWith(callback(data));
    			Xonomy.wycCache[url]=data;
    	});
    	return "<span class='wyc' id='"+wycID+"'></span>";
    },

    formatXml: function(xml) { //stolen from https://gist.github.com/sente/1083506
        var formatted = '';
        var reg = /(>)(<)(\/*)/g;
        xml = xml.replace(reg, '$1\r\n$2$3');
        var pad = 0;
        jQuery.each(xml.split('\r\n'), function(index, node) {
            var indent = 0;
            if (node.match( /.+<\/\w[^>]*>$/ )) {
                indent = 0;
            } else if (node.match( /^<\/\w/ )) {
                if (pad != 0) {
                    pad -= 1;
                }
            } else if (node.match( /^<\w[^>]*[^\/]>.*$/ )) {
                indent = 1;
            } else {
                indent = 0;
            }

            var padding = '';
            for (var i = 0; i < pad; i++) {
                padding += '  ';
            }

            formatted += padding + node + '\r\n';
            pad += indent;
        });

        return formatted;
    },
    cleanupXml: function(xml){
      return xml.trim().replace(/\>[\r\n]+\s*\</g, "><");
    },
    isWellFormedXml: function(xml){
      var doc=null;
      try{doc=$.parseXML(xml);} catch(e){}
      if(doc) return true;
      return false;
    },
    isWellFormedJson: function(json){
      var obj=null;
      try{obj=JSON.parse(json);} catch(e){}
      if(obj) return true;
      return false;
    },
    formatJson: function(json){
      if(typeof(json)=="string") json=JSON.parse(json);
      return JSON.stringify(json, null, "  ");
    },
  };

  Screenful.Editor={
    start: function(){
      Screenful.createEnvelope();
      //$("#envelope").html("<div id='toolbar'></div><div id='container' class='empty'></div><div id='waiter' style='display: none'></div><div id='history' style='display: none'></div>");
      if(Screenful.Editor.historyUrl) $("#history").html("<iframe name='historyframe' frameborder='0' scrolling='auto' src='"+Screenful.Editor.historyUrl+"'/>");
      Screenful.Editor.populateToolbar();
      Screenful.status(Screenful.Loc.ready);
      Screenful.Editor.updateToolbar();
      if(Screenful.Editor.entryID) Screenful.Editor.open(null, Screenful.Editor.entryID);

      //keyboard nav:
      $(document).on("keydown", function(e){
        //console.log(e.which, e.ctrlKey, e.metaKey, e.altKey, e.altGraphKey, e.shiftKey);
        if(e.which==37 && e.altKey){ //arrow left key
          if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Navigator) {
            e.preventDefault();
            e.stopImmediatePropagation();
            window.parent.Screenful.Navigator.focusEntryList();
          }
        }
        if(e.which==84 && (e.ctrlKey||e.metaKey) && e.shiftKey){ //T key
          if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Navigator) {
            e.preventDefault();
            e.stopImmediatePropagation();
            window.parent.$("#searchbox").focus();
          }
        }
        if(e.which==69 && (e.ctrlKey||e.metaKey) && e.shiftKey){ //E key
          e.preventDefault();
          e.stopImmediatePropagation();
          $("#butEdit:visible").click();
          $("#butView:visible").click();
        }
        if(e.which==83 && (e.ctrlKey||e.metaKey) && e.shiftKey){ //S key
          e.preventDefault();
          e.stopImmediatePropagation();
          $("#butSave:visible").click();
        }
        if(e.which==78 && (e.ctrlKey||e.metaKey) && e.shiftKey){ //N key
          e.preventDefault();
          e.stopImmediatePropagation();
          $("#butNew:visible").click();
        }
      });

      $(document).on("click", function(e){
        if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.User){
          window.parent.$(".menu:visible").slideUp();
        }
      });

    },
    populateToolbar: function(){
      var $toolbar=$("#toolbar");
      $toolbar.empty();
      //$("<button id='butLink' class='iconOnly' title='"+Screenful.Loc.link+"'>&nbsp;</button>").appendTo($toolbar).on("click", Screenful.Editor.showLink);
      $("<span id='errorMessage' style='display: none;'></span>").appendTo($toolbar);
      if(!Screenful.Editor.singleton) {
        if(Screenful.Editor.createUrl) {
      		$("<button id='butNew' title='Ctrl + Shift + N' class='btn btn-secondary'>"+Screenful.Loc.new+"<i class='material-icons right'>add<i></button></button>").appendTo($toolbar).on("click", Screenful.Editor.new);
      		$("<span class='divider'></span>").appendTo($toolbar);
        }
        //$("<span id='idlabel'>ID</span>").appendTo($toolbar);
        $("<span style='line-height: 30px;'>ID</span>").appendTo($toolbar);
    		$("<input id='idbox' type='text' style='width: 4.4rem; height:1.8rem;'/>").appendTo($toolbar).on("keyup", function(event){
    			if(event.which==27) $("#idbox").val(Screenful.Editor.entryID);
    			if(event.which==13) {
            Screenful.Editor.open(event);
            Screenful.Editor.onEntryIdChange($("#idbox").val());
          }      }).on("keydown", function(e){if(!e.altKey)e.stopPropagation();});  		$("<button id='butOpen' class='btn btn-secondary'><i class='material-icons'>send</i></button>").appendTo($toolbar).on("click", Screenful.Editor.open);
    		$("<span class='divider'></span>").appendTo($toolbar);
    	}
      $("<button id='butSave' title='Ctrl + Shift + S' class='btn btn-secondary'>"+Screenful.Loc.save+"<span class='star' style='display: none'>*</span><i class='material-icons right'>save<i></button>").appendTo($toolbar).on("click", Screenful.Editor.save);
      if(Screenful.Editor.viewer) {
    		$("<button id='butEdit' title='Ctrl + Shift + E' class='btn btn-secondary'>"+Screenful.Loc.edit+"<i class='material-icons right'>edit<i></button>").appendTo($toolbar).on("click", Screenful.Editor.edit);
    		$("<button id='butView' title='Ctrl + Shift + E' class='btn btn-secondary'>"+Screenful.Loc.cancel+"<i class='material-icons right'>cancel<i></button>").appendTo($toolbar).on("click", Screenful.Editor.view);
    	}
      if(!Screenful.Editor.singleton) $("<button id='butNonew' class='btn btn-secondary'>"+Screenful.Loc.cancel+"</button>").appendTo($toolbar).on("click", Screenful.Editor.nonew);
      if(Screenful.Editor.leaveUrl) $("<button id='butLeave' class='btn btn-secondary'>"+Screenful.Loc.cancel+"</button>").appendTo($toolbar).on("click", function(){window.location=Screenful.Editor.leaveUrl;});
      if(!Screenful.Editor.singleton) {
        if(Screenful.Editor.createUrl) {
      		$("<button id='butClone' class='btn btn-secondary'>"+Screenful.Loc.clone+"<i class='material-icons right'>content_copy<i></button>").appendTo($toolbar).on("click", Screenful.Editor.clone);
        }
      }
      if(!Screenful.Editor.singleton && Screenful.Editor.deleteUrl) {
        $("<button id='butDelete' class='btn btn-secondary'>"+Screenful.Loc.delete+"<i class='material-icons right'>delete<i></button>").appendTo($toolbar).on("click", Screenful.Editor.delete);
      }
      if(Screenful.Editor.allowAutosave) {
        $("<label id='labAutosave'><input type='checkbox' "+(Screenful.Editor.autosaveOn?"checked":"")+" id='chkAutosave'/> "+Screenful.Loc.autosave+"</label>").appendTo($toolbar);
      }
      if(Screenful.Editor.toolbarLinks){
        for(var i=0; i<Screenful.Editor.toolbarLinks.length; i++){
          var link=Screenful.Editor.toolbarLinks[i];
          $("<a class='iconYes' style='background-image: url("+link.image+")' href='"+link.href+"'>"+link.caption+"</a>").appendTo($toolbar);
        }
      }
      $("<div style='margin-left:auto'></div>").appendTo($toolbar);
      if(Screenful.Editor.allowSourceCode) $("<button id='butSourceCode' class='btn btn-secondary right' title='"+Screenful.Loc.sourceCode+"'><i class='material-icons'>code<i></button>").appendTo($toolbar).on("click", Screenful.Editor.sourceCode);
      if(Screenful.History) $("<button id='butHistory' class='btn btn-flat right' title='"+Screenful.Loc.history+"'><i class='material-icons'>history<i></button>").appendTo($toolbar).on("click", Screenful.Editor.history);
    },
    entryID: null,
    updateToolbar: function(){
      $("#butHistory").addClass("btn-flat");
      $("#butSourceCode").addClass("btn-flat");
      if($("#container").hasClass("withHistory")) { //the history pane is open
        $("#butEdit").hide();
        $("#butView").hide();
        $("#butNonew").hide();
        $("#butSave").hide(); $("#butSave .star").hide();
        $("#labAutosave").hide();
        $("#butDelete").hide();
        $("#butSourceCode").hide();
        $("#butClone").hide();
        $("#butHistory").removeClass("btn-flat").show();
      } else if($("#container").hasClass("withSourceCode")) { //the source code editor is open
        $("#butEdit").hide();
        $("#butView").hide();
        $("#butNonew").hide();
        $("#butSave").hide(); $("#butSave .star").hide();
        $("#labAutosave").hide();
        $("#butDelete").hide();
        if(Screenful.Editor.entryID) $("#butHistory").show(); else $("#butHistory").hide();
        $("#butClone").hide();
        $("#butSourceCode").removeClass("btn-flat").show();
      } else if($("#container").hasClass("empty")) { //we have nothing open
        $("#butEdit").hide();
        $("#butView").hide();
        $("#butNonew").hide();
        $("#butSave").hide(); $("#butSave .star").hide();
        $("#labAutosave").hide();
        $("#butDelete").hide();
        $("#butSourceCode").hide();
        $("#butClone").hide();
        if($("#idbox").val()) $("#butHistory").show(); else $("#butHistory").hide();
      } else if(!Screenful.Editor.entryID){ //we have a new entry open
        $("#butEdit").hide();
        $("#butView").hide();
        $("#butNonew").show();
        $("#butSave").show(); $("#butSave .star").hide();
        $("#labAutosave").show();
        $("#butDelete").hide();
        $("#butClone").hide();
        $("#butSourceCode").show();
        $("#butHistory").hide();
      } else if(Screenful.Editor.entryID && $("#viewer").length>0){ //we have an existing entry open for viewing
        $("#butEdit").show();
        $("#butView").hide();
        $("#butNonew").hide();
        $("#butSave").hide(); $("#butSave .star").hide();
        $("#labAutosave").hide();
        $("#butDelete").show();
        $("#butSourceCode").hide();
        $("#butClone").show();
        $("#butHistory").show();
      } else if(Screenful.Editor.entryID && $("#editor").length>0){ //we have an existing entry open for editing
        $("#butEdit").hide();
        $("#butView").show();
        $("#butNonew").hide();
        $("#butSave").show(); $("#butSave .star").hide();
        $("#labAutosave").show();
        $("#butDelete").show();
        $("#butSourceCode").show();
        $("#butClone").show();
        $("#butHistory").show();
      }
      if($("#butNonew:visible").length==0 && $("#butView:visible").length==0){
        $("#butLeave").show();
      } else {
        $("#butLeave").hide();
      }
    },
    new: function(event, content){
      if(!Screenful.Editor.needsSaving || confirm(Screenful.Loc.unsavedConfirm)){ //"are you sure?"
        $("#container").css("right", ""); //remove room for xonomy layby
        Screenful.Editor.needsSaving=false;
        Screenful.Editor.hideHistory();
        id=$("#idbox").val("");
        Screenful.Editor.entryID=null;
        $("#container").removeClass("empty").removeClass("withHistory").removeClass("withSourceCode").html("<div id='editor'></div>");
        var fakeentry=null; if(content) fakeentry={id: null, content: content};
        Screenful.Editor.editor(document.getElementById("editor"), fakeentry);
        if($("#container #editor .xonomy .layby").length>0) $("#container").remove(".withHistory").css("right", "15px"); //make room for xonomy layby
        $("#container").hide().fadeIn();
        Screenful.status(Screenful.Loc.ready);
        Screenful.Editor.updateToolbar();
        if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Navigator) window.parent.Screenful.Navigator.setEntryAsCurrent(null);
      }
    },
    edit: function(event, id){
      if(!Screenful.Editor.needsSaving || confirm(Screenful.Loc.unsavedConfirm)){ //"are you sure?"
        $("#container").css("right", ""); //remove room for xonomy layby
        Screenful.Editor.needsSaving=false;
        Screenful.Editor.hideHistory();
        if(!id) id=Screenful.Editor.entryID;
        if(id) {
          var url=Screenful.Editor.readUrl;
          $("#container").html("").addClass("empty");
          Screenful.Editor.entryID=null;
          $("#idbox").val(id);
          Screenful.status(Screenful.Loc.reading, "wait"); //"reading entry"
          $.ajax({url: url, dataType: "json", method: "POST", data: {id: id}}).done(function(data){
            if(!data.success) {
              Screenful.status(Screenful.Loc.readingFailed, "warn"); //"failed to read entry"
              Screenful.Editor.updateToolbar();
            } else {
              Screenful.Editor.entryID=data.id;
              $("#idbox").val(data.id);
              $("#container").removeClass("empty").html("<div id='editor'></div>");
              Screenful.Editor.editor(document.getElementById("editor"), data);
              $("#container").hide().fadeIn();
              if($("#container .xonomy .layby").length>0) {
                $("#container").css("right", "15px"); //make room for xonomy layby
              }
              Screenful.status(Screenful.Loc.ready);
              Screenful.Editor.updateToolbar();
              if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Navigator) window.parent.Screenful.Navigator.setEntryAsCurrent(data.id);
              Screenful.Editor.addLinks(url.replace("entryread", "entrylinks"), $('#editor'), id);
            }
            Screenful.Editor.onModeChange("edit");
        	});
        }
        //Screenful.Editor.onEntryIdChange(data.id)

      }
    },
    view: function(event, id){
      if(!Screenful.Editor.needsSaving || confirm(Screenful.Loc.unsavedConfirm)){ //"are you sure?"
        $("#container").css("right", ""); //remove room for xonomy layby
        Screenful.Editor.needsSaving=false;
        Screenful.Editor.hideHistory();
      	if(!Screenful.Editor.viewer) Screenful.Editor.edit(event, id);
      	else {
      		if(!id) id=Screenful.Editor.entryID;
      		if(id) {
      		  var url=Screenful.Editor.readUrl;
      		  $("#container").removeClass("withHistory").removeClass("withSourceCode").html("").addClass("empty");
      		  Screenful.Editor.entryID=null;
            $("#idbox").val(id);
            Screenful.status(Screenful.Loc.reading, "wait"); //"reading entry"
      		  $.ajax({url: url, dataType: "json", method: "POST", data: {id: id}}).done(function(data){
        			if(!data.success) {
                Screenful.status(Screenful.Loc.readingFailed, "warn"); //"failed to read entry"
                Screenful.Editor.updateToolbar();
        			} else {
        			  Screenful.Editor.entryID=data.id;
        			  $("#idbox").val(data.id);
        			  $("#container").removeClass("empty").html("<div id='viewer'></div>");
                Screenful.Editor.viewer(document.getElementById("viewer"), data);
                $("#container").hide().fadeIn();
        			  Screenful.status(Screenful.Loc.ready);
        			  Screenful.Editor.updateToolbar();
        			  if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Navigator) window.parent.Screenful.Navigator.setEntryAsCurrent(data.id);
                Screenful.Editor.addLinks(url.replace("entryread", "entrylinks"), $('#viewer'), id);
        			}
              Screenful.Editor.onModeChange("view");
      			});
      		}
      	}
      }
    },
    addLinks: function(linkUrl, linkElement, entryID) {
      $.ajax({url: linkUrl, method: "GET", data: {id: entryID}}).done(function(data){
        var links = data.links;
        $('#outlinks').remove();
        $('#inlinks').remove();
        if (links.out.length > 0) {
          linkElement.append('<span id="outlinks"><h2>Outgoing links</h2></span>');
          for (var link in links.out) {
            var linkdata = links.out[link];
            var preview = linkdata["source_id"];
            if (linkdata["source_preview"] != "") preview = linkdata["source_preview"];
            if (linkdata['target_hw'] != '') {
              var linkhtml = '<ul>'+preview+' → <a target="_top" href="/'+linkdata['target_dict']+'/edit/entry/view'+linkdata['target_entry']+'">'+linkdata['target_dict']+' : '+linkdata['target_el']+' : '+linkdata['target_id']+'</a>';
            } else if (linkdata['target_entry'] != '') {
              var linkhtml = '<ul>'+preview+' → <a target="_top" href="/'+linkdata['target_dict']+'/edit/entry/view'+linkdata['target_entry']+'">'+linkdata['target_dict']+' : '+linkdata['target_el']+' : '+linkdata['target_id']+'</a>';
            } else {
              var linkhtml = '<ul>'+preview+' → <a target="_top" href="/'+linkdata['target_dict']+'">'+linkdata['target_dict']+'</a> : '+linkdata['target_el']+' : '+linkdata['target_id'];
            }
            if (linkdata['confidence'] && linkdata['confidence'] != '') {
              linkhtml += ' ('+linkdata['confidence']+')';
            }
            if ($("#editor").length>0) {
              linkhtml += ' <span class="linkdelete" data-href="/'+linkdata['source_dict']+'/links/delete/'+linkdata['link_id']+'">×delete</span>';
            }
            linkhtml += '</ul>';
            $('#outlinks').append(linkhtml);
          }
        }
        if (links.in.length > 0) {
          linkElement.append('<span id="inlinks"><h2>Incoming links</h2></span>');
          for (var link in links.in) {
            var linkdata = links.in[link];
            if (linkdata['source_hw'] != '') {
              var linkhtml = '<ul>'+linkdata["target_id"]+' ← <a target="_top" href="/'+linkdata['source_dict']+'/edit/entry/view'+linkdata['source_entry']+'">'+linkdata['source_dict']+' : '+linkdata['source_hw']+' : '+linkdata['source_el']+' : '+linkdata['source_id']+'</a>';
            } else if (linkdata['source_entry'] != '') {
              var linkhtml = '<ul>'+linkdata["target_id"]+' ← <a target="_top" href="/'+linkdata['source_dict']+'/edit/entry/view'+linkdata['source_entry']+'">'+linkdata['source_dict']+' : '+linkdata['source_el']+' : '+linkdata['source_id']+'</a>';
            } else {
              var linkhtml = '<ul>'+linkdata["target_id"]+' ← <a target="_top" href="/'+linkdata['source_dict']+'">'+linkdata['source_dict']+'</a> : '+linkdata['source_el']+' : '+linkdata['source_id'];
            }
            if (linkdata['confidence'] && linkdata['confidence'] != '') {
              linkhtml += ' ('+linkdata['confidence']+')';
            }
            if ($("#editor").length>0) {
              linkhtml += ' <span class="linkdelete" data-href="/'+linkdata['target_dict']+'/links/delete/'+linkdata['link_id']+'">×delete</span>';
            }
            linkhtml += '</ul>';
            $('#inlinks').append(linkhtml);
          }
        }
        $('.linkdelete').on("click", function() {
          if (confirm('Really delete link?')) {
            $.ajax({url: $(this).data('href'), method: "GET"}).done(function(data){
              Screenful.Editor.addLinks(linkUrl, linkElement, entryID);
            });
          }
        });
      });
    },
    nonew: function(event){
      Screenful.Editor.open(event, null);
    },
    open: function(event, id){
      if(!Screenful.Editor.needsSaving || confirm(Screenful.Loc.unsavedConfirm)){ //"are you sure?"
        Screenful.Editor.needsSaving=false;
        Screenful.Editor.hideHistory();
        if($("#container").hasClass("withSourceCode")) $("#container").removeClass("withSourceCode").html("<div id='editor'></div>");
        if(!id) id=$.trim( $("#idbox").val() );
        if(!id) {
          $("#container").html("").addClass("empty");
          Screenful.Editor.entryID=null;
          Screenful.status(Screenful.Loc.ready);
          Screenful.Editor.updateToolbar();
          if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Navigator) window.parent.Screenful.Navigator.setEntryAsCurrent(null);
        } else {
          if($("#editor").length>0 && Screenful.Editor.entryID) {
            Screenful.Editor.edit(event, id);
          } else {
            Screenful.Editor.view(event, id);
          }
          /*if (event != null && (event.target.id == 'butOpen' || event.target.id == 'idbox')) {
            var link = Screenful.Editor.getDirectLink();
            if($("#editor").length>0 && Screenful.Editor.entryID) {
              link += id;
            } else {
              link += "view"+id
            }
            if (history.pushState) {
              parent.window.history.pushState({path:link},'',link);
            } else {
              parent.window.location = link;
            }
          }*/
        }
      }
    },
    feedbackMessage: function(feedback) {
      var message = Screenful.Loc[feedback.type]; // e.g. saveFeedbackHeadwordExists
      if (!message) {
        message = feedback.type; // no localized message; just show the code
      }
      if (message) {
        message += feedback.info ? feedback.info : "";
      } else {
        message = "Server feedback: " + JSON.stringify(feedback);
      }
      return message;
    },
    save: async function(event){
      Screenful.Editor.hideHistory();
      var id=Screenful.Editor.entryID;
      var content=Screenful.Editor.harvester(document.getElementById("editor"));
      content = await Promise.resolve(content);
      if (!content) {
        return
      }
      $("#container").addClass("empty");
      if(!id) { //we are creating a new entry
        Screenful.status(Screenful.Loc.saving, "wait"); //"saving entry..."
        if(Screenful.Editor.saveWaitMsg){
          $("#curtain").show();
          $("#waiter").html(Screenful.Editor.saveWaitMsg).show();
        }
        $.ajax({url: Screenful.Editor.createUrl, dataType: "json", method: "POST", data: {content: content}}).done(function(data){
          $("#waiter").hide();
          $("#curtain").hide();
          if(!data.success) {
            Screenful.status(Screenful.Loc.savingFailed, "warn"); //"failed to save entry"
          } else {
            Screenful.Editor.entryID=data.id;
            $("#idbox").val(data.id);
            if(Screenful.Editor.viewer && !$("#chkAutosave").prop("checked")) {
        			$("#container").removeClass("empty").html("<div id='viewer'></div>");
              Screenful.Editor.viewer(document.getElementById("viewer"), data);
      		  } else {
        			$("#container").removeClass("empty").html("<div id='editor'></div>");
              Screenful.Editor.editor(document.getElementById("editor"), data);
      		  }
            $("#container").hide().fadeIn();
            if (data.feedback) {
              Screenful.status(Screenful.Editor.feedbackMessage(data.feedback), "alert");
            }
            Screenful.status(Screenful.Loc.ready);

            Screenful.Editor.updateToolbar();
            Screenful.Editor.needsSaving=false;
            if(data.redirUrl) window.location=data.redirUrl;
            if(Screenful.Editor.postCreateRedirUrl) window.location=Screenful.Editor.postCreateRedirUrl;
            if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Navigator) window.parent.Screenful.Navigator.refresh();
            if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Aftersave){
              window.parent.Screenful.Aftersave.batch();
            } else if(Screenful.Aftersave){
              Screenful.Aftersave.batch();
            }
            Screenful.Editor.onListChange();
            Screenful.Editor.onEntryIdChange(data.id);
          }
      	});
      } else { //we are updating an existing entry
        Screenful.status(Screenful.Loc.saving, "wait"); //"saving entry..."
        if(Screenful.Editor.saveWaitMsg){
          $("#curtain").show();
          $("#waiter").html(Screenful.Editor.saveWaitMsg).show();
        }
        $.ajax({url: Screenful.Editor.updateUrl, dataType: "json", method: "POST", data: {id: id, content: content}}).done(function(data){
          $("#waiter").hide();
          $("#curtain").hide();
          if(!data.success) {
            Screenful.status(Screenful.Loc.savingFailed, "warn"); //"failed to save entry"
          } else {
            Screenful.Editor.entryID=data.id;
            $("#idbox").val(data.id);
            if(Screenful.Editor.viewer && !$("#chkAutosave").prop("checked")) {
              $("#container").removeClass("empty").html("<div id='viewer'></div>");
              Screenful.Editor.viewer(document.getElementById("viewer"), data);
  		      } else {
  			      $("#container").removeClass("empty").html("<div id='editor'></div>");
              Screenful.Editor.editor(document.getElementById("editor"), data);
  		      }
            $("#container").hide().fadeIn();
            if (data.feedback) {
              Screenful.status(Screenful.Editor.feedbackMessage(data.feedback), "alert");
            }
            Screenful.status(Screenful.Loc.ready);

            Screenful.Editor.needsSaving=false;
            Screenful.Editor.updateToolbar();
            if(data.redirUrl) window.location=data.redirUrl;
            if(Screenful.Editor.postUpdateRedirUrl) window.location=Screenful.Editor.postUpdateRedirUrl;
            if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Navigator) window.parent.Screenful.Navigator.refresh(id, "update");
            if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Aftersave){
              window.parent.Screenful.Aftersave.batch();
            } else if(Screenful.Aftersave){
              Screenful.Aftersave.batch();
            }
            // headword might be renamed
            Screenful.Editor.onListChange();
          }
      	});
      }
    },
    delete: function(event){
      Screenful.Editor.hideHistory();
      var id=Screenful.Editor.entryID;
      if(confirm(Screenful.Loc.deleteConfirm)){ //"are you sure?"
        Screenful.status(Screenful.Loc.deleting, "wait"); //"deleting entry..."
        $.ajax({url: Screenful.Editor.deleteUrl, dataType: "json", method: "POST", data: {id: id}}).done(function(data){
          if(!data.success) {
            Screenful.status(Screenful.Loc.deletingFailed, "warn"); //"failed to delete entry"
          } else {
            if(!Screenful.Editor.historyUrl) {
              Screenful.Editor.entryID=null;
              $("#idbox").val("");
            }
            $("#container").addClass("empty deleted").html("");
            Screenful.status(Screenful.Loc.ready);
            Screenful.Editor.updateToolbar();
            if(Screenful.Editor.postDeleteRedirUrl) window.location=Screenful.Editor.postDeleteRedirUrl;
            if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Navigator) window.parent.Screenful.Navigator.refresh(id, "delete");
            if(window.parent!=window && window.parent.Screenful && window.parent.Screenful.Aftersave){
              window.parent.Screenful.Aftersave.batch();
            } else if(Screenful.Aftersave){
              Screenful.Aftersave.batch();
            }
          }
          Screenful.Editor.onListChange();
      	});
      }
    },
    needsSaving: false,
    changed: function(){
      Screenful.Editor.needsSaving=true;
      $("#butSave .star").show();
      if($("#chkAutosave").prop("checked")) Screenful.Editor.save();
    },
    resetChanged: function() {
      Screenful.Editor.needsSaving=false;
      $("#butSave .star").hide();
    },
    history: function(){
      if(!Screenful.Editor.needsSaving || confirm(Screenful.Loc.unsavedConfirm)){ //"are you sure?"
        $("#container").css("right", ""); //remove room for xonomy layby
        Screenful.Editor.needsSaving=false;
        if($("#container").hasClass("withHistory")) {
          Screenful.Editor.hideHistory();
          var id=Screenful.Editor.entryID || $("#idbox").val();        Screenful.Editor.view(null, id);
        } else {
          var id=Screenful.Editor.entryID || $("#idbox").val();        $("#container").html("").removeClass("withSourceCode").addClass("withHistory");
          $("#history").show();
          Screenful.Editor.updateToolbar();
          $("#container .xonomy .layby").remove();
          Screenful.History.go(id);
        }
      }
    },
    hideHistory: function(){
      $("#history").hide();
      if($("#container").hasClass("withHistory")) $("#container").removeClass("withHistory").html("<div id='viewer'></div>");
      Screenful.Editor.updateToolbar();
    },
    /*getDirectLink: function(fullLink) {
      var link = window.location.protocol + '//' + window.location.host;
      var paths = window.location.hash.split('/');
      link += paths[0] + '/edit/' + paths[2] + '/';
      if (fullLink) {
        if (Screenful.Editor.entryID && $("#viewer").length>0) {
          link += Screenful.Editor.entryID;
          link += '/view';

        }
        if (Screenful.Editor.entryID && $("#editor").length>0) {
          link += Screenful.Editor.entryID;
        }
      }
      return link;
    },*/
    /*showLink: function() {
      var link = Screenful.Editor.getDirectLink(true);
      if (Screenful.Editor.entryID && $("#viewer").length>0) {
        prompt("Direct link to view this entry", link);
      }
      if (Screenful.Editor.entryID && $("#editor").length>0) {
        prompt("Direct link to edit this entry", link);
      }
    },*/
    clone: function(event){
      if(Screenful.Editor.entryID && $("#editor").length>0){ //we have an existing entry open for editing
        var content=Screenful.Editor.harvester(document.getElementById("editor"));
        Screenful.Editor.new(event, content);
      } else if(Screenful.Editor.entryID && $("#viewer").length>0){ //we have an existing entry open for viewing
        var url=Screenful.Editor.readUrl;
        Screenful.status(Screenful.Loc.reading, "wait"); //"reading entry"
        $.ajax({url: url, dataType: "json", method: "POST", data: {id: Screenful.Editor.entryID}}).done(function(data){
          if(!data.success) {
            Screenful.status(Screenful.Loc.readingFailed, "warn"); //"failed to read entry"
            Screenful.Editor.updateToolbar();
          } else {
            Screenful.Editor.new(event, data.content);
          }
      	});
      }
    },
    sourceCode: function(){
      if($("#container").hasClass("withSourceCode")) {
        Screenful.Editor.hideSourceCode();
      } else {
        var content=Screenful.Editor.harvester(document.getElementById("editor"));
        if(Screenful.Editor.formatSourceCode) content=Screenful.Editor.formatSourceCode(content);
        $("#container").removeClass("withHistory").addClass("withSourceCode");
        $("#container").removeClass("empty").html("<div id='sourceCode'><textarea spellcheck='false'>"+content.replace(/\&/g, "&amp;")+"</textarea></div>");
        $("#container").hide().fadeIn();
        $("#sourceCode textarea").focus().on("keydown", function(e){e.stopPropagation();});
        Screenful.Editor.updateToolbar();
      }
    },
    hideSourceCode: function(){
      var content=$("#sourceCode textarea").val();
      if(Screenful.Editor.validateSourceCode && !Screenful.Editor.validateSourceCode(content)){
        //invalid source code:
        $("#errorMessage").html(Screenful.Loc.invalidSourceCode).fadeIn();
        window.setTimeout(function(){ $("#errorMessage").fadeOut(); }, 1000);
      } else {
        //valid source code:
        if(Screenful.Editor.cleanupSourceCode) content=Screenful.Editor.cleanupSourceCode(content);
        var data={id: Screenful.Editor.entryID, content: content};
        if($("#container").hasClass("withSourceCode")) $("#container").removeClass("withSourceCode").html("<div id='editor'></div>");
        Screenful.Editor.editor(document.getElementById("editor"), data);
        Screenful.Editor.updateToolbar();
        Screenful.Editor.needsSaving=false;
      }
    },
    abandon: function(){
      Screenful.Editor.needsSaving=false;
      $("#idbox").val("");
      Screenful.Editor.open();
    },
  };
  //$(document).ready(Screenful.Editor.start);

  Screenful.Loc={
    ready: "Ready.",
    find: "Find",
    reload: "Reload",
    reverse: "Reverse",
    shownumbers: "Number lines",
    golast: "Show last edited entry",
    cancel: "Cancel",
    more: "More",
    new: "New",
    edit: "Edit",
    save: "Save",
    delete: "Delete",
    listing: "Getting list...",
    listingFailed: "Failed to get list.",
    reading: "Getting item...",
    readingFailed: "No such item.",
    saving: "Saving...",
    savingFailed: "Failed to save.",
    saveFeedbackHeadwordExists: "WARNING: another entry with this headword exists. ID=",
    deleting: "Deleting...",
    deletingFailed: "Failed to delete.",
    deleteConfirm: "Careful now! Are you sure?",
    username: "E-mail address",
    password: "Password",
    login: "Log in",
    loginError: "Incorrect e-mail address or password.",
    logout: "Log out",
    anonymous: "anonymous user",
    home: "Home",
    title: "Title",
    titleEmpty: "The title should not be be empty.",
    url: "URL",
    urlEmpty: "The URL should not be be empty.",
    urlShort: "The URL should be at least three characters long.",
    urlInvalid: "The URL should not contain characters other than a-z, A-Z, 0-9 and hyphens.",
    urlTaken: "This URL is already taken.",
    template: "Template",
    create: "Create",
    finished: "Finished",
    changePwd: "Change your password",
    userProfile: "Your profile",
    signup: "Get an account",
    forgotPwd: "Forgot your password?",
    signupEmail: "To get an account send an e-mail to",
    newPassword: "New password",
    change: "Change",
    skeApiKey: "Your Sketch Engine API Key",
    skeApiKeyChanged: "Your API key has been changed.",
    skeUserName: "Your Sketch Engine username",
    skeUserNameChanged: "Your Sketch Engine username has been changed.",
    passwordChanged: "Your password has been changed.",
    passwordEmpty: "The password should not be empty.",
    passwordShort: "The password should be at least six characters long.",
    passwordWhitespace: "The password should not begin or end with a space.",
    ok: "OK",
    currentUrl: "Current URL",
    newUrl: "New URL",
    upload: "Upload",
    uploadPurge: "Purge before upload",
    uploadFail: "The upload has failed.",
    uploadSuccess: "The upload has succeeded.",
    history: "History",
    link: "Direct link",
    version: "Version",
    clone: "Clone",
    sourceCode: "Source code",
    invalidSourceCode: "Invalid source code",
    unsavedConfirm: "You have unsaved changes. Are you sure you want to lose them?",
    doItLater: "Do it later",
    badEmailError: "Incorrect e-mail address.",

    forgotPwdEmail: "If you have forgotten your password, enter your e-mail address and we will send you instructions on how to create a new one.",
    recoverPwd: "Get a new password",
    tokenSent: "We have sent you an e-mail with instructions on how to reset your password.",
    recoverPwdMsg: "You can change your password now.",
    changePwdMsg: "You can change your password here.",
    invalidToken: "This password reset link is invalid. It may have expired or has been used before.",

    signupInfoEmail: "To get a new account, enter your e-mail address and we will send you instructions.",
    signupButton: "Create new account",
    signupTokenSent: "We have sent you an e-mail with instructions on how to create a new account.",
    invalidSignupToken: "This signup link is invalid. It may have expired or has been used before.",
    setPwdMsg: "Please set your password now.",
    accountCreated: "We have created your account. You can now log in with your e-mail address and password.",
    signupAccountExists: "You are trying to create an account for e-mail address that already has an account.",

    autosave: "Autosave",

    flagging: "Flagging...",
    flaggingFailed: "Failed to flag the entry.",

    exactMatches: "Exact matches",
    partialMatches: "Partial matches",

    termsTitle: "Terms of Use",
    confirm: "Confirm",
    termsError: "Please, confirm Terms of Use before using Lexonomy.",
  };

  Screenful.History={
    go: function(entryID){
      Screenful.Editor.entryID=entryID;
      $("#history").html("<div></div>");
      $.ajax({url: Screenful.History.historyUrl, dataType: "json", method: "POST", data: {id: entryID}}).done(function(data){
        if(!data.history.length) ; else {
          for(var i=0; i<data.history.length; i++){
            var hist=data.history[i];
            if(!Screenful.History.isDeletion(hist)) {
              var $div=$("<div class='revision'></div>").appendTo($("#history"));
              Screenful.History.drawRevision($div, hist, data.history.length-i, (i==0));
              if(i==0) Screenful.History.zoomRevision(Screenful.History.getRevisionID(hist), true);
            }
            var $div=$("<div class='interRevision'></div>").appendTo($("#history"));
            Screenful.History.drawInterRevision($div, hist);
          }
        }
      });
    },
    drawRevision: function($div, hist, versionNumber, isLatest){
      $div.data("hist", hist);
      $div.on("click", function(e){
        Screenful.History.zoomRevision(Screenful.History.getRevisionID(hist), true);
      });
      if(Screenful.Editor.viewer){
        $div.append(" <span class='pretty'></span>");
        $div.find(".pretty").on("click", function(e){
          Screenful.History.zoomRevision(Screenful.History.getRevisionID(hist), false);
          e.stopPropagation();
        });
      }
      if(!isLatest) {
        $div.append("<span class='revive'>Revive</span>");
        $div.find(".revive").on("click", function(e){
          Screenful.History.reviveRevision(Screenful.History.getRevisionID(hist), false);
          e.stopPropagation();
        });
      }
      $div.append("<span class='label'>"+Screenful.Loc.version+" "+versionNumber+"</span>");
    },
    drawInterRevision: function($div, hist){
      $div.append("<div class='arrowTop'></div>");
      $div.append("<div class='arrowMiddle'></div>");
      $div.append("<div class='arrowBottom'></div>");
      $div.append(Screenful.History.printAction(hist));
    },
    zoomRevision: function(revision_id, asSourceCode){
      $(".revision").removeClass("current").removeClass("pretty").each(function(){
        var $this=$(this);
        if(Screenful.History.getRevisionID($this.data("hist"))==revision_id) {
          $this.addClass("current");
          if(!asSourceCode) $this.addClass("pretty");
          var fakeentry=Screenful.History.fakeEntry($this.data("hist"));
          if(fakeentry){
            if(!asSourceCode && Screenful.Editor.viewer){
              $("#container").removeClass("empty").html("<div id='viewer'></div>");
              Screenful.Editor.viewer(document.getElementById("viewer"), fakeentry);
            } else {
              $("#container").removeClass("empty").html("<div id='editor'></div>");
              Screenful.Editor.editor(document.getElementById("editor"), fakeentry, true);
            }
            $("#container").hide().fadeIn();
          }
        }
      });
    },
    reviveRevision: function(revision_id){
      $(".revision").each(function(){
        var $this=$(this);
        if(Screenful.History.getRevisionID($this.data("hist"))==revision_id) {
          var fakeentry=Screenful.History.fakeEntry($this.data("hist"));
          if(fakeentry){
            Screenful.Editor.hideHistory();
            $("#container").removeClass("empty").html("<div id='editor'></div>");
            Screenful.Editor.editor(document.getElementById("editor"), fakeentry);
            $("#container").hide().fadeIn();
            Screenful.Editor.updateToolbar();
            Screenful.Editor.changed();
          }
        }
      });
    },
  };

  (()=>{var e={d:(t,n)=>{for(var a in n)e.o(n,a)&&!e.o(t,a)&&Object.defineProperty(t,a,{enumerable:!0,get:n[a]});},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)},t={};(()=>{e.d(t,{default:()=>o});const n=Symbol("We add this to docspec and related definitions to mark they've been verified to be valid.");class a{constructor(e,t,n,a){this.name=e,this.elementName=t,this.internalParent=n,this.htmlID=a,this.type="element",this.attributes=[],this.children=[];}parent(){return this.internalParent}hasAttribute(e){return this.attributes.some((t=>t.name===e))}getAttribute(e){return this.attributes.find((t=>t.name===e))}getAttributeValue(e,t){const n=this.getAttribute(e);return n?n.value:t}hasElements(){return this.children.some((e=>"element"===e.type))}hasText(){return this.children.some((e=>"text"===e.type))}hasChildElement(e){return this.children.some((t=>t.htmlID===e&&"element"===t.type))}getText(){return this.children.map((e=>"text"===e.type?e.value:e.getText())).join("")}getChildElements(e){return this.children.filter((t=>"element"===t.type&&t.name===e))}getDescendantElements(e){return this.children.flatMap((t=>"element"===t.type?[t,...t.getDescendantElements(e)]:[]))}getPrecedingSibling(){if(this.internalParent){let e=null;for(const t of this.internalParent.children){if(t===this)return e;"element"===t.type&&(e=t);}}return null}getFollowingSibling(){if(this.internalParent){let e=!1;for(const t of this.internalParent.children){if(e&&"element"===t.type)return t;e=e||t===this;}}return null}setAttribute(e,t){this.hasAttribute(e)?this.getAttribute(e).value=t:this.attributes.push(new r(e,t,this));}addText(e){this.children.push(new s(e));}}class r{constructor(e,t,n=null,a){this.name=e,this.value=t,this.internalParent=n,this.htmlID=a,this.type="attribute";}parent(){return this.internalParent}}class s{constructor(e,t=null,n){this.value=e,this.internalParent=t,this.htmlID=n,this.type="text";}parent(){return this.internalParent}}const l={lang:"",mode:"nerd",namespaces:{},lastIDNum:0,docSpec:{},harvestCache:{},draggingID:null,notclick:!1,lastAskerParam:null,wycLastID:0,wycCache:{},warnings:[],currentHtmlId:null,currentFocus:null,keyNav:!1,keyboardEventCatcher:null,scrollableContainer:null,notKeyUp:!1,answer:null,wrapIndex:-1,wrapWord:"",setMode(e){"nerd"!=e&&"laic"!=e||(l.mode=e),"nerd"==e&&$(".xonomy").removeClass("laic").addClass("nerd"),"laic"==e&&$(".xonomy").removeClass("nerd").addClass("laic");},jsEscape:e=>String(e).replace(/\"/g,'\\"').replace(/\'/g,"\\'"),xmlEscape:(e,t)=>(t&&(e=l.jsEscape(e)),String(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&apos;").replace(/</g,"&lt;").replace(/>/g,"&gt;")),xmlUnscape:e=>String(e).replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&"),isNamespaceDeclaration(e){var t=!1;return "xmlns"==e&&(t=!0),e.length>=6&&"xmlns:"==e.substring(0,6)&&(t=!0),t},xml2js(e,t){"string"==typeof e&&(e=$.parseXML(e)),"documentElement"in e&&(e=e.documentElement);const n=e.nodeName,o=l.docSpec.getElementId(e.nodeName,t?t.name:void 0);for(var i=new a(o,n),c=0;c<e.attributes.length;c++){var d=e.attributes[c];l.isNamespaceDeclaration(d.nodeName)?l.namespaces[d.nodeName]=d.value:"xml:space"!=d.name&&i.attributes.push(new r(d.nodeName,d.value,i));}for(c=0;c<e.childNodes.length;c++){var u=e.childNodes[c];1==u.nodeType&&i.children.push(l.xml2js(u,i)),3==u.nodeType&&i.children.push(new s(u.nodeValue||"",i));}return i},js2xml(e){if("text"==e.type)return l.xmlEscape(e.value);if("attribute"==e.type)return e.name+"='"+l.xmlEscape(e.value)+"'";if("element"==e.type){for(var t="<"+e.elementName,n=0;n<e.attributes.length;n++){var a=e.attributes[n];t+=" "+a.name+"='"+l.xmlEscape(a.value)+"'";}if(e.children.length>0){var r=!1;for(n=0;n<e.children.length;n++)"text"==(s=e.children[n]).type&&(r=!0);for(r&&(t+=" xml:space='preserve'"),t+=">",n=0;n<e.children.length;n++){var s;"text"==(s=e.children[n]).type?t+=l.xmlEscape(s.value):"element"==s.type&&(t+=l.js2xml(s));}t+="</"+e.elementName+">";}else t+="/>";return t}return ""},asFunction:(e,t)=>e instanceof Function?e:typeof e==typeof t?function(){return e}:function(){return t},verifyDocSpec(){$.isPlainObject(l.docSpec)||(l.docSpec={});const e=l.docSpec;e[n]||Object.assign(e,{allowLayby:"boolean"==typeof e.allowLayby&&e.allowLayby,allowModeSwitching:"boolean"==typeof e.allowModeSwitching&&e.allowModeSwitching,elements:$.isPlainObject(e.elements)?e.elements:{},getElementId:e.getElementId instanceof Function?e.getElementId:function(e,t){return e},laybyMessage:"string"==typeof e.laybyMessage?e.laybyMessage:"",onModeSwitch:e.onModeSwitch instanceof Function?e.onModeSwitch:function(){},onchange:e.onchange instanceof Function?e.onchange:function(){},unknownAttribute:e.unknownAttribute instanceof Function||$.isPlainObject(e.unknownAttribute)?e.unknownAttribute:void 0,unknownElement:e.unknownElement instanceof Function||$.isPlainObject(e.unknownElement)?e.unknownElement:void 0,validate:e.validate instanceof Function?e.validate:function(){},[n]:!0});},verifyDocSpecElement(e){if(!$.isPlainObject(l.docSpec.elements[e])){const t=l.docSpec.unknownElement;l.docSpec.elements[e]=t instanceof Function?t(e):$.isPlainObject(t)?Object.assign({},t):{};}const t=l.docSpec.elements[e];if(!t[n]){Object.assign(t,{asker:t.asker instanceof Function?t.asker:l.askLongString,askerParameter:t.askerParameter,attributes:$.isPlainObject(t.attributes)?t.attributes:{},backgroundColour:l.asFunction(t.backgroundColour,""),canDropTo:Array.isArray(t.canDropTo)?t.canDropTo:[],caption:"caption"in t?l.asFunction(t.caption,""):void 0,collapsed:l.asFunction(t.collapsed,!1),collapsible:l.asFunction(t.collapsible,!0),collapsoid:"collapsoid"in t?l.asFunction(t.collapsoid,""):void 0,displayName:"displayName"in t?l.asFunction(t.displayName,e):void 0,displayValue:"displayValue"in t?l.asFunction(t.displayValue,""):void 0,elementName:l.asFunction(t.elementName,e),hasText:l.asFunction(t.hasText,!1),inlineMenu:Array.isArray(t.inlineMenu)?t.inlineMenu:[],isInvisible:"isInvisible"in t?l.asFunction(t.isInvisible,!1):void 0,isReadOnly:"isReadOnly"in t?l.asFunction(t.isReadOnly,!1):void 0,localDropOnly:l.asFunction(t.localDropOnly,!1),menu:Array.isArray(t.menu)?t.menu:[],mustBeAfter:"mustBeAfter"in t?l.asFunction(t.mustBeAfter,[]):void 0,mustBeBefore:"mustBeBefore"in t?l.asFunction(t.mustBeBefore,[]):void 0,oneliner:l.asFunction(t.oneliner,!1),title:"title"in t?l.asFunction(t.title,""):void 0,[n]:!0});for(var a=0;a<t.menu.length;a++)l.verifyDocSpecMenuItem(t.menu[a]);for(a=0;a<t.inlineMenu.length;a++)l.verifyDocSpecMenuItem(t.inlineMenu[a]);for(var r in t.attributes)l.verifyDocSpecAttribute(e,r);}},verifyDocSpecAttribute(e,t){l.verifyDocSpecElement(e);const a=l.docSpec.elements[e];if(!$.isPlainObject(a.attributes[t])){const n=l.docSpec.unknownAttribute;a.attributes[t]=n instanceof Function?n(e,t):$.isPlainObject(n)?Object.assign({},n):{};}const r=a.attributes[t];if(!r[n]){Object.assign(r,{asker:r.asker instanceof Function?r.asker:l.askString,askerParameter:r.askerParameter,caption:"caption"in r?l.asFunction(r.caption,""):void 0,displayName:"displayName"in r?l.asFunction(r.displayName,t):void 0,displayValue:"displayValue"in r?l.asFunction(r.displayValue,""):void 0,title:"title"in r?l.asFunction(r.title,""):void 0,isInvisible:"isInvisible"in r?l.asFunction(r.isInvisible,!1):void 0,isReadOnly:"isReadOnly"in r?l.asFunction(r.isReadOnly,!1):void 0,menu:Array.isArray(r.menu)?r.menu:[],shy:"shy"in r?l.asFunction(r.shy,!1):void 0,[n]:!0});for(var s=0;s<r.menu.length;s++)l.verifyDocSpecMenuItem(r.menu[s]);}},verifyDocSpecMenuItem(e){e[n]||(Object.assign(e,{action:e.action instanceof Function?e.action:function(){},actionParameter:e.actionParameter,caption:l.asFunction(e.caption,"?"),expanded:l.asFunction(e.expanded,!1),hideIf:l.asFunction(e.hideIf,!1),icon:"string"==typeof e.icon?e.icon:void 0,keyCaption:"string"==typeof e.keyCaption?e.keyCaption:void 0,keyTrigger:e.keyTrigger instanceof Function?e.keyTrigger:void 0,menu:Array.isArray(e.menu)?e.menu:void 0,[n]:!0}),e.caption=l.asFunction(e.caption,"?"),e.action&&"function"==typeof e.action||(e.action=function(){}),e.hideIf||(e.hideIf=function(){return !1}),"function"!=typeof e.expanded&&(e.expanded=l.asFunction(e.expanded,!1)));},nextID:()=>"xonomy"+ ++l.lastIDNum,refresh(){$(".xonomy .textnode[data-value='']").each((function(){var e=$(this),t=e.closest(".element"),n=t.data("name"),a=l.docSpec.elements[n];a&&!a.hasText(l.harvestElement(t.toArray()[0]))&&e.remove();})),$(".xonomy .children ").each((function(){0!=this.childNodes.length||$(this.parentElement).hasClass("hasText")?($(this.parentElement).removeClass("noChildren"),l.updateCollapsoid(this.parentElement.id)):$(this.parentElement).addClass("noChildren");})),$(".xonomy .element.hasText > .children > .element").each((function(){0!=$(this).prev().length&&$(this).prev().hasClass("textnode")||$(this).before(l.renderText(new s(""))),0!=$(this).next().length&&$(this).next().hasClass("textnode")||$(this).after(l.renderText(new s("")));}));for(var e=!1;!e;){e=!0;for(var t=$(".xonomy .textnode").toArray(),n=0;n<t.length;n++){var a=$(t[n]);if(a.next().hasClass("textnode")){var r=l.harvestText(a.toArray()[0]),o=l.harvestText(a.next().toArray()[0]);r.value+=o.value,a.next().remove(),a.replaceWith(l.renderText(r)),e=!1;break}}}$(".xonomy .attribute ").each((function(){var e=this.getAttribute("data-name"),t=this.parentElement.parentElement.parentElement.getAttribute("data-name"),n=l.docSpec.elements[t],a=[];for(var r in n.attributes){if(r==e)break;a.push(r);}var s=[],o=!1;for(var r in n.attributes)r==e?o=!0:o&&s.push(r);if(s.length>0){var i=$(this);do{d=!0;for(var c=0;c<s.length;c++)i.prevAll("*[data-name='"+s[c]+"']").toArray().length>0&&(i.prev().before(i),d=!1);}while(!d)}if(a.length>0){var d;i=$(this);do{for(d=!0,c=0;c<a.length;c++)i.nextAll("*[data-name='"+a[c]+"']").toArray().length>0&&(i.next().after(i),d=!1);}while(!d)}})),$(".xonomy .attributes").each((function(){0==$(this).children(".shy").toArray().length?($(this.parentElement).children(".rollouter").hide().removeClass("rolledout"),$(this).removeClass("rolledout").css("display","")):$(this.parentElement).children(".rollouter").show();})),$(".xonomy .element").each((function(){var e=l.docSpec.elements[this.getAttribute("data-name")];if(e.displayName&&$(this).children(".tag").children(".name").html(l.textByLang(e.displayName(l.harvestElement(this)))),e.caption){var t=l.harvestElement(this);$(this).children(".inlinecaption").html(l.textByLang(e.caption(t)));}e.displayValue&&((t=l.harvestElement(this)).hasElements()||$(this).children(".children").html(l.textByLang(l.renderDisplayText(t.getText(),e.displayValue(t))))),$(this).children(".tag.opening").children(".attributes").children(".attribute").each((function(){var t=e.attributes[this.getAttribute("data-name")];t.displayName&&$(this).children(".name").html(l.textByLang(t.displayName(l.harvestAttribute(this)))),t.displayValue&&$(this).children(".value").html(l.textByLang(t.displayValue(l.harvestAttribute(this)))),t.caption&&$(this).children(".inlinecaption").html("&nbsp;"+l.textByLang(t.caption(l.harvestAttribute(this)))+"&nbsp;");}));}));},harvest(){var e=$(".xonomy .element").first().toArray()[0],t=l.harvestElement(e);for(var n in l.namespaces)t.hasAttribute(n)||t.attributes.push(new r(n,l.namespaces[n],t));return l.js2xml(t)},harvestElement(e,t){var n=e.id;if(!l.harvestCache[n]){const u=e.getAttribute("data-name"),m=l.docSpec.elements[u];for(var r=new a(u,m.elementName(),t,e.id),s=$(e).find(".tag.opening > .attributes").toArray()[0],o=0;o<s.children.length;o++){var i=s.children[o];$(i).hasClass("attribute")&&r.attributes.push(l.harvestAttribute(i,r));}var c=$(e).children(".children").toArray()[0];for(o=0;o<c.children.length;o++){var d=c.children[o];$(d).hasClass("element")?r.children.push(l.harvestElement(d,r)):$(d).hasClass("textnode")&&r.children.push(l.harvestText(d,r));}l.harvestCache[n]=r;}return l.harvestCache[n]},harvestAttribute(e,t){var n=e.id;return l.harvestCache[n]||(l.harvestCache[n]=new r(e.getAttribute("data-name"),e.getAttribute("data-value"),t,e.id)),l.harvestCache[n]},harvestText(e,t){var n=e.id;return l.harvestCache[n]||(l.harvestCache[n]=new s(e.getAttribute("data-value"),t,e.id)),l.harvestCache[n]},harvestParentOf(e){var t=null,n=$("#"+e.htmlID).parent().closest(".element");if(1==n.toArray().length){t=l.harvestElement(n.toArray()[0]);for(var a=0;a<t.attributes.length;a++)t.attributes[a].htmlID==e.htmlID&&"attribute"===e.type&&(t.attributes[a]=e);for(a=0;a<t.children.length;a++)t.children[a].htmlID==e.htmlID&&"element"===e.type&&(t.children[a]=e);}return t},render(e,t,n){if(l.docSpec=n,l.verifyDocSpec(),l.namespaces={},"string"==typeof e){[...e.matchAll(/ ([a-zA-Z]+):[^=]+=/g)].forEach((function(t){var n=t[1],a=new RegExp("xmlns:"+n+"=");"xmlns"!=n&&"lxnm"!=n&&"xml"!=n&&null==e.match(a)&&(e=e.replace(" xmlns:lxnm"," xmlns:"+n+'="'+n+'" xmlns:lxnm'));}));try{e=$.parseXML(e);}catch(t){$(".alertmessage .text",parent.document).html("Error parsing entry XML."),$(".alertmessage",parent.document).show(),e=$.parseXML("<entry/>");}}if(e instanceof Document&&(e=l.xml2js(e)),"string"==typeof t&&(t=document.getElementById(t)),$(t).hasClass("xonomy")||$(t).addClass("xonomy"),$(t).addClass(l.mode),$(t).hide(),t.innerHTML=l.renderElement(e),$(t).show(),n.allowLayby){var a="<div class='layby closed empty' onclick='if($(this).hasClass(\"closed\")) Xonomy.openLayby()' ondragover='Xonomy.dragOver(event)' ondragleave='Xonomy.dragOut(event)' ondrop='Xonomy.drop(event)''>";a+="<span class='button closer' onclick='Xonomy.closeLayby();'>&nbsp;</span>",a+="<span class='button purger' onclick='Xonomy.emptyLayby()'>&nbsp;</span>",a+="<div class='content'></div>",a+="<div class='message'>"+l.textByLang(n.laybyMessage)+"</div>",a+="</div>",$(a).appendTo($(t));}n.allowModeSwitching&&$("<div class='modeSwitcher'><span class='nerd'></span><span class='laic'></span></div>").appendTo($(t)).on("click",(function(e){"nerd"==l.mode?l.setMode("laic"):l.setMode("nerd"),n.onModeSwitch&&n.onModeSwitch(l.mode);})),$(document.body).off("click",l.clickoff),$(document.body).on("click",l.clickoff),$(document.body).off("dragend",l.dragend),$(document.body).on("dragend",l.dragend),l.refresh(),l.validate();},renderElement(e){var t=l.nextID();l.verifyDocSpecElement(e.name);var n=l.docSpec.elements[e.name],a="element";n.canDropTo&&n.canDropTo.length>0&&(a+=" draggable");var r=n.hasText(e);r&&(a+=" hasText"),n.inlineMenu&&n.inlineMenu.length>0&&(a+=" hasInlineMenu"),n.oneliner(e)&&(a+=" oneliner"),n.collapsible(e)?n.collapsed(e)&&e.children.length>0&&(a+=" collapsed"):a+=" uncollapsible",n.isInvisible&&n.isInvisible(e)&&(a+=" invisible"),n.isReadOnly&&n.isReadOnly(e)&&(a+=" readonly"),n.menu.length>0&&(a+=" hasMenu");var o=e.elementName;n.displayName&&(o=l.textByLang(n.displayName(e)));var i="";n.title&&(i=l.textByLang(n.title(e)));var c="";c+='<div data-name="'+e.name+'" id="'+t+'" class="'+a+'">',c+='<span class="connector">',c+='<span class="plusminus" onclick="Xonomy.plusminus(\''+t+"')\"></span>",c+='<span class="draghandle" draggable="true" ondragstart="Xonomy.drag(event)"></span>',c+="</span>",c+='<span class="tag opening focusable" style="background-color: '+n.backgroundColour(e)+';">',c+='<span class="punc">&lt;</span>',c+='<span class="warner"><span class="inside" onclick="Xonomy.click(\''+t+"', 'warner')\"></span></span>",c+='<span class="name" title="'+i+'" onclick="Xonomy.click(\''+t+"', 'openingTagName')\">"+o+"</span>",c+='<span class="attributes">';for(var d=0;d<e.attributes.length;d++)l.verifyDocSpecAttribute(e.name,e.attributes[d].name),c+=l.renderAttribute(e.attributes[d],e.name);if(c+="</span>",c+='<span class="rollouter focusable" onclick="Xonomy.click(\''+t+"', 'rollouter')\"></span>",c+='<span class="punc slash">/</span>',c+='<span class="punc">&gt;</span>',c+="</span>",n.caption&&!n.oneliner(e)&&(c+="<span class='inlinecaption'>"+l.textByLang(n.caption(e))+"</span>"),c+='<span class="childrenCollapsed focusable" onclick="Xonomy.plusminus(\''+t+"', true)\">&middot;&middot;&middot;</span>",c+='<div class="children">',n.displayValue&&!e.hasElements())c+=l.renderDisplayText(e.getText(),n.displayValue(e));else {var u="";for(!r||0!=e.children.length&&"element"!=e.children[0].type||(c+=l.renderText(new s(""))),d=0;d<e.children.length;d++){var m=e.children[d];r&&"element"==u&&"element"==m.type&&(c+=l.renderText(new s(""))),"text"==m.type?c+=l.renderText(m):"element"==m.type&&(c+=l.renderElement(m)),u=m.type;}r&&e.children.length>1&&"element"==e.children[e.children.length-1].type&&(c+=l.renderText(new s("")));}return c+="</div>",c+='<span class="tag closing focusable" style="background-color: '+n.backgroundColour(e)+';">',c+='<span class="punc">&lt;</span>',c+='<span class="punc">/</span>',c+='<span class="name" onclick="Xonomy.click(\''+t+"', 'closingTagName')\">"+o+"</span>",c+='<span class="punc">&gt;</span>',c+="</span>",n.caption&&n.oneliner(e)&&(c+="<span class='inlinecaption'>"+l.textByLang(n.caption(e))+"</span>"),c+="</div>",e.htmlID=t,c},renderAttribute(e,t){var n=l.nextID(),a="attribute",r=!1,s=e.name,o=l.xmlEscape(e.value),i="",c="";if(t){var d=l.docSpec.elements[t].attributes[e.name];d&&(d.displayName&&(s=l.textByLang(d.displayName(e))),d.displayValue&&(o=l.textByLang(d.displayValue(e))),d.title&&(c=l.textByLang(d.title(e))),d.caption&&(i=l.textByLang(d.caption(e))),d.isReadOnly&&d.isReadOnly(e)&&(r=!0,a+=" readonly"),d.isInvisible&&d.isInvisible(e)&&(a+=" invisible"),d.shy&&d.shy(e)&&(a+=" shy"));}var u=!1;(o.startsWith("https://")||o.startsWith("http://"))&&(u=!0);var m="";m+='<span data-name="'+e.name+'" data-value="'+l.xmlEscape(e.value)+'" id="'+n+'" class="'+a+'">',m+='<span class="punc"> </span>';var p="";return r||(p=" onclick=\"Xonomy.click('"+n+"', 'attributeName')\""),m+='<span class="warner"><span class="inside" onclick="Xonomy.click(\''+n+"', 'warner')\"></span></span>",m+='<span class="name attributeName focusable" title="'+c+'"'+p+">"+s+"</span>",m+='<span class="punc">=</span>',p="",r||(p=" onclick=\"Xonomy.click('"+n+"', 'attributeValue')\""),m+='<span class="valueContainer attributeValue focusable"'+p+">",m+='<span class="punc">"</span>',m+=u?'<span class="value" title="'+o+'">URL</span>':'<span class="value">'+o+"</span>",m+='<span class="punc">"</span>',m+="</span>",u&&(i='<a href="'+o+'" target='+e.name+">🔗</a> "+i),i&&(m+="<span class='inlinecaption'>"+i+"</span>"),m+="</span>",e.htmlID=n,m},renderText(e){var t=l.nextID(),n="textnode focusable";""==$.trim(e.value)&&(n+=" whitespace"),""==e.value&&(n+=" empty");var a="";return a+='<div id="'+t+'" data-value="'+l.xmlEscape(e.value)+'" class="'+n+'">',a+='<span class="connector"></span>',a+='<span class="value" onclick="Xonomy.click(\''+t+'\', \'text\')"><span class="insertionPoint"><span class="inside"></span></span><span class="dots"></span>'+l.chewText(e.value)+"</span>",a+="</div>",e.htmlID=t,a},renderDisplayText(e,t){var n=l.nextID(),a="textnode";""==$.trim(t)&&(a+=" whitespace"),""==t&&(a+=" empty");var r="";return r+='<div id="'+n+'" data-value="'+l.xmlEscape(e)+'" class="'+a+'">',r+='<span class="connector"></span>',(r+='<span class="value" onclick="Xonomy.click(\''+n+'\', \'text\')"><span class="insertionPoint"><span class="inside"></span></span><span class="dots"></span>'+l.textByLang(t)+"</span>")+"</div>"},chewText:e=>e.split(" ").map(((e,t)=>`\n\t\t\t<span \n\t\t\t\tdata-index="${t}" \n\t\t\t\tdata-word="${e}" \n\t\t\t\tclass="word focusable" \n\t\t\t\tonclick="if((event.ctrlKey||event.metaKey) && $(this).closest('.element').hasClass('hasInlineMenu')) Xonomy.wordClick(this)"\n\t\t\t>\n\t\t\t\t${e}\n\t\t\t</span>`)).join(" "),wordClick(e){var t=$(e);if(l.clickoff(),!(t.closest(".readonly").length>0)){l.notclick=!0;const n=t.attr("id"),a=l.inlineMenu(n);l.wrapIndex=$(e).data("index"),l.wrapWord=$(e).data("word"),a&&"<div class='menu'></div>"!=a&&(document.body.appendChild(l.makeBubble(a)),l.showBubble($(e).last()));}},wrap(e,t){if(l.clickoff(),l.destroyBubble(),$("#"+e+" .children .element").length>0){$("#"+e+" .children .element").each((function(){l.unwrap(this.id);}));const t=l.harvestElement(document.getElementById(e)).getText().split(" ");l.wrapIndex=t.indexOf(l.wrapWord);}let n=t.template;const a=t.placeholder,r=l.harvestElement(document.getElementById(e)),o=r.getText();let i="";if(l.wrapIndex>0){var c=o.split(" ");i+=l.renderText(new s(c.slice(0,l.wrapIndex).join(" "))),n=n.replace(a,c[l.wrapIndex]);var d=l.xml2js(n,r);i+=" ",i+=l.renderElement(d);const e=d.htmlID;i+=" ",i+=l.renderText(new s(c.slice(l.wrapIndex+1).join(" "))),window.setTimeout((function(){l.setFocus(e,"openingTagName");}),100);}else n=n.replace(a,o),d=l.xml2js(n,r),i=l.renderElement(d);$("#"+e+" .children div").replaceWith(i),l.wrapIndex=-1,l.wrapWord="",l.changed();},unwrap(e){const t=$("#"+e)[0].parentElement.parentElement.id;l.clickoff();const n=l.harvestElement(document.getElementById(e));$("#"+e).replaceWith(l.renderText(new s(" "+n.getText()+" "))),l.changed(),window.setTimeout((function(){l.setFocus(t,"openingTagName");}),100);},plusminus(e,t){var n=$("#"+e),a=n.children(".children");n.hasClass("collapsed")?(a.hide(),n.removeClass("collapsed"),n.hasClass("oneliner")?a.fadeIn("fast"):a.slideDown("fast")):t||(l.updateCollapsoid(e),n.hasClass("oneliner")?a.fadeOut("fast",(function(){n.addClass("collapsed");})):a.slideUp("fast",(function(){n.addClass("collapsed");}))),window.setTimeout((function(){$("#"+l.currentHtmlId+" .opening:visible").length>0?l.setFocus(l.currentHtmlId,"openingTagName"):l.setFocus(l.currentHtmlId,"childrenCollapsed");}),300);},updateCollapsoid(e){var t=$("#"+e),n="",a=t.data("name"),r=l.docSpec.elements[a];if(r.collapsoid)n=r.collapsoid(l.harvestElement(t.toArray()[0]));else {var s=!1;t.find(".textnode").each((function(){for(var e=l.harvestText(this).value,t=0;t<e.length;t++)n.length<35?n+=e[t]:s=!0;n+=" ";})),n=n.replace(/  +/g," ").replace(/ +$/g,""),s&&!t.hasClass("oneliner")&&"..."!=n&&(n+="...");}""!=n&&n||(n="..."),t.children(".childrenCollapsed").html(n);},click(e,t){if(!l.notclick){l.clickoff(),l.currentHtmlId=e,l.currentFocus=t;var n=$("#"+e).hasClass("readonly")||$("#"+e).closest(".readonly").toArray().length>0;if(!n&&("openingTagName"==t||"closingTagName"==t)){$("#"+e).addClass("current"),""!=(u=l.elementMenu(e))&&"<div class='menu'></div>"!=u&&(document.body.appendChild(l.makeBubble(u)),"openingTagName"==t&&l.showBubble($("#"+e+" > .tag.opening > .name")),"closingTagName"==t&&l.showBubble($("#"+e+" > .tag.closing > .name")));var a=l.harvestElement(document.getElementById(e));$("#"+e).trigger("xonomy-click-element",[a]);}if(!n&&"attributeName"==t){$("#"+e).addClass("current"),""!=(u=l.attributeMenu(e))&&"<div class='menu'></div>"!=u&&(document.body.appendChild(l.makeBubble(u)),l.showBubble($("#"+e+" > .name")));var o=l.harvestAttribute(document.getElementById(e));$("#"+e).trigger("xonomy-click-attribute",[o]);}if(!n&&"attributeValue"==t){$("#"+e+" > .valueContainer").addClass("current");var i=$("#"+e).attr("data-name"),c=$("#"+e).attr("data-value"),d=$("#"+e).closest(".element").attr("data-name");l.verifyDocSpecAttribute(d,i);const n=l.docSpec.elements[d].attributes[i];""!=(u=n.asker(c,n.askerParameter,l.harvestAttribute(document.getElementById(e))))&&"<div class='menu'></div>"!=u&&(document.body.appendChild(l.makeBubble(u)),l.showBubble($("#"+e+" > .valueContainer > .value")),l.answer=function(n){var a=document.getElementById(e),s=l.renderAttribute(new r(i,n),d);$(a).replaceWith(s),l.changed(),window.setTimeout((function(){l.clickoff(),l.setFocus($(s).prop("id"),t);}),100);});}if(!n&&"text"==t){$("#"+e).addClass("current"),c=$("#"+e).attr("data-value"),d=$("#"+e).closest(".element").attr("data-name");const n=l.docSpec.elements[d],a=l.harvestElement(document.getElementById(e));""!=(u=n.asker(c,n.askerParameter,a))&&"<div class='menu'></div>"!=u&&(document.body.appendChild(l.makeBubble(u)),l.showBubble($("#"+e+" > .value")),l.answer=function(n){var a=document.getElementById(e),r=new s(n),o=l.renderText(r);$(a).replaceWith(o),l.changed(l.harvestText(document.getElementById(r.htmlID))),window.setTimeout((function(){l.clickoff(),l.setFocus($(o).prop("id"),t);}),100);});}if("warner"==t){for(var u="",m=0;m<l.warnings.length;m++){var p=l.warnings[m];p.htmlID==e&&(u+="<div class='warning'>"+l.formatCaption(l.textByLang(p.text))+"</div>");}document.body.appendChild(l.makeBubble(u)),l.showBubble($("#"+e+" .warner .inside").first());}"rollouter"==t&&$("#"+e+" > .tag.opening > .attributes").children(".shy").toArray().length>0&&($("#"+e).children(".tag.opening").children(".rollouter").hasClass("rolledout")?($("#"+e).children(".tag.opening").children(".rollouter").removeClass("rolledout"),$("#"+e).children(".tag.opening").children(".attributes").slideUp("fast",(function(){$(this).removeClass("rolledout").css("display","");}))):($("#"+e).children(".tag.opening").children(".rollouter").addClass("rolledout"),$("#"+e).children(".tag.opening").children(".attributes").addClass("rolledout").hide().slideDown("fast")),window.setTimeout((function(){l.setFocus(e,"rollouter");}),100)),l.notclick=!0;}},clickoff(e){l.notclick||(l.currentHtmlId=null,l.currentFocus=null,l.destroyBubble(),$(".xonomy .current").removeClass("current"),$(".xonomy .focused").removeClass("focused")),l.notclick=!1;},destroyBubble(){if(document.getElementById("xonomyBubble")){var e=document.getElementById("xonomyBubble");$(e).find(":focus").blur(),e.parentElement.removeChild(e),l.keyboardEventCatcher&&l.keyboardEventCatcher.focus();}},makeBubble(e){l.destroyBubble();var t=document.createElement("div");return t.id="xonomyBubble",t.className=l.mode,t.innerHTML="<div class='inside' onclick='Xonomy.notclick=true;'><div id='xonomyBubbleContent'>"+e+"</div></div>",t},showBubble(e){var t=$("#xonomyBubble"),n=e.offset(),a=$("body").width(),r=$(document).height(),s=t.outerHeight(),o=e.width();o>40&&(o=40);var i=e.height();i>25&&(i=25),"laic"==l.mode&&(o-=25,i+=10);var c,d,u=(c="",d="",n.top+i+s<=r?c=n.top+i+"px":r-n.top+5+s>0?d=r-n.top+5+"px":c=(r-s)/2+"px",{top:c,bottom:d});n.left<a/2?u.left=n.left+o-15+"px":(t.addClass("rightAnchored"),u.right=a-n.left+"px"),t.css(u),t.slideDown("fast",(function(){l.keyNav?t.find(".focusme").first().focus():t.find("input.focusme, select.focusme, textarea.focusme").first().focus();})),t.on("keyup",(function(e){27==e.which&&l.destroyBubble();})),l.keyNav&&t.find("div.focusme").on("keyup",(function(e){if(40==e.which){var n=$(e.delegateTarget);(a=t.find(".focusme:visible")).eq(a.index(n[0])+1).focus();}var a;38==e.which&&(n=$(e.delegateTarget),(a=t.find("div.focusme:visible")).eq(a.index(n[0])-1).focus());13==e.which&&($(e.delegateTarget).click(),l.notclick=!1);}));},askString(e,t,n){var a="";return a+="<form onsubmit='Xonomy.answer(this.val.value); return false'>",a+="<input name='val' class='textbox focusme' style='width: "+(.5*$("body").width()-75)+"px;' value='"+l.xmlEscape(e)+"' onkeyup='Xonomy.notKeyUp=true'/>",(a+=" <input type='submit' value='OK'>")+"</form>"},askLongString(e,t,n){var a="";return a+="<form onsubmit='Xonomy.answer(this.val.value); return false'>",a+="<textarea name='val' class='textbox focusme' spellcheck='false' style='width: "+(.5*$("body").width()-75)+"px; height: 150px;'>"+l.xmlEscape(e)+"</textarea>",(a+="<div class='submitline'><input type='submit' value='OK'></div>")+"</form>"},askPicklist:(e,t,n)=>""+l.pickerMenu(t,e),askOpenPicklist(e,t){var n="";return n+=l.pickerMenu(t,e),n+="<form class='undermenu' onsubmit='Xonomy.answer(this.val.value); return false'>",n+="<input name='val' class='textbox focusme' value='"+l.xmlEscape(e)+"' onkeyup='Xonomy.notKeyUp=true'/>",(n+=" <input type='submit' value='OK'>")+"</form>"},askRemote(e,t,n){var a="";return (t.searchUrl||t.createUrl)&&(a+="<form class='overmenu' onsubmit='return Xonomy.remoteSearch(\""+l.xmlEscape(t.searchUrl,!0)+'", "'+l.xmlEscape(t.urlPlaceholder,!0)+'", "'+l.xmlEscape(l.jsEscape(e))+"\")'>",a+="<input name='val' class='textbox focusme' value=''/>",t.searchUrl&&(a+=" <button class='buttonSearch' onclick='return Xonomy.remoteSearch(\""+l.xmlEscape(t.searchUrl,!0)+'", "'+l.xmlEscape(t.urlPlaceholder,!0)+'", "'+l.xmlEscape(l.jsEscape(e))+"\")'>&nbsp;</button>"),t.createUrl&&(a+=" <button class='buttonCreate' onclick='return Xonomy.remoteCreate(\""+l.xmlEscape(t.createUrl,!0)+'", "'+l.xmlEscape(t.searchUrl?t.searchUrl:t.url,!0)+'", "'+l.xmlEscape(t.urlPlaceholder,!0)+'", "'+l.xmlEscape(l.jsEscape(e))+"\")'>&nbsp;</button>"),a+="</form>"),a+=l.wyc(t.url,(function(n){if(t.add)for(var a=0;a<t.add.length;a++)n.push(t.add[a]);return l.pickerMenu(n,e)})),l.lastAskerParam=t,a},remoteSearch(e,t,n){var a=$("#xonomyBubble input.textbox").val();return e=e.replace(t,encodeURIComponent(a)),$("#xonomyBubble .menu").replaceWith(l.wyc(e,(function(e){var t=[];if(""==a&&l.lastAskerParam.add)for(var r=0;r<l.lastAskerParam.add.length;r++)t.push(l.lastAskerParam.add[r]);for(r=0;r<e.length;r++)t.push(e[r]);return l.pickerMenu(t,n)}))),!1},remoteCreate(e,t,n,a){var r=$.trim($("#xonomyBubble input.textbox").val());return ""!=r&&(e=e.replace(n,encodeURIComponent(r)),t=t.replace(n,encodeURIComponent(r)),$.ajax({url:e,dataType:"text",method:"POST"}).done((function(e){l.wycCache[t]&&delete l.wycCache[t],$("#xonomyBubble .menu").replaceWith(l.wyc(t,(function(e){return l.pickerMenu(e,a)})));}))),!1},pickerMenu(e,t){var n="";n+="<div class='menu'>";for(var a=0;a<e.length;a++){var r=e[a];"string"==typeof r&&(r={value:r,caption:""}),n+="<div class='menuItem focusme techno"+(r.value==t?" current":"")+"' tabindex='1' onclick='Xonomy.answer(\""+l.xmlEscape(r.value)+"\")'>";var s=!0;n+="<span class='punc'>\"</span>",r.displayValue?(n+=l.textByLang(r.displayValue),s=!1):(n+=l.xmlEscape(r.value),r.value&&(s=!1)),n+="<span class='punc'>\"</span>",""!=r.caption&&(n+=" <span class='explainer "+(s?"alone":"")+"'>"+l.xmlEscape(l.textByLang(r.caption))+"</span>"),n+="</div>";}return n+"</div>"},wyc(e,t){l.wycLastID++;var n="xonomy_wyc_"+l.wycLastID;return l.wycCache[e]?t(l.wycCache[e]):($.ajax({url:e,dataType:"json",method:"POST"}).done((function(a){$("#"+n).replaceWith(t(a)),l.wycCache[e]=a;})),"<span class='wyc' id='"+n+"'></span>")},toggleSubmenu(e){var t=$(e);t.hasClass("expanded")?t.find(".submenu").first().slideUp("fast",(function(){t.removeClass("expanded");})):t.find(".submenu").first().slideDown("fast",(function(){t.addClass("expanded");}));},internalMenu(e,t,n,a,r=[]){l.harvestCache={};var s=n(document.getElementById(e)),o=t.map((function(t,o){l.verifyDocSpecMenuItem(t);var i="";if(!t.hideIf(s)){r.push(o);var c="";t.icon&&(c="<span class='icon'><img src='"+t.icon+"'/></span> ");var d="";if(t.keyTrigger&&t.keyCaption&&(d="<span class='keyCaption'>"+l.textByLang(t.keyCaption)+"</span>"),t.menu){var u=l.internalMenu(e,t.menu,n,a,r);"<div class='submenu'></div>"!=u&&(i+="<div class='menuItem"+(t.expanded(s)?" expanded":"")+"'>",i+="<div class='menuLabel focusme' tabindex='0' onkeydown='if(Xonomy.keyNav && [37, 39].indexOf(event.which)>-1) Xonomy.toggleSubmenu(this.parentNode)' onclick='Xonomy.toggleSubmenu(this.parentNode)'>"+c+l.formatCaption(l.textByLang(t.caption(s)))+"</div>",i+=u,i+="</div>");}else i+="<div class='menuItem focusme' tabindex='0' onclick='Xonomy.callMenuFunction("+a(r)+', "'+e+"\")'>",i+=d+c+l.formatCaption(l.textByLang(t.caption(s))),i+="</div>";r.pop();}return i})),i=r.length?"submenu":"menu";return o.length?"<div class='"+i+"'>"+o.join("")+"</div>":""},attributeMenu(e){l.harvestCache={};var t=$("#"+e).attr("data-name"),n=$("#"+e).closest(".element").attr("data-name");l.verifyDocSpecAttribute(n,t);var a=l.docSpec.elements[n].attributes[t];return l.internalMenu(e,a.menu,l.harvestAttribute,(function(e){return 'Xonomy.docSpec.elements["'+n+'"].attributes["'+t+'"].menu['+e.join("].menu[")+"]"}))},elementMenu(e){l.harvestCache={};var t=$("#"+e).attr("data-name"),n=l.docSpec.elements[t];return l.internalMenu(e,n.menu,l.harvestElement,(function(e){return 'Xonomy.docSpec.elements["'+t+'"].menu['+e.join("].menu[")+"]"}))},inlineMenu(e){l.harvestCache={};var t=$("#"+e).attr("data-name"),n=l.docSpec.elements[t];return l.internalMenu(e,n.inlineMenu,l.harvestElement,(function(e){return 'Xonomy.docSpec.elements["'+t+'"].inlineMenu['+e.join("].menu[")+"]"}))},callMenuFunction(e,t){e.action(t,e.actionParameter);},formatCaption:e=>(e=(e=(e=(e=e.replace(/\<(\/?)([^\>\/]+)(\/?)\>/g,"<span class='techno'><span class='punc'>&lt;$1</span><span class='elName'>$2</span><span class='punc'>$3&gt;</span></span>")).replace(/\@"([^\"]+)"/g,"<span class='techno'><span class='punc'>\"</span><span class='atValue'>$1</span><span class='punc'>\"</span></span>")).replace(/\@([^ =]+)=""/g,"<span class='techno'><span class='atName'>$1</span><span class='punc'>=\"</span><span class='punc'>\"</span></span>")).replace(/\@([^ =]+)="([^\"]+)"/g,"<span class='techno'><span class='atName'>$1</span><span class='punc'>=\"</span><span class='atValue'>$2</span><span class='punc'>\"</span></span>")).replace(/\@([^ =]+)/g,"<span class='techno'><span class='atName'>$1</span></span>"),deleteAttribute(e,t){l.clickoff();var n=document.getElementById(e),a=n.parentElement.parentElement.parentElement.id;n.parentElement.removeChild(n),l.changed(),window.setTimeout((function(){l.setFocus(a,"openingTagName");}),100);},deleteElement(e,t){l.clickoff();var n=document.getElementById(e),a=n.parentElement.parentElement.id;$(n).fadeOut((function(){var e=n.parentElement;e.removeChild(n),l.changed(),0==$(e).closest(".layby").length&&window.setTimeout((function(){l.setFocus(a,"openingTagName");}),100);}));},newAttribute(e,t){l.clickoff();var n=$("#"+e),a=l.renderAttribute(new r(t.name,t.value),n.data("name"));$("#"+e+" > .tag.opening > .attributes").append(a),l.changed(),$("#"+e+" > .tag.opening > .attributes").children("[data-name='"+t.name+"'].shy").toArray().length>0&&($("#"+e).children(".tag.opening").children(".rollouter").hasClass("rolledout")||($("#"+e).children(".tag.opening").children(".rollouter").addClass("rolledout"),$("#"+e).children(".tag.opening").children(".attributes").addClass("rolledout").hide().slideDown("fast"))),""==t.value?l.click($(a).prop("id"),"attributeValue"):l.setFocus($(a).prop("id"),"attributeValue");},newElementChild(e,t){l.clickoff();var n=l.harvestElement(document.getElementById(e)),a=l.renderElement(l.xml2js(t,n)),r=$(a).hide();$("#"+e+" > .children").append(r),l.plusminus(e,!0),l.elementReorder(r.attr("id")),l.changed(),r.fadeIn(),window.setTimeout((function(){l.setFocus(r.prop("id"),"openingTagName");}),100);},elementReorder(e){var t=document.getElementById(e),n=l.docSpec.elements[t.getAttribute("data-name")];if(n.mustBeBefore){var a=$(t),r=l.harvestElement(t),s=n.mustBeBefore(r);do{i=!0;for(var o=0;o<s.length;o++)a.prevAll("*[data-name='"+s[o]+"']").toArray().length>0&&(a.prev().before(a),i=!1);}while(!i)}if(n.mustBeAfter){a=$(t),r=l.harvestElement(t);var i,c=n.mustBeAfter(r);do{for(i=!0,o=0;o<c.length;o++)a.nextAll("*[data-name='"+c[o]+"']").toArray().length>0&&(a.next().after(a),i=!1);}while(!i)}},newElementBefore(e,t){l.clickoff();var n=l.harvestElement(document.getElementById(e)),a=l.renderElement(l.xml2js(t,n.parent())),r=$(a).hide();$("#"+e).before(r),l.elementReorder(r.prop("id")),l.changed(),r.fadeIn(),window.setTimeout((function(){l.setFocus(r.prop("id"),"openingTagName");}),100);},newElementAfter(e,t){l.clickoff();var n=l.harvestElement(document.getElementById(e)),a=l.renderElement(l.xml2js(t,n.parent())),r=$(a).hide();$("#"+e).after(r),l.elementReorder(r.prop("id")),l.changed(),r.fadeIn(),window.setTimeout((function(){l.setFocus(r.prop("id"),"openingTagName");}),100);},replace(e,t){var n=l.currentFocus;l.clickoff();var a="";"element"==t.type&&(a=l.renderElement(t)),"attribute"==t.type&&(a=l.renderAttribute(t)),"text"==t.type&&(a=l.renderText(t)),$("#"+e).replaceWith(a),l.changed(),window.setTimeout((function(){l.setFocus($(a).prop("id"),n);}),100);},editRaw(e,t){var n=document.getElementById(e),a=l.harvestElement(n);if(t.fromJs)var r=t.fromJs(a);else r=t.fromXml?t.fromXml(l.js2xml(a)):l.js2xml(a);document.body.appendChild(l.makeBubble(l.askLongString(r))),l.showBubble($(n)),l.answer=function(n){var r;r=t.toJs?t.toJs(n,a):t.toXml?l.xml2js(t.toXml(n,a),a.parent()):l.xml2js(n,a.parent());var s=document.getElementById(e),o=l.renderElement(r);$(s).replaceWith(o),l.clickoff(),l.changed(),window.setTimeout((function(){l.setFocus($(o).prop("id"),"openingTagName");}),100);};},duplicateElement(e){l.clickoff();var t=document.getElementById(e).outerHTML;t=(t=(t=t.replace(/ id=['"]/g,(function(e){return e+"d_"}))).replace(/Xonomy\.click\(['"]/g,(function(e){return e+"d_"}))).replace(/Xonomy\.plusminus\(['"]/g,(function(e){return e+"d_"}));var n=$(t).hide();$("#"+e).after(n),l.changed(),n.fadeIn(),window.setTimeout((function(){l.setFocus(n.prop("id"),"openingTagName");}),100);},moveElementUp(e){l.clickoff();var t=$("#"+e);if(0==t.closest(".layby > .content").length){l.insertDropTargets(e);var n=$(".xonomy .elementDropper").add(t),a=n.index(t[0])-1;a>=0&&($(n[a]).replaceWith(t),l.changed(),t.hide().fadeIn()),l.dragend();}window.setTimeout((function(){l.setFocus(e,"openingTagName");}),100);},moveElementDown(e){l.clickoff();var t=$("#"+e);if(0==t.closest(".layby > .content").length){l.insertDropTargets(e);var n=$(".xonomy .elementDropper").add(t),a=n.index(t[0])+1;a<n.length&&($(n[a]).replaceWith(t),l.changed(),t.hide().fadeIn()),l.dragend();}window.setTimeout((function(){l.setFocus(e,"openingTagName");}),100);},canMoveElementUp(e){var t=!1,n=$("#"+e);return 0==n.closest(".layby > .content").length&&(l.insertDropTargets(e),$(".xonomy .elementDropper").add(n).index(n[0])-1>=0&&(t=!0),l.dragend()),t},canMoveElementDown(e){var t=!1,n=$("#"+e);if(0==n.closest(".layby > .content").length){l.insertDropTargets(e);var a=$(".xonomy .elementDropper").add(n);a.index(n[0])+1<a.length&&(t=!0),l.dragend();}return t},mergeWithPrevious(e,t){var n=document.getElementById(e),a=l.harvestElement(n),r=a.getPrecedingSibling();r&&l.mergeElements(a,r);},mergeWithNext(e,t){var n=document.getElementById(e),a=l.harvestElement(n),r=a.getFollowingSibling();r&&l.mergeElements(a,r);},mergeElements(e,t){l.clickoff();var n=document.getElementById(e.htmlID);if(t&&"element"==t.type){for(var a=0;a<e.attributes.length;a++){var r=e.attributes[a];t.hasAttribute(r.name)&&""!=t.getAttributeValue(r.name)||(t.setAttribute(r.name,r.value),t.hasAttribute(r.name)&&$("#"+t.getAttribute(r.name).htmlID).remove(),$("#"+t.htmlID).find(".attributes").first().append($("#"+e.attributes[a].htmlID)));}var o=l.docSpec.elements[e.name],i=l.docSpec.elements[t.name];if(o.hasText(e)||i.hasText(t))for(""!=t.getText()&&""!=e.getText()&&(t.addText(" "),$("#"+t.htmlID).find(".children").first().append(l.renderText(new s(" ")))),a=0;a<e.children.length;a++)t.children.push(e.children[a]),$("#"+t.htmlID).find(".children").first().append($("#"+e.children[a].htmlID));else for(const n of e.children){var c=l.js2xml(n),d=!1;for(const e of t.children)if(c==l.js2xml(e)){d=!0;break}d||(t.children.push(n),$("#"+t.htmlID).find(".children").first().append($("#"+n.htmlID)),l.elementReorder(n.htmlID));}n.parentElement.removeChild(n),l.changed(),window.setTimeout((function(){l.setFocus(t.htmlID,"openingTagName");}),100);}else window.setTimeout((function(){l.setFocus(e.htmlID,"openingTagName");}),100);},deleteEponymousSiblings(e,t){var n=l.currentFocus;l.clickoff();for(var a=document.getElementById(e),r=a.parentElement.parentElement,s=$(r).children(".children").toArray()[0].children,o=[],i=0;i<s.length;i++)o.push(s[i]);for(i=0;i<o.length;i++){var c=o[i];$(c).hasClass("element")&&$(c).attr("data-name")==$(a).attr("data-name")&&c!=a&&c.parentElement.removeChild(c);}l.changed(),window.setTimeout((function(){l.setFocus(e,n);}),100);},insertDropTargets(e){var t=$("#"+e);t.addClass("dragging");var n=t.attr("data-name"),a=l.docSpec.elements[n];$(".xonomy .element:visible > .children").append("<div class='elementDropper' ondragover='Xonomy.dragOver(event)' ondragleave='Xonomy.dragOut(event)' ondrop='Xonomy.drop(event)'><div class='inside'></div></div>"),$(".xonomy .element:visible > .children > .element").before("<div class='elementDropper' ondragover='Xonomy.dragOver(event)' ondragleave='Xonomy.dragOut(event)' ondrop='Xonomy.drop(event)'><div class='inside'></div></div>"),$(".xonomy .element:visible > .children > .text").before("<div class='elementDropper' ondragover='Xonomy.dragOver(event)' ondragleave='Xonomy.dragOut(event)' ondrop='Xonomy.drop(event)'><div class='inside'></div></div>"),$(".xonomy .dragging .children:visible > .elementDropper").remove(),$(".xonomy .dragging").prev(".elementDropper").remove(),$(".xonomy .dragging").next(".elementDropper").remove(),$(".xonomy .children:visible > .element.readonly .elementDropper").remove();var r={},s=function(e){var t=$(e).prop("id");return r[t]||(r[t]=l.harvestElement(e)),r[t]};if(a.localDropOnly(s(t.toArray()[0]))&&a.canDropTo)for(var o=$(".xonomy .elementDropper").toArray(),i=0;i<o.length;i++)(u=o[i]).parentNode!=t.get(0).parentElement.parentElement.parentElement&&u.parentElement.removeChild(u);if(a.canDropTo)for(o=$(".xonomy .elementDropper").toArray(),i=0;i<o.length;i++){var c=(u=o[i]).parentElement.parentElement.getAttribute("data-name");$.inArray(c,a.canDropTo)<0&&u.parentElement.removeChild(u);}if(a.mustBeBefore){var d=s(t.toArray()[0]);for(o=$(".xonomy .elementDropper").toArray(),i=0;i<o.length;i++){var u=o[i];d.internalParent=s(u.parentElement.parentElement);for(var m=a.mustBeBefore(d),p=0;p<m.length;p++)$(u).prevAll("*[data-name='"+m[p]+"']").toArray().length>0&&u.parentElement.removeChild(u);}}if(a.mustBeAfter)for(d=s(t.toArray()[0]),o=$(".xonomy .elementDropper").toArray(),i=0;i<o.length;i++){u=o[i],d.internalParent=s(u.parentElement.parentElement);var h=a.mustBeAfter(d);for(p=0;p<h.length;p++)$(u).nextAll("*[data-name='"+h[p]+"']").toArray().length>0&&u.parentElement.removeChild(u);}},drag(e){e.dataTransfer.effectAllowed="move";var t=e.target.parentElement.parentElement.id;e.dataTransfer.setData("text",t),setTimeout((function(){l.clickoff(),l.insertDropTargets(t),l.draggingID=t,l.refresh();}),10);},dragOver(e){e.preventDefault(),e.dataTransfer.dropEffect="move",$(e.currentTarget).hasClass("layby")?$(e.currentTarget).addClass("activeDropper"):$(e.target.parentElement).addClass("activeDropper");},dragOut(e){e.preventDefault(),$(e.currentTarget).hasClass("layby")?$(e.currentTarget).removeClass("activeDropper"):$(".xonomy .activeDropper").removeClass("activeDropper");},drop(e){e.preventDefault();var t=document.getElementById(l.draggingID);$(e.currentTarget).hasClass("layby")?($(t).hide(),$(".xonomy .layby > .content").append(t),$(t).fadeIn((function(){l.changed();}))):($(t).hide(),$(e.target.parentElement).replaceWith(t),$(t).fadeIn((function(){l.changed();}))),l.openCloseLayby(),l.recomputeLayby();},dragend(e){$(".xonomy .attributeDropper").remove(),$(".xonomy .elementDropper").remove(),$(".xonomy .dragging").removeClass("dragging"),l.refresh(),$(".xonomy .layby").removeClass("activeDropper");},openCloseLayby(){$(".xonomy .layby > .content > *").length>0?$(".xonomy .layby").removeClass("closed").addClass("open"):$(".xonomy .layby").removeClass("open").addClass("closed");},openLayby(){$(".xonomy .layby").removeClass("closed").addClass("open");},closeLayby(){window.setTimeout((function(){$(".xonomy .layby").removeClass("open").addClass("closed");}),10);},emptyLayby(){$(".xonomy .layby .content").html(""),$(".xonomy .layby").removeClass("nonempty").addClass("empty");},recomputeLayby(){$(".xonomy .layby > .content > *").length>0?$(".xonomy .layby").removeClass("empty").addClass("nonempty"):$(".xonomy .layby").removeClass("nonempty").addClass("empty");},newElementLayby(e){l.clickoff();var t=l.renderElement(l.xml2js(e)),n=$(t).hide();$(".xonomy .layby > .content").append(n),l.refresh(),n.fadeIn(),l.openCloseLayby(),l.recomputeLayby();},changed(e){l.harvestCache={},l.refresh(),l.validate(),l.docSpec.onchange(e);},validate(){var e=l.harvestElement($(".xonomy .element").toArray()[0]);$(".xonomy .invalid").removeClass("invalid"),l.warnings=[],l.docSpec.validate(e);for(var t=0;t<l.warnings.length;t++){var n=l.warnings[t];$("#"+n.htmlID).addClass("invalid");}},textByLang(e){e||(e="");for(var t=e,n=e.split("|"),a=0;a<n.length;a++){var r=$.trim(n[a]);0==r.indexOf(l.lang+":")&&(t=r.substring((l.lang+":").length,t.length));}return $.trim(t)},startKeyNav(e,t){l.keyNav=!0;var n=$(e);e||(n=$(".xonomy"));var a=$(t);t||(a=n),n.attr("tabindex","0"),n.on("keydown",l.key),$(document).on("keydown",(function(e){[32,37,38,39,40].indexOf(e.keyCode)>-1&&0==$("input:focus, select:focus, textarea:focus").length&&e.preventDefault();})),l.keyboardEventCatcher=n,l.scrollableContainer=a;},setFocus(e,t){l.keyNav&&($(".xonomy .current").removeClass("current"),$(".xonomy .focused").removeClass("focused"),"attributeValue"==t?$("#"+e+" > .valueContainer").addClass("current").addClass("focused"):$("#"+e).addClass("current").addClass("focused"),l.currentHtmlId=e,l.currentFocus=t,"openingTagName"==l.currentFocus&&$("#"+e+" > .tag.opening").first().addClass("focused"),"closingTagName"==l.currentFocus&&$("#"+e+" > .tag.closing").last().addClass("focused"),"childrenCollapsed"==l.currentFocus&&$("#"+e+" > .childrenCollapsed").last().addClass("focused"),"rollouter"==l.currentFocus&&$("#"+e+" > .tag.opening > .rollouter").last().addClass("focused"));},key(e){if(!l.notKeyUp)if(e.shiftKey||$("#xonomyBubble").length)$("#xonomyBubble").length?13==e.which&&e.ctrlKey&&(e.preventDefault(),e.stopImmediatePropagation(),$("#xonomyBubble form").trigger("submit")):l.keyboardMenu(e);else if(27==e.which)e.preventDefault(),e.stopImmediatePropagation(),l.destroyBubble();else if(13==e.which)e.preventDefault(),e.stopImmediatePropagation(),"childrenCollapsed"==l.currentFocus?l.plusminus(l.currentHtmlId,!0):(l.click(l.currentHtmlId,l.currentFocus),l.clickoff());else if((e.ctrlKey||e.metaKey)&&40==e.which)e.preventDefault(),e.stopImmediatePropagation(),l.scrollableContainer.scrollTop(l.scrollableContainer.scrollTop()+60);else if((e.ctrlKey||e.metaKey)&&38==e.which)e.preventDefault(),e.stopImmediatePropagation(),l.scrollableContainer.scrollTop(l.scrollableContainer.scrollTop()-60);else if((e.ctrlKey||e.metaKey)&&[37,39].indexOf(e.which)>-1){e.preventDefault(),e.stopImmediatePropagation();var t=$("#"+l.currentHtmlId);t.hasClass("element")&&!t.hasClass("uncollapsible")&&(39==e.which&&t.hasClass("collapsed")&&l.plusminus(l.currentHtmlId),37!=e.which||t.hasClass("collapsed")||l.plusminus(l.currentHtmlId));}else [37,38,39,40].indexOf(e.which)>-1&&!e.altKey&&(e.preventDefault(),e.stopImmediatePropagation(),l.currentHtmlId?0==$(".xonomy .focused").length?l.setFocus(l.currentHtmlId,l.currentFocus):(40==e.which&&l.goDown(),38==e.which&&l.goUp(),39==e.which&&l.goRight(),37==e.which&&l.goLeft()):l.setFocus($(".xonomy .element").first().prop("id"),"openingTagName"));l.notKeyUp=!1;},keyboardMenu(e){l.harvestCache={};var t=$("#"+l.currentHtmlId),n=null,a=null;if(t.hasClass("element")){n=l.harvestElement(t[0]);var r=t.attr("data-name");a=l.docSpec.elements[r].menu;}else if(t.hasClass("attribute")){n=l.harvestAttribute(t[0]);var s=t.attr("data-name");r=t.closest(".element").attr("data-name"),a=l.docSpec.elements[r].attributes[s].menu;}if(a){l.harvestCache={};var o=function(t){var a=null;for(const r of t)if(r.menu?a=o(r.menu):r.keyTrigger&&!r.hideIf(n)&&r.keyTrigger(e)&&(a=r),a)break;return a},i=o(a);if(i)return l.callMenuFunction(i,l.currentHtmlId),l.clickoff(),!0}return !1},goDown(){if("openingTagName"!=l.currentFocus&&"closingTagName"!=l.currentFocus&&"text"!=l.currentFocus)l.goRight();else {var e=$("#"+l.currentHtmlId),t=e;if("openingTagName"==l.currentFocus&&(t=e.find(".tag.opening").first()),"closingTagName"==l.currentFocus&&(t=e.find(".tag.closing").last()),n=(n=$(".xonomy .focusable:visible").not(".attributeName").not(".attributeValue").not(".childrenCollapsed").not(".rollouter")).add(e),"openingTagName"==l.currentFocus&&e.hasClass("oneliner")&&(n=n.not("#"+l.currentHtmlId+" .tag.closing").not("#"+l.currentHtmlId+" .children *")),"openingTagName"==l.currentFocus&&e.hasClass("oneliner")&&(n=n.not("#"+l.currentHtmlId+" .textnode")),e.hasClass("collapsed")&&(n=n.not("#"+l.currentHtmlId+" .tag.closing")),e.hasClass("textnode")&&$(".xonomy").hasClass("nerd"))var n=e.closest(".element").find(".tag.closing").last();e.hasClass("textnode")&&$(".xonomy").hasClass("laic")&&(n=e.closest(".element").next().find(".focusable:visible").first());var a=n.eq(n.index(t[0])+1);a.hasClass("opening")&&l.setFocus(a.closest(".element").prop("id"),"openingTagName"),a.hasClass("closing")&&l.setFocus(a.closest(".element").prop("id"),"closingTagName"),a.hasClass("textnode")&&l.setFocus(a.prop("id"),"text");}},goUp(){if("openingTagName"!=l.currentFocus&&"closingTagName"!=l.currentFocus&&"text"!=l.currentFocus)l.goLeft();else {var e=$("#"+l.currentHtmlId),t=e;if("openingTagName"==l.currentFocus&&(t=e.find(".tag.opening").first()),"closingTagName"==l.currentFocus&&(t=e.find(".tag.closing").last()),n=(n=(n=(n=$(".xonomy .focusable:visible").not(".attributeName").not(".attributeValue").not(".childrenCollapsed").not(".rollouter")).not(".element .oneliner .tag.closing")).not(".element .oneliner .textnode")).not(".element .collapsed .tag.closing"),e.hasClass("textnode"))var n=e.closest(".element").find(".tag.opening").first().add(e);if(t.hasClass("closing")&&e.hasClass("hasText")&&(n=n.not("#"+l.currentHtmlId+" .children *:not(:first-child)")),t.hasClass("opening")&&e.closest(".element").prev().hasClass("hasText")){var a=e.closest(".element").prev().prop("id");n=n.not("#"+a+" .children *:not(:first-child)");}if(n.index(t[0])>0){var r=n.eq(n.index(t[0])-1);r.hasClass("opening")&&l.setFocus(r.closest(".element").prop("id"),"openingTagName"),r.hasClass("closing")&&l.setFocus(r.closest(".element").prop("id"),"closingTagName"),r.hasClass("textnode")&&l.setFocus(r.prop("id"),"text");}}},goRight(){var e=$("#"+l.currentHtmlId),t=e;"openingTagName"==l.currentFocus&&(t=e.find(".tag.opening").first()),"closingTagName"==l.currentFocus&&(t=e.find(".tag.closing").last()),"attributeName"==l.currentFocus&&(t=e.find(".attributeName").first()),"attributeValue"==l.currentFocus&&(t=e.find(".attributeValue").first()),"childrenCollapsed"==l.currentFocus&&(t=e.find(".childrenCollapsed").first()),"rollouter"==l.currentFocus&&(t=e.find(".rollouter").first());var n=$(".xonomy .focusable:visible"),a=n.eq(n.index(t[0])+1);a.hasClass("attributeName")&&l.setFocus(a.closest(".attribute").prop("id"),"attributeName"),a.hasClass("attributeValue")&&l.setFocus(a.closest(".attribute").prop("id"),"attributeValue"),a.hasClass("opening")&&l.setFocus(a.closest(".element").prop("id"),"openingTagName"),a.hasClass("closing")&&l.setFocus(a.closest(".element").prop("id"),"closingTagName"),a.hasClass("textnode")&&l.setFocus(a.prop("id"),"text"),a.hasClass("childrenCollapsed")&&l.setFocus(a.closest(".element").prop("id"),"childrenCollapsed"),a.hasClass("rollouter")&&l.setFocus(a.closest(".element").prop("id"),"rollouter");},goLeft(){var e=$("#"+l.currentHtmlId),t=e;"openingTagName"==l.currentFocus&&(t=e.find(".tag.opening").first()),"closingTagName"==l.currentFocus&&(t=e.find(".tag.closing").last()),"attributeName"==l.currentFocus&&(t=e.find(".attributeName").first()),"attributeValue"==l.currentFocus&&(t=e.find(".attributeValue").first()),"childrenCollapsed"==l.currentFocus&&(t=e.find(".childrenCollapsed").first()),"rollouter"==l.currentFocus&&(t=e.find(".rollouter").first());var n=$(".xonomy .focusable:visible"),a=n.eq(n.index(t[0])-1);a.hasClass("attributeName")&&l.setFocus(a.closest(".attribute").prop("id"),"attributeName"),a.hasClass("attributeValue")&&l.setFocus(a.closest(".attribute").prop("id"),"attributeValue"),a.hasClass("opening")&&l.setFocus(a.closest(".element").prop("id"),"openingTagName"),a.hasClass("closing")&&l.setFocus(a.closest(".element").prop("id"),"closingTagName"),a.hasClass("textnode")&&l.setFocus(a.prop("id"),"text"),a.hasClass("childrenCollapsed")&&l.setFocus(a.closest(".element").prop("id"),"childrenCollapsed"),a.hasClass("rollouter")&&l.setFocus(a.closest(".element").prop("id"),"rollouter");}};l.verifyDocSpec();const o=l;})();})();

  /*!
   * JavaScript Cookie v2.1.4
   * https://github.com/js-cookie/js-cookie
   *
   * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
   * Released under the MIT license
   */
  (function (factory) {
  	var registeredInModuleLoader = false;
  	if (typeof define === 'function' && define.amd) {
  		define(factory);
  		registeredInModuleLoader = true;
  	}
  	if (typeof exports === 'object') {
  		module.exports = factory();
  		registeredInModuleLoader = true;
  	}
  	if (!registeredInModuleLoader) {
  		var OldCookies = window.Cookies;
  		var api = window.Cookies = factory();
  		api.noConflict = function () {
  			window.Cookies = OldCookies;
  			return api;
  		};
  	}
  }(function () {
  	function extend () {
  		var i = 0;
  		var result = {};
  		for (; i < arguments.length; i++) {
  			var attributes = arguments[ i ];
  			for (var key in attributes) {
  				result[key] = attributes[key];
  			}
  		}
  		return result;
  	}

  	function init (converter) {
  		function api (key, value, attributes) {
  			var result;
  			if (typeof document === 'undefined') {
  				return;
  			}

  			// Write

  			if (arguments.length > 1) {
  				attributes = extend({
  					path: '/'
  				}, api.defaults, attributes);

  				if (typeof attributes.expires === 'number') {
  					var expires = new Date();
  					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
  					attributes.expires = expires;
  				}

  				// We're using "expires" because "max-age" is not supported by IE
  				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

  				try {
  					result = JSON.stringify(value);
  					if (/^[\{\[]/.test(result)) {
  						value = result;
  					}
  				} catch (e) {}

  				if (!converter.write) {
  					value = encodeURIComponent(String(value))
  						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
  				} else {
  					value = converter.write(value, key);
  				}

  				key = encodeURIComponent(String(key));
  				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
  				key = key.replace(/[\(\)]/g, escape);

  				var stringifiedAttributes = '';

  				for (var attributeName in attributes) {
  					if (!attributes[attributeName]) {
  						continue;
  					}
  					stringifiedAttributes += '; ' + attributeName;
  					if (attributes[attributeName] === true) {
  						continue;
  					}
  					stringifiedAttributes += '=' + attributes[attributeName];
  				}
  				return (document.cookie = key + '=' + value + stringifiedAttributes);
  			}

  			// Read

  			if (!key) {
  				result = {};
  			}

  			// To prevent the for loop in the first place assign an empty array
  			// in case there are no cookies at all. Also prevents odd result when
  			// calling "get()"
  			var cookies = document.cookie ? document.cookie.split('; ') : [];
  			var rdecode = /(%[0-9A-Z]{2})+/g;
  			var i = 0;

  			for (; i < cookies.length; i++) {
  				var parts = cookies[i].split('=');
  				var cookie = parts.slice(1).join('=');

  				if (cookie.charAt(0) === '"') {
  					cookie = cookie.slice(1, -1);
  				}

  				try {
  					var name = parts[0].replace(rdecode, decodeURIComponent);
  					cookie = converter.read ?
  						converter.read(cookie, name) : converter(cookie, name) ||
  						cookie.replace(rdecode, decodeURIComponent);

  					if (this.json) {
  						try {
  							cookie = JSON.parse(cookie);
  						} catch (e) {}
  					}

  					if (key === name) {
  						result = cookie;
  						break;
  					}

  					if (!key) {
  						result[name] = cookie;
  					}
  				} catch (e) {}
  			}

  			return result;
  		}

  		api.set = api;
  		api.get = function (key) {
  			return api.call(api, key);
  		};
  		api.getJSON = function () {
  			return api.apply({
  				json: true
  			}, [].slice.call(arguments));
  		};
  		api.defaults = {};

  		api.remove = function (key, attributes) {
  			api(key, '', extend(attributes, {
  				expires: -1
  			}));
  		};

  		api.withConverter = init;

  		return api;
  	}

  	return init(function () {});
  }));

  //var Xonomy = require('./xonomy.js');

  //element name
  var nameRe = '[:A-Z_a-z][:A-Z_a-z.\\-0-9]*';
  //element content
  var contentRe = 'ANY|EMPTY|\\([:A-Z_a-z.\\-0-9#\\%;|?,\\s+*()]*\\)[+*?]?';
  var atDefinitionRe = '\\s*('+nameRe+')\\s+(CDATA|ID|IDREF|ENTITY|ENTITIES|NMTOKEN|NMTOKENS|[|\\(\\)\\S]+)\\s+(#REQUIRED|#IMPLIED|#FIXED [\'"\\S]+|[\'"\\S]+)';
  //element definition
  var elRe = '<!ELEMENT\\s+('+nameRe+')\\s+('+contentRe+')\\s*>';
  //attribute definition
  var atRe = '<!ATTLIST\\s+('+nameRe+')\\s+(('+atDefinitionRe+')+)\\s*>';
  //entity definition
  var enRe = '<!ENTITY\\s+%\\s+[a-zA-Z0-9]*\\s+"[^^"]*"[^^>]*>';
  var elements = new Array();
  var attributes = new Array();
  var usedChildren = new Array();
  var entities = {};

  //parse single element definition
  //returns object: element name; can element include text; children structure
  function parseElement(text) {
    var elRegex = new RegExp(elRe, 'g');
    var results = elRegex.exec(text);
    if (results == null) return null;
    var elName = results[1];
    var content = results[2];
    //replace all entities with values
    Object.entries(entities).forEach(function(val,key) {
      content = content.replace('%'+val[0]+';', val[1]);
    });
    var hasText = false;
    var children = null;
    if (content == 'ANY' || content.includes('#PCDATA')) {
      hasText = true;
    }
    if (content.startsWith('(') && content.substring(0,9) != '(#PCDATA)') {
      children = parseElementContent(content);
    }
    return {name:elName, hasText:hasText, children:children};
  }

  //parse single attlist, may have more attributes
  function parseAttribute(text) {
    var atRegex = new RegExp(atRe, 'gm');
    var results = atRegex.exec(text);
    if (results == null) return null;
    var elName = results[1];
    var atDef = results[2];
    //parse each attribute definition
    var atDefRegex = new RegExp('('+atDefinitionRe+')', 'mg');
    var resultsDef = atDef.match(atDefRegex);
    if (resultsDef != null) resultsDef.forEach(function(atDefMatch){
      var atSingleRegex = new RegExp(atDefinitionRe, 'm');
      var resultsAt = atDefMatch.match(atSingleRegex);
      var atName = resultsAt[1];
      var isReadOnly = false;
      var isRequired  = false;
      var menu = null;
      var defaultValue = null;
      if (resultsAt[3].includes('#FIXED')) {
        isReadOnly = true;
      }
      if (resultsAt[3].includes('#REQUIRED')) {
        isRequired = true;
      }
      if (resultsAt[2].startsWith('(')) {
        menu = resultsAt[2].substr(1,(resultsAt[2].length-2)).split('|');
      }
      if (!(resultsAt[3].startsWith('#'))) {
        defaultValue = resultsAt[3].substr(1,(resultsAt[3].length-2));
      }
      attributes.push({element:elName, name:atName, defaultValue:defaultValue, required:isRequired, readOnly:isReadOnly, options:menu});
    });
  }

  //parse content of element children spec, return object
  function parseElementContent(elContent) {
    var childrenArray = new Array();
    //not interested in text content here
    elContent = elContent.replace(/#PCDATA\s*\|/, '').trim();
    var minRepeat, maxRepeat = null;
    //detect min and max repeat from last character
    switch(elContent.slice(-1)) {
    case '?':
      minRepeat = 0;
      maxRepeat = 1;
      elContent = elContent.substr(0,(elContent.length-1));
      break;
    case '*':
      minRepeat = 0;
      maxRepeat = null;
      elContent = elContent.substr(0,(elContent.length-1));
      break;
    case '+':
      minRepeat = 1;
      maxRepeat = null;
      elContent = elContent.substr(0,(elContent.length-1));
      break;
    default:
      minRepeat = 1;
      maxRepeat = 1;
      break;
    }
    //if enclosed in parentheses, remove them
    if (elContent.charAt(0) == '(') {
      elContent = elContent.substr(1,(elContent.length-2));
    }

    var type = 'element';
    //try to split by |, if more than one, we treat content as choice
    if (SplitBalanced(elContent,'\\|').length>1) {
      type = 'choice';
      SplitBalanced(elContent, '\\|').forEach(function(splitPart){
        childrenArray.push(parseElementContent(splitPart.trim()));
      });
    } else {
      //otherwise try to split by , and treat content as sequence
      if (SplitBalanced(elContent,",").length>1 || elContent.slice(-1) == '*' || elContent.slice(-1) == '?' || elContent.slice(-1) == '+') {
        type = 'sequence';
        SplitBalanced(elContent, ",").forEach(function(splitPart){
          childrenArray.push(parseElementContent(splitPart.trim()));
        });
      } else {
        //if not choice or sequence, this must be element
        childrenArray.push(elContent);
        usedChildren.push(elContent);
      }
    }
    var result = {minRepeat:minRepeat, maxRepeat:maxRepeat, type:type, children:childrenArray};
    return result;
  }

  function SplitBalanced(input, split, open, close, toggle, escape) {
      // Build the pattern from params with defaults:
      var pattern = "([\\s\\S]*?)(e)?(?:(o)|(c)|(t)|(sp)|$)"
                      .replace("sp", split)
                      .replace("o", open || "[\\(\\{\\[]")
                      .replace("c", close || "[\\)\\}\\]]")
                      .replace("t", toggle || "['\"]")
                      .replace("e", escape || "[\\\\]");
      var r = new RegExp(pattern, "gi");
      var stack = [];
      var buffer = [];
      var results = [];
      input.replace(r, function($0,$1,$e,$o,$c,$t,$s,i){
          if ($e) { // Escape
              buffer.push($1, $s || $o || $c || $t);
              return;
          }
          else if ($o) // Open
              stack.push($o);
          else if ($c) // Close
              stack.pop();
          else if ($t) { // Toggle
              if (stack[stack.length-1] !== $t)
                  stack.push($t);
              else
                  stack.pop();
          }
          else { // Split (if no stack) or EOF
              if ($s ? !stack.length : !$1) {
                 buffer.push($1);
                 results.push(buffer.join(""));
                 buffer = [];
                 return;
              }
          }
          buffer.push($0);
      });
      return results;
  }

  //parse DTD in text string to structure object
  function parseDTD$1(dtdData) {
    elements = new Array();
    attributes = new Array();
    usedChildren = new Array();
    entities = {};

    //find entities and remember values
    var enRegex = new RegExp('('+enRe+')', 'gm');
    var results = dtdData.match(enRegex);
    if (results != null) results.forEach(function(enMatch){
      enMatch = enMatch.replace(/(\r\n|\n|\r)/gm," ");
      var enResult = enMatch.match(/<!ENTITY\s+%\s+([a-zA-Z0-9]*)\s+"([^"]*)"[^>]*>/);
      if (enResult != null) {
        entities[enResult[1]] = enResult[2];
      }
    });

    //find element definitions and parse each definition to get [name,hastext,children]
    var elRegex = new RegExp('('+elRe+')', 'gm');
    var results = dtdData.match(elRegex);
    if (results != null) results.forEach(function(elMatch){
      var elResult = parseElement(elMatch);
      if (elResult != null) {
        elements.push(elResult);
      }
    });

    //find attribute definitions and parse each definition to get [element,name,options]
    var atRegex = new RegExp('('+atRe+')', 'gm');
    var results = dtdData.match(atRegex);
    if (results != null) results.forEach(function(atMatch){
      parseAttribute(atMatch);
    });

    //root element is the element not appearing in children list
    var root = null;
    elements.forEach(function(item){
      if (!usedChildren.includes(item.name)) {
        root = item.name;
      }
    });
    var xmlStructure = {elements: elements, attributes: attributes, root:root};
    return xmlStructure;
  }

  //initial XML fragment for element - select required children
  function initialElement(element) {
    if (element == undefined) return '';
    var ret = "<"+element.name+">";
    if (element.children != null) {
      var children = getFlatChildren(element);
      children.forEach(function(chEl) {
        if (chEl.min > 0) {
          ret += "<"+chEl.name+"/>";
        }
      });
    }
    ret += "</"+element.name+">";
    return ret;
  }

  //transform xml structure to Xonomy docSpec
  function struct2Xonomy$1(xmlStructure) {
  	var docSpec = {
  		elements: {},
  		unknownElement: function(elName){
  			if(elName.indexOf("lxnm:")==0) return {
  				isReadOnly: true,
  				isInvisible: true,
  			};
  			return {
  				oneliner: function(jsMe){ return !jsMe.hasElements(); },
  				menu: [{caption: "Delete", action: Xonomy.deleteElement, hideIf: function(jsMe){return !jsMe.parent();}}],
  			};
  		},
  		unknownAttribute: function(elName, atName){
  			if(atName.indexOf("lxnm:")==0) return {
  				isReadOnly: true,
  				isInvisible: true,
  			};
  			return  {
  				menu: [{caption: "Delete", action: Xonomy.deleteAttribute}],
  			};
  		},
  		validate: function(jsElement){  },
  	};
    //add information for elements
    xmlStructure.elements.forEach(function(itemEl) {
      var del = {menu: [], inlineMenu: [], collapsible: false};
      docSpec.elements[itemEl.name] = del;
  		var submenu=[];

  		//children of inl elements have a menu item to unwrap themselves:
  		submenu.push({
  			caption: "Unwrap <"+itemEl.name+">",
  			action: Xonomy.unwrap,
  			hideIf: function(jsMe){return jsMe.parent()==null || xmlStructure.elements.find(function(xe) {return xe.name==jsMe.parent().name}).hasText==false; },
  			keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==88 },
  			keyCaption: "Ctrl + Shift + X",
  		});

  		//all elements have a menu item to remove themselves, except the top-level element and except children of inl elements:
  		submenu.push({
  			caption: "Remove <"+itemEl.name+">",
  			action: Xonomy.deleteElement,
  			hideIf: function(jsMe){ return jsMe.parent()==null || xmlStructure.elements.find(function(xe) {return xe.name==jsMe.parent().name}).hasText==true; },
  			keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==88 },
  			keyCaption: "Ctrl + Shift + X",
  		});

  		//all elements have a menu item to duplicate themselves, except the top-level element and except children of inl elements:
  		submenu.push({
  			caption: "Duplicate <"+itemEl.name+">",
  			action: Xonomy.duplicateElement,
  			hideIf: function(jsMe){ return jsMe.parent()==null || xmlStructure.elements.find(function(xe) {return xe.name==jsMe.parent().name}).hasText==true; },
  			keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==68 },
  			keyCaption: "Ctrl + Shift + D",
  		});
  		//all elements have a menu item to move themselves up and down, except the top-level element, and except children of inl elements, and expect elements that have nowhere to move to:
  		submenu.push({
  			caption: "Move <"+itemEl.name+"> up",
  			action: Xonomy.moveElementUp,
  			hideIf: function(jsMe){ return jsMe.parent()==null || xmlStructure.elements.find(function(xe) {return xe.name==jsMe.parent().name}).hasText==true || !Xonomy.canMoveElementUp(jsMe.htmlID); },
  			keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==38 },
  			keyCaption: "Ctrl + Shift + Up",
  		});
  		submenu.push({
  			caption: "Move <"+itemEl.name+"> down",
  			action: Xonomy.moveElementDown,
  			hideIf: function(jsMe){ return jsMe.parent()==null || xmlStructure.elements.find(function(xe) {return xe.name==jsMe.parent().name}).hasText==true || !Xonomy.canMoveElementDown(jsMe.htmlID); },
  			keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==40 },
  			keyCaption: "Ctrl + Shift + Down",
  		});
  		//all elements have a menu item to merge themselves with a sibling, except the top-level element, and except children of inl elements, and expect elements that have no-one to merge with:
  		submenu.push({
  			caption: "Merge <"+itemEl.name+"> with previous",
  			action: Xonomy.mergeWithPrevious,
  			hideIf: function(jsMe){ return jsMe.parent()==null || xmlStructure.elements.find(function(xe) {return xe.name==jsMe.parent().name}).hasText==true || !jsMe.getPrecedingSibling() || jsMe.getPrecedingSibling().name!=itemEl.name },
  			keyTrigger: function(event){ return event.altKey && event.shiftKey && event.which==38 },
  			keyCaption: "Alt + Shift + Up",
  		});
  		submenu.push({
  			caption: "Merge <"+itemEl.name+"> with next",
  			action: Xonomy.mergeWithNext,
  			hideIf: function(jsMe){ return jsMe.parent()==null || xmlStructure.elements.find(function(xe) {return xe.name==jsMe.parent().name}).hasText==true || !jsMe.getFollowingSibling() || jsMe.getFollowingSibling().name!=itemEl.name },
  			keyTrigger: function(event){ return event.altKey && event.shiftKey && event.which==40 },
  			keyCaption: "Alt + Shift + Down",
  		});

  		if(submenu.length>0) {
  			del.menu.push({
  				caption: "This element",
  				menu: submenu,
  				expanded: true,
  			});
  		}

      //txt elements
  		if(itemEl.hasText && itemEl.children == null){
  			del.hasText=true;
  			del.oneliner=true;
  			del.asker=Xonomy.askLongString;
  		}

      //no lst elements from DTD

      //element attributes
      del.attributes = {};
      var submenu = [];
      xmlStructure.attributes.filter(att => att.element==itemEl.name).forEach(function(itemAt) {
        var datt = {menu:[]};
        del.attributes[itemAt.name] = datt;

        if (itemAt.options == null) {
          //txt attribute
  				datt.asker=Xonomy.askLongString;
        } else {
          //lst attribute
  				datt.asker=Xonomy.askPicklist;
  				datt.askerParameter=[];
  				itemAt.options.forEach(function(obj){
  					datt.askerParameter.push({value: obj, caption: obj});
  				});
        }

  			//every attribute's owner element has a menu item to add the attribute:
  			submenu.push({
  				caption: "Add @"+itemAt.name+"",
  				action: Xonomy.newAttribute,
  				actionParameter: {name: itemAt.name, value: ""},
  				hideIf: function(jsMe){ return jsMe.hasAttribute(itemAt.name); },
  			});

  			//every attribute has a menu item to remove itself:
  			datt.menu.push({
  				caption: "Remove @"+itemAt.name+"",
  				action: Xonomy.deleteAttribute,
  				keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==88 },
  				keyCaption: "Ctrl + Shift + X",
  			});
      });
      //attributes submenu
  		if(submenu.length>0) {
  			del.menu.push({
  				caption: "Attributes",
  				menu: submenu,
  			});
  		}

  		//chd elements have menu items for adding children
      if (itemEl.children != null) {
        var submenu = [];
        getFlatChildren(itemEl).forEach(function(elCh) {
  				submenu.push({
  					caption: "Add <"+elCh.name+">",
  					action: Xonomy.newElementChild,
  					actionParameter: initialElement(xmlStructure.elements.find(function(el){return el.name==elCh.name})),
  				});
        });
  			if(submenu.length>0) {
  				del.menu.push({
  					caption: "Child elements",
  					menu: submenu,
  				});
  			}
  			del.collapsible=function(jsMe){ return (jsMe.internalParent ? true : false); };
  			del.collapsed=true;
      }

  		//inl elements have inline menu items for wrapping
      if (itemEl.hasText && itemEl.children != null) {
  			del.hasText=true;
  			del.oneliner=true;
  			del.asker=Xonomy.askLongString;
        getFlatChildren(itemEl).forEach(function(elCh) {
  				del.inlineMenu.push({
  					caption: "Wrap with <"+elCh.name+">",
  					action: Xonomy.wrap,
  					actionParameter: {template: "<"+elCh.name+">$</"+elCh.name+">", placeholder: "$"},
  				});
        });
      }
      //TODO siblings

    });
    return docSpec;
  }


  //transform xml structure to Lexonomy Xema
  function struct2Xema(xmlStructure) {
    var xema = {root: xmlStructure.root, elements: {}};

    //add information for elements
    xmlStructure.elements.forEach(function(itemEl) {
      var objectEl = {filling: '', values: [], children: [], attributes: {}};
      //select element type: inl=text+children, txt=text only, chd=children only
      if (itemEl.hasText) {
        if (itemEl.children != null) {
          objectEl.filling = 'inl';
        } else {
          objectEl.filling = 'txt';
        }
      } else {
        if (itemEl.children != null) {
          objectEl.filling = 'chd';
        } else {
          objectEl.filling = 'emp';
        }
      }
      //add children, flattened, throw away choice and sequence
      if (itemEl.children != null) {
        objectEl.children = getFlatChildren(itemEl);
      }
      //add attributes for current element
      xmlStructure.attributes.filter(function(obj) {return obj.element == itemEl.name;}).forEach(function(itemAt) {
        var objectAt = {optionality: 'optional', filling: 'txt'};
        if (itemAt.required) {
          objectAt.optionality = 'obligatory';
        }
        if (itemAt.options != null) {
          objectAt.filling = 'lst';
          objectAt.values = new Array();
          itemAt.options.forEach(function(itemOp) {
            objectAt.values.push({value: itemOp, caption: itemOp});
          });
        }
        objectEl.attributes[itemAt.name] = objectAt;
      });
      xema.elements[itemEl.name] = objectEl;
    });
    return xema;
  }

  //return list of children elements, ignore complex structure
  function getFlatChildren(element) {
    var childrenResult = new Array();
    childrenResult = getFlatLevel(element.children, childrenResult);
    return childrenResult;
  }

  //flatten one level of children spec
  function getFlatLevel(childrenLevel, resultList, topMin, topMax) {
    //min and max from outermost spec can override
    if (topMin == undefined) {
      if (childrenLevel.minRepeat == null) {
        var topMin = 0;
      } else {
        var topMin = childrenLevel.minRepeat;
      }
    }
    if (topMax == undefined) {
      if (childrenLevel.maxRepeat == null) {
        var topMax = 0;
      } else {
        var topMax = childrenLevel.maxRepeat;
      }
    }
    //add element to the result list, with properties
    //choice and sequence process recursively
    if (childrenLevel.type == 'element') {
      var min = 0;
      var max = 0;
      if (childrenLevel.minRepeat != null && topMin != 0) min = childrenLevel.minRepeat;
      if (childrenLevel.maxRepeat != null && topMax != 0) max = childrenLevel.maxRepeat;
      var findChild = resultList.find(function(xe) {return xe.name==childrenLevel.children[0]});
      if (findChild == undefined || findChild.length == 0) {
        resultList.push({name: childrenLevel.children[0], min: min, max: max});
      }
    } else {
      childrenLevel.children.forEach(function(itemCh) {
        resultList = getFlatLevel(itemCh, resultList, topMin, topMax);
      });
    }
    return resultList;
  }

  try {
  module.exports = {
    dtd2xonomy: function(dtdData) {
      var xmlStructure = parseDTD$1(dtdData);
      //console.log(xmlStructure)
      var spec = struct2Xonomy$1(xmlStructure);
      // console.log(spec)
      var xema = struct2Xema(xmlStructure);
      // console.log(JSON.stringify(xema,undefined,1))
    },
    struct2Xema: function(xmlStructure) {
      return struct2Xema(xmlStructure);
    }
  };
  } catch(e) {}

  window.Xematron={};

  //takes a xema, returns a Xonomy docSpec:
  Xematron.xema2docspec=function(xema, stringAsker){
  	var docSpec={
  		elements: {},
  		unknownElement: function(elName){
  			if(elName.indexOf("lxnm:")==0) return {
  				isReadOnly: true,
  				isInvisible: true,
  			};
  			return {
  				oneliner: function(jsMe){ return !jsMe.hasElements(); },
  				menu: [{caption: "Delete", action: Xonomy.deleteElement, hideIf: function(jsMe){return !jsMe.parent();}}],
  			};
  		},
  		unknownAttribute: function(elName, atName){
  			if(atName.indexOf("lxnm:")==0) return {
  				isReadOnly: true,
  				isInvisible: true,
  			};
  			return  {
  				menu: [{caption: "Delete", action: Xonomy.deleteAttribute}],
  			};
  		},
  		validate: function(jsElement){ Xematron.validate(xema, jsElement); },
  	};
  	var elnames=[]; for(var elname in xema.elements) elnames.push(elname); elnames.forEach(function(elname){
  		var xel=xema.elements[elname]; //the xema element from which we are creating a docSpec element
  		var del={}; docSpec.elements[elname]=del; //the docSpec element we are creating
  		del.menu=[];
  		del.inlineMenu=[];
  		del.collapsible=false;

  		var submenu=[];

  		//children of inl elements have a menu item to unwrap themselves:
  		submenu.push({
  			caption: "Unwrap <"+elname+">",
  			action: Xonomy.unwrap,
  			hideIf: function(jsMe){ return jsMe.parent()==null || xema.elements[jsMe.parent().name].filling!="inl"; },
  			keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==88 },
  			keyCaption: "Ctrl + Shift + X",
  		});

  		//all elements have a menu item to remove themselves, except the top-level element and except children of inl elements:
  		submenu.push({
  			caption: "Remove <"+elname+">",
  			action: Xonomy.deleteElement,
  			hideIf: function(jsMe){ return jsMe.parent()==null || xema.elements[jsMe.parent().name].filling=="inl"; },
  			keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==88 },
  			keyCaption: "Ctrl + Shift + X",
  		});

  		//all elements have a menu item to duplicate themselves, except the top-level element and except children of inl elements:
  		submenu.push({
  			caption: "Duplicate <"+elname+">",
  			action: Xonomy.duplicateElement,
  			hideIf: function(jsMe){ return jsMe.parent()==null || xema.elements[jsMe.parent().name].filling=="inl"; },
  			keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==68 },
  			keyCaption: "Ctrl + Shift + D",
  		});

  		//all elements have a menu item to move themselves up and down, except the top-level element, and except children of inl elements, and expect elements that have nowhere to move to:
  		submenu.push({
  			caption: "Move <"+elname+"> up",
  			action: Xonomy.moveElementUp,
  			hideIf: function(jsMe){ return jsMe.parent()==null || xema.elements[jsMe.parent().name].filling=="inl" || !Xonomy.canMoveElementUp(jsMe.htmlID); },
  			keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==38 },
  			keyCaption: "Ctrl + Shift + Up",
  		});
  		submenu.push({
  			caption: "Move <"+elname+"> down",
  			action: Xonomy.moveElementDown,
  			hideIf: function(jsMe){ return jsMe.parent()==null || xema.elements[jsMe.parent().name].filling=="inl" || !Xonomy.canMoveElementDown(jsMe.htmlID); },
  			keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==40 },
  			keyCaption: "Ctrl + Shift + Down",
  		});

  		//all elements have a menu item to merge themselves with a sibling, except the top-level element, and except children of inl elements, and expect elements that have no-one to merge with:
  		submenu.push({
  			caption: "Merge <"+elname+"> with previous",
  			action: Xonomy.mergeWithPrevious,
  			hideIf: function(jsMe){ return jsMe.parent()==null || xema.elements[jsMe.parent().name].filling=="inl" || !jsMe.getPrecedingSibling() || jsMe.getPrecedingSibling().name!=elname },
  			keyTrigger: function(event){ return event.altKey && event.shiftKey && event.which==38 },
  			keyCaption: "Alt + Shift + Up",
  		});
  		submenu.push({
  			caption: "Merge <"+elname+"> with next",
  			action: Xonomy.mergeWithNext,
  			hideIf: function(jsMe){ return jsMe.parent()==null || xema.elements[jsMe.parent().name].filling=="inl" || !jsMe.getFollowingSibling() || jsMe.getFollowingSibling().name!=elname },
  			keyTrigger: function(event){ return event.altKey && event.shiftKey && event.which==40 },
  			keyCaption: "Alt + Shift + Down",
  		});

  		if(submenu.length>0) {
  			del.menu.push({
  				caption: "This element",
  				menu: submenu,
  				expanded: true,
  			});
  		}

  		//txt elements are easy:
  		if(xel.filling=="txt"){
  			del.hasText=true;
  			del.oneliner=true;
  			del.asker=Xonomy[stringAsker] || Xonomy.askLongString;
  			// del.collapsible=function(jsMe){ return (jsMe.getText().length>100 ? true : false); };
  			// del.collapsed=function(jsMe){ return (jsMe.getText().length>100 ? true : false); };
  		}

  		//lst elements are like txt elements but they also have a picklist:
  		if(xel.filling=="lst"){
  			del.hasText=true;
  			del.oneliner=true;
  			del.asker=Xonomy.askPicklist;
  			del.askerParameter=[];
  			xel.values.forEach(function(obj){
  				del.askerParameter.push({ value: obj.value, caption: obj.caption });
  			});
  		}

  		//med elements are like txt:
  		if(xel.filling=="med"){
  			del.hasText=true;
  			del.oneliner=true;
  			del.asker=Xonomy[stringAsker] || Xonomy.askLongString;
  		}

  		del.attributes={};
  		var submenu=[];
  		var attnames=[]; for(var attname in xel.attributes) attnames.push(attname); attnames.forEach(function(attname){
  			var xatt=xel.attributes[attname]; //the xema attribute from which we are creating a docSpec attribute
  			var datt={}; del.attributes[attname]=datt; //the docSpec attribute we are creating
  			datt.menu=[];

  			//txt attributes are easy:
  			if(xatt.filling=="txt"){
  				datt.asker=Xonomy[stringAsker] || Xonomy.askLongString;
  			}

  			//lst attributes are like txt attributes but they also have a picklist:
  			if(xatt.filling=="lst"){
  				datt.asker=Xonomy.askPicklist;
  				datt.askerParameter=[];
  				xatt.values.forEach(function(obj){
  					datt.askerParameter.push({ value: obj.value, caption: obj.caption });
  				});
  			}

  			//every attribute's owner element has a menu item to add the attribute:
  			submenu.push({
  				caption: "Add @"+attname+"",
  				action: Xonomy.newAttribute,
  				actionParameter: {name: attname, value: ""},
  				hideIf: function(jsMe){ return jsMe.hasAttribute(attname); },
  			});

  			//every attribute has a menu item to remove itself:
  			datt.menu.push({
  				caption: "Remove @"+attname+"",
  				action: Xonomy.deleteAttribute,
  				keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==88 },
  				keyCaption: "Ctrl + Shift + X",
  			});

  		}); //end of loop over attributes
  		if(submenu.length>0) {
  			del.menu.push({
  				caption: "Attributes",
  				menu: submenu,
  			});
  		}

  		//chd elements have menu items for adding children:
  		if(xel.filling=="chd"){
  			if(!xel.children) xel.children=[];
  			var submenu=[];
  			xel.children.forEach(function(obj){
  				submenu.push({
  					caption: "Add <"+obj.name+">",
  					action: Xonomy.newElementChild,
  					actionParameter: Xematron.initialElement(xema, obj.name),
  				});
  			});
  			if(submenu.length>0) {
  				del.menu.push({
  					caption: "Child elements",
  					menu: submenu,
  				});
  			}
  			//del.collapsible=function(jsMe){ return (jsMe.internalParent ? true : false); };
  			//del.collapsed=true;
  			del.collapsible=true;
  			del.collapsed=function(jsMe){ return (jsMe.internalParent ? true : false); };
  		}

  		//inl elements have inline menu items for wrapping:
  		if(xel.filling=="inl"){
  			del.hasText=true;
  			del.oneliner=true;
  			del.asker=Xonomy[stringAsker] || Xonomy.askLongString;
  			if(!xel.children) xel.children=[];
  			xel.children.forEach(function(obj){
  				del.inlineMenu.push({
  					caption: "Wrap with <"+obj.name+">",
  					action: Xonomy.wrap,
  					actionParameter: {template: "<"+obj.name+Xematron.initialAttributes(xema, obj.name)+">$</"+obj.name+">", placeholder: "$"},
  				});
  			});
  			// del.collapsible=function(jsMe){ return (jsMe.getText().length>100 ? true : false); };
  			// del.collapsed=function(jsMe){ return (jsMe.getText().length>100 ? true : false); };
  		}

  		//all elements can be dragged-and-droped:
  		del.canDropTo=Xematron.listParents(xema, elname);

  		//all elements have a fixed position among their siblings if the parent is a 'chd' element:
  		del.mustBeAfter=Xematron.listPrecedingSiblings(xema, elname);
  		del.mustBeBefore=Xematron.listFollowingSiblings(xema, elname);

  		//Menu items for adding siblings:
  		var submenu=[];
  		Xematron.listElements(xema).forEach(function(siblingName){
  			submenu.push({
  				caption: "Add <"+siblingName+">",
  				action: Xonomy.newElementBefore,
  				actionParameter: Xematron.initialElement(xema, siblingName),
  				hideIf: function(jsMe){ return !jsMe.parent() || xema.elements[jsMe.parent().name].filling=="inl" || jsMe.parent().hasChildElement(siblingName) || (jsMe.getPrecedingSibling() && jsMe.getPrecedingSibling().name==jsMe.name) || del.mustBeAfter(jsMe).indexOf(siblingName)==-1; },
  			});
  		});
  		submenu.push({
  			caption: "Add another <"+elname+"> before",
  			action: Xonomy.newElementBefore,
  			actionParameter: Xematron.initialElement(xema, elname),
  			hideIf: function(jsMe){ return !jsMe.parent() || xema.elements[jsMe.parent().name].filling=="inl"; },
  		});
  		submenu.push({
  			caption: "Add another <"+elname+"> after",
  			action: Xonomy.newElementAfter,
  			actionParameter: Xematron.initialElement(xema, elname),
  			hideIf: function(jsMe){ return !jsMe.parent() || xema.elements[jsMe.parent().name].filling=="inl"; },
  		});
  		Xematron.listElements(xema).forEach(function(siblingName){
  			submenu.push({
  				caption: "Add <"+siblingName+">",
  				action: Xonomy.newElementAfter,
  				actionParameter: Xematron.initialElement(xema, siblingName),
  				hideIf: function(jsMe){ return !jsMe.parent() || xema.elements[jsMe.parent().name].filling=="inl" || jsMe.parent().hasChildElement(siblingName) || (jsMe.getFollowingSibling() && jsMe.getFollowingSibling().name==jsMe.name) || del.mustBeBefore(jsMe).indexOf(siblingName)==-1; },
  			});
  		});
  		submenu.push({
  			caption: "Remove all <"+elname+"> siblings",
  			action: Xonomy.deleteEponymousSiblings,
  			hideIf: function(jsMe){ return !jsMe.parent() || xema.elements[jsMe.parent().name].filling=="inl" || jsMe.parent().getChildElements(jsMe.name).length<2; },
  			keyTrigger: function(event){ return (event.ctrlKey||event.metaKey) && event.shiftKey && event.which==90 },
  			keyCaption: "Ctrl + Shift + Z",
  		});
  		if(submenu.length>0) {
  			del.menu.push({
  				caption: "Sibling elements",
  				menu: submenu,
  			});
  		}

  	}); //end of loop over elements
  	return docSpec;
  };

  //takes a xema, returns an initial XML document (as string):
  Xematron.xema2xml= function(xema){
  	return xema.newXml || Xematron.initialElement(xema, xema.root);
  };

  //helper functions:
  Xematron.listParents=function(xema, elname){
  	var list=[];
  	for(var parname in xema.elements){
  		var parent=xema.elements[parname];
  		if(parent.filling=="chd"){
  			if(!parent.children) parent.children=[];
  			for(var i=0; i<parent.children.length; i++){
  				if(parent.children[i].name==elname) {
  					list.push(parname);
  					break;
  				}
  			}
  		}
  	}
  	return list;
  };
  Xematron.listPrecedingSiblings=function(xema, elname){
  	var list={};
  	for(var parname in xema.elements){
  		var parent=xema.elements[parname];
  		if(parent.filling=="chd"){
  			var templist=[];
  			for(var i=0; i<parent.children.length; i++){
  				if(parent.children[i].name!=elname) {
  					templist.push(parent.children[i].name);
  				} else if(parent.children[i].name==elname) {
  					list[parname]=templist;
  					break;
  				}
  			}
  		}
  	}
  	return function(jsMe){
  		if(jsMe) for(var parname in list){ if(jsMe.parent() && parname==jsMe.parent().name) return list[parname]; }
  		return [];
  	};
  };
  Xematron.listFollowingSiblings=function(xema, elname){
  	var list={};
  	for(var parname in xema.elements){
  		var parent=xema.elements[parname];
  		if(parent.filling=="chd"){
  			var templist=[];
  			var found=false;
  			for(var i=0; i<parent.children.length; i++){
  				if(parent.children[i].name!=elname && found) {
  					templist.push(parent.children[i].name);
  				} else if(parent.children[i].name==elname) {
  					found=true;
  				}
  			}
  			list[parname]=templist;
  		}
  	}
  	return function(jsMe){
  		if(jsMe) for(var parname in list){ if(jsMe.parent() && parname==jsMe.parent().name) return list[parname]; }
  		return [];
  	};
  };
  Xematron.initialAttributes=function(xema, elname){
  	var ret="";
    if (xema.elements[elname] != undefined) {
      for(var attname in xema.elements[elname].attributes){
        var att=xema.elements[elname].attributes[attname];
        if(att.optionality=="obligatory") {
          var attvalue="";
          ret+=" "+attname+"='"+Xonomy.xmlEscape(attvalue)+"'";
        }
      }
    }
  	return ret;
  };
  Xematron.initialElement=function(xema, elname, depth){
  	if(!depth) depth=0;
  	var el=xema.elements[elname];
  	var ret="<"+elname+Xematron.initialAttributes(xema, elname)+">";
  	if (el != undefined && el.filling=="chd" && el.children && depth < 10) {
  		el.children.forEach(function(child) {
  			for(var i=0; i<child.min; i++) ret+=Xematron.initialElement(xema, child.name, depth+1);
  		});
  	}
  	ret+="</"+elname+">";
  	return ret;
  };
  Xematron.valuesHave=function(values, value){
  	var ret=false;
  	for(var i=0; i<values.length; i++){
  		if(values[i].value==value) { ret=true; break; }
  	}
  	return ret;
  };
  Xematron.childrenHave=function(children, childName){
  	var ret=false;
  	for(var i=0; i<children.length; i++){
  		if(children[i].name==childName) { ret=true; break; }
  	}
  	return ret;
  };
  Xematron.validate=function(xema, jsElement){
  	var xel=xema.elements[jsElement.name];
  	if(!xel){ //is the element allowed to exist?
  		Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The top element should be <"+xema.root+">."});
  	} else {

  		//cycle through the attributes the element should have:
  		for(var attname in xel.attributes){
  			if(xel.attributes[attname].optionality=="obligatory" && !jsElement.getAttribute(attname)){
  				Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.name+"> element is missing the @"+attname+" attribute."});
  			}
  		}

  		//cycle through the element's attributes:
  		for(var i=0; i<jsElement.attributes.length; i++) {
  			var jsAttribute=jsElement.attributes[i];
  			var xatt=xel.attributes[jsAttribute.name];
  			if(!xatt) { //is the attribute allowed to exist?
  				Xonomy.warnings.push({htmlID: jsAttribute.htmlID, text: "The <"+jsElement.name+"> element should not have an attribute called @"+jsAttribute.name+"."});
  			} else if(jsAttribute.value=="") { //is the attribute non-empty?
  				Xonomy.warnings.push({htmlID: jsAttribute.htmlID, text: "The @"+jsAttribute.name+" attribute should not be empty."});
  			} else if(xatt.filling=="lst" && !Xematron.valuesHave(xatt.values, jsAttribute.value)) { //does the attribute have an allowed value?
  				Xonomy.warnings.push({htmlID: jsAttribute.htmlID, text: "The @"+jsAttribute.name+" attribute should not have the value @\""+jsAttribute.value+"\"."});
  			}
  		}
  		//if this is an emp element:
  		if(xel.filling=="emp") {
  			if(jsElement.children.length>0) { //is the element empty like it should?
  				Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.name+"> element should be empty."});
  			}
  		}

  		//if this is a lst element:
  		if(xel.filling=="lst") {
  			if(jsElement.getText()=="") { //does the element have text?
  					Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.name+"> element should not be empty."});
  			} else if(!Xematron.valuesHave(xel.values, jsElement.getText())) { //does the element have an allowed value?
  				Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.name+"> element should not have the value @\""+jsElement.getText()+"\"."});
  			}
  		}

  		//if this is a txt element:
  		if(xel.filling=="txt") {
  			if(jsElement.getText()=="") { //does the element have text?
  				Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.name+"> element should have some text."});
  			}
  		}

  		//if this is an inl element:
  		if(xel.filling=="inl") {
  			if(jsElement.getText()=="") { //does the element have text?
  				Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.name+"> element should have some text."});
  			}
  		}

  		//if this is a chd element:
  		if(xel.filling=="chd") {
  			var hasTextChild=false; for(var i=0; i<jsElement.children.length; i++) if(jsElement.children[i].type=="text"){ hasTextChild=true; break; }
  			if(hasTextChild) { //does the element not have text?
  				Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.name+"> element should not have any text."});
  			}
  		}

  		//if this is an inl or chd element:
  		if(xel.filling=="inl" || xel.filling=="chd") {
  			for(var i=0; i<xel.children.length; i++){
  				xchild=xel.children[i];
  				var children=jsElement.getChildElements(xchild.name);
  				if( (xchild.min>0 && children.length<xchild.min) || (xchild.max>0 && children.length>xchild.max) )	{
  					var msg="Should have ";
  					if(xchild.min>0) msg+="at least "+xchild.min;
  					if(xchild.min>0 && xchild.max>0) msg+=", ";
  					if(xchild.max>0) msg+="at most "+xchild.max;
  					msg+=".";
  					if(children.length>0) {
  						children.forEach(function(item){
  							Xonomy.warnings.push({htmlID: item.htmlID, text: "The <"+jsElement.name+"> element does not have the correct number of <"+xchild.name+"> child elements. "+msg});
  						});
  					} else {
  						Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.name+"> element does not have the correct number of <"+xchild.name+"> child elements. "+msg});
  					}
  				}
  			}
  		}

  		//cycle through the element's children:
  		for(var i=0; i<jsElement.children.length; i++) {
  			var jsChild=jsElement.children[i];
  			if(jsChild.type=="element") {
  				if(!Xematron.childrenHave(xel.children, jsChild.name)) {
  					Xonomy.warnings.push({htmlID: jsChild.htmlID, text: "The <"+jsElement.name+"> element should not have a child element called <"+jsChild.name+">."});
  				} else {
  					Xematron.validate(xema, jsChild);
  				}
  			}
  		}

  		//cycle through the element's siblings:
  		if(jsElement.parent()){
  			var parent=jsElement.parent();
  			var whereAreWe="before";
  			for(var i=0; i<parent.children.length; i++) {
  				var jsSibling=parent.children[i];
  				if(jsSibling==jsElement){
  					whereAreWe="after";
  				} else {
  					if(whereAreWe=="after") { //jsSibling is after jsElement == jsElement is before jsSibling
  						if(Xonomy.docSpec.elements[jsElement.name].mustBeAfter(jsElement).indexOf(jsSibling.name)>-1){
  							Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.name+"> element should appear after the <"+jsSibling.name+"> element, not before it."});
  						}
  					}
  					if(whereAreWe=="before") { //jsSibling is before jsElement == jsElement is after jsSibling
  						if(Xonomy.docSpec.elements[jsElement.name].mustBeBefore(jsElement).indexOf(jsSibling.name)>-1){
  							Xonomy.warnings.push({htmlID: jsElement.htmlID, text: "The <"+jsElement.name+"> element should appear before the <"+jsSibling.name+"> element, not after it."});
  						}
  					}
  				}
  			}
  		}
  	}
  };

  Xematron.listElements=function(xema){
  	var ret=[];
  	var done=[];
  	var doElement=function(elName){
  		if(xema.elements[elName]){
  			if(ret.indexOf(elName)==-1){
  				ret.push(elName);
  				done.push(elName);
  				if((xema.elements[elName].filling=="chd" || xema.elements[elName].filling=="inl") && xema.elements[elName].children){
  					for(var i=0; i<xema.elements[elName].children.length; i++) {
  						doElement(xema.elements[elName].children[i].name);
  					}
  				}
  			}
  		}
  	};
  	doElement(xema.root);
  	for(var elName in xema.elements) if(done.indexOf(elName)==-1) ret.push(elName);
  	return ret;

  };

  window.Xemplatron={};
  Xemplatron.xema=null;
  Xemplatron.xemplate=null;

  Xemplatron.xml2html=function(xml, xemplate, xema){
    Xemplatron.xema=xema;
    Xemplatron.xemplate=xemplate;
    if(typeof(xml)=="string") xml=$.parseXML(xml);
    var html=Xemplatron.el2html(xml.documentElement, true, true);
    return html;
  };
  Xemplatron.el2html=function(el, isFirst, isLast){
    if(!Xemplatron.getXemplate(el).shown) return "";
    var html="";
    var caption="";
    var xema=Xemplatron.xema.elements[el.nodeName]; if(xema && xema.filling=="lst") {
      html=el.textContent;
      if(xema.values) for(var i=0; i<xema.values.length; i++) if(xema.values[i].value==el.textContent) {caption=xema.values[i].caption; break;}
    } else if (xema && xema.filling=="med") {
      var fileType = Xemplatron.detectFileType(el.textContent);
      console.log(fileType);
      switch(fileType) {
        case 'image':
          html = '<img src="'+el.textContent+'" class="media_image"/>';
          break;
        case 'video':
          html = '<video controls class="media_video"><source src="'+el.textContent+'"/></video>';
          break;
        case 'audio':
          html = '<audio controls class="media_audio" src="'+el.textContent+'"/>';
          break;
        default:
          html = el.textContent;
          break;
      }
    } else {
      //obtain the child nodes we want to process, in the other we want to proceess them in:
      var nodes=[];
      for(var iNode=0; iNode<el.attributes.length; iNode++){
        var node=el.attributes[iNode];
        if(node.nodeName.indexOf("xml:")!=0 && node.nodeName.indexOf("lxnm:")!=0){
          var xemplate=Xemplatron.getXemplate(node);
          if(xemplate.order=="before" && xemplate.shown) nodes.push(node);
        }
      }
      for(var iNode=0; iNode<el.childNodes.length; iNode++){
        var node=el.childNodes[iNode];
        if(node.nodeName.indexOf("xml:")!=0 && node.nodeName.indexOf("lxnm:")!=0){
          if(node.nodeType==3) nodes.push(node);
          if(node.nodeType==1){var xemplate=Xemplatron.getXemplate(node); if(xemplate.shown) nodes.push(node);}
        }
      }
      for(var iNode=0; iNode<el.attributes.length; iNode++){
        var node=el.attributes[iNode];
        if(node.nodeName.indexOf("xml:")!=0){var xemplate=Xemplatron.getXemplate(node); if(xemplate.order=="after" && xemplate.shown) nodes.push(node);}
      }
      //process the child nodes:
      for(var iNode=0; iNode<nodes.length; iNode++){
        var node=nodes[iNode];
        var iF=(iNode==0);
        var iL=(iNode==nodes.length-1); if(!iL && nodes[iNode+1].nodeType!=3) iL=(Xemplatron.getXemplate(nodes[iNode+1]).layout=="block");
        if(node.nodeType==1) html+=Xemplatron.el2html(node, iF, iL);
        if(node.nodeType==2) html+=Xemplatron.at2html(node, iF, iL);
        if(node.nodeType==3) html+=Xemplatron.tn2html(node);
      }
    }
    var xemplate=Xemplatron.getXemplate(el);
    //add label:
    if(xemplate.label) html="<span class='label'>"+xemplate.label+"</span>&nbsp;"+html;
    //surround the processed nodes with markup:
    for(var dimension in Xemplatron.styles) if(xemplate[dimension]) html=Xemplatron.getStyle(dimension, xemplate[dimension]).toHtml(xemplate.layout, html, el, isFirst, isLast, caption);
    //should this element inherit the font properties of its parent?
    var clearFont=true;
    if(el.parentNode && Xemplatron.xema.elements[el.parentNode.nodeName] && Xemplatron.xema.elements[el.parentNode.nodeName].filling=="inl") clearFont=false;
    //done:
    return "<"+(xemplate.layout=="block"?"div":"span")+" "+(clearFont?"class='clearFont'":"")+">"+html+"</"+(xemplate.layout=="block"?"div":"span")+">";
  };
  Xemplatron.at2html=function(at, isFirst, isLast){
    var xemplate=Xemplatron.getXemplate(at);
    var html="";
    var caption="";
    var xema=Xemplatron.xema.elements[at.ownerElement.nodeName]; if(xema) xema=xema.attributes[at.nodeName]; else xema=null;
    if(xema && xema.filling=="lst") {
      html=Xemplatron.xmlEscape(at.nodeValue);
      if(xema.values) for(var i=0; i<xema.values.length; i++) if(xema.values[i].value==at.nodeValue) {caption=xema.values[i].caption; break;}
    } else {
      html+=Xemplatron.xmlEscape(at.nodeValue);
    }
    if(xemplate.label) html="<span class='label'>"+xemplate.label+"</span>&nbsp;"+html;
    for(var dimension in Xemplatron.styles) if(xemplate[dimension]) html=Xemplatron.getStyle(dimension, xemplate[dimension]).toHtml(xemplate.layout, html, at, isFirst, isLast, caption);
    if(xemplate.layout=="block") return "<div class='clearFont'>"+html+"</div>"; else return "<span class='clearFont'>"+html+"</span>";};
  Xemplatron.tn2html=function(tn){
    var html="";
    html+=Xemplatron.xmlEscape(tn.nodeValue);
    return html;
  };

  Xemplatron.xmlEscape=function(str) {
    return String(str)
  		.replace(/&/g, '&amp;')
  		.replace(/"/g, '&quot;')
  		.replace(/'/g, '&apos;')
  		.replace(/</g, '&lt;')
  		.replace(/>/g, '&gt;');
  };

  Xemplatron.getXemplate=function(elat){
    var xemplate=null;
    if(elat.nodeType==1) {
      if(Xemplatron.xemplate[elat.nodeName]) xemplate=Xemplatron.xemplate[elat.nodeName];
      else xemplate={shown: true, layout: "block"};
    }
    else if(elat.nodeType==2) {
      var parentName=elat.ownerElement.nodeName;
      if(Xemplatron.xemplate[parentName] && Xemplatron.xemplate[parentName].attributes && Xemplatron.xemplate[parentName].attributes[elat.nodeName]) xemplate=Xemplatron.xemplate[parentName].attributes[elat.nodeName];
      else xemplate={order: "after", shown: false, layout: "inline"};
    }
    if(xemplate && xemplate.shown=="false") xemplate.shown=false;
    return xemplate;
  };

  Xemplatron.getStyle=function(dimension, name){
    if(Xemplatron.styles[dimension][name]) return Xemplatron.styles[dimension][name]; else return Xemplatron.defaultStyle;
  };
  Xemplatron.defaultStyle={toHtml: function(ly, html, n, isF, isL){return html}};
  Xemplatron.styles={ //the dimensions are ordered from innermost to outermost
    captioning: {
      "title": "Caption display",
      "replace": {toHtml: function(ly, html, n, isF, isL, cap){return "<span>"+(cap?cap:html)+"</span>"}, title: "Show caption instead of value"},
      "mouseover": {toHtml: function(ly, html, n, isF, isL, cap){return "<span class='caption' title='"+cap.replace("'", "&apos;")+"'>"+html+"</span>"}, title: "Show caption on mouse-over"},
    },
    interactivity: {
      "title": "Interactivity",
      "xref": {toHtml: function(ly, html, n, isF, isL){return "<a class='xref' href=\"" + window.location.hash.split("?")[0] + "?s=" + encodeURIComponent(n.textContent) + "&m=substring\">"+html+"</a>"}, title: "Clickable cross-reference"},
      "xlink": {toHtml: function(ly, html, n, isF, isL){return "<a class='xlink' target='_blank' href='"+n.textContent.replace("'", "&apos;")+"'>"+n.textContent+"</a>"}, title: "External URL link"},
    },
    innerPunc: {
      "title": "Inner punctuation",
      "roundBrackets": {toHtml: function(ly, html, n, isF, isL){return "("+html+")"}, title: "Round brackets"},
      "squareBrackets": {toHtml: function(ly, html, n, isF, isL){return "["+html+"]"}, title: "Square brackets"},
      "curlyBrackets": {toHtml: function(ly, html, n, isF, isL){return "{"+html+"}"}, title: "Curly brackets"},
      "comma": {toHtml: function(ly, html, n, isF, isL){return html+(isL?"":", ")}, title: "Comma"},
      "semicolon": {toHtml: function(ly, html, n, isF, isL){return html+(isL?"":"; ")}, title: "Semicolon"},
      "colon": {toHtml: function(ly, html, n, isF, isL){return html+(isL?"":": ")}, title: "Colon"},
    },
    textsize: {
      "title": "Text size",
      "smaller": {toHtml: function(ly, html, n, isF, isL){return "<span class='smaller'>"+html+"</span>"}, title: "Smaller"},
      "bigger": {toHtml: function(ly, html, n, isF, isL){return "<span class='bigger'>"+html+"</span>"}, title: "Bigger"},
    },
    weight: {
      "title": "Text weight",
      "bold": {toHtml: function(ly, html, n, isF, isL){return "<span class='bold'>"+html+"</span>"}, title: "Bold"},
    },
    slant: {
      "title": "Text slant",
      "italic": {toHtml: function(ly, html, n, isF, isL){return "<span class='italic'>"+html+"</span>"}, title: "Italic"},
    },
    colour: {
      "title": "Text colour",
      "red": {toHtml: function(ly, html, n, isF, isL){return "<span class='xema_red'>"+html+"</span>"}, title: "Red"},
      "blue": {toHtml: function(ly, html, n, isF, isL){return "<span class='xema_blue'>"+html+"</span>"}, title: "Blue"},
      "green": {toHtml: function(ly, html, n, isF, isL){return "<span class='xema_green'>"+html+"</span>"}, title: "Green"},
      "grey": {toHtml: function(ly, html, n, isF, isL){return "<span class='xema_grey'>"+html+"</span>"}, title: "Grey"},
    },
    outerPunc: {
      "title": "Outer punctuation",
      "roundBrackets": {toHtml: function(ly, html, n, isF, isL){return "("+html+")"}, title: "Round brackets"},
      "squareBrackets": {toHtml: function(ly, html, n, isF, isL){return "["+html+"]"}, title: "Square brackets"},
      "curlyBrackets": {toHtml: function(ly, html, n, isF, isL){return "{"+html+"}"}, title: "Curly brackets"},
      "comma": {toHtml: function(ly, html, n, isF, isL){return html+(isL?"":", ")}, title: "Comma"},
      "semicolon": {toHtml: function(ly, html, n, isF, isL){return html+(isL?"":"; ")}, title: "Semicolon"},
      "colon": {toHtml: function(ly, html, n, isF, isL){return html+(isL?"":": ")}, title: "Colon"},
    },
    background: {
      "title": "Background colour",
      "yellow": {toHtml: function(ly, html, n, isF, isL){return "<"+(ly=="block"?"div":"span")+" class='background xema_yellow'>"+html+"</"+(ly=="block"?"div":"span")+">"}, title: "Yellow"},
      "blue": {toHtml: function(ly, html, n, isF, isL){return "<"+(ly=="block"?"div":"span")+" class='background xema_blue'>"+html+"</"+(ly=="block"?"div":"span")+">"}, title: "Blue"},
      "grey": {toHtml: function(ly, html, n, isF, isL){return "<"+(ly=="block"?"div":"span")+" class='background xema_grey'>"+html+"</"+(ly=="block"?"div":"span")+">"}, title: "Grey"},
    },
    border: {
      "title": "Box border",
      "dotted": {toHtml: function(ly, html, n, isF, isL){return "<"+(ly=="block"?"div":"span")+" class='border dotted'>"+html+"</"+(ly=="block"?"div":"span")+">"}, title: "Dotted"},
      "solid": {toHtml: function(ly, html, n, isF, isL){return "<"+(ly=="block"?"div":"span")+" class='border solid'>"+html+"</"+(ly=="block"?"div":"span")+">"}, title: "Thin"},
      "thick": {toHtml: function(ly, html, n, isF, isL){return "<"+(ly=="block"?"div":"span")+" class='border thick'>"+html+"</"+(ly=="block"?"div":"span")+">"}, title: "Thick"},
    },
    gutter: {
      "title": "Indentation and bulleting",
      "disk": {toHtml: function(ly, html, n, isF, isL){ return Xemplatron._bullet(ly, "disk", html) }, title: "Round bullet"},
      "square": {toHtml: function(ly, html, n, isF, isL){ return Xemplatron._bullet(ly, "square", html) }, title: "Square bullet"},
      "diamond": {toHtml: function(ly, html, n, isF, isL){ return Xemplatron._bullet(ly, "diamond", html) }, title: "Diamond bullet"},
      "arrow": {toHtml: function(ly, html, n, isF, isL){ return Xemplatron._bullet(ly, "arrow", html) }, title: "Arrow bullet"},
      "indent": {toHtml: function(ly, html, n, isF, isL){ return "<"+(ly=="block"?"div":"span")+" class='indented'>"+html+"</"+(ly=="block"?"div":"span")+">" }, title: "Indent"},
      "hanging": {toHtml: function(ly, html, n, isF, isL){ return "<"+(ly=="block"?"div":"span")+" class='hanging'>"+html+"</"+(ly=="block"?"div":"span")+">" }, title: "Hanging indent"},
      "sensenum0": {title: "Sense number I, II, III...", toHtml: function(ly, html, n, isF, isL){ return Xemplatron._senseNum(ly, html, n, 0); }},
      "sensenum1": {title: "Sense number 1, 2, 3...", toHtml: function(ly, html, n, isF, isL){ return Xemplatron._senseNum(ly, html, n, 1); }},
      "sensenum2": {title: "Sense number a, b, c...", toHtml: function(ly, html, n, isF, isL){ return Xemplatron._senseNum(ly, html, n, 2); }},
      "sensenum3": {title: "Sense number i, ii, iii...", toHtml: function(ly, html, n, isF, isL){ return Xemplatron._senseNum(ly, html, n, 3); }},
    },
    separation: {
      "title": "Separation from other content",
      "space": {toHtml: function(ly, html, n, isF, isL){ if(ly=="block") return "<div class='space'>"+html+"</div>"; if(ly=="inline") return (isF?"":" ")+html+(isL?"":" ");}, title: "Whitespace"},
    },
  };

  Xemplatron._getNumberingSymbol=function(num, level){
    var ret="&nbsp;";
    if(level==0) ret=Xemplatron._getRoman(num);
    if(level==1) ret=num.toString();
    if(level==2) ret=Xemplatron._getAbc(num);
    if(level>=3) ret=Xemplatron._getRoman(num).toLowerCase();
    return "<span class='numberingSymbol'>"+ret+"</span>";
  };
  Xemplatron._getAbc=function(num){
    num=num-1;
    var list="abcdefghijklmnopqrstuvwxyz";
    var ret=list[list.length-1]; if(num<list.length) ret=list[num];
    return ret.toString();
  };
  Xemplatron._getRoman=function(num){
    num=num-1;
    var list=["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
    var ret=list[list.length-1]; if(num<list.length) ret=list[num];
    return ret;
  };
  Xemplatron._hasEponymousSiblings=function(n){
    var num=0;
    var sibling=n.previousSibling; while(sibling){ if(sibling.nodeName==n.nodeName) num++; sibling=sibling.previousSibling; }
    var sibling=n.nextSibling; while(sibling){ if(sibling.nodeName==n.nodeName) num++; sibling=sibling.nextSibling; }
    return num;
  };
  Xemplatron._senseNum=function(ly, html, n, startLevel) {
    var symbol="&mdash;";
    if(Xemplatron._hasEponymousSiblings(n)) {
      var num=0;
      var sibling=n; while(sibling){ if(sibling.nodeName==n.nodeName) num++; sibling=sibling.previousSibling; }
      if(num) {
        var level=startLevel-1;
        var parent=n; while(parent){ if(parent.nodeName==n.nodeName) level++; parent=parent.parentNode; }
        symbol=Xemplatron._getNumberingSymbol(num, level);
      }
    }
    return Xemplatron._bullet(ly, symbol, html);

  };
  Xemplatron._bullet=function(ly, name, html){
    var symbol=""; var className="";
    if(name=="square") { symbol="⯀"; className=name; }
    else if(name=="diamond") { symbol="⯁"; className=name; }
    else if(name=="arrow") { symbol="⯈"; className=name; }
    else if(name=="disk") { symbol="⏺"; className=name; }
    else symbol=name;
    if(ly=="block") return "<div class='bulleted "+className+"'><div class='bullet'>"+symbol+"</div> <div class='inside'>"+html+"</div><div class='clear'></div></div>";
    if(ly=="inline") return "<span class='bulleted "+className+"'>"+symbol+"</span>&nbsp;"+html;
  };
  Xemplatron.detectFileType=function(url) {
    var fileExtension = url.split('.').pop().split(/\#|\?/)[0].toLowerCase();
    console.log('FE'+fileExtension);
    if (['jpg','jpeg','png','gif'].includes(fileExtension)) return 'image';
    if (['avi','mp4','webm'].includes(fileExtension)) return 'video';
    if (['wav','ogg','weba'].includes(fileExtension)) return 'audio';
    return '';
  };

  if(!module$1) var module$1={};
  module$1.exports={
    xml2html: Xemplatron.xml2html
  };

  window.Xrefs={};

  Xrefs.extendDocspec=function(docspec, xema) {
    if (Object.keys(linking).length) {
      for(var parName in xema.elements) {
        if (linking[parName] != undefined) {
          docspec.elements[parName].caption = function(jsMe){
            var cap="";
            cap="<button class='btn btn-secondary lexonomyXrefsCaption' onclick='Xonomy.notclick=true; Xrefs.linkBox(\""+jsMe.htmlID+"\")'>▼</button>";
            if(typeof(incaption)=="function") cap=incaption(jsMe)+cap;
            if(typeof(incaption)=="string") cap=incaption+cap;
            return cap;
          };
        }
      }
    }
  };

  Xrefs.linkBox=function(htmlID) {
    var html = "";
    html = "<div class='xrefsbox'>";
    html += "Link this element to<br/>dictionary: ";
    html += "<select name='xrefdict' class='browser-default' style='display: inline-block; width: auto;' onchange='Xrefs.refreshLinks()'>";
    for (var dict in userDicts) {
      if (userDicts[dict]["id"] != dictId && userDicts[dict]["hasLinks"]) {
        html += "<option value='"+userDicts[dict]["id"]+"'>"+userDicts[dict]["title"]+"</option>";
      }
    }
    html += "</select><br/>";
    html += " target: ";
    html += "<div class='input-field'><input id='xreftarget' name='xreftarget' class='autocomplete'/></div>";
    html += "<button class=\"btn\"onclick='Xrefs.makeLink(\""+htmlID+"\")'>Link</button>";
    html += "</div>";
    document.body.appendChild(Xonomy.makeBubble(html)); //create bubble
    Xonomy.showBubble($("#"+htmlID+" > .inlinecaption")); //anchor bubble to opening tag
    // read dictionary preference from cookie
    if (document.cookie.split('; ').find(row => row.startsWith('linkPref='))) {
      $('[name=xrefdict]').val(document.cookie.split('; ').find(row => row.startsWith('linkPref=')).split('=')[1]);
    }
    Xrefs.refreshLinks();
  };

  Xrefs.refreshLinks=function() {
    var xrefdict = $("[name=xrefdict]").val();
    $("[name=xreftarget]").empty();
    if (xrefdict) {
      var xrefTarget = $("#xreftarget");
      var listData = {};
      var autocompleteData = {};
      $.get(Xonomy.baseUrl+xrefdict+"/linkablelist.json", (response) => {
        response.links.forEach(item => {
          var text = item.element + ": " + item.link + ((item.preview != "")? " (" + item.preview + ")":"");
          listData[text] = item;
          autocompleteData[text] = null;
        });
        xrefTarget.autocomplete({
          data: autocompleteData,
          limit: 10,
          onAutocomplete: function(txt) {
            var item = listData[txt];
            if (item) {
              $("#xreftarget").data('element', item.element);
              $("#xreftarget").data('link', item.link);
            }
          }
        });
      });
    }
  };

  Xrefs.makeLink=function(htmlID) {
    var xrefdict = $("[name=xrefdict]").val();
    var xrefel = $("#xreftarget").data('element');
    var xrefid = $("#xreftarget").data('link');
    var srcid = $("#"+htmlID+" > .tag.opening > .attributes").children("[data-name='lxnm:linkable']").data('value');
    var srcel = $("#"+htmlID).data('name');
    if (xrefel != undefined && xrefid != undefined && xrefel != "" && xrefid != "" && xrefdict != "" && srcid != undefined && srcel != undefined) {
      var srcdict = dictId;

      document.cookie = "linkPref=" + xrefdict + "; path=/" + srcdict;
      $("#"+htmlID+" > .tag.opening > .attributes");
      $.get(Xonomy.baseUrl+dictId+"/links/add", {source_el: srcel, source_id: srcid, target_dict: xrefdict, target_el: xrefel, target_id: xrefid}, function(json){
        if (json.success) {
          Screenful.status('Link created successfully.');
        } else {
          Screenful.status('Error while creating link: ' + json.error);
        }
      });
    }
    Xonomy.destroyBubble();
    Screenful.Editor.addLinks(Screenful.Editor.readUrl.replace("entryread", "entrylinks"), $('#editor'), Screenful.Editor.entryID);
  };

  window.Ske={};
  Ske.htmID="";
  Ske.settings={
    headwordElement: "",
    examples: {containerElement: "", textElement: "", markupElement: ""}
  };
  Ske.makeSettings=function(){
    for(var elName in rollo){
      if(rollo[elName].headword && !Ske.settings.headwordElement) Ske.settings.headwordElement=elName;
      if(rollo[elName].exampleContainer && !Ske.settings.examples.containerElement) Ske.settings.examples.containerElement=elName;
      if(rollo[elName].exampleText && !Ske.settings.examples.textElement) Ske.settings.examples.textElement=elName;
      if(rollo[elName].exampleHeadwordMarkup && !Ske.settings.examples.markupElement) Ske.settings.examples.markupElement=elName;
    }
  };
  Ske.getHeadword=function(){
    var $xml = $($.parseXML(Xonomy.harvest()));
    var hwd = $xml.find(titling.headword).html().replace(/(<([^>]+)>)/gi, "");
    if(!hwd) hwd = "";
    return hwd;
  };
  Ske.getSearchword=function(elementID){
    return Xonomy.harvestElement(document.getElementById(elementID)).getText();
  };
  Ske.getCQL=function(cql){
    var $xml=$($.parseXML(Xonomy.harvest()));
    var ret = cql.replace(/%\([^)]+\)/g, function (el) {
      return $xml.find(el.substring(2, el.length - 1)).html();
    });
    return ret;
  };
  Ske.getConcordance=function(htmlID){
    var operations = [];
    if (htmlID) { // menus for additional elements
      var simplequery = Ske.getSearchword(htmlID);
      operations.push({"name":"iquery","arg":simplequery,"active":true,"query":{"queryselector":"iqueryrow","iquery":simplequery}});
    } else if (kex.concquery.length > 0) {
      var cql = Ske.getCQL(kex.concquery);
      operations.push({"name":"cql","arg":cql,"active":true,"query":{"queryselector":"cqlrow","cql":cql}});
    } else {
      var simplequery = Ske.getHeadword();
      operations.push({"name":"iquery","arg":simplequery,"active":true,"query":{"queryselector":"iqueryrow","iquery":simplequery}});
    }
    if (kex.concsampling > 0)
      operations.push({"name":"sample","arg":kex.concsampling,"query":{"q":"r"+kex.concsampling},"active":true});
    return JSON.stringify(operations);
  };
  Ske.extendDocspec=function(docspec, xema){
    if(kex.corpus) {
      if(!subbing[xema.root]) {
        var elSpec=docspec.elements[xema.root];
        var incaption=elSpec.caption;
        elSpec.caption=function(jsMe){
          var cap="";
          cap="<span class='lexonomySkeCaption' onclick='Xonomy.notclick=true; Ske.menuRoot(\""+jsMe.htmlID+"\")'>▼</span>";
          if(typeof(incaption)=="function") cap=incaption(jsMe)+cap;
          if(typeof(incaption)=="string") cap=incaption+cap;
          return cap;
        };
      }
    }

    if(kex.apiurl && kex.corpus && ske_username && ske_apiKey && ske_username != "" && ske_apiKey != "") {
      for(var parName in xema.elements){
        if(kex.searchElements.indexOf(parName) != -1) {
          docspec.elements[parName].caption = function(jsMe){
            var cap="";
            cap="<span class='lexonomySkeCaption' onclick='Xonomy.notclick=true; Ske.menuRoot(\""+jsMe.htmlID+"\", true)'>▼</span>";
            if(typeof(incaption)=="function") cap=incaption(jsMe)+cap;
            if(typeof(incaption)=="string") cap=incaption+cap;
            return cap;
          };
        }
        if(xema.elements[parName].children){

          canHaveExamples=false;
          for(var iChild=0; iChild<xema.elements[parName].children.length; iChild++){
            if(xema.elements[parName].children[iChild].name==xampl.container){
              canHaveExamples=true; break;
            }
          }
          if(canHaveExamples){
            if(docspec.elements[parName]){
              if(!docspec.elements[parName].menu) docspec.elements[parName].menu=[];
              docspec.elements[parName].menu.push({
                icon: "/furniture/ske.png",
                caption: "Find examples <"+xampl.container+">",
                action: Ske.menuExamples,
              });
            }
          }

          canHaveCollx=false;
          for(var iChild=0; iChild<xema.elements[parName].children.length; iChild++){
            if(xema.elements[parName].children[iChild].name==collx.container){
              canHaveCollx=true; break;
            }
          }
          if(canHaveCollx){
            if(docspec.elements[parName]){
              if(!docspec.elements[parName].menu) docspec.elements[parName].menu=[];
              docspec.elements[parName].menu.push({
                icon: "/furniture/ske.png",
                caption: "Find collocations <"+collx.container+">",
                action: Ske.menuCollx,
              });
            }
          }

          canHaveThes=false;
          for(var iChild=0; iChild<xema.elements[parName].children.length; iChild++){
            if(xema.elements[parName].children[iChild].name==thes.container){
              canHaveThes=true; break;
            }
          }
          if(canHaveThes){
            if(docspec.elements[parName]){
              if(!docspec.elements[parName].menu) docspec.elements[parName].menu=[];
              docspec.elements[parName].menu.push({
                icon: "/furniture/ske.png",
                caption: "Find thesaurus items <"+thes.container+">",
                action: Ske.menuThes,
              });
            }
          }

          canHaveDefo=false;
          for(var iChild=0; iChild<xema.elements[parName].children.length; iChild++){
            if(xema.elements[parName].children[iChild].name==defo.container){
              canHaveDefo=true; break;
            }
          }
          if(canHaveDefo){
            if(docspec.elements[parName]){
              if(!docspec.elements[parName].menu) docspec.elements[parName].menu=[];
              docspec.elements[parName].menu.push({
                icon: "/furniture/ske.png",
                caption: "Find definitions <"+defo.container+">",
                action: Ske.menuDefo,
              });
            }
          }


        }
      }
    }
  };

  Ske.menuRoot=function(htmlID, additional=false){
    var html="<div class='menu'>";
    if (!additional) {
      if(xampl.container) {
        html+="<div class='menuItem' onclick='Ske.menuExamples(\""+htmlID+"\", \"layby\")'>";
          html+="<span class='icon'><img src='../../../furniture/ske.png'/></span> ";
          html+="Find examples <span class='techno'><span class='punc'>&lt;</span><span class='elName'>"+xampl.container+"</span><span class='punc'>&gt;</span></span>";
        html+="</div>";
      }
      if(collx.container) {
        html+="<div class='menuItem' onclick='Ske.menuCollx(\""+htmlID+"\", \"layby\")'>";
          html+="<span class='icon'><img src='../../../furniture/ske.png'/></span> ";
          html+="Find collocations <span class='techno'><span class='punc'>&lt;</span><span class='elName'>"+collx.container+"</span><span class='punc'>&gt;</span></span>";
        html+="</div>";
      }
      if(thes.container) {
        html+="<div class='menuItem' onclick='Ske.menuThes(\""+htmlID+"\", \"layby\")'>";
          html+="<span class='icon'><img src='../../../furniture/ske.png'/></span> ";
          html+="Find thesaurus items <span class='techno'><span class='punc'>&lt;</span><span class='elName'>"+thes.container+"</span><span class='punc'>&gt;</span></span>";
        html+="</div>";
      }
      if(defo.container) {
        html+="<div class='menuItem' onclick='Ske.menuDefo(\""+htmlID+"\", \"layby\")'>";
          html+="<span class='icon'><img src='../../../furniture/ske.png'/></span> ";
          html+="Find definitions items <span class='techno'><span class='punc'>&lt;</span><span class='elName'>"+defo.container+"</span><span class='punc'>&gt;</span></span>";
        html+="</div>";
      }
    }
    if (additional) {
      var headword = encodeURIComponent(Ske.getSearchword(htmlID));
      var conc = encodeURIComponent(Ske.getConcordance(htmlID));
    } else {
      var headword = encodeURIComponent(Ske.getHeadword());
      var conc = encodeURIComponent(Ske.getConcordance());
    }
    var corpus = encodeURIComponent(kex.corpus);
    if(headword) {
      html+="<div class='menuItem')'>";
        html+="<a target='ske' href='" + kex.url + "/#wordsketch?corpname="+corpus+"&lemma="+headword+"&showresults=1'>";
          html+="<span class='icon'><img src='../../../furniture/ske.png'/></span> ";
          html+="Show word sketch";
        html+="</a>";
      html+="</div>";
      html+="<div class='menuItem')'>";
          html+="<a target='ske' href='" + kex.url + "/#concordance?corpname="+corpus+"&showresults=1&operations="+conc+"'>";
          html+="<span class='icon'><img src='../../../furniture/ske.png'/></span> ";
          html+="Show concordance";
        html+="</a>";
      html+="</div>";
      html+="<div class='menuItem')'>";
        html+="<a target='ske' href='" + kex.url + "/#thesaurus?corpname="+corpus+"&lemma="+headword+"&showresults=1'>";
          html+="<span class='icon'><img src='../../../furniture/ske.png'/></span> ";
          html+="Show thesaurus";
        html+="</a>";
      html+="</div>";
    }
    html+="</div>";
    document.body.appendChild(Xonomy.makeBubble(html)); //create bubble
    Xonomy.showBubble($("#"+htmlID+" > .inlinecaption")); //anchor bubble to opening tag
  };

  Ske.menuExamples=function(htmlID, param){
    if(param=="layby") Ske.htmlID=null; else  Ske.htmlID=htmlID;
    document.body.appendChild(Xonomy.makeBubble(Ske.boxExamples())); //create bubble
    $("input[name=skesearchtype]").on("click", function() {
      var val = $(this).val() == "skesimple";
      $("#skesimple").nextAll("input").first().prop("disabled", !val);
      $("#skecql").nextAll("input").first().prop("disabled", val);
    });
    if(Xonomy.lastClickWhat=="openingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.opening > .name")); //anchor bubble to opening tag
    else if(Xonomy.lastClickWhat=="closingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.closing > .name")); //anchor bubble to closing tag
    else Xonomy.showBubble($("#"+htmlID));
    if(Ske.getHeadword()) {
      Ske.searchExamples();
    } else {
      $(".skebox .waiter").hide();
    }
  };
  Ske.boxExamples=function(){
    var html="";
    html="<div class='skebox'>";
      html+="<form class='topbar' onsubmit='Ske.searchExamples(); return false'>";
        if (kex.concquery.length > 0) {
          html+="<input id='skesimple' type='radio' name='skesearchtype' value='skesimple'/>";
          html+="<label for='skesimple'>Simple search: </label>";
          html+="<input disabled name='val' class='textbox simple' value='"+Ske.getHeadword()+"'/> ";
          html+="<input id='skecql' type='radio' name='skesearchtype' checked value='skecql'/>";
          html+="<label for='skecql'>CQL: </label>";
          html+="<input name='val' class='textbox cql focusme' value='"+Ske.getCQL(kex.concquery)+"'/> ";
        } else {
          html+="<input id='skesimple' type='radio' name='skesearchtype' checked value='skesimple'/>";
          html+="<label for='skesimple'>Simple search: </label>";
          html+="<input name='val' class='textbox simple focusme' value='"+Ske.getHeadword()+"'/> ";
          html+="<input id='skecql' type='radio' name='skesearchtype' value='skecql'/>";
          html+="<label for='skecql'>CQL: </label>";
          html+="<input name='val' class='textbox cql' disabled/> ";
        }
        html+="<input type='submit' class='button ske' value='&nbsp;'/>";
      html+="</form>";
      html+="<div class='waiter'></div>";
      html+="<div class='choices' style='display: none'></div>";
      html+="<div class='bottombar' style='display: none;'>";
        html+="<button class='prevnext' id='butSkeNext'>More »</button>";
        html+="<button class='prevnext' id='butSkePrev'>«</button>";
        html+="<button class='insert' onclick='Ske.insertExamples()'>Insert</button>";
      html+="</div>";
    html+="</div>";
    return html;
  };
  Ske.toggleExample=function(inp){
    if($(inp).prop("checked")) $(inp.parentNode).addClass("selected"); else $(inp.parentNode).removeClass("selected");
  };
  Ske.searchExamples=function(fromp){
    $("#butSkePrev").hide();
    $("#butSkeNext").hide();
    $(".skebox .choices").hide();
    $(".skebox .bottombar").hide();
    $(".skebox .waiter").show();
    var query=$.trim($(".skebox input.textbox:enabled").val());
    var querytype=$("input[name=skesearchtype]:checked").val();
    if(query!="") {
      $.get("/"+dictId+"/skeget/xampl/", {url: kex.apiurl, corpus: kex.corpus, username: ske_username, apikey: ske_apiKey, querytype: querytype, query: query, fromp: fromp}, function(json){
          $(".skebox .choices").html("");
          if(json.error && json.error=="Empty result"){
            $(".skebox .choices").html("<div class='error'>No results found.</div>");
            $(".skebox .waiter").hide();
            $(".skebox .choices").fadeIn();
          }
          else if(json.Lines) {
            if(json.prevlink) $("#butSkePrev").show().on("click", function(){ Ske.searchExamples(json.prevlink); $("div.skebox button.prevnext").off("click"); });
            if(json.nextlink) $("#butSkeNext").show().on("click", function(){ Ske.searchExamples(json.nextlink); $("div.skebox button.prevnext").off("click"); });
            for(var iLine=0; iLine<json.Lines.length; iLine++){ var line=json.Lines[iLine];
              var left=""; for(var i=0; i<line.Left.length; i++) left+=line.Left[i].str; left=left.replace(/\<[^\<\>]+\>/g, "");
              var kwic=""; for(var i=0; i<line.Kwic.length; i++) kwic+=line.Kwic[i].str; kwic=kwic.replace(/<[^\<\>]+\>/g, "");
              var right=""; for(var i=0; i<line.Right.length; i++) right+=line.Right[i].str; right=right.replace(/<[^\<\>]+\>/g, "");
              var txt=left+"<b>"+kwic+"</b>"+right;
              txt=txt.replace("<b> ", " <b>");
              txt=txt.replace(" </b>", "</b> ");
              $(".skebox .choices").append("<label><input type='checkbox' onchange='Ske.toggleExample(this)'/><span class='inside'>"+txt+"</span></label>");
              $(".skebox .waiter").hide();
              $(".skebox .choices").fadeIn();
              $(".skebox .bottombar").show();
            }
          } else {
            $(".skebox .choices").html("<div class='error'>There has been an error getting data from Sketch Engine.</div>");
            $(".skebox .waiter").hide();
            $(".skebox .choices").fadeIn();
          }
      });
    }
  };
  Ske.insertExamples=function(){
    $(".skebox div.choices label").each(function(){
      var $label=$(this);
      if($label.hasClass("selected")){
        var txt=$label.find("span.inside").html();
        if(xampl.markup) {
          txt=txt.replace("<b>", "<"+xampl.markup+">");
          txt=txt.replace("</b>", "</"+xampl.markup+">");
        } else {
          txt=txt.replace("<b>", "");
          txt=txt.replace("</b>", "");
        }
        var xml=xampl.template.replace("$text", txt);
        if(Ske.htmlID) Xonomy.newElementChild(Ske.htmlID, xml); else Xonomy.newElementLayby(xml);
      }
    });
  };

  Ske.menuThes=function(htmlID, param){
    if(param=="layby") Ske.htmlID=null; else  Ske.htmlID=htmlID;
    document.body.appendChild(Xonomy.makeBubble(Ske.boxThes())); //create bubble
    if(Xonomy.lastClickWhat=="openingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.opening > .name")); //anchor bubble to opening tag
    else if(Xonomy.lastClickWhat=="closingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.closing > .name")); //anchor bubble to closing tag
    else Xonomy.showBubble($("#"+htmlID));
    if(Ske.getHeadword()) {
      Ske.searchThes();
    } else {
      $(".skebox .waiter").hide();
    }
  };
  Ske.boxThes=function(){
    var html="";
    html="<div class='skebox'>";
      html+="<form class='topbar' onsubmit='Ske.searchThes(); return false'>";
    		html+="<input name='val' class='textbox focusme' value='"+Ske.getHeadword()+"'/> ";
        html+="<input type='submit' class='button ske' value='&nbsp;'/>";
      html+="</form>";
      html+="<div class='waiter'></div>";
      html+="<div class='choices' style='display: none'></div>";
      html+="<div class='bottombar' style='display: none;'>";
        html+="<button class='prevnext' id='butSkeNext'>More »</button>";
        html+="<button class='prevnext' id='butSkePrev'>«</button>";
        html+="<button class='insert' onclick='Ske.insertThes()'>Insert</button>";
      html+="</div>";
    html+="</div>";
    return html;
  };
  Ske.toggleThes=function(inp){
    if($(inp).prop("checked")) $(inp.parentNode).addClass("selected"); else $(inp.parentNode).removeClass("selected");
  };
  Ske.searchThes=function(fromp){
    $("#butSkePrev").hide();
    $("#butSkeNext").hide();
    $(".skebox .choices").hide();
    $(".skebox .bottombar").hide();
    $(".skebox .waiter").show();
    var lemma=$.trim($(".skebox .textbox").val());
    if(lemma!="") {
      $.get("/"+dictId+"/skeget/thes/", {url: kex.apiurl, corpus: kex.corpus, username: ske_username, apikey: ske_apiKey, lemma: lemma, fromp: fromp}, function(json){
          $(".skebox .choices").html("");
          if(json.error && json.error=="Empty result"){
            $(".skebox .choices").html("<div class='error'>No results found.</div>");
            $(".skebox .waiter").hide();
            $(".skebox .choices").fadeIn();
          }

          // $(".skebox .choices").append(JSON.stringify(json, null, "  "));
          // $(".skebox .waiter").hide();
          // $(".skebox .choices").fadeIn();

          else if(json.Words) {
            // if(json.prevlink) $("#butSkePrev").show().on("click", function(){ Ske.searchExamples(json.prevlink); $("div.skebox button.prevnext").off("click"); });
            // if(json.nextlink) $("#butSkeNext").show().on("click", function(){ Ske.searchExamples(json.nextlink); $("div.skebox button.prevnext").off("click"); });
            for(var iLine=0; iLine<json.Words.length; iLine++){ var line=json.Words[iLine];
              var txt=line.word;
              $(".skebox .choices").append("<label><input type='checkbox' onchange='Ske.toggleThes(this)'/><span class='inside'>"+txt+"</span></label>");
              $(".skebox .waiter").hide();
              $(".skebox .choices").fadeIn();
              $(".skebox .bottombar").show();
            }
          } else {
            $(".skebox .choices").html("<div class='error'>There has been an error getting data from Sketch Engine.</div>");
            $(".skebox .waiter").hide();
            $(".skebox .choices").fadeIn();
          }
      });
    }
  };
  Ske.insertThes=function(){
    $(".skebox div.choices label").each(function(){
      var $label=$(this);
      if($label.hasClass("selected")){
        var txt=$label.find("span.inside").html();
        var xml=thes.template.replace("$text", txt);
        if(Ske.htmlID) Xonomy.newElementChild(Ske.htmlID, xml); else Xonomy.newElementLayby(xml);
      }
    });
  };

  Ske.menuCollx=function(htmlID, param){
    if(param=="layby") Ske.htmlID=null; else  Ske.htmlID=htmlID;
    document.body.appendChild(Xonomy.makeBubble(Ske.boxCollx())); //create bubble
    if(Xonomy.lastClickWhat=="openingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.opening > .name")); //anchor bubble to opening tag
    else if(Xonomy.lastClickWhat=="closingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.closing > .name")); //anchor bubble to closing tag
    else Xonomy.showBubble($("#"+htmlID));
    if(Ske.getHeadword()) {
      Ske.searchCollx();
    } else {
      $(".skebox .waiter").hide();
    }
  };
  Ske.boxCollx=function(){
    var html="";
    html="<div class='skebox'>";
      html+="<form class='topbar' onsubmit='Ske.searchCollx(); return false'>";
    		html+="<input name='val' class='textbox focusme' value='"+Ske.getHeadword()+"'/> ";
        html+="<input type='submit' class='button ske' value='&nbsp;'/>";
      html+="</form>";
      html+="<div class='waiter'></div>";
      html+="<div class='choices' style='display: none'></div>";
      html+="<div class='bottombar' style='display: none;'>";
        html+="<button class='prevnext' id='butSkeNext'>More »</button>";
        html+="<button class='prevnext' id='butSkePrev'>«</button>";
        html+="<button class='insert' onclick='Ske.insertCollx()'>Insert</button>";
      html+="</div>";
    html+="</div>";
    return html;
  };
  Ske.toggleCollx=function(inp){
    if($(inp).prop("checked")) $(inp.parentNode).addClass("selected"); else $(inp.parentNode).removeClass("selected");
  };
  Ske.searchCollx=function(fromp){
    $("#butSkePrev").hide();
    $("#butSkeNext").hide();
    $(".skebox .choices").hide();
    $(".skebox .bottombar").hide();
    $(".skebox .waiter").show();
    var lemma=$.trim($(".skebox .textbox").val());
    if(lemma!="") {
      $.get("/"+dictId+"/skeget/collx/", {url: kex.apiurl, corpus: kex.corpus, username: ske_username, apikey: ske_apiKey, lemma: lemma, fromp: fromp}, function(json){
          $(".skebox .choices").html("");
          if(json.error && json.error=="Empty result"){
            $(".skebox .choices").html("<div class='error'>No results found.</div>");
            $(".skebox .waiter").hide();
            $(".skebox .choices").fadeIn();
          }

          // $(".skebox .choices").append(JSON.stringify(json, null, "  "));
          // $(".skebox .waiter").hide();
          // $(".skebox .choices").fadeIn();

          else if(json.Items) {
            // if(json.prevlink) $("#butSkePrev").show().on("click", function(){ Ske.searchExamples(json.prevlink); $("div.skebox button.prevnext").off("click"); });
            // if(json.nextlink) $("#butSkeNext").show().on("click", function(){ Ske.searchExamples(json.nextlink); $("div.skebox button.prevnext").off("click"); });
            for(var iLine=0; iLine<json.Items.length; iLine++){ var line=json.Items[iLine];
              var txt=line.word;
              $(".skebox .choices").append("<label><input type='checkbox' onchange='Ske.toggleCollx(this)'/><span class='inside'>"+txt+"</span></label>");
              $(".skebox .waiter").hide();
              $(".skebox .choices").fadeIn();
              $(".skebox .bottombar").show();
            }
          } else {
            $(".skebox .choices").html("<div class='error'>There has been an error getting data from Sketch Engine.</div>");
            $(".skebox .waiter").hide();
            $(".skebox .choices").fadeIn();
          }
      });
    }
  };
  Ske.insertCollx=function(){
    $(".skebox div.choices label").each(function(){
      var $label=$(this);
      if($label.hasClass("selected")){
        var txt=$label.find("span.inside").html();
        var xml=collx.template.replace("$text", txt);
        if(Ske.htmlID) Xonomy.newElementChild(Ske.htmlID, xml); else Xonomy.newElementLayby(xml);
      }
    });
  };

  Ske.menuDefo=function(htmlID, param){
    if(param=="layby") Ske.htmlID=null; else  Ske.htmlID=htmlID;
    document.body.appendChild(Xonomy.makeBubble(Ske.boxDefo())); //create bubble
    if(Xonomy.lastClickWhat=="openingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.opening > .name")); //anchor bubble to opening tag
    else if(Xonomy.lastClickWhat=="closingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.closing > .name")); //anchor bubble to closing tag
    else Xonomy.showBubble($("#"+htmlID));
    if(Ske.getHeadword()) {
      Ske.searchDefo();
    } else {
      $(".skebox .waiter").hide();
    }
  };
  Ske.boxDefo=function(){
    var html="";
    html="<div class='skebox'>";
      html+="<form class='topbar' onsubmit='Ske.searchDefo(); return false'>";
    		html+="<input name='val' class='textbox focusme' value='"+Ske.getHeadword()+"'/> ";
        html+="<input type='submit' class='button ske' value='&nbsp;'/>";
      html+="</form>";
      html+="<div class='waiter'></div>";
      html+="<div class='choices' style='display: none'></div>";
      html+="<div class='bottombar' style='display: none;'>";
        html+="<button class='prevnext' id='butSkeNext'>More »</button>";
        html+="<button class='prevnext' id='butSkePrev'>«</button>";
        html+="<button class='insert' onclick='Ske.insertDefo()'>Insert</button>";
      html+="</div>";
    html+="</div>";
    return html;
  };
  Ske.toggleDefo=function(inp){
    if($(inp).prop("checked")) $(inp.parentNode).addClass("selected"); else $(inp.parentNode).removeClass("selected");
  };
  Ske.searchDefo=function(fromp){
    $("#butSkePrev").hide();
    $("#butSkeNext").hide();
    $(".skebox .choices").hide();
    $(".skebox .bottombar").hide();
    $(".skebox .waiter").show();
    var lemma=$.trim($(".skebox .textbox").val());
    if(lemma!="") {
      $.get("/"+dictId+"/skeget/defo/", {url: kex.apiurl, corpus: kex.corpus, username: ske_username, apikey: ske_apiKey, lemma: lemma, fromp: fromp}, function(json){
          $(".skebox .choices").html("");
          if(json.error && json.error=="Empty result"){
            $(".skebox .choices").html("<div class='error'>No results found.</div>");
            $(".skebox .waiter").hide();
            $(".skebox .choices").fadeIn();
          }
          else if(json.Lines) {
            if(json.prevlink) $("#butSkePrev").show().on("click", function(){ Ske.searchExamples(json.prevlink); $("div.skebox button.prevnext").off("click"); });
            if(json.nextlink) $("#butSkeNext").show().on("click", function(){ Ske.searchExamples(json.nextlink); $("div.skebox button.prevnext").off("click"); });
            for(var iLine=0; iLine<json.Lines.length; iLine++){ var line=json.Lines[iLine];
              var left=""; for(var i=0; i<line.Left.length; i++) left+=line.Left[i].str; left=left.replace(/\<[^\<\>]+\>/g, "");
              var kwic=""; for(var i=0; i<line.Kwic.length; i++) kwic+=line.Kwic[i].str; kwic=kwic.replace(/<[^\<\>]+\>/g, "");
              var right=""; for(var i=0; i<line.Right.length; i++) right+=line.Right[i].str; right=right.replace(/<[^\<\>]+\>/g, "");
              //var txt=left+"<b>"+kwic+"</b>"+right;
              var txt=left+kwic+right;
              // txt=txt.replace("<b> ", " <b>");
              // txt=txt.replace(" </b>", "</b> ");
              $(".skebox .choices").append("<label><input type='checkbox' onchange='Ske.toggleDefo(this)'/><span class='inside'>"+txt+"</span></label>");
              $(".skebox .waiter").hide();
              $(".skebox .choices").fadeIn();
              $(".skebox .bottombar").show();
            }
          } else {
            $(".skebox .choices").html("<div class='error'>There has been an error getting data from Sketch Engine.</div>");
            $(".skebox .waiter").hide();
            $(".skebox .choices").fadeIn();
          }
      });
    }
  };
  Ske.insertDefo=function(){
    $(".skebox div.choices label").each(function(){
      var $label=$(this);
      if($label.hasClass("selected")){
        var txt=$label.find("span.inside").html();
        // if(xampl.markup) {
        //   txt=txt.replace("<b>", "<"+xampl.markup+">");
        //   txt=txt.replace("</b>", "</"+xampl.markup+">");
        // } else {
        //   txt=txt.replace("<b>", "");
        //   txt=txt.replace("</b>", "");
        // }
        var xml=defo.template.replace("$text", txt);
        if(Ske.htmlID) Xonomy.newElementChild(Ske.htmlID, xml); else Xonomy.newElementLayby(xml);
      }
    });
  };

  window.Kontext={};

  Kontext.change=function(){};

  Kontext.settings={
    defaultURL: "https://www.clarin.si/kontext/"
  };

  Kontext.ifchange=function(event){
    var $inp=$(event.delegateTarget);
    if($inp.val()!=$inp.data("origval")) Kontext.change();
  };

  Kontext.render=function(div, json){
    $(div).append("<div id='pagebody' class='notop'><div class='pillarform'></div></div>"); var $div=$(div).find("div.pillarform");

    $div.append("<div class='title'>KonText URL</div>");
    $div.append("<input class='textbox' id='kontext_url'/>");
    if (json.url == "" || json.url == undefined) {
      json.url = Kontext.settings.defaultURL;
    }
    $div.find("#kontext_url").val(json.url).data("origval", json.url).on("change keyup", Kontext.ifchange);
    $div.append("<div class='instro'>The URL of the KonText installation where external links should point. Defaults to <code>https://www.clarin.si/kontext/</code>. </div>");

    $div.append("<div class='title'>Corpus name</div>");
      $div.append("<input class='textbox' id='kontext_corpus' value='Retrieving available corpora from KonText, please wait...' disabled/>");
      var corpus_input = $("#kontext_corpus");
      corpus_input.data("corpname", json.corpus);
      $.get({
        url: "/" + dictID + "/kontext/corpora",
      }).done(function(res) {
          Kontext.corpora = res.corpus_list;
          corpus_input.easyAutocomplete({
            theme: "blue-light",
            data: Kontext.corpora,
            getValue: "name",
            list: {
              maxNumberOfElements: 20,
              match: {
                enabled: true,
                method : function(element, phrase) {
                  return element.indexOf(phrase) !== -1;
                }
              },
              onSelectItemEvent: function() {
                var new_corpus = corpus_input.getSelectedItemData().corpus_id;
                if (json.corpus != new_corpus) {
                  corpus_input.data("corpus_id", new_corpus);
                  Kontext.change();
                }
              }
            },
            placeholder: "Type to search in the list of corpora",
            template: {
              type: "custom",
              method: function(value, item) {
                return item.name + " (" + item.desc + "; " + item.size_info + ")";
              }
            }
          });
          corpus_input.prop("disabled", false);
          if (json.corpus) {
            var corpus = res.corpus_list.find(function(el) {return el.corpus_id == json.corpus});
            if (corpus) {
              corpus_input.val(corpus.name);
              $("<div class='instro'>Currently selected corpus: " + corpus.name + "</div>").insertAfter($("#kontext_corpus").parent());
            } else {
              corpus_input.val("Your current corpus is no longer available, please select a new one.");
            }
          } else {
            corpus_input.val("");
          }
        });
      $div.append("<div class='instro'>Select a KonText corpus from the list of corpora available to you.</div>");

    $div.append("<div class='title'>Concordance query</div>");
    $div.append("<input class='textbox' id='kontext_concquery'/>");
    $div.find("#kontext_concquery").val(json.concquery).data("origval", json.concquery).on("change keyup", Kontext.ifchange);
    $div.append("<div class='instro'>The CQL query that will be used to obtain concordance from KonText. You can use placeholders for elements in the form of '%(element)', e.g. '[lemma=\"%(headword)\"]'. If left empty the 'simple' query type will be used as configured for the respective corpus. Please note that you cannot use CQL syntax with default attribute because it is not specified.</div>");

    if (!json.searchElements) {
      json.searchElements = [];
    }
    $div.append("<div class='title'>Additional search elements</div>");
    $div.append("<div class='scrollbox'>");
    var $scrollbox = $div.find(".scrollbox");
    var elements=Xematron.listElements(xema);
    for(var i=0; i<elements.length; i++){
      var available = ["txt","lst"].indexOf(xema.elements[elements[i]].filling) != -1;
      $scrollbox.append("<div><label class='radio' data-name='"+elements[i]+"'>\
          <input type='checkbox' data-name='"+elements[i]+"' "+(json.searchElements.indexOf(elements[i])>-1?"checked":"")+ " " + (available?"":"disabled") + "/> \
          "+elements[i]+"</label></div>");
    }
    $scrollbox.find("label").on("click", Kontext.change);
    $scrollbox.parent().append("<div class='instro'>You can select any textual elements here whose content you would like to search for in KonText. A menu will be displayed next to all these elements like for the root entry element.</div>");

    var $block=$("<div class='block container'></div>").appendTo($div);
  	$block.append("<div class='title'>Example container</div>");
    $block.append("<select></select>");
    $block.find("select").append("<option value=''>(not set)</option>");
    for(var i=0; i<elements.length; i++){
      $block.find("select").append("<option "+(json.container==elements[i] ? "selected='selected'" : "")+" value='"+elements[i]+"'>"+elements[i]+"</option>");
    }
    $block.find("select").on("change", function(e){Kontext.containerChanged();});
    $block.append("<div class='instro'>Select the element which should wrap each individual example. When you pull example sentences automatically from a corpus, Lexonomy will insert one of these elements for each example sentence.</div>");

    var $block=$("<div class='block template'></div>").appendTo($div);
  	$block.append("<div class='title'>XML template</div>");
    $block.append("<textarea class='textbox' spellcheck='false'></textarea>");
    $block.find("textarea").val(json.template).data("origval", json.template).on("change keyup", function(e){
      Kontext.validateTemplate();
    });
    $block.append("<div class='instro'>This is the XML that will be inserted into your entries with each corpus example. The actual text will be where the placeholder <code>$text</code> is.</div>");
    $block.append("<div class='error' style='display: none;'></div>");
    Kontext.validateTemplate();

    var $block=$("<div class='block markup'></div>").appendTo($div);
  	$block.append("<div class='title'>Headword mark-up</div>");
    $block.append("<select></select>");
    $block.find("select").append("<option value=''>(none)</option>");
    for(var i=0; i<elements.length; i++){
      $block.find("select").append("<option "+(json.markup==elements[i] ? "selected='selected'" : "")+" value='"+elements[i]+"'>"+elements[i]+"</option>");
    }
    $block.append("<div class='instro'>Select the element which should mark up the headword in inserted corpus examples. This setting is optional: if you make no selection, corpus examples will be inserted without mark-up.</div>");

  };

  Kontext.containerChanged=function(){
    var container=$(".pillarform .block.container select").val();
    var template=$.trim($(".pillarform .block.template textarea").val());
    if(!template && container) {
      $(".pillarform .block.template textarea").val(Kontext.composeTemplate(container));
    } else {
      try{
        var xml=$.parseXML(template);
      }catch(ex){}
      if(container && (xml.documentElement.localName!=container)){
        $(".pillarform .block.template textarea").val(Kontext.composeTemplate(container));
      }
    }
    Kontext.validateTemplate();
  };

  Kontext.validateTemplate=function(){
    var container=$(".pillarform .block.container select").val();
    var template=$.trim($(".pillarform .block.template textarea").val());
    if(container && template) {
      try{
        var xml=$.parseXML(template);
        $(".pillarform .block.template .error").hide();
        if(container && xml.documentElement.localName!=container) {
            $(".pillarform .block.template .error").html("The top-level element should be <code>"+container+"</code>.").show();
        } else {
          if(!/\$text/.test(template)) {
            $(".pillarform .block.template .error").html("The <code>$text</code> symbol is missing.").show();
          }
        }
      }catch(ex){
        $(".pillarform .block.template .error").html("The XML is invalid.").show();
      }
    }
  };

  Kontext.composeTemplate=function(topElement){
    var xml=$.parseXML(Xematron.initialElement(xema, topElement));
    var els=xml.getElementsByTagName("*");
    for(var i=0; i<els.length; i++){
      var el=els[i];
      if(xema.elements[el.localName].filling=="txt" || xema.elements[el.localName].filling=="inl") {
        el.innerHTML="$text";
        break;
      }
    }
    return xml.documentElement.outerHTML;
  };

  Kontext.harvest=function(div){
    var $div=$(div);
    var ret={};
    ret.url=$.trim( $div.find("#kontext_url").val() ) || Kontext.settings.defaultURL;
    ret.corpus=$("#kontext_corpus").data("corpus_id") || "";
    ret.concquery=$.trim( $div.find("#kontext_concquery").val() );
    ret.searchElements=[];
    $(".pillarform .scrollbox label input").each(function(){
      var $input=$(this);
      if($input.prop("checked")) ret.searchElements.push($input.attr("data-name"));
    });
    ret.container=$(".pillarform .block.container select").val();
    ret.template=$(".pillarform .block.template textarea").val();
    ret.markup=$(".pillarform .block.markup select").val();
    return ret;
  };

  Kontext.extendDocspec=function(docspec, xema){
    if(kontext.corpus) {
      if(!subbing[xema.root]) {
        var elSpec=docspec.elements[xema.root];
        var incaption=elSpec.caption;
        elSpec.caption=function(jsMe){
          var cap="";
          cap="<span class='lexonomyKontextCaption' onclick='Xonomy.notclick=true; Kontext.menuRoot(\""+jsMe.htmlID+"\")'>▼</span>";
          if(typeof(incaption)=="function") cap=incaption(jsMe)+cap;
          if(typeof(incaption)=="string") cap=incaption+cap;
          return cap;
        };
      }
    }
  };

  Kontext.menuRoot=function(htmlID, additional=false){
    var html="<div class='menu'>";
    if (!additional) {
      if(kontext.container) {
        html+="<div class='menuItem' onclick='Kontext.menuExamples(\""+htmlID+"\", \"layby\")'>";
          html+="<span class='icon'><img src='../../../furniture/kontext.png'/></span> ";
          html+="Find examples <span class='techno'><span class='punc'>&lt;</span><span class='elName'>"+kontext.container+"</span><span class='punc'>&gt;</span></span>";
        html+="</div>";
      }
    }
    if (additional) {
      var headword = encodeURIComponent(Kontext.getSearchword(htmlID));
    } else {
      var headword = encodeURIComponent(Kontext.getHeadword());
    }
    if(headword) {
      html+="<div class='menuItem')'>";
          html+="<a target='kontext' href='/"+dictID+"/kontext/conc?lemma="+headword+"&redir=1'>";
          html+="<span class='icon'><img src='../../../furniture/kontext.png'/></span> ";
          html+="Show concordance";
        html+="</a>";
      html+="</div>";
    }
    html+="</div>";
    document.body.appendChild(Xonomy.makeBubble(html)); //create bubble
    Xonomy.showBubble($("#"+htmlID+" > .inlinecaption")); //anchor bubble to opening tag
  };
  Kontext.getHeadword=function(){
    var $xml=$($.parseXML(Xonomy.harvest()));
    var hwd=$xml.find(titling.headword).html();
    if(!hwd) hwd="";
    return hwd;
  };
  Kontext.getSearchword=function(elementID){
    return Xonomy.harvestElement(document.getElementById(elementID)).getText();
  };
  Kontext.menuExamples=function(htmlID, param){
    if(param=="layby") Kontext.htmlID=null; else  Kontext.htmlID=htmlID;
    document.body.appendChild(Xonomy.makeBubble(Kontext.boxExamples())); //create bubble
    $("input[name=kontextsearchtype]").on("click", function() {
      var val = $(this).val() == "kontextsimple";
      $("#kontextsimple").nextAll("input").first().prop("disabled", !val);
      $("#kontextcql").nextAll("input").first().prop("disabled", val);
    });
    if(Xonomy.lastClickWhat=="openingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.opening > .name")); //anchor bubble to opening tag
    else if(Xonomy.lastClickWhat=="closingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.closing > .name")); //anchor bubble to closing tag
    else Xonomy.showBubble($("#"+htmlID));
    if(Kontext.getHeadword()) {
      Kontext.searchExamples();
    } else {
      $(".kontextbox .waiter").hide();
    }
  };
  Kontext.boxExamples=function(){
    var html="";
    html="<div class='kontextbox'>";
      html+="<form class='topbar' onsubmit='Kontext.searchExamples(); return false'>";
        if (kontext.concquery.length > 0) {
          html+="<input id='kontextsimple' type='radio' name='kontextsearchtype' value='kontextsimple'/>";
          html+="<label for='kontextsimple'>Simple search: </label>";
          html+="<input disabled name='val' class='textbox simple' value='"+Kontext.getHeadword()+"'/> ";
          html+="<input id='kontextcql' type='radio' name='kontextsearchtype' checked value='kontextcql'/>";
          html+="<label for='kontextcql'>CQL: </label>";
          html+="<input name='val' class='textbox cql focusme' value='"+Kontext.getCQL(kontext.concquery)+"'/> ";
        } else {
          html+="<input id='kontextsimple' type='radio' name='kontextsearchtype' checked value='kontextsimple'/>";
          html+="<label for='kontextsimple'>Simple search: </label>";
          html+="<input name='val' class='textbox simple focusme' value='"+Kontext.getHeadword()+"'/> ";
          html+="<input id='kontextcql' type='radio' name='kontextsearchtype' value='kontextcql'/>";
          html+="<label for='kontextcql'>CQL: </label>";
          html+="<input name='val' class='textbox cql' disabled/> ";
        }
        html+="<input type='submit' class='button kontext' value='&nbsp;'/>";
      html+="</form>";
      html+="<div class='waiter'></div>";
      html+="<div class='choices' style='display: none'></div>";
      html+="<div class='bottombar' style='display: none;'>";
        html+="<button class='prevnext' id='butKontextNext'>More »</button>";
        html+="<button class='prevnext' id='butKontextPrev'>«</button>";
        html+="<button class='insert' onclick='Kontext.insertExamples()'>Insert</button>";
      html+="</div>";
    html+="</div>";
    return html;
  };
  Kontext.toggleExample=function(inp){
    if($(inp).prop("checked")) $(inp.parentNode).addClass("selected"); else $(inp.parentNode).removeClass("selected");
  };
  Kontext.searchExamples=function(fromp){
    $("#butKontextPrev").hide();
    $("#butKontextNext").hide();
    $(".kontextbox .choices").hide();
    $(".kontextbox .bottombar").hide();
    $(".kontextbox .waiter").show();
    var query=$.trim($(".kontextbox input.textbox:enabled").val());
    var querytype=$("input[name=kontextsearchtype]:checked").val();
    if(query!="") {
      $.get(rootPath+dictID+"/kontext/conc/", {querytype: querytype, query: query, fromp: fromp}, function(json){
          $(".kontextbox .choices").html("");
          if(json.error && json.error=="Empty result"){
            $(".kontextbox .choices").html("<div class='error'>No results found.</div>");
            $(".kontextbox .waiter").hide();
            $(".kontextbox .choices").fadeIn();
          }
          else if(json.Lines) {
            if(json.pagination.prevPage) $("#butKontextPrev").show().on("click", function(){ Kontext.searchExamples(json.pagination.prevPage); $("div.kontextbox button.prevnext").off("click"); });
            if(json.pagination.nextPage) $("#butKontextNext").show().on("click", function(){ Kontext.searchExamples(json.pagination.nextPage); $("div.kontextbox button.prevnext").off("click"); });
            for(var iLine=0; iLine<json.Lines.length; iLine++){ var line=json.Lines[iLine];
              var left=""; for(var i=0; i<line.Left.length; i++) left+=line.Left[i].str; left=left.replace(/\<[^\<\>]+\>/g, "");
              var kwic=""; for(var i=0; i<line.Kwic.length; i++) kwic+=line.Kwic[i].str; kwic=kwic.replace(/<[^\<\>]+\>/g, "");
              var right=""; for(var i=0; i<line.Right.length; i++) right+=line.Right[i].str; right=right.replace(/<[^\<\>]+\>/g, "");
              var txt=left+"<b>"+kwic+"</b>"+right;
              txt=txt.replace("<b> ", " <b>");
              txt=txt.replace(" </b>", "</b> ");
              $(".kontextbox .choices").append("<label><input type='checkbox' onchange='Kontext.toggleExample(this)'/><span class='inside'>"+txt+"</span></label>");
              $(".kontextbox .waiter").hide();
              $(".kontextbox .choices").fadeIn();
              $(".kontextbox .bottombar").show();
            }
          } else {
            $(".kontextbox .choices").html("<div class='error'>There has been an error getting data from KonText.</div>");
            $(".kontextbox .waiter").hide();
            $(".kontextbox .choices").fadeIn();
          }
      });
    }
  };
  Kontext.getCQL=function(cql){
    var $xml=$($.parseXML(Xonomy.harvest()));
    var ret = cql.replace(/%\([^)]+\)/g, function (el) {
      return $xml.find(el.substring(2, el.length - 1)).html();
    });
    return ret;
  };

  Kontext.insertExamples=function(){
    $(".kontextbox div.choices label").each(function(){
      var $label=$(this);
      if($label.hasClass("selected")){
        var txt=$label.find("span.inside").html();
        if(kontext.markup) {
          txt=txt.replace("<b>", "<"+kontext.markup+">");
          txt=txt.replace("</b>", "</"+kontext.markup+">");
        } else {
          txt=txt.replace("<b>", "");
          txt=txt.replace("</b>", "");
        }
        var xml=kontext.template.replace("$text", txt);
        if(Kontext.htmlID) Xonomy.newElementChild(Kontext.htmlID, xml); else Xonomy.newElementLayby(xml);
      }
    });
  };

  window.Gmedia = {};
  Gmedia.extendDocspec=function(docspec, xema) {
    if (gapi.apikey && gapi.cx) {
      for(var parName in xema.elements){
        if (xema.elements[parName].filling == 'med') {
          var elSpec=docspec.elements[parName];
          var incaption=elSpec.caption;
          elSpec.caption=function(jsMe){
            var cap="";
            cap="<span class='lexonomyGmediaCaption' onclick='Xonomy.notclick=true; Gmedia.menuRoot(\""+jsMe.htmlID+"\")'>▼</span>";
            if(typeof(incaption)=="function") cap=incaption(jsMe)+cap;
            if(typeof(incaption)=="string") cap=incaption+cap;
            return cap;
          };
        }
      }
    }
  };

  Gmedia.getHeadword=function() {
    var $xml = $($.parseXML(Xonomy.harvest()));
    var hwd = $xml.find(titling.headword).html();
    if(!hwd) hwd = "";
    return hwd;
  };

  Gmedia.addLink=function(htmlID, target) {
    $('#'+htmlID+' .children div').attr('data-value', target.getAttribute('data-url'));
    $('#'+htmlID+' .children div').removeClass('empty');
    $('#'+htmlID+' .children div').removeClass('whitespace');
    $('#'+htmlID+' .children div .value .word').html(target.getAttribute('data-url'));
    Xonomy.changed();
  };

  Gmedia.menuRoot=function(htmlID) {
    var html = "<div class='menu'>";

    var headword = Gmedia.getHeadword();
    if (headword != '') {
      html += "searching for: " + headword;
      var url = '/'+dictID+'/getmedia/'+headword;
      $.get(url, function(json) {
        if (json.images && json.images.length > 0) {
          $('#xonomyBubbleContent .menu').html('');
          json.images.forEach((image) => {
            var imhtml = '<i>' + image.title + '</i><br/>';
            imhtml += '<img onclick="Gmedia.addLink(\'' + htmlID + '\', this)" data-url="' + image.url + '" src="' + image.thumb + '" class="Gmediathumb">';
            imhtml += '</br>';
            $('#xonomyBubbleContent .menu').append(imhtml);
          });
        } else {
          $('#xonomyBubbleContent .menu').html("no results found");
        }
      });
    } else {
      html += "no headword set";
    }

    html += "</div>";
    document.body.appendChild(Xonomy.makeBubble(html)); //create bubble
    Xonomy.showBubble($("#"+htmlID+" > .inlinecaption")); //anchor bubble to opening tag
  };

  Gmedia.addVoice=function(entry) {
    if (gapi.voicekey && gapi.voicekey != '' && gapi.voicelang != '') {
      if (entry) {
        var $xml = $($.parseXML(entry.content));
      } else {
        var $xml = $($.parseXML(Xonomy.harvest()));
      }
      var headword = $xml.find(titling.headword).html();
      if (headword != '') {
        $('#viewer').append('<div id="voicetts"><audio controls src="https://api.voicerss.org/?key='+gapi.voicekey+'&hl='+gapi.voicelang+'&src='+headword+'"/></div>');
        $('#editor').append('<div id="voicetts"><audio controls src="https://api.voicerss.org/?key='+gapi.voicekey+'&hl='+gapi.voicelang+'&src='+headword+'"/></div>');
      }
    }
  };

  Gmedia.addVoicePublic=function(entry, gapi, titling) {
     var $xml = $($.parseXML(entry.content));
     var headword = $xml.find(titling.headword).html();
     if (headword != "" && gapi.voicekey && gapi.voicekey != '' && gapi.voicelang != '') {
        $('#viewer div:first span:first').after('<span class="voicetts"><audio id="voiceplayer" src="https://api.voicerss.org/?key='+gapi.voicekey+'&hl='+gapi.voicelang+'&src='+headword+'"/><span class="voicetts-icon"><img src="./furniture/speaker.png" onclick="document.getElementById(\'voiceplayer\').play()"></span></span>');
     }
  };

  window.Sub={};
  Sub.htmID="";

  Sub.extendDocspec=function(docspec, xema){
    //add background colour and captions to elements that can be subentries:
    for(var elName in xema.elements){
      if(subbing[elName]) {
        docspec.elements[elName].backgroundColour=function(jsMe){
          var id=jsMe.getAttributeValue("lxnm:subentryID", 0);
          var parents=[]; jsMe.getChildElements("lxnm:subentryParent").map(function(p){if(p.getAttributeValue("id")!=Screenful.Editor.entryID) parents.push(p);});
    			if(id && parents.length>0) {
            return "#e6e6e6";
          }
          return "";
        };
        var incaption=docspec.elements[elName].caption;
        docspec.elements[elName].caption=function(jsMe){
    			var cap="";
    			var id=jsMe.getAttributeValue("lxnm:subentryID", 0);
    			var parents=[]; jsMe.getChildElements("lxnm:subentryParent").map(function(p){if(p.getAttributeValue("id")!=Screenful.Editor.entryID) parents.push(p);});
    			if(id && parents.length>0) {
            cap+=+parents.length+" ▼";
    			  cap="<span class='lexonomySubentryCaption' onclick='Xonomy.notclick=true; Sub.menuSubentry(\""+jsMe.htmlID+"\")'>"+cap+"</span>";
          }
          if(typeof(incaption)=="function") cap=incaption(jsMe)+cap;
          if(typeof(incaption)=="string") cap=incaption+cap;
    			return cap;
    		};
      }
    }
    //add menu items to parents that can have subentry children:
    for(var parName in xema.elements){
      for(var elName in subbing){
        if(xema.elements[parName].children){
          canHaveSubs=false;
          for(var iChild=0; iChild<xema.elements[parName].children.length; iChild++){
            if(xema.elements[parName].children[iChild].name==elName){
              canHaveSubs=true; break;
            }
          }
          if(canHaveSubs){
            if(docspec.elements[parName]){
              if(!docspec.elements[parName].menu) docspec.elements[parName].menu=[];
              docspec.elements[parName].menu.push({
                icon: "/furniture/favicon.png",
                caption: "Find subentries <"+elName+">",
                action: Sub.menuSubentries,
                actionParameter: {elName: elName},
              });
            }
          }
        }
      }
    }
  };

  Sub.menuSubentry=function(htmlID){
    var jsMe=Xonomy.harvestElement($("#"+htmlID)[0]);
    var id=jsMe.getAttributeValue("lxnm:subentryID", 0);
    var parents=[]; jsMe.getChildElements("lxnm:subentryParent").map(function(p){if(p.getAttributeValue("id")!=Screenful.Editor.entryID) parents.push(p);});
    var html="<div class='subinfobox'>";
    if(jsMe.parent() || $("#"+htmlID).closest(".xonomy .layby").length>0){
      if(parents.length==0) html+="<div class='topline'><span class='opener' onclick='Xonomy.clickoff(); Screenful.Editor.open(null, "+id+")'>This subentry</span> is not shared with any other entry.</div>";
      else if(parents.length==1) html+="<div class='topline'><span class='opener' onclick='Xonomy.clickoff(); Screenful.Editor.open(null, "+id+")'>This subentry</span> is shared with one other entry.</div>";
      else html+="<div class='topline'><span class='opener' onclick='Xonomy.clickoff(); Screenful.Editor.open(null, "+id+")'>This subentry</span> is shared with "+parents.length+" other entries.</div>";
    } else {
      if(parents.length==0) html+="<div class='topline'>This subentry is not embedded in any entries.</div>";
      else if(parents.length==1) html+="<div class='topline'>This subentry is embedded in one entry.</div>";
      else html+="<div class='topline'>This subentry is shared by "+parents.length+" entries.</div>";
    }
    if(parents.length>0) {
      html+="<div class='entrylines'>";
      parents.map(function(parent){
        var parentID=parent.getAttributeValue("id", 0);
        var parentTitle=parent.getAttributeValue("title", parentID);
        html+="<div class='entryline' onclick='Xonomy.clickoff(); Screenful.Editor.open(null, "+parentID+")'>"+parentTitle+"</div>";
      });
      html+="</div>";
    }
    html+="</div>";
    document.body.appendChild(Xonomy.makeBubble(html)); //create bubble
    Xonomy.showBubble($("#"+htmlID+" > .inlinecaption")); //anchor bubble to opening tag
  };

  Sub.getHeadword=function(){
    var $xml = $($.parseXML(Xonomy.harvest()));
    var hwd = $xml.find(titling.headword).html().replace(/(<([^>]+)>)/gi, "");
    if(!hwd) hwd = "";
    return hwd;
  };

  Sub.menuSubentries=function(htmlID, param){
    Sub.htmlID=htmlID;
    document.body.appendChild(Xonomy.makeBubble(Sub.boxSubentries(param.elName))); //create bubble
    if(Xonomy.lastClickWhat=="openingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.opening > .name")); //anchor bubble to opening tag
    else if(Xonomy.lastClickWhat=="closingTagName") Xonomy.showBubble($("#"+htmlID+" > .tag.closing > .name")); //anchor bubble to closing tag
    else Xonomy.showBubble($("#"+htmlID));
    if(Sub.getHeadword()) {
      Sub.searchSubentries();
    } else {
      $(".subbox .waiter").hide();
    }
  };

  Sub.boxSubentries=function(elName){
    var html="";
    html="<div class='subbox'>";
      html+="<form class='topbar' onsubmit='Sub.searchSubentries(); return false'>";
    		html+="<input name='val' class='textbox focusme' value='"+Sub.getHeadword()+"'/> ";
    		html+="<input name='doctype' type='hidden' value='"+elName+"'/> ";
        html+="<input type='submit' class='button sub' value='&nbsp;'/>";
        html+="<button class='creator' onclick='Sub.newSubentry(\""+elName+"\"); return false;'>New</button>";
      html+="</form>";
      html+="<div class='waiter'></div>";
      html+="<div class='choices' style='display: none'></div>";
      html+="<div class='bottombar' style='display: none;'>";
        html+="<button class='insert' onclick='Sub.insertSubentries()'>Insert</button>";
      html+="</div>";
    html+="</div>";
    return html;
  };

  Sub.newSubentry=function(elName){
    var xml=Xematron.initialElement(xema, elName);
    Xonomy.newElementChild(Sub.htmlID, xml);
    Xonomy.clickoff();
  };

  Sub.toggleSubentry=function(inp){
    if($(inp).prop("checked")) $(inp.parentNode).addClass("selected"); else $(inp.parentNode).removeClass("selected");
  };

  Sub.searchSubentries=function(){
    $(".subbox .choices").hide();
    $(".subbox .bottombar").hide();
    $(".subbox .waiter").show();
    var lemma=$.trim($(".subbox .textbox").val());
    var doctype=$.trim($("input[name=\"doctype\"]").val());
    if(lemma!="") {
      $.get("/"+dictId+"/subget/", {lemma: lemma, doctype: doctype}, function(json){
          $(".subbox .choices").html("");
          if(!json.success){
            $(".subbox .choices").html("<div class='error'>There has been an error getting data from Lexonomy.</div>");
            $(".subbox .waiter").hide();
            $(".subbox .choices").fadeIn();
          } else if(json.total==0){
            $(".subbox .choices").html("<div class='error'>No matches found.</div>");
            $(".subbox .waiter").hide();
            $(".subbox .choices").fadeIn();
          } else {
            for(var iLine=0; iLine<json.entries.length; iLine++){ var line=json.entries[iLine];
              $(".subbox .choices").append("<label><input type='checkbox' onchange='Sub.toggleSubentry(this)'/><span class='inside'>"+line.title+"</span></label>");
              $(".subbox .choices label").last().data("xml", line.xml);
              $(".subbox .waiter").hide();
              $(".subbox .choices").fadeIn();
              $(".subbox .bottombar").show();
            }
          }
      });
    }
  };

  Sub.insertSubentries=function(){
    $(".subbox div.choices label").each(function(){
      var $label=$(this);
      if($label.hasClass("selected")){
        var xml=$label.data("xml");
        Xonomy.newElementChild(Sub.htmlID, xml);
      }
    });
  };

  var App = {
    css: `main .contentWrapper,[is="main"] .contentWrapper{ position: relative; } main .content,[is="main"] .content{ padding-left: 10px; min-height: 50vh; } main .wideContainer,[is="main"] .wideContainer{ max-width: 1600px; width: 90vw; }`,

    exports: {
      state: {
         content: '',
         subPage: 'login',
         token: ''
      },

      bindings: [["auth", "authChanged", "update"],
                 ["auth", "checkingAuthChanged", "onCheckingAuthChange"],
                 ["store", "dictionaryChanged", "update"]],

      onCheckingAuthChange(){
         this.update();
         if(this.authData.authorized){
            this.store.loadDictionaryList();
         }
         route.start(true);
      },

      goTo(content, subPage, storeParams, updateParams){
         if(!this.authData.authorized && this.needAuthorization(content, subPage)){
            this.update({
               subPage: 'login',
               content: 'main-page'
            });
         } else {
            storeParams && this.store.open(...storeParams);
            let query = route.query();
            this.store.changeSearchParams({
               searchtext: decodeURIComponent(query.s || ""),
               modifier: query.m
            });

            this.update(Object.assign({
               content: content,
               subPage: subPage || ''
            }, updateParams || {}));
         }
      },

      needAuthorization(content, subPage){
         if(['e404', 'open-dict-list', 'dict-public', 'dict-public-entry', 'docs-intro'].includes(content)
               || content == 'main-page' && !['new', 'userprofile'].includes(subPage)){
            return false
         }
         return true
      },

      onBeforeMount() {
         $.ajaxSetup({
            xhrFields: { withCredentials: true }
         });
         this.auth.checkAuthCookie();
         this.store.loadSiteconfig().always(this.update.bind(this));
         new window.AppUpdaterClass({
            url: window.window.API_URL + 'version.txt',
            windowVersionKey: 'LEXONOMY_VERSION'
         });

         route('/api', () => {
            this.goTo.bind(this, 'api');
         });
         route('/e404', () => {
            this.goTo('e404');
         });
         route('/opendictionaries', () => {
            this.goTo('open-dict-list');
         });
         route('/docs/intro', () => {
            this.goTo('docs-intro');
         });
         route('/createaccount/*', (token) => {
            this.goTo('main-page', 'registerPassword', '', {token: token});
         });
         route('/recoverpwd/*', (token) => {
            this.goTo('main-page', 'forgotPassword', '', {token: token});
         });
         route('/register', () => {
            this.goTo('main-page', 'register');
         });
         route('/forgot', () => {
            this.goTo('main-page', 'forgot');
         });
         route('/userprofile', () => {
            this.goTo('main-page', 'userprofile');
         });
         route('/make', () => {
            this.goTo('main-page', 'new');
         });
         route('/*/edit(\?*){0,1}', (dictId) => {
            this.goTo('dict-edit', '', [dictId]);
         });
         route('/*/edit/*(\?*){0,1}', (dictId, doctype) => {
            this.goTo('dict-edit', '', [dictId, doctype]);
         });
         route('/*/edit/*/*/*(\?*){0,1}', (dictId, doctype, entryId, mode) => {
            this.goTo('dict-edit', '', [dictId, doctype, entryId, mode]);
         });
         route('/*/([0-9]+)(\?*){0,1}', (dictId, entryId) => {
            this.goTo('dict-public-entry', '', [dictId, null, entryId]);
         });
         route('/*/config/*', (dictId, configId) => {
            this.goTo('dict-config-' + configId, '', [dictId]);
         });
         route('/*/config', (dictId) => {
            this.goTo('dict-config', '', [dictId]);
         });
         route('/*/links', (dictId) => {
            this.goTo('dict-links', '', [dictId]);
         });
         route('/*/download', (dictId) => {
            this.goTo('dict-download', '', [dictId]);
         });
         route('/*/upload', (dictId) => {
            this.goTo('dict-upload', '', [dictId]);
         });
         route('/*', (dictId) => {
            this.goTo('dict-public', '', [dictId]);
         });
         route('/', () => {
            this.goTo('main-page', 'login');
         });
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<loading-overlay expr78="expr78" fullscreen="1"></loading-overlay><app-header expr79="expr79"></app-header><div class="contentWrapper"><div expr80="expr80"></div></div><app-footer expr81="expr81"></app-footer>',
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
          type: bindingTypes.IF,
          evaluate: _scope => _scope.authData.isCheckingAuth || _scope.dictData.isSiteconfigLoading,
          redundantAttribute: 'expr78',
          selector: '[expr78]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'app-header',
          slots: [],
          attributes: [],
          redundantAttribute: 'expr79',
          selector: '[expr79]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.authData.isCheckingAuth && !_scope.dictData.isSiteconfigLoading,
          redundantAttribute: 'expr80',
          selector: '[expr80]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => _scope.state.content,
                slots: [],

                attributes: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'class',

                    evaluate: _scope => [
                      'container content row ',
                      ['dict-edit', 'dict-public-entry', 'dict-public'].includes(_scope.state.content) ? 'wideContainer' : ''
                    ].join(
                      ''
                    )
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'token',
                    evaluate: _scope => _scope.state.token
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'main-sub-page',
                    evaluate: _scope => _scope.state.subPage
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'app-footer',
          slots: [],
          attributes: [],
          redundantAttribute: 'expr81',
          selector: '[expr81]'
        }
      ]
    ),

    name: 'main'
  };

  var api = {
    css: null,

    exports: {
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
      '<div class="container"><h2>Lexonomy API documentation and test</h2><p>Lexonomy also supports <a href="https://elexis-eu.github.io/elexis-rest/">ELEXIS REST API</a> - calls <tt expr0="expr0"></tt>. Use your API key as <tt expr1="expr1"></tt>.</p><hr/><p>Following calls are Lexonomy API with specific information.</p><p expr2="expr2"><b>API URL:</b> </p><hr/><h3>List languages used in dictionaries</h3><p expr3="expr3"> </p><textarea id="input_listLang" style="font-size: 1rem; width: 100%; height: 5em; resize: vertical" spellcheck="false">{\n         "email": "rambousek@gmail.com",\n         "apikey": "I0BNKTQEZUI9ZBMUX7ABQG1A6LMKUZOU"\n      }</textarea><button expr4="expr4">Post</button> and watch your console.\n      <hr/><h3>List all dictionaries metadata</h3><p expr5="expr5"> </p><textarea id="input_listDict" style="font-size: 1rem; width: 100%; height: 5em; resize: vertical" spellcheck="false">{\n         "email": "rambousek@gmail.com",\n         "apikey": "I0BNKTQEZUI9ZBMUX7ABQG1A6LMKUZOU"\n      }</textarea><button expr6="expr6">Post</button> and watch your console.\n      <hr/><h3>List dictionaries metadata for selected language</h3><p expr7="expr7"> </p><textarea id="input_listDict2" style="font-size: 1rem; width: 100%; height: 7em; resize: vertical" spellcheck="false">{\n         "email": "rambousek@gmail.com",\n         "apikey": "I0BNKTQEZUI9ZBMUX7ABQG1A6LMKUZOU",\n         "lang": "sl"\n      }</textarea><button expr8="expr8">Post</button> and watch your console.\n      <hr/><h3>List dictionaries metadata for selected language, with links only</h3><p expr9="expr9"> </p><textarea id="input_listDict3" style="font-size: 1rem; width: 100%; height: 7em; resize: vertical" spellcheck="false">{\n         "email": "rambousek@gmail.com",\n         "apikey": "I0BNKTQEZUI9ZBMUX7ABQG1A6LMKUZOU",\n         "lang": "sl",\n         "withLinks": true\n      }</textarea><button expr10="expr10">Post</button> and watch your console.\n      <hr/><h3>Find links, from headword in language</h3><p expr11="expr11"> </p><textarea id="input_listLinks1" style="font-size: 1rem; width: 100%; height: 7em; resize: vertical" spellcheck="false">{\n         "email": "rambousek@gmail.com",\n         "apikey": "I0BNKTQEZUI9ZBMUX7ABQG1A6LMKUZOU",\n         "headword": "zopet",\n         "sourceLanguage": "sl"\n      }</textarea><button expr12="expr12">Post</button> and watch your console.\n      <hr/><h3>Find links, headword with specific dictionary</h3><p expr13="expr13"> </p><textarea id="input_listLinks2" style="font-size: 1rem; width: 100%; height: 7em; resize: vertical" spellcheck="false">{\n         "email": "rambousek@gmail.com",\n         "apikey": "I0BNKTQEZUI9ZBMUX7ABQG1A6LMKUZOU",\n         "headword": "zopet",\n         "sourceLanguage": "sl",\n         "sourceDict": "elexis-zrcsazu-pletersnik"\n      }</textarea><button expr14="expr14">Post</button> and watch your console.\n      <hr/><h3>Find links, headword to target language</h3><p expr15="expr15"> </p><textarea id="input_listLinks3" style="font-size: 1rem; width: 100%; height: 7em; resize: vertical" spellcheck="false">{\n         "email": "rambousek@gmail.com",\n         "apikey": "I0BNKTQEZUI9ZBMUX7ABQG1A6LMKUZOU",\n         "headword": "zopet",\n         "sourceLanguage": "sl",\n         "targetLanguage": "en"\n      }</textarea><button expr16="expr16">Post</button> and watch your console.\n\n      <h2>Lexonomy Push API documentation and test</h2><p expr17="expr17"><b>PUSH API URL:</b> </p><h3>Make a dictionary, TEI Lex0 format</h3><textarea id="input_makeDictTei" style="font-size: 1rem; width: 100%; height: 11em; resize: vertical" spellcheck="false">{\n         "email": "rambousek@gmail.com",\n         "apikey": "I0BNKTQEZUI9ZBMUX7ABQG1A6LMKUZOU",\n         "command": "makeDict",\n         "format": "teilex0",\n         "dictTitle": "My TEI Lex0 Dictionary",\n         "dictBlurb": "Yet another dictionary draft."\n      }</textarea><button expr18="expr18">Post</button> and watch your console.\n      <h3>Create entries, TEI Lex0 format</h3><textarea id="input_createEntriesTei" style="font-size: 1rem; width: 100%; height: 9em; resize: vertical" spellcheck="false">{\n         "email": "rambousek@gmail.com",\n         "apikey": "I0BNKTQEZUI9ZBMUX7ABQG1A6LMKUZOU",\n         "command": "createEntries",\n         "format": "teilex0",\n         "dictID": "jakobrno",\n         "entryXmls": ["<entry><form type=\'lemma\'><orth>Earth</orth></form></entry>", "<entry><form type=\'lemma\'><orth>Mars</orth></form></entry>"]\n      }</textarea><button expr19="expr19">Post</button> and watch your console.\n      <h3>Make a dictionary</h3><textarea id="input_makeDict" style="font-size: 1rem; width: 100%; height: 11em; resize: vertical" spellcheck="false">{\n         "email": "rambousek@gmail.com",\n         "apikey": "I0BNKTQEZUI9ZBMUX7ABQG1A6LMKUZOU",\n         "command": "makeDict",\n         "dictTitle": "My Pushy Dictionary",\n         "dictBlurb": "Yet another dictionary draft.",\n         "poses": ["n", "v", "adj", "adv"],\n         "labels": ["colloquial", "formal", "mostly plural", "Irish English", "vulgar"]\n      }</textarea><button expr20="expr20">Post</button> and watch your console.\n      <h3>Create entries</h3><textarea id="input_createEntries" style="font-size: 1rem; width: 100%; height: 9em; resize: vertical" spellcheck="false">{\n         "email": "rambousek@gmail.com",\n         "apikey": "I0BNKTQEZUI9ZBMUX7ABQG1A6LMKUZOU",\n         "command": "createEntries",\n         "dictID": "jakobrno",\n         "entryXmls": ["<heslo/>", "<heslo/>"]\n      }</textarea><button expr21="expr21">Post</button> and watch your console.\n\n\n   </div>',
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
          redundantAttribute: 'expr0',
          selector: '[expr0]'
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
          redundantAttribute: 'expr1',
          selector: '[expr1]'
        },
        {
          redundantAttribute: 'expr2',
          selector: '[expr2]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 1,

              evaluate: _scope => [
                _scope.dictData.siteconfig.baseUrl,
                'api'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr3',
          selector: '[expr3]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: _scope => [
                'POST ',
                _scope.dictData.siteconfig.baseUrl,
                'api/listLang'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr4',
          selector: '[expr4]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.listLang
            }
          ]
        },
        {
          redundantAttribute: 'expr5',
          selector: '[expr5]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: _scope => [
                'POST ',
                _scope.dictData.siteconfig.baseUrl,
                'api/listDict'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr6',
          selector: '[expr6]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.listDict
            }
          ]
        },
        {
          redundantAttribute: 'expr7',
          selector: '[expr7]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: _scope => [
                'POST ',
                _scope.dictData.siteconfig.baseUrl,
                'api/listDict'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr8',
          selector: '[expr8]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.listDict2
            }
          ]
        },
        {
          redundantAttribute: 'expr9',
          selector: '[expr9]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: _scope => [
                'POST ',
                _scope.dictData.siteconfig.baseUrl,
                'api/listDict'
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
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.listDict3
            }
          ]
        },
        {
          redundantAttribute: 'expr11',
          selector: '[expr11]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: _scope => [
                'POST ',
                _scope.dictData.siteconfig.baseUrl,
                'api/listLinks'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr12',
          selector: '[expr12]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.listLinks1
            }
          ]
        },
        {
          redundantAttribute: 'expr13',
          selector: '[expr13]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: _scope => [
                'POST ',
                _scope.dictData.siteconfig.baseUrl,
                'api/listLinks'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr14',
          selector: '[expr14]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.listLinks2
            }
          ]
        },
        {
          redundantAttribute: 'expr15',
          selector: '[expr15]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: _scope => [
                'POST ',
                _scope.dictData.siteconfig.baseUrl,
                'api/listLinks'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr16',
          selector: '[expr16]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.listLinks3
            }
          ]
        },
        {
          redundantAttribute: 'expr17',
          selector: '[expr17]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 1,

              evaluate: _scope => [
                _scope.dictData.siteconfig.baseUrl,
                'push.api'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr18',
          selector: '[expr18]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.makeDictTei
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
              evaluate: _scope => _scope.createEntriesTei
            }
          ]
        },
        {
          redundantAttribute: 'expr20',
          selector: '[expr20]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.makeDict
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
      state: {
         isSaving: false,
         info: ""
      },

      onUpdated() {
         if (this.dictData.config.xema && this.dictData.config.xema.elements) {
            if ($('#elements option').length == 0) {
               Object.entries(this.dictData.config.xema.elements).forEach(([key, info]) => {
                  $('#elements').append('<option value="' + key + '">' + key + '</option>');
               });
               this.changeElem();
            } else {
               $('select').formSelect();
            }
            M.updateTextFields();
         }
      },

      changeElem() {
         $("#children").find('option').remove();
         var elem = $("#elements").val();
         for(var atName in this.dictData.config.xema.elements[elem]['attributes']){
            $("#children").append("<option value='@"+atName+"'>@"+atName+"</option>");
         }
         for(var child in this.dictData.config.xema.elements[elem]['children']){
            $("#children").append("<option value='"+this.dictData.config.xema.elements[elem]['children'][child].name+"'>"+this.dictData.config.xema.elements[elem]['children'][child].name+"</option>");
         }
         var hasChildren = !!this.dictData.config.xema.elements[elem]['children'].length;
         $("#submit_button").toggleClass("disabled", !hasChildren);
         $("#hasChildren").toggle(hasChildren);
         $("#hasNoChildren").toggle(!hasChildren);

         $('select').formSelect();
      },

      addNumbers() {
         var countElem = $("#elements").val();
         var storeElem = $("#children").val();
         if (countElem && storeElem) {
            this.update({
               isSaving: true,
               info: ''
            });
            this.store.autonumberElements(countElem, storeElem)
                  .done(response => {
                     if(response.success) {
                        this.update({info: 'Auto-numbering finished, ' + response.processed + ' entries updated.'});
                     }
                  })
                  .always(() => this.update({isSaving: false}));
         }
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<loading-overlay expr22="expr22"></loading-overlay><dict-nav expr23="expr23"></dict-nav><h1>Auto-numbering of elements</h1><div class="row"><p>If you need to number some of entry elements automatically, Lexonomy can do that for you. First, go to Entry structure and add element/attribute where you want to store the number. Eg. in element <tt expr24="expr24"></tt> add attribute <tt expr25="expr25"></tt>. When you\'re ready, select element to number (eg. <tt expr26="expr26"></tt>) and element/attribute to store numbering (eg. <tt expr27="expr27"></tt>). Lexonomy will fill the numbers where missing.</p></div><div class="row"><div class="input-field col s4"><select expr28="expr28" id="elements"></select><label for="elements">Element to number</label></div><div id="hasChildren" class="input-field col s4"><select id="children"></select><label for="children">Add numbers to</label></div><div id="hasNoChildren" class="input-field col s4 grey-text" style="display: none; padding-top: 10px;">\n         element has no children\n      </div><div class="input-field col s3"><a expr29="expr29" class="btn waves-effect waves-light" id="submit_button"><i class="material-icons right">add</i>Add numbers\n         </a></div></div><div expr30="expr30" class="section"></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isSaving,
          redundantAttribute: 'expr22',
          selector: '[expr22]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [["config", "Configure"], ["autonumber", "Auto-numbering"]]
            }
          ],

          redundantAttribute: 'expr23',
          selector: '[expr23]'
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
          redundantAttribute: 'expr24',
          selector: '[expr24]'
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
          redundantAttribute: 'expr25',
          selector: '[expr25]'
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
          redundantAttribute: 'expr26',
          selector: '[expr26]'
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
          redundantAttribute: 'expr27',
          selector: '[expr27]'
        },
        {
          redundantAttribute: 'expr28',
          selector: '[expr28]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onchange',
              evaluate: _scope => _scope.changeElem
            }
          ]
        },
        {
          redundantAttribute: 'expr29',
          selector: '[expr29]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.addNumbers
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.info,
          redundantAttribute: 'expr30',
          selector: '[expr30]',

          template: template(
            '<div expr31="expr31" class="message messageInfo"> </div>',
            [
              {
                redundantAttribute: 'expr31',
                selector: '[expr31]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,

                    evaluate: _scope => [
                      _scope.state.info
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

    name: 'dict-config-autonumber'
  };

  var dict_config_download = {
    css: null,

    exports: {
      state: {
         isLoading: true,
         isSaving: false,
         data: {xslt: ''}
      },

      onMounted() {
         this.store.loadDictionaryConfig("donwload")
               .done(response => {
                  this.state.data = response.content;
               })
               .always(() => {
                  this.update({isLoading: false});
                  M.updateTextFields();
                  M.textareaAutoResize($('#download_xslt'));
               });
      },

      saveData() {
         var xslt = $('#download_xslt').val();
         try {
            var data = {xslt: xslt};
            // TODO  parsed_xslt??
            parsed_xslt = $.parseXML(xslt);
            this.update({isSaving: true});
            this.store.updateDictionaryConfig("download", data)
                  .always(() => this.update({isSaving: false}));
         } catch(e) {
            M.toast({html: 'Failed to parse XSLT'});
         }
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<loading-overlay expr46="expr46"></loading-overlay><dict-nav expr47="expr47"></dict-nav><h1>Download settings</h1><div class="row"><div class="input-field"><textarea expr48="expr48" id="download_xslt" class="materialize-textarea"> </textarea><label for="download_xslt">XSLT transformation on download</label><span class="helper-text">You can use this functionality to automatically apply an XSLT transformation when the dictionary is downloaded. If you do not input valid XSLT here, no transformation will be applied.</span></div></div><dict-config-buttons expr49="expr49"></dict-config-buttons>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isLoading || _scope.state.isSaving,
          redundantAttribute: 'expr46',
          selector: '[expr46]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [["config", "Configure"], ["download", "Download settings"]]
            }
          ],

          redundantAttribute: 'expr47',
          selector: '[expr47]'
        },
        {
          redundantAttribute: 'expr48',
          selector: '[expr48]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.state.data.xslt
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
            }
          ],

          redundantAttribute: 'expr49',
          selector: '[expr49]'
        }
      ]
    ),

    name: 'dict-config-download'
  };

  var dict_config_editing = {
    css: `dict-config-editing textarea,[is="dict-config-editing"] textarea{ min-height: 30vh; } dict-config-editing #editor_js,[is="dict-config-editing"] #editor_js{ padding-top: 25px; } dict-config-editing #codeStatus,[is="dict-config-editing"] #codeStatus{ top: 1px; position: absolute; right: 1px; left: 1px; background-color: whitesmoke; padding: 3px 8px; } dict-config-editing #info_nerd,[is="dict-config-editing"] #info_nerd,dict-config-editing #info_laic,[is="dict-config-editing"] #info_laic{ padding-left: 50px; }`,

    exports: {
      state: {
         isLoading: true,
         isSaving: false,
         override: false,
         data: {
            xonomyMode: "nerd",
            xonomyTextEditor: "askString",
            _js: "",
            _css: ""
         }
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
         this.update({override: true});
      },

      stopOverride() {
         this.state.data._js = '';
         this.state.data._css = '';
         this.update({override: false});
      },

      backFromOverride(){
         this.update({override: false});
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
         this.store.loadDictionaryConfig("editing")
               .done(response => {
                  this.state.data = response.content;
                  this.state.override = !!response.content._js;
               })
               .always(() => {
                  this.update({isLoading: false});
                  this.changeInfo();
                  M.updateTextFields();
                  if (this.state.override) {
                     M.textareaAutoResize($('#editor_css'));
                     M.textareaAutoResize($('#editor_js'));
                     this.checkJSCode();
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
         if (this.state.override) {
            newData._js = $('#editor_js').val();
            newData._css = $('#editor_css').val();
         }
         return newData;
      },

      checkJSCode(evt){
         let isOk = false;
         let err = "";
         try{
            new Function("return " + $("#editor_js").val())();
            isOk = true;
         } catch(e){
            err = e.toString().split('\n')[0];
         }
         $("#codeStatus").html(isOk ? `<b class="green-text">valid</b>` : `<b class="red-text">invalid</b><span class="grey-text right">${err}</span>`);
      },

      saveData() {
         this.update({isSaving: true});
         this.store.updateDictionaryConfig("editing", this.getConfigData())
               .always(() => this.update({isSaving: false}));
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<loading-overlay expr50="expr50"></loading-overlay><dict-nav expr51="expr51"></dict-nav><h1>Entry editor</h1><div expr52="expr52"></div><div expr60="expr60"></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isLoading || _scope.state.isSaving,
          redundantAttribute: 'expr50',
          selector: '[expr50]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [["config", "Configure"], ["editing", "Entry editor"]]
            }
          ],

          redundantAttribute: 'expr51',
          selector: '[expr51]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => (!_scope.state.data._js || _scope.state.data._js == "") && !_scope.state.override,
          redundantAttribute: 'expr52',
          selector: '[expr52]',

          template: template(
            '<div class="input-field"><p><label><input expr53="expr53" name="xonomyMode" id="xonomyMode_nerd" type="radio" class="with-gap"/><span>Nerd mode</span></label><label style="margin-left: 30px;"><input expr54="expr54" name="xonomyMode" id="xonomyMode_laic" type="radio" class="with-gap"/><span>Laic mode</span></label><label style="margin-left: 30px;"><input expr55="expr55" name="xonomyMode" id="xonomyMode_graphical" type="radio" class="with-gap"/><span>Graphical mode</span></label></p><span class="helper-text">Choose what the entry editor will look like.</span></div><div id="info_nerd"><p>When editing an entry in <b>nerd mode</b> the user sees the XML source code, angle brackets and all.\n            <div class="instro"><img src="docs/mode-nerd.png" alt="Illustration"/></div><br/>\n            Individual users can overide this setting by clicking an icon in the bottom-left corner of their screen.\n         </p></div><div id="info_laic"><p>When editing an entry in <b>laic mode</b> the XML source code is hidden and the entry looks more like a bulleted list.\n            <div class="instro"><img src="docs/mode-laic.png" alt="Illustration"/></div><br/>\n            Individual users can overide this setting by clicking an icon in the bottom-left corner of their screen.\n         </p></div><div id="info_graphical" style="padding-left: 50px;"><p>When editing an entry in <b>graphical mode</b> the XML source code is hidden and the entry uses settings configuration to display a more graphically friendly interface.\n \n           <div class="instro">Image of graphical editor</div></p></div><br/><div class="input-field"><p><label><input expr56="expr56" name="xonomyTextEditor" id="xonomyTextEditor_string" type="radio" class="with-gap"/><span>Single line</span></label><label style="margin-left: 30px;"><input expr57="expr57" name="xonomyTextEditor" id="xonomyTextEditor_longstring" type="radio" class="with-gap"/><span>Multi line</span></label></p><span class="helper-text">Choose the default text editor for node values.</span></div><div id="info_string" style="margin-left: 30px;"><p>When editing text in <b>single line mode</b> the user sees a smaller editor.\n            <div class="instro"><img src="docs/text-editor-askstring.png" alt="Illustration"/></div></p></div><div id="info_longstring" style="margin-left: 30px;"><p>When editing text in <b>multi line mode</b> the user sees a full-fledged text editor.\n            <div class="instro"><img src="docs/text-editor-asklongstring.png" alt="Illustration"/></div></p></div><br/><div><br/><button expr58="expr58" class="btn waves-effect waves-light">\n            Customize entry editor\n            <i class="material-icons right">edit</i></button></div><br/><br/><dict-config-buttons expr59="expr59"></dict-config-buttons>',
            [
              {
                redundantAttribute: 'expr53',
                selector: '[expr53]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'checked',
                    evaluate: _scope => _scope.state.data.xonomyMode == "nerd"
                  },
                  {
                    type: expressionTypes.EVENT,
                    name: 'onchange',
                    evaluate: _scope => _scope.changeInfo
                  }
                ]
              },
              {
                redundantAttribute: 'expr54',
                selector: '[expr54]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'checked',
                    evaluate: _scope => _scope.state.data.xonomyMode == "laic"
                  },
                  {
                    type: expressionTypes.EVENT,
                    name: 'onchange',
                    evaluate: _scope => _scope.changeInfo
                  }
                ]
              },
              {
                redundantAttribute: 'expr55',
                selector: '[expr55]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'checked',
                    evaluate: _scope => _scope.state.data.xonomyMode == "graphical"
                  },
                  {
                    type: expressionTypes.EVENT,
                    name: 'onchange',
                    evaluate: _scope => _scope.changeInfo
                  }
                ]
              },
              {
                redundantAttribute: 'expr56',
                selector: '[expr56]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'checked',
                    evaluate: _scope => _scope.state.data.xonomyTextEditor == "askString"
                  },
                  {
                    type: expressionTypes.EVENT,
                    name: 'onchange',
                    evaluate: _scope => _scope.changeInfo
                  }
                ]
              },
              {
                redundantAttribute: 'expr57',
                selector: '[expr57]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'checked',
                    evaluate: _scope => _scope.state.data.xonomyTextEditor == "askLongString"
                  },
                  {
                    type: expressionTypes.EVENT,
                    name: 'onchange',
                    evaluate: _scope => _scope.changeInfo
                  }
                ]
              },
              {
                redundantAttribute: 'expr58',
                selector: '[expr58]',

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
                  }
                ],

                redundantAttribute: 'expr59',
                selector: '[expr59]'
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => (_scope.state.data._js && _scope.state.data._js != "") || _scope.state.override,
          redundantAttribute: 'expr60',
          selector: '[expr60]',

          template: template(
            '<div class="row"><div class="input-field"><div id="codeStatus"></div><textarea expr61="expr61" id="editor_js" class="materialize-textarea"> </textarea><label>JavaScript</label><span class="helper-text">\n               You can customize the editor by defining two functions in JavaScript: one that will render the HTML editor from the XML entry and one that will harvest the (edited) HTML back into XML. If you would like to see an example,\n               <a expr62="expr62">click here to load a sample JavaScript code</a>.\n            </span></div></div><div class="row"><div class="input-field"><textarea expr63="expr63" id="editor_css" class="materialize-textarea"> </textarea><label for="editor_css">CSS</label><span class="helper-text">\n               You can customize the editor look and feel by writing your own CSS styles. If you would like to see an example,\n               <a expr64="expr64">click here to load a sample CSS style</a>.\n            </span></div></div><div class="buttons"><a expr65="expr65" class="btn btn-secondary waves-effect waves-light">back</a><button expr66="expr66" class="btn waves-effect waves-light">\n            Disable entry editor customizations\n            <i class="material-icons right">edit</i></button><button expr67="expr67" class="btn waves-effect waves-light" id="submit_button">\n            Save\n            <i class="material-icons right">save</i></button></div><br/><br/>',
            [
              {
                redundantAttribute: 'expr61',
                selector: '[expr61]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.state.data._js
                  },
                  {
                    type: expressionTypes.EVENT,
                    name: 'oninput',
                    evaluate: _scope => _scope.checkJSCode
                  }
                ]
              },
              {
                redundantAttribute: 'expr62',
                selector: '[expr62]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.exampleJS
                  }
                ]
              },
              {
                redundantAttribute: 'expr63',
                selector: '[expr63]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.state.data._css
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
                    evaluate: _scope => _scope.exampleCSS
                  }
                ]
              },
              {
                redundantAttribute: 'expr65',
                selector: '[expr65]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.backFromOverride
                  }
                ]
              },
              {
                redundantAttribute: 'expr66',
                selector: '[expr66]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.stopOverride
                  }
                ]
              },
              {
                redundantAttribute: 'expr67',
                selector: '[expr67]',

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
    css: `dict-config-flagging tr,[is="dict-config-flagging"] tr{ border-bottom: none; } dict-config-flagging th,[is="dict-config-flagging"] th,dict-config-flagging td,[is="dict-config-flagging"] td{ padding: 3px 10px 3px 0; }`,

    exports: {
      state: {
         isLoading: true,
         isSaving: false,
         data: {flag_elements: "", flags: []}
      },

      doDeleteEl(idx) {
         this.state.data = this.getConfigData();
         this.state.data.flags.splice(idx, 1);
         this.update();
      },

      doAddEl(event) {
         this.state.data.flags.push({key: "", name: "", label: "", color: ""});
         this.update();
      },

      addColor() {
         $('.flag-color').each(function(idx, elem) {
            var cid = $(elem)[0].id;
            $('#' + cid).colorpicker().on('changeColor', function(ev) {
               let bgColor = ev.color.toHex();
               let color = this.store.getFlagTextColor(bgColor);
               $(elem).css({
                  'background-color': bgColor,
                  'color': color
               });
            }.bind(this));
         }.bind(this));
      },

      onMounted() {
         this.store.loadDictionaryConfig("flagging")
               .done(response => {
                  if (response.content.flag_element) {
                     this.state.data = response.content;
                  }
               })
               .always(() => {
                  this.update({isLoading: false});
               });
      },

      onUpdated() {
         if (this.dictData.config.xema && this.dictData.config.xema.elements) {
            if ($('#flag-element option').length == 0) {
               Object.entries(this.dictData.config.xema.elements).forEach(([key, info]) => {
                  if(key != this.dictData.config.xema.root){
                     $('#flag-element').append('<option value="' + key + '"' + (key == this.state.data.flag_element ? 'selected' : '') +  '>' + key + '</option>');
                  }
               });
            }
            $('select').formSelect();
         }
         M.updateTextFields();
         this.addColor();
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
         return newData
      },

      saveData() {
         this.update({isSaving: true});
         this.store.updateDictionaryConfig("flagging", this.getConfigData())
               .always(() => this.update({isSaving: false}));
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<loading-overlay expr32="expr32"></loading-overlay><dict-nav expr33="expr33"></dict-nav><h1>Entry flags</h1><template expr34="expr34"></template><br/><br/><dict-config-buttons expr45="expr45"></dict-config-buttons>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isLoading || _scope.state.isSaving,
          redundantAttribute: 'expr32',
          selector: '[expr32]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [["config", "Configure"], ["flagging", "Entry flags"]]
            }
          ],

          redundantAttribute: 'expr33',
          selector: '[expr33]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.state.isLoading,
          redundantAttribute: 'expr34',
          selector: '[expr34]',

          template: template(
            '<div expr35="expr35" class="center-align grey-text"></div><template expr37="expr37"></template>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => !_scope.state.data.flags.length,
                redundantAttribute: 'expr35',
                selector: '[expr35]',

                template: template(
                  '<h1>no entry flags</h1><br/><a expr36="expr36" class="btn btn-primary waves-effect waves-light">\n            add flag\n            <i class="material-icons right">add</i></a>',
                  [
                    {
                      redundantAttribute: 'expr36',
                      selector: '[expr36]',

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
                evaluate: _scope => _scope.state.data.flags.length,
                redundantAttribute: 'expr37',
                selector: '[expr37]',

                template: template(
                  '<table><thead><tr><th>Keyboard shortcut</th><th>Value</th><th>Label</th><th>Color</th><th></th></tr></thead><tbody><tr expr38="expr38" class="flag-info"></tr></tbody></table><div><a expr44="expr44" class="btn waves-effect waves-light">\n               add flag\n               <i class="material-icons right">add</i></a></div><br/><br/><div class="input-field" style="max-width: 400px;"><select id="flag-element"></select><label for="flag-element">Flag element</label><span class="helper-text">Select the element which the flags should be put into.</span></div>',
                  [
                    {
                      type: bindingTypes.EACH,
                      getKey: null,
                      condition: null,

                      template: template(
                        '<td><input expr39="expr39" type="text" placeholder="key" class="flag-key"/></td><td><input expr40="expr40" type="text" placeholder="value" class="flag-name"/></td><td><input expr41="expr41" type="text" placeholder="label" class="flag-label"/></td><td><input expr42="expr42" type="text" placeholder="color" class="flag-color"/></td><td><a expr43="expr43" class="btn btn-flat"><i class="material-icons">delete</i></a></td>',
                        [
                          {
                            redundantAttribute: 'expr39',
                            selector: '[expr39]',

                            expressions: [
                              {
                                type: expressionTypes.VALUE,
                                evaluate: _scope => _scope.flag.key
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr40',
                            selector: '[expr40]',

                            expressions: [
                              {
                                type: expressionTypes.VALUE,
                                evaluate: _scope => _scope.flag.name
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr41',
                            selector: '[expr41]',

                            expressions: [
                              {
                                type: expressionTypes.VALUE,
                                evaluate: _scope => _scope.flag.label
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr42',
                            selector: '[expr42]',

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
                                  'color: ',
                                  _scope.store.getFlagTextColor(_scope.flag.color),
                                  ';background-color: ',
                                  _scope.flag.color
                                ].join(
                                  ''
                                )
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr43',
                            selector: '[expr43]',

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

                      redundantAttribute: 'expr38',
                      selector: '[expr38]',
                      itemName: 'flag',
                      indexName: 'index',
                      evaluate: _scope => _scope.state.data.flags
                    },
                    {
                      redundantAttribute: 'expr44',
                      selector: '[expr44]',

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
              name: 'show-save',
              evaluate: _scope => _scope.state.data.flags.length
            }
          ],

          redundantAttribute: 'expr45',
          selector: '[expr45]'
        }
      ]
    ),

    name: 'dict-config-flagging'
  };

  var dict_config_gapi = {
    css: `dict-config-gapi .input-field,[is="dict-config-gapi"] .input-field{ max-width: 500px; }`,

    exports: {
      state: {
         isLoading: true,
         isSaving: false,
         data: {},
         info: ""
      },

      addImages() {
         var addElem = $("#add_element").val();
         var addNumber = $("#add_number").val();
         if (addElem != "" && parseInt(addNumber) > 0) {
            this.update({info: "Adding images to dictionary, please wait..."});
            this.store.autoAddImages(addElem, addNumber)
                  .done(response => {
                     this.waitImages(response.bgjob);
                  });
         }
      },

      waitImages(jobId) {
      if (jobId != "") {
         this.store.autoAddImagesGetProgress(jobId)
               .done(response =>{
                  if (response.status == "finished") {
                     this.update({info: "Dictionary now contains automatically added images. <a href='#" + this.dictData.dictId + "/edit'>See results.</a>"});
                  } else if (response.status == "failed") {
                     this.update({info: "Adding images failed."});
                  } else {
                     setTimeout(this.waitImages.bind(this, jobId), 1000);
                  }
               });
         }
      },

      onMounted() {
         this.store.loadDictionaryConfig("gapi")
               .done(response => {
                  this.state.data = response.content;
               })
               .always(() => {
                  this.update({isLoading: false});
                  M.updateTextFields();
               });
      },

      onUpdated() {
         if (this.dictData.config.xema && this.dictData.config.xema.elements) {
            // TODO: handle empty option list
            if ($('#add_element option').length == 0) {
               Object.entries(this.dictData.config.xema.elements).forEach(([key, info]) => {
                  if (info.filling == "med") {
                     $('#add_element').append('<option value="' + key + '">' + key + '</option>');
                  }
               });
            }
            if (this.state.data.image_licence) {
               $(`#img_licence option[value="${this.state.data.image_licence}"]` ).attr('selected', 'selected');
            }
            $(`#voice_lang option[value="${this.state.data.voicelang}"]` ).attr('selected', 'selected');
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
         return newData
      },

      saveData() {
         this.update({isSaving: true});
         this.store.updateDictionaryConfig("gapi", this.getConfigData())
               .always(() => this.update({isSaving: false}));
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<loading-overlay expr68="expr68"></loading-overlay><dict-nav expr69="expr69"></dict-nav><h1>Multimedia API</h1><div class="row"><div class="input-field"><select id="img_licence"><option value="any" selected>any licence</option><option value="comm">permits commercial use</option><option value="der">permits derivative works</option><option value="code">permits commercial and derivative use</option><option value="public">public domain</option></select><label>Image licence</label><span class="helper-text">Select licence type when searching for images.</span></div></div><div class="row"><div class="input-field"><input expr70="expr70" type="text" id="gapi_key"/><label>Google Custom Search API key</label><span class="helper-text">Insert your Google Custom Search API key to allow multimedia search.</span></div></div><div class="row"><div class="input-field"><input expr71="expr71" type="text" id="gapi_cx"/><label>Google Custom Search ID</label><span class="helper-text">\n            Insert ID of your Custom Search - see\n            <a href="https://developers.google.com/custom-search/v1/introduction">documentation</a>.\n         </span></div></div><div class="row"><div class="input-field"><input expr72="expr72" type="text" id="pixabay_key"/><label>Pixabay API key</label><span class="helper-text">\n            Insert your\n            <a href="https://pixabay.com/api/docs/">Pixabay API key</a>.\n         </span></div></div><div class="row"><div class="input-field"><input expr73="expr73" type="text" id="voice_key"/><label>VoiceRSS API key</label><span class="helper-text">\n            Insert your\n            <a href="http://www.voicerss.org/api/">VoiceRSS</a>\n            API key to enable text-to-speech.\n         </span></div></div><div class="row"><div class="input-field"><select id="voice_lang"><option value>.</option><option value="ar-eg">Arabic (Egypt)</option><option value="ar-sa">Arabic (Saudi Arabia)</option><option value="bg-bg">Bulgarian</option><option value="ca-es">Catalan</option><option value="zh-cn">Chinese (China)</option><option value="zh-hk">Chinese (Hong Kong)</option><option value="zh-tw">Chinese (Taiwan)</option><option value="hr-hr">Croatian</option><option value="cs-cz">Czech</option><option value="da-dk">Danish</option><option value="nl-be">Dutch (Belgium)</option><option value="nl-nl">Dutch (Netherlands)</option><option value="en-au">English (Australia)</option><option value="en-ca">English (Canada)</option><option value="en-gb">English (Great Britain)</option><option value="en-in">English (India)</option><option value="en-ie">English (Ireland)</option><option value="en-us">English (United States)</option><option value="fi-fi">Finnish</option><option value="fr-ca">French (Canada)</option><option value="fr-fr">French (France)</option><option value="fr-ch">French (Switzerland)</option><option value="de-at">German (Austria)</option><option value="de-de">German (Germany)</option><option value="de-ch">German (Switzerland)</option><option value="el-gr">Greek</option><option value="he-il">Hebrew</option><option value="hi-in">Hindi</option><option value="hu-hu">Hungarian</option><option value="id-id">Indonesian</option><option value="it-it">Italian</option><option value="ja-jp">Japanese</option><option value="ko-kr">Korean</option><option value="ms-my">Malay</option><option value="nb-no">Norwegian</option><option value="pl-pl">Polish</option><option value="pt-br">Portuguese (Brazil)</option><option value="pt-pt">Portuguese (Portugal)</option><option value="ro-ro">Romanian</option><option value="ru-ru">Russian</option><option value="sk-sk">Slovak</option><option value="sl-si">Slovenian</option><option value="es-mx">Spanish (Mexico)</option><option value="es-es">Spanish (Spain)</option><option value="sv-se">Swedish</option><option value="ta-in">Tamil</option><option value="th-th">Thai</option><option value="tr-tr">Turkish</option><option value="vi-vn">Vietnamese</option></select><label>VoiceRSS language</label></div></div><button expr74="expr74" class="btn waves-effect waves-light" id="submit_button">\n      Save\n      <i class="material-icons right">save</i></button><br/><br/><hr/><br/><div><h3>Auto download images to each entry</h3><p class="grey-text">If you want to add images to each entry automatically, Lexonomy can do that for you. First, go to Entry structure and add element with content type <i>media</i>. When you\'re ready, select element and number of images you want to add.</p><div style="display: flex; gap: 10px; vertical-align: middle;"><div style="max-width: 200px;"><div class="input-field"><select id="add_element"></select><label>Image element to add</label></div></div><div style="max-width: 150px;"><div class="input-field"><input type="number" id="add_number" value="3"/><label>Add X images</label></div></div><button expr75="expr75" class="btn waves-effect waves-light" id="addimages" style="margin-top: 28px;">Add images</button></div></div><div expr76="expr76" class="message messageInfo"></div><br/><a expr77="expr77" class="btn btn-secondary btn-flat">Back</a>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isLoading || _scope.state.isSaving,
          redundantAttribute: 'expr68',
          selector: '[expr68]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [["config", "Configure"], ["gapi", "MultimediaApi"]]
            }
          ],

          redundantAttribute: 'expr69',
          selector: '[expr69]'
        },
        {
          redundantAttribute: 'expr70',
          selector: '[expr70]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.state.data.apikey
            }
          ]
        },
        {
          redundantAttribute: 'expr71',
          selector: '[expr71]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.state.data.cx
            }
          ]
        },
        {
          redundantAttribute: 'expr72',
          selector: '[expr72]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.state.data.pixabaykey
            }
          ]
        },
        {
          redundantAttribute: 'expr73',
          selector: '[expr73]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.state.data.voicekey
            }
          ]
        },
        {
          redundantAttribute: 'expr74',
          selector: '[expr74]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.saveData
            }
          ]
        },
        {
          redundantAttribute: 'expr75',
          selector: '[expr75]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.addImages
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.info,
          redundantAttribute: 'expr76',
          selector: '[expr76]',

          template: template(
            ' ',
            [
              {
                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.state.info
                  }
                ]
              }
            ]
          )
        },
        {
          redundantAttribute: 'expr77',
          selector: '[expr77]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#',
                _scope.dictData.dictId,
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
      state: {
         isLoading: true,
         isSaving: false,
         data: {}
      },

      onMounted() {
         this.store.loadDictionaryConfig("ident")
               .done(response => {
                  this.state.data = response.content;
               })
               .always(() => {
                  this.update({isLoading: false});
                  M.updateTextFields();
                  M.textareaAutoResize($('#ident_blurb'));
                  if(this.state.data.langs){
                     var langs_data = {};
                     this.state.data.langs.forEach(lang => {
                        langs_data[lang['lang']] = null;
                     });
                     $('#ident_lang').autocomplete({data: langs_data});
                  }
               });
      },

      saveData() {
         this.update({isSaving: true});
         this.store.updateDictionaryConfig("ident", {
            'title': $('#ident_title').val(),
            'blurb': $('#ident_blurb').val(),
            'lang': $('#ident_lang').val(),
            'handle': $('#ident_handle').val()
         })
               .done(this.store.loadDictionaryList.bind(this.store))
               .always(() => this.update({isSaving: false}));
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<loading-overlay expr95="expr95"></loading-overlay><dict-nav expr96="expr96"></dict-nav><h1>Description</h1><div><form><div class="row"><div class="input-field"><input expr97="expr97" placeholder="My Dictionary" id="ident_title" type="text" class="validate" style="width:300px"/><label for="ident_title">Dictionary name</label><span class="helper-text">A human-readable title for your dictionary, such as <i>My Esperanto Dictionary</i>.</span></div></div><div class="row"><div class="input-field"><textarea expr98="expr98" id="ident_blurb" class="materialize-textarea" placeholder="Yet another Lexonomy dictionary." rows="3"> </textarea><label for="ident_blurb">Dictionary description</label><span class="helper-text">\n                  This will appear on your dictionary\'s home page. You can leave it blank if you prefer.<br/>You can use <a href="https://daringfireball.net/projects/markdown/" target="_blank">Markdown</a> here.\n               </span></div></div><div class="row"><div class="input-field"><input expr99="expr99" type="text" id="ident_lang" class="autocomplete" placeholder="Type to search for language, or write your custom info" style="width:300px"/><label for="ident_lang">Main language</label><span class="helper-text">Language of dictionary entries, used to sort dictionaries on your home page. You can select language from the list, or write down your own.</span></div></div><div class="row"><div class="input-field"><input expr100="expr100" placeholder="URL" id="ident_handle" type="text" class="validate"/><label for="ident_title">Metadata from CLARIN repository</label><span class="helper-text">Link to metadata recorded in CLARIN repository, provide URL to \'handle\' link, eg. <tt expr101="expr101"></tt>.</span></div></div><dict-config-buttons expr102="expr102"></dict-config-buttons></form></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isLoading || _scope.state.isSaving,
          redundantAttribute: 'expr95',
          selector: '[expr95]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [["config", "Configure"], ["ident", "Description"]]
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
              evaluate: _scope => _scope.state.data.title
            }
          ]
        },
        {
          redundantAttribute: 'expr98',
          selector: '[expr98]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.state.data.blurb
            }
          ]
        },
        {
          redundantAttribute: 'expr99',
          selector: '[expr99]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.state.data.lang
            }
          ]
        },
        {
          redundantAttribute: 'expr100',
          selector: '[expr100]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.state.data.handle
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
          redundantAttribute: 'expr101',
          selector: '[expr101]'
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
            }
          ],

          redundantAttribute: 'expr102',
          selector: '[expr102]'
        }
      ]
    ),

    name: 'dict-config-ident'
  };

  var dict_config_kontext = {
    css: `dict-config-kontext #searchElements,[is="dict-config-kontext"] #searchElements{ width: 10em; }`,

    exports: {
      state: {
         isLoading: true,
         isSaving: false,
         data: {
            url: 'https://www.clarin.si/kontext/', searchElements: [],
            container: '', template: '', markup: ''
         }
      },

      onMounted() {
         this.store.loadDictionaryConfig("kontex")
               .done(response => {
                  this.state.data = response.content;
                  if (!response.url || response.url == '') {
                     this.state.data.url = 'https://www.clarin.si/kontext/';
                  }
                  if (!response.searchElements) {
                     this.state.data.searchElements = [];
                  }
                  M.updateTextFields();
                  M.textareaAutoResize($('#template'));
                  $('#corpus').autocomplete({data: {}});
                  $('#corpus').data('corpora', {});
                  if (this.state.data.corpus != '') {
                     $('#corpus').data('selected-corpora', this.state.data.corpus);
                  }
                  this.store.loadKontextCorpora()
                        .done(function(res) {
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

                  this.state.data.searchElements.forEach(el => {
                     $('#searchElements option[value='+el+']').attr('selected','selected');
                  });
                  if (this.state.data.container != '') {
                     $('#container option[value='+this.state.data.container+']').attr('selected','selected');
                  }
                  if (this.state.data.markup != '') {
                     $('#markup option[value='+this.state.data.markup+']').attr('selected','selected');
                  }
               })
               .always(() => {
                  this.update({isLoading: false});
                  $('select').formSelect();
                  M.updateTextFields();
               });
      },

      onUpdated() {
         if (this.dictData.config.xema && this.dictData.config.xema.elements) {
            if ($('#searchElements option').length == 0) {
               Object.entries(this.dictData.config.xema.elements).forEach(([key, info]) => {
                  if (info.filling == 'txt' || info.filling == 'lst') {
                     var checked = this.state.data.searchElements.includes(key)? 'checked':'';
                     $('#searchElements').append('<option value="' + key + '" ' + checked + '>' + key + '</option>');
                  }
               });
            }
            if ($('#container option').length == 1) {
               Object.entries(this.dictData.config.xema.elements).forEach(([key, info]) => {
                     var checked = (this.state.data.container == key)? 'checked':'';
                     $('#container').append('<option value="' + key + '" ' + checked + '>' + key + '</option>');
               });
            }
            if ($('#markup option').length == 1) {
               Object.entries(this.dictData.config.xema.elements).forEach(([key, info]) => {
                     var checked = (this.state.data.markup == key)? 'checked':'';
                     $('#markup').append('<option value="' + key + '" ' + checked + '>' + key + '</option>');
               });
            }
            $('select').formSelect();
         }
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
         return newData
      },

      saveData() {
         this.update({isSaving: true});
         this.store.updateDictionaryConfig("kontext", this.getConfigData())
               .always(() => this.update({isSaving: false}));
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<loading-overlay expr85="expr85"></loading-overlay><dict-nav expr86="expr86"></dict-nav><h1>KonText connection</h1><div class="row"><div class="input-field"><input expr87="expr87" id="kontext_url" type="text"/><label for="kontext_url">KonText URL</label><span class="helper-text">The URL of the KonText installation where external links should point. Defaults to <tt expr88="expr88"></tt>. Do not change this unless you are using a local installation of KonText.</span></div></div><div class="row"><div class="input-field"><input expr89="expr89" type="text" id="corpus" class="autocomplete" placeholder="Retrieving available corpora from KonText, please wait..."/><label for="corpus">Corpus name</label><span class="helper-text">Select a Sketch Engine corpus from the list of corpora available to you.</span><span expr90="expr90" class="helper-text" id="corpusInfo"></span></div></div><div class="row"><div class="input-field"><input expr91="expr91" id="concquery" type="text"/><label for="concquery">Concordance query</label><span class="helper-text">The CQL query that will be used to obtain concordance from KonText. You can use placeholders for elements in the form of \'%(element)\', e.g. \'[lemma="%(headword)"]\'. If left empty the \'simple\' query type will be used as configured for the respective corpus. Please note that you cannot use CQL syntax with default attribute because it is not specified.</span></div></div><div class="row"><div class="input-field"><select id="searchElements" multiple></select><label for="searchElements">Additional search elements</label><span class="helper-text">You can select any textual elements here whose content you would like to search for in KonText. A menu will be displayed next to all these elements like for the root entry element.</span></div></div><div class="row"><h2>Examples</h2></div><div class="row"><div class="input-field"><select id="container"><option value>(not set)</option></select><label for="container">Example container</label><span class="helper-text">Select the element which should wrap each individual example. When you pull example sentences automatically from a corpus, Lexonomy will insert one of these elements for each example sentence.</span></div></div><div class="row"><div class="input-field"><textarea expr92="expr92" id="template" class="materialize-textarea" placeholder="XML template"> </textarea><label for="template">XML template</label><span class="helper-text">This is the XML that will be inserted into your entries with each corpus example. The actual text will be where the placeholder <tt expr93="expr93"></tt> is.</span></div></div><div class="row"><div class="input-field"><select id="markup"><option value>(not set)</option></select><label for="markup">Headword mark-up</label><span class="helper-text">Select the element which should mark up the headword in inserted corpus examples. This setting is optional: if you make no selection, corpus examples will be inserted without mark-up.</span></div></div><dict-config-buttons expr94="expr94"></dict-config-buttons>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isLoading || _scope.state.isSaving,
          redundantAttribute: 'expr85',
          selector: '[expr85]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [["config", "Configure"], ["kontext", "KonText connection"]]
            }
          ],

          redundantAttribute: 'expr86',
          selector: '[expr86]'
        },
        {
          redundantAttribute: 'expr87',
          selector: '[expr87]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.state.data.url
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
          redundantAttribute: 'expr88',
          selector: '[expr88]'
        },
        {
          redundantAttribute: 'expr89',
          selector: '[expr89]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'data-selected-corpus',
              evaluate: _scope => _scope.state.data.corpus
            }
          ]
        },
        {
          redundantAttribute: 'expr90',
          selector: '[expr90]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'hide',
              evaluate: _scope => true
            }
          ]
        },
        {
          redundantAttribute: 'expr91',
          selector: '[expr91]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.state.data.concquery
            }
          ]
        },
        {
          redundantAttribute: 'expr92',
          selector: '[expr92]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.state.data.template
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
          redundantAttribute: 'expr93',
          selector: '[expr93]'
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
            }
          ],

          redundantAttribute: 'expr94',
          selector: '[expr94]'
        }
      ]
    ),

    name: 'dict-config-kontext'
  };

  var dict_config_links = {
    css: `dict-config-links tbody tr,[is="dict-config-links"] tbody tr{ border-bottom: none; } dict-config-links th,[is="dict-config-links"] th,dict-config-links td,[is="dict-config-links"] td{ padding: 10px 10px 0 0; } dict-config-links td,[is="dict-config-links"] td{ vertical-align: top; } dict-config-links td .input-field,[is="dict-config-links"] td .input-field{ margin: 0; }`,

    exports: {
      state: {
         isLoading: true,
         isSaving: false,
         isLinking: false,
         isChecking: true,
         unusedElements: [],
         data: {elements: []},
         info: "",
         checkDelay: 1000
      },

      doDeleteEl(element) {
         this.state.data.elements = this.state.data.elements.filter(val => val.linkElement != element);
         this.update();
      },

      doAddEl(event) {
         this.state.data.elements.push({
            linkElement: this.state.unusedElements[0],
            identifier: "", preview: ""
         });
         this.update();
      },

      onMounted() {
         this.store.loadDictionaryConfig("links")
               .done(response => {
                  this.state.data = {elements: Object.values(response.content)};
               })
               .always(() => {
                  this.update({isLoading: false});
               });

         //check NAISC status
         this.store.linkingCheckIfRunning()
               .done(response => {
                  if (response.bgjob != -1) {
                     this.state.info = "Linking to '" + response.otherdictID + "' already in progress, please wait...";
                     this.waitForLinking(response.otherdictID, response.bgjob);
                  }
               })
               .always(() => {
                  this.update({isChecking: false});
               });
      },

      onBeforeUpdate(){
         this.refreshUnusedElements();
      },

      onUpdated() {
         if (this.dictData.config.xema && this.dictData.config.xema.elements) {
            $("select").each(function(idx, el){
               var $select = $(el);
               var instance = M.FormSelect.getInstance(el);
               $select.off("change", this.onElementChange);
               instance && instance.destroy();
               $select.empty();
               var key = $select.attr("linkelement");
               $select.append(`<option value="${key}" selected}>${key}</option>`);
               this.state.unusedElements.forEach(key => {
                  $select.append(`<option value="${key}">${key}</option>`);
               });
               $('select').formSelect()
                  .on("change", this.onElementChange);
            }.bind(this));
         }
      },

      onElementChange(evt){
         var idx = $(evt.target).closest("tr").attr("idx");
         this.state.data.elements[idx].linkElement = $(evt.target).find("option:selected").attr("value");
         this.update();
      },

      onItemChange(evt){
         var idx = $(evt.target).closest("tr").attr("idx");
         this.state.data.elements[idx][evt.target.name] = evt.target.value;
      },

      refreshUnusedElements(){
         var savedElements = this.state.data.elements.map(e => e.linkElement);
         this.state.unusedElements = Object.keys(this.dictData.config.xema.elements).filter(el => {
            return !savedElements.includes(el)
         });
      },

      startLinking() {
         var otherdictID = $("#otherdict").val();
         if(otherdictID){
            this.update({
               isLinking: true,
               info: "Initiating linking..."
            });
            this.store.startLinking($("#otherdict").val())
                  .done(response => {
                     this.update({
                        info: "Linking in progress, please wait...",
                        checkDelay: 1000
                     });
                     this.waitForLinking(otherdictID, response.bgjob);
                  })
                  .fail(() => {
                     this.update({
                        isLinking: false,
                        info: "Linking failed."
                     });
                  });
         }
      },

      waitForLinking(otherdictID, jobID) {
         this.store.linkingGetProgress(otherdictID, jobID)
               .done(response => {
                  if (response.status == "finished") {
                     this.update({
                        isLinking: false,
                        info: "Linking done. <a href='#/" + this.dictData.dictId + "/links'>See results.</a>"
                     });
                  } else if (response.status == "failed") {
                     this.update({
                        isLinking: false,
                        info: "Linking failed"
                     });
                  } else {
                     this.state.checkDelay = this.state.checkDelay < 60000 ? this.state.checkDelay + 2000 : 60000;
                     setTimeout(this.waitForLinking.bind(this, otherdictID, jobID), this.state.checkDelay);
                  }
               })
               .fail(() => {
                  this.update({
                     isLinking: false,
                     info: "Linking failed"
                  });
               });
      },

      saveData() {
         var data = {};
         this.state.data.elements.forEach(item => {
            data[item.linkElement] = item;
         });
         this.update({isSaving: true});
         this.store.updateDictionaryConfig("links", data)
               .always(() => this.update({isSaving: false}));
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<loading-overlay expr387="expr387"></loading-overlay><dict-nav expr388="expr388"></dict-nav><h1>Manual linking between entries</h1><div><p>Elements listed here can be used as target of cross-reference link. For each element, specify unique identifier in the form of placeholders <tt expr389="expr389"></tt>. Eg. element <tt expr390="expr390"></tt> can have identifier <tt expr391="expr391"></tt>, element <tt expr392="expr392"></tt> can have identifier <tt expr393="expr393"></tt>. Optionally, specify element you want to show as preview when selecting links.</p><template expr394="expr394"></template><br/><br/><div><h2>Automatic linking using NAISC</h2></div><div><div><label for="otherdict">Other dictionary code</label></div><div class="input-field inlineBlock" style="max-width: 400px;"><input type="text" id="otherdict"/></div><div class="input-field inlineBlock"><button expr403="expr403" id="naisc_link" style="margin-left: 10px;">Start linking</button></div></div><div expr404="expr404" class="section"></div></div><br/><a expr406="expr406" class="btn btn-secondary btn-flat">Back</a>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isLoading || _scope.state.isSaving,
          redundantAttribute: 'expr387',
          selector: '[expr387]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [["config", "Configure"], ["links", "Linking"]]
            }
          ],

          redundantAttribute: 'expr388',
          selector: '[expr388]'
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
          redundantAttribute: 'expr389',
          selector: '[expr389]'
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
          redundantAttribute: 'expr390',
          selector: '[expr390]'
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
          redundantAttribute: 'expr391',
          selector: '[expr391]'
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
          redundantAttribute: 'expr392',
          selector: '[expr392]'
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
          redundantAttribute: 'expr393',
          selector: '[expr393]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.state.isLoading,
          redundantAttribute: 'expr394',
          selector: '[expr394]',

          template: template(
            '<table expr395="expr395"></table><div class="buttons"><button expr401="expr401">\n               add element\n               <i class="material-icons right">add</i></button><button expr402="expr402" class="btn waves-effect waves-light" id="submit_button">\n               Save\n               <i class="material-icons right">save</i></button></div>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.state.data.elements.length,
                redundantAttribute: 'expr395',
                selector: '[expr395]',

                template: template(
                  '<thead><tr><th>Linking element</th><th>Idenitifier</th><th>Preview</th><th></th></tr></thead><tbody><tr expr396="expr396"></tr></tbody>',
                  [
                    {
                      type: bindingTypes.EACH,
                      getKey: null,
                      condition: null,

                      template: template(
                        '<td><div class="input-field"><select expr397="expr397"></select></div></td><td><div class="input-field"><input expr398="expr398" type="text" name="identifier"/></div></td><td><div class="input-field"><input expr399="expr399" type="text" name="preview"/></div></td><td><a expr400="expr400" class="btn btn-floating right"><i class="material-icons">delete</i></a></td>',
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
                            redundantAttribute: 'expr397',
                            selector: '[expr397]',

                            expressions: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'linkelement',
                                evaluate: _scope => _scope.element.linkElement
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr398',
                            selector: '[expr398]',

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
                            redundantAttribute: 'expr399',
                            selector: '[expr399]',

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
                            redundantAttribute: 'expr400',
                            selector: '[expr400]',

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

                      redundantAttribute: 'expr396',
                      selector: '[expr396]',
                      itemName: 'element',
                      indexName: 'idx',
                      evaluate: _scope => _scope.state.data.elements
                    }
                  ]
                )
              },
              {
                redundantAttribute: 'expr401',
                selector: '[expr401]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'class',

                    evaluate: _scope => [
                      'btn ',
                      _scope.state.unusedElements.length ? '' : 'disabled'
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
                redundantAttribute: 'expr402',
                selector: '[expr402]',

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
          redundantAttribute: 'expr403',
          selector: '[expr403]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'class',

              evaluate: _scope => [
                'btn waves-effect waves-light ',
                _scope.state.isLinking || _scope.state.isChecking ? 'disabled' : ''
              ].join(
                ''
              )
            },
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.startLinking
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.info,
          redundantAttribute: 'expr404',
          selector: '[expr404]',

          template: template(
            '<div class="message messageInfo"><raw-html expr405="expr405"></raw-html></div>',
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'raw-html',
                slots: [],

                attributes: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'content',
                    evaluate: _scope => _scope.state.info
                  }
                ],

                redundantAttribute: 'expr405',
                selector: '[expr405]'
              }
            ]
          )
        },
        {
          redundantAttribute: 'expr406',
          selector: '[expr406]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#',
                _scope.dictData.dictId,
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

  var dict_nav = {
    css: null,

    exports: {
      getLink(idx){
         var link = "#";
         if(this.dictData.dictId){
            link += "/" + this.dictData.dictId;
         }
         for(var i = 0; i <= idx; i++){
            link += "/" + this.props.links[i][0];
         }
         return link
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<nav class="nav-breadcrumbs"><div class="nav-wrapper"><a expr82="expr82" class="breadcrumb">Dictionaries</a><a expr83="expr83" class="breadcrumb"></a><a expr84="expr84" class="breadcrumb"></a></div></nav>',
      [
        {
          redundantAttribute: 'expr82',
          selector: '[expr82]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',
              evaluate: _scope => _scope.authData.authorized ? '#/' : '#/opendictionaries'
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.dictData.dictId,
          redundantAttribute: 'expr83',
          selector: '[expr83]',

          template: template(
            ' ',
            [
              {
                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.dictData.title
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'href',

                    evaluate: _scope => [
                      '#/',
                      _scope.dictData.dictId
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
          type: bindingTypes.EACH,
          getKey: null,
          condition: _scope => _scope.props.links && _scope.props.links.length,

          template: template(
            ' ',
            [
              {
                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.link[1]
                  },
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'href',
                    evaluate: _scope => _scope.getLink(_scope.idx)
                  }
                ]
              }
            ]
          ),

          redundantAttribute: 'expr84',
          selector: '[expr84]',
          itemName: 'link',
          indexName: 'idx',
          evaluate: _scope => _scope.props.links
        }
      ]
    ),

    name: 'dict-nav'
  };

  var dict_entry_filter = {
    css: `dict-entry-filter,[is="dict-entry-filter"]{ display: block; } dict-entry-filter .filterForm,[is="dict-entry-filter"] .filterForm{ display: flex; gap: 10px; } dict-entry-filter .filterForm .searchBox,[is="dict-entry-filter"] .filterForm .searchBox{ width: 100px; position: relative; flex: 2; } dict-entry-filter .filterForm .searchBox input,[is="dict-entry-filter"] .filterForm .searchBox input{ padding-right: 27px; } dict-entry-filter .filterForm > .select-wrapper,[is="dict-entry-filter"] .filterForm > .select-wrapper{ flex: 3; } dict-entry-filter .filterForm .clearFilterIcon,[is="dict-entry-filter"] .filterForm .clearFilterIcon{ position: absolute; right: 5px; top: 11px; }`,

    exports: {
      search() {
         this.dictData.searchtext = $('#searchBox').val();
         this.dictData.modifier = $('#searchType').val();
         this.props.searchFunc();
      },

      onClearFilterClick(evt){
         if($('#searchBox').val()){
            $('#searchBox').val("");
            this.search();
         }
      },

      onKeyUp(evt) {
         if (evt.keyCode == 13) {
            this.search();
         }
      },

      initSelect(){
         $('select').off("change")
               .formSelect({
                  dropdownOptions: {
                     coverTrigger: false,
                     constrainWidth: false
                  }
               })
               .on("change", () => {

                  $('#searchBox').val() && this.search();
               });
      },

      onMounted(){
         this.initSelect();
      },

      onUpdated(){
         this.initSelect();
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div class="filterForm"><span class="searchBox"><input expr119="expr119" type="text" id="searchBox" placeholder="search" class="input-field"/><i expr120="expr120" class="material-icons clearFilterIcon grey-text clickable">close</i></span><select id="searchType"><option expr121="expr121" value="start">starts like this</option><option expr122="expr122" value="exact">is exactly</option><option expr123="expr123" value="wordstart">contains a word that starts like this</option><option expr124="expr124" value="substring">contains this sequence of characters</option></select></div>',
      [
        {
          redundantAttribute: 'expr119',
          selector: '[expr119]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.dictData.searchtext
            },
            {
              type: expressionTypes.EVENT,
              name: 'onkeyup',
              evaluate: _scope => _scope.onKeyUp
            }
          ]
        },
        {
          redundantAttribute: 'expr120',
          selector: '[expr120]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.onClearFilterClick
            }
          ]
        },
        {
          redundantAttribute: 'expr121',
          selector: '[expr121]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'selected',
              evaluate: _scope => !_scope.dictData.modifier || _scope.dictData.modifier == 'start'
            }
          ]
        },
        {
          redundantAttribute: 'expr122',
          selector: '[expr122]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'selected',
              evaluate: _scope => _scope.dictData.modifier == 'exact'
            }
          ]
        },
        {
          redundantAttribute: 'expr123',
          selector: '[expr123]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'selected',
              evaluate: _scope => _scope.dictData.modifier == 'wordstart'
            }
          ]
        },
        {
          redundantAttribute: 'expr124',
          selector: '[expr124]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'selected',
              evaluate: _scope => _scope.dictData.modifier == 'substring'
            }
          ]
        }
      ]
    ),

    name: 'dict-entry-filter'
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
      '<a expr146="expr146">\n      Back\n   </a><button expr147="expr147" class="btn waves-effect waves-light" id="submit_button"></button>',
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
          redundantAttribute: 'expr146',
          selector: '[expr146]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#',
                _scope.dictData.dictId,
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
          redundantAttribute: 'expr147',
          selector: '[expr147]',

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
      state: {
         isLoading: true,
         isSaving: false,
         data: {}
      },

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
         this.state.data.public = evt.target.value == "1";
         if(!this.state.data.public){
            this.state.data.licence = "";
         } else {
            this.state.data.licence = "cc-by-4.0";
         }
         this.update();
      },

      onMounted() {
         this.store.loadDictionaryConfig("publico")
               .done(response => {
                  this.state.data = response.content;
               })
               .always(() => {
                  this.update({isLoading: false});
               });
      },

      refreshLicenceInfo(){
         var url = $('#publico_licence option:selected').data('url');
         $('#publico_licence_info .helper-text').html('More information about this licence: <a target="_blank" href="' + url + '">' + url + "</a>.");
      },

      onUpdated(){
         $('#publico_licence').formSelect()
               .off("change")
               .on('change', this.refreshLicenceInfo.bind(this));
         this.refreshLicenceInfo();
      },

      saveData() {
         this.update({isSaving: true});
         this.store.updateDictionaryConfig("publico", this.state.data)
               .always(() => this.update({isSaving: false}));
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<loading-overlay expr111="expr111"></loading-overlay><dict-nav expr112="expr112"></dict-nav><h1>Publishing</h1><template expr113="expr113"></template>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isLoading || _scope.state.isSaving,
          redundantAttribute: 'expr111',
          selector: '[expr111]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [["config", "Configure"], ["publico", "Publishing"]]
            }
          ],

          redundantAttribute: 'expr112',
          selector: '[expr112]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.isLoading,
          redundantAttribute: 'expr113',
          selector: '[expr113]',

          template: template(
            '<div class="row"><div class="input-field"><p><label><input expr114="expr114" name="publico_public" type="radio" class="with-gap" value="0"/><span>Private</span></label><label style="margin-left: 30px;"><input expr115="expr115" name="publico_public" type="radio" class="with-gap" value="1"/><span>Public</span></label></p><span class="helper-text"><i>Private</i> means that the dictionary is not publicly viewable. <i>Public</i> means that the dictionary is publicly viewable.\n            </span></div></div><div expr116="expr116" class="row"></div><dict-config-buttons expr118="expr118"></dict-config-buttons>',
            [
              {
                redundantAttribute: 'expr114',
                selector: '[expr114]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'checked',
                    evaluate: _scope => !_scope.state.data.public
                  },
                  {
                    type: expressionTypes.EVENT,
                    name: 'onchange',
                    evaluate: _scope => _scope.onCheckboxChange
                  }
                ]
              },
              {
                redundantAttribute: 'expr115',
                selector: '[expr115]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'checked',
                    evaluate: _scope => _scope.state.data.public
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
                evaluate: _scope => _scope.state.data.public,
                redundantAttribute: 'expr116',
                selector: '[expr116]',

                template: template(
                  '<div class="input-field" id="publico_licence_info" style="max-width: 500px;"><select id="publico_licence"><option expr117="expr117"></option></select><label>Licence</label><span class="helper-text"></span></div>',
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
                                evaluate: _scope => _scope.state.data.licence == _scope.licence.id
                              }
                            ]
                          }
                        ]
                      ),

                      redundantAttribute: 'expr117',
                      selector: '[expr117]',
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
                  }
                ],

                redundantAttribute: 'expr118',
                selector: '[expr118]'
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
      state: {
         isLoading: true,
         isSaving: false,
         hasElements: false,
         data: {searchableElements: []}
      },

      onBeforeMount() {
         this.state.hasElements = this.dictData.config.xema
               && this.dictData.config.xema.elements
               && Object.keys(this.dictData.config.xema.elements).length;
      },

      onMounted() {
         this.store.loadDictionaryConfig("searchability")
               .done(response => {
                  this.state.data = response.content;
               }).always(() => {
                  this.update({isLoading: false});
               });
      },

      getConfigData() {
         return {
            searchableElements: $('input[type="checkbox"]:checked').toArray().map(function(elem){
               return $(elem).attr("value")
            })
         }
      },

      saveData() {
         this.update({isSaving: true});
         this.store.updateDictionaryConfig("searchability", this.getConfigData())
               .always(() => this.update({isSaving: false}));
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<loading-overlay expr103="expr103"></loading-overlay><dict-nav expr104="expr104"></dict-nav><h1>Searching</h1><div expr105="expr105" class="center-align grey-text"></div><div expr106="expr106"></div><br/><br/><dict-config-buttons expr110="expr110"></dict-config-buttons>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isLoading || _scope.state.isSaving,
          redundantAttribute: 'expr103',
          selector: '[expr103]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [["config", "Configure"], ["searchability", "Searching"]]
            }
          ],

          redundantAttribute: 'expr104',
          selector: '[expr104]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.state.isLoading && !_scope.state.hasElements,
          redundantAttribute: 'expr105',
          selector: '[expr105]',

          template: template(
            '<h1>No elements found</h1>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.state.isLoading && _scope.state.hasElements,
          redundantAttribute: 'expr106',
          selector: '[expr106]',

          template: template(
            '<label for="search-element">Searchable elements</label><div class="helper-text">\n         The contents of elements you select here will be searchable (in addition to each entry\'s headword).\n      </div><br/><div expr107="expr107"></div>',
            [
              {
                type: bindingTypes.EACH,
                getKey: null,
                condition: null,

                template: template(
                  '<label><input expr108="expr108" type="checkbox"/><span expr109="expr109"> </span></label>',
                  [
                    {
                      redundantAttribute: 'expr108',
                      selector: '[expr108]',

                      expressions: [
                        {
                          type: expressionTypes.VALUE,
                          evaluate: _scope => _scope.element
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'checked',
                          evaluate: _scope => _scope.state.data.searchableElements && _scope.state.data.searchableElements.includes(_scope.element)
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'disabled',
                          evaluate: _scope => _scope.element == _scope.dictData.config.titling.headword
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr109',
                      selector: '[expr109]',

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

                redundantAttribute: 'expr107',
                selector: '[expr107]',
                itemName: 'element',
                indexName: null,
                evaluate: _scope => Object.keys(_scope.dictData.config.xema.elements)
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
              name: 'show-save',
              evaluate: _scope => _scope.state.hasElements
            }
          ],

          redundantAttribute: 'expr110',
          selector: '[expr110]'
        }
      ]
    ),

    name: 'dict-config-searchability'
  };

  var dict_config_ske = {
    css: `dict-config-ske #kex_concsampling,[is="dict-config-ske"] #kex_concsampling{ width: 4em; } dict-config-ske #kex_searchElements,[is="dict-config-ske"] #kex_searchElements{ width: 10em; }`,

    exports: {
      state: {
         isLoading: true,
         isSaving: false,
         data: {
            kex: {
               url: 'https://app.sketchengine.eu',
               apiurl: 'https://api.sketchengine.eu/bonito/run.cgi',
               concsampling: 0,
               searchElements: []
            },
            xampl: {container: '', template: '', markup: ''},
            collx: {container: '', template: ''},
            defo: {container: '', template: ''},
            thes: {container: '', template: ''},
         }
      },

      onMounted() {
         this.store.loadDictionaryConfig("ske")
               .done(response => {
                  this.state.data = response.content;
                  if (!this.state.data.kex.concsampling || this.state.data.kex.concsampling == '') {
                     this.state.data.kex.concsampling = 0;
                  }
                  if (!this.state.data.kex.searchElements) {
                     this.state.data.kex.searchElements = [];
                  }
                  $('#kex_corpus').autocomplete({data: {}});
                  $('#kex_corpus').data('corpora', {});
                  if (this.state.data.kex.corpus != '') {
                     $('#kex_corpus').data('selected-corpora', this.state.data.kex.corpus);
                  }
                  this.store.loadCorpora()
                        .done(function(res) {
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
                  this.state.data.kex.searchElements.forEach(el => {
                     $('#kex_searchElements option[value='+el+']').attr('selected','selected');
                  });
                  if (this.state.data.xampl.container != '') {
                     $('#xampl_container option[value='+this.state.data.xampl.container+']').attr('selected','selected');
                  }
                  if (this.state.data.xampl.markup != '') {
                     $('#xampl_markup option[value='+this.state.data.xampl.markup+']').attr('selected','selected');
                  }
                  if (this.state.data.collx.container != '') {
                     $('#collx_container option[value='+this.state.data.collx.container+']').attr('selected','selected');
                  }
                  if (this.state.data.thes.container != '') {
                     $('#thes_container option[value='+this.state.data.thes.container+']').attr('selected','selected');
                  }
                  if (this.state.data.defo.container != '') {
                     $('#defo_container option[value='+this.state.data.defo.container+']').attr('selected','selected');
                  }
               })
               .always(() => {
                  this.update({isLoading: false});
                  M.updateTextFields();
                  M.textareaAutoResize($('#xampl_template'));
               });
      },

      onUpdated() {
         if (this.dictData.config.xema && this.dictData.config.xema.elements) {
            if ($('#kex_searchElements option').length == 0) {
               Object.entries(this.dictData.config.xema.elements).forEach(([key, info]) => {
                  if (info.filling == 'txt' || info.filling == 'lst') {
                     var checked = this.state.data.kex.searchElements.includes(key)? 'checked':'';
                     $('#kex_searchElements').append('<option value="' + key + '" ' + checked + '>' + key + '</option>');
                  }
               });
            }
            if ($('#xampl_container option').length == 1) {
               Object.entries(this.dictData.config.xema.elements).forEach(([key, info]) => {
                  var checked = (this.state.data.xampl.container == key)? 'checked':'';
                  $('#xampl_container').append('<option value="' + key + '" ' + checked + '>' + key + '</option>');
               });
            }
            if ($('#xampl_markup option').length == 1) {
               Object.entries(this.dictData.config.xema.elements).forEach(([key, info]) => {
                  var checked = (this.state.data.xampl.markup == key)? 'checked':'';
                  $('#xampl_markup').append('<option value="' + key + '" ' + checked + '>' + key + '</option>');
               });
            }
            if ($('#collx_container option').length == 1) {
               Object.entries(this.dictData.config.xema.elements).forEach(([key, info]) => {
                  var checked = (this.state.data.collx.container == key)? 'checked':'';
                  $('#collx_container').append('<option value="' + key + '" ' + checked + '>' + key + '</option>');
               });
            }
            if ($('#defo_container option').length == 1) {
               Object.entries(this.dictData.config.xema.elements).forEach(([key, info]) => {
                  var checked = (this.state.data.defo.container == key)? 'checked':'';
                  $('#defo_container').append('<option value="' + key + '" ' + checked + '>' + key + '</option>');
               });
            }
            if ($('#thes_container option').length == 1) {
               Object.entries(this.dictData.config.xema.elements).forEach(([key, info]) => {
                  var checked = (this.state.data.thes.container == key)? 'checked':'';
                  $('#thes_container').append('<option value="' + key + '" ' + checked + '>' + key + '</option>');
               });
            }
            $('select').formSelect();
         }
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
         return newData
      },

      saveData() {
         this.update({isSaving: true});
         this.store.updateDictionaryConfig("ske", this.getConfigData())
               .always(() => this.update({isSaving: false}));
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<loading-overlay expr509="expr509"></loading-overlay><dict-nav expr510="expr510"></dict-nav><h1>Sketch Engine connection</h1><div class="row"><div class="input-field"><input expr511="expr511" id="kex_url" type="text"/><label for="kex_url">Sketch Engine URL</label><span class="helper-text">The URL of the Sketch Engine installation where external links should point. Defaults to <tt expr512="expr512"></tt>. Do not change this unless you are using a local installation of Sketch Engine.</span></div></div><div class="row"><div class="input-field"><input expr513="expr513" id="kex_apiurl" type="text"/><label for="kex_apiurl">Sketch Engine API URL</label><span class="helper-text">The path to the <tt expr514="expr514"></tt> API script in Sketch Engine. Defaults to <tt expr515="expr515"></tt>. Do not change this unless you are using a local installation of Sketch Engine.</span></div></div><template expr516="expr516"></template><template expr520="expr520"></template><div class="row"><h2>Examples</h2></div><div class="row"><div class="input-field"><select id="xampl_container"><option value>(not set)</option></select><label for="xampl_container">Example container</label><span class="helper-text">Select the element which should wrap each individual example. When you pull example sentences automatically from a corpus, Lexonomy will insert one of these elements for each example sentence.</span></div></div><div class="row"><div class="input-field"><textarea expr521="expr521" id="xampl_template" class="materialize-textarea" placeholder="XML template"> </textarea><label for="xampl_template">XML template</label><span class="helper-text">This is the XML that will be inserted into your entries with each corpus example. The actual text will be where the placeholder <tt expr522="expr522"></tt> is.</span></div></div><div class="row"><div class="input-field"><select id="xampl_markup"><option value>(not set)</option></select><label for="xampl_markup">Headword mark-up</label><span class="helper-text">Select the element which should mark up the headword in inserted corpus examples. This setting is optional: if you make no selection, corpus examples will be inserted without mark-up.</span></div></div><div class="row"><h2>Collocations</h2></div><div class="row"><div class="input-field"><select id="collx_container"><option value>(not set)</option></select><label for="collx_container">Collocation container</label><span class="helper-text">Select the element which should wrap each collocation (the collocate plus any other data). When you pull collocations automatically from a corpus, Lexonomy will insert one of these elements for each collocation.</span></div></div><div class="row"><div class="input-field"><textarea expr523="expr523" id="collx_template" class="materialize-textarea" placeholder="XML template"> </textarea><label for="collx_template">XML template</label><span class="helper-text">This is the XML that will be inserted into your entries with each collocation. The actual text will be where the placeholder <tt expr524="expr524"></tt> is.</span></div></div><div class="row"><h2>Thesaurus items</h2></div><div class="row"><div class="input-field"><select id="thes_container"><option value>(not set)</option></select><label for="thes_container">Thesaurus item container</label><span class="helper-text">Select the element which should wrap each individual thesaurus item (a word). When you pull thesaurus items automatically from a corpus, Lexonomy will insert one of these elements for each thesaurus item.</span></div></div><div class="row"><div class="input-field"><textarea expr525="expr525" id="thes_template" class="materialize-textarea" placeholder="XML template"> </textarea><label for="thes_template">XML template</label><span class="helper-text">This is the XML that will be inserted into your entries with each thesaurus item. The actual text will be where the placeholder <tt expr526="expr526"></tt> is.</span></div></div><div class="row"><h2>Definitions</h2></div><div class="row"><div class="input-field"><select id="defo_container"><option value>(not set)</option></select><label for="defo_container">Definition container</label><span class="helper-text">Select the element which should wrap each definition. When you pull definitions automatically from a corpus, Lexonomy will insert one of these elements for each definition.</span></div></div><div class="row"><div class="input-field"><textarea expr527="expr527" id="defo_template" class="materialize-textarea" placeholder="XML template"> </textarea><label for="defo_template">XML template</label><span class="helper-text">This is the XML that will be inserted into your entries with each definition. The actual text will be where the placeholder <tt expr528="expr528"></tt> is.</span></div></div><dict-config-buttons expr529="expr529"></dict-config-buttons>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isLoading || _scope.state.isSaving,
          redundantAttribute: 'expr509',
          selector: '[expr509]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [["config", "Configure"], ["ske", "Sketch Engine connection"]]
            }
          ],

          redundantAttribute: 'expr510',
          selector: '[expr510]'
        },
        {
          redundantAttribute: 'expr511',
          selector: '[expr511]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.state.data.kex.url
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
          redundantAttribute: 'expr512',
          selector: '[expr512]'
        },
        {
          redundantAttribute: 'expr513',
          selector: '[expr513]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.state.data.kex.apiurl
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
          redundantAttribute: 'expr514',
          selector: '[expr514]'
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
          redundantAttribute: 'expr515',
          selector: '[expr515]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.authData.ske_username && _scope.authData.ske_apiKey && _scope.authData.ske_username != "" && _scope.authData.ske_apiKey != "",
          redundantAttribute: 'expr516',
          selector: '[expr516]',

          template: template(
            '<div class="row"><div class="input-field"><input expr517="expr517" type="text" id="kex_corpus" class="autocomplete" placeholder="Retrieving available corpora from Sketch Engine, please wait..."/><label for="kex_corpus">Corpus name</label><span class="helper-text">Select a Sketch Engine corpus from the list of corpora available to you.</span><span class="helper-text" id="corpusInfo" style="display: none"></span></div></div><div class="row"><div class="input-field"><input expr518="expr518" id="kex_concquery" type="text"/><label for="kex_concquery">Concordance query</label><span class="helper-text">The CQL query that will be used to obtain concordance from Sketch Engine. You can use placeholders for elements in the form of \'%(element)\', e.g. \'[lemma="%(headword)"]\'. If left empty the \'simple\' query type will be used as configured for the respective corpus. Please note that you cannot use CQL syntax with default attribute because it is not specified.</span></div></div><div class="row"><div class="input-field"><input expr519="expr519" id="kex_concsampling" type="number"/><label for="kex_concsampling">Sample size</label><span class="helper-text">Whether to apply automatic sampling of the concordance. Any non-zero value means to automatically create a random sample of that size.</span></div></div><div class="row"><div class="input-field"><select id="kex_searchElements" multiple></select><label for="kex_searchElements">Additional search elements</label><span class="helper-text">You can select any textual elements here whose content you would like to search for in Sketch Engine. A menu will be displayed next to all these elements like for the root entry element.</span></div></div>',
            [
              {
                redundantAttribute: 'expr517',
                selector: '[expr517]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'data-selected-corpus',
                    evaluate: _scope => _scope.state.data.kex.corpus
                  }
                ]
              },
              {
                redundantAttribute: 'expr518',
                selector: '[expr518]',

                expressions: [
                  {
                    type: expressionTypes.VALUE,
                    evaluate: _scope => _scope.state.data.kex.concquery
                  }
                ]
              },
              {
                redundantAttribute: 'expr519',
                selector: '[expr519]',

                expressions: [
                  {
                    type: expressionTypes.VALUE,
                    evaluate: _scope => _scope.state.data.kex.concsampling
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.authData.ske_username || !_scope.authData.ske_apiKey || _scope.authData.ske_apiKey == "" || _scope.authData.ske_username == "",
          redundantAttribute: 'expr520',
          selector: '[expr520]',

          template: template(
            '<div class="card-panel amber lighten-2">\n         Please setup your Sketch Engine account in your <a href="#/userprofile">profile</a> settings to be able to select a corpus.\n      </div>',
            []
          )
        },
        {
          redundantAttribute: 'expr521',
          selector: '[expr521]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.state.data.xampl.template
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
          redundantAttribute: 'expr522',
          selector: '[expr522]'
        },
        {
          redundantAttribute: 'expr523',
          selector: '[expr523]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.state.data.collx.template
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
          redundantAttribute: 'expr524',
          selector: '[expr524]'
        },
        {
          redundantAttribute: 'expr525',
          selector: '[expr525]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.state.data.thes.template
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
          redundantAttribute: 'expr526',
          selector: '[expr526]'
        },
        {
          redundantAttribute: 'expr527',
          selector: '[expr527]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.state.data.defo.template
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
          redundantAttribute: 'expr528',
          selector: '[expr528]'
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
            }
          ],

          redundantAttribute: 'expr529',
          selector: '[expr529]'
        }
      ]
    ),

    name: 'dict-config-ske'
  };

  var dict_config_subbing = {
    css: `dict-config-subbing .element-info,[is="dict-config-subbing"] .element-info{ display: flex; flex-direction: column; border: 1px solid #CCC; margin: 15px 0; border-radius: 3px; padding: 15px 30px; } dict-config-subbing .element-info > .header,[is="dict-config-subbing"] .element-info > .header{ display: flex; flex-direction: row; flex-wrap: nowrap; align-items: baseline; justify-content: space-between; border-bottom: 1px solid #9e9e9e; margin-bottom: 25px; } dict-config-subbing .element-info > .att,[is="dict-config-subbing"] .element-info > .att,dict-config-subbing .element-info > .att-new,[is="dict-config-subbing"] .element-info > .att-new{ margin-left: 25px; padding-top: 25px; display: flex; flex-direction: row; align-items: baseline; flex-wrap: nowrap; width: 66.66%; } dict-config-subbing .att > *,[is="dict-config-subbing"] .att > *{ margin-right: 15px!important; flex: none; } dict-config-subbing .att > .name,[is="dict-config-subbing"] .att > .name{ min-width: 16.667% } dict-config-subbing .att > .value,[is="dict-config-subbing"] .att > .value,dict-config-subbing .att > .select-wrapper,[is="dict-config-subbing"] .att > .select-wrapper{ flex: auto; } dict-config-subbing .att + .att-new,[is="dict-config-subbing"] .att + .att-new{ border-top: 1px solid #9e9e9e; } dict-config-subbing .element-info > .att-new,[is="dict-config-subbing"] .element-info > .att-new{ flex-wrap: wrap; justify-content: stretch; } dict-config-subbing .att-new > *,[is="dict-config-subbing"] .att-new > *{ margin-right: 15px!important; flex: none; } dict-config-subbing .att-new > .name,[is="dict-config-subbing"] .att-new > .name,dict-config-subbing .att-new > .select-wrapper,[is="dict-config-subbing"] .att-new > .select-wrapper{ flex: auto; }`,

    exports: {
      state: {
         isLoading: true,
         isSaving: false,
      },

      dictId: '',
      configId: '',
      configTitle: 'Subentries',

      /** @type {{
       * 		[elementName: string]: {
       * 			attributes: { 
       * 				[attributeName: string]: string;
       * 			}
       * 		}
       * }} */
      configData: {
      },

      get xema() { return this.props.dictConfigs?.xema; },
      get elements() { return Object.keys(this.xema?.elements || {}); },

      get activeSubentries() {
         if (!this.xema) return [];
         return Object
            .entries(this.configData)
            .map(([elementName, value]) => ({
               name: elementName,
               valid: !!this.xema.elements[elementName], // mark invalid subentry configurations (element is not in the entry schema - maybe it changed?)
               activeAttributes: Object
                  .entries(value.attributes)
                  .map(([attributeName, attributeValue]) => ({
                     name: attributeName, 
                     value: attributeValue,
                  })),
               inactiveAttributes: Object
                  .entries(this.xema.elements[elementName]?.attributes || {})
                  .filter(([name]) => !(name in value.attributes))
                  .map(([attributeName, {values}]) => ({
                     name: attributeName, 
                     values
                  }))
               })
            )
      },

      get inactiveSubentries() {
         return this.elements.filter(name => !this.configData[name])
      },

      addAttribute(event) {
         const context = event.target.closest('[data-element]');
         const elementName = context.getAttribute('data-element');
         const attributeName = context.querySelector('.new-attribute').value;
         // const attributeValue = context.find('.new-attribute-value').value
         if (!attributeName) return;
         this.configData[elementName].attributes = this.configData[elementName].attributes || {}; // init if the config is old format
         this.configData[elementName].attributes[attributeName] = "";
         this.update();
      },

      deleteAttribute(event) {
         const elementName = event.target.closest('[data-element]').getAttribute('data-element');
         const attributeName = event.target.closest('[data-attribute]').getAttribute('data-attribute');
         delete this.configData[elementName].attributes[attributeName];
         this.update();
      },

      changeAttribute(event) {
         const elementName = event.target.closest('[data-element]').getAttribute('data-element');
         const attributeName = event.target.closest('[data-attribute]').getAttribute('data-attribute');
         const newValue = event.target.value;
         this.configData[elementName].attributes[attributeName] = newValue; 
         this.update();
      },

      doDeleteEl(event) {
         const elementName = event.target.closest('[data-element]').getAttribute('data-element');
         delete this.configData[elementName];
         this.update();
      },

      doAddEl(event) {
         const elementName = document.getElementById('new-element').value;
         if (!elementName) return;
         this.configData[elementName] = { attributes: {} };
         this.update();
      },

      onMounted() {
         this.dictId = this.props.dictId;
         this.configId = this.props.configId;

         this.store
            .loadDictionaryConfig("subbing")
            .done(response => this.configData = response.content)
            .always(() => this.update({isLoading: false}));
      },

      onUpdated() {
         $('select').formSelect();
      },

      saveData() {
         this.update({isSaving: true});
         this.store
            .updateDictionaryConfig("subbing", this.configData)
            .always(() => this.update({isSaving: false}));
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<loading-overlay expr125="expr125"></loading-overlay><dict-nav expr126="expr126"></dict-nav><h1>Subentries</h1><template expr127="expr127"></template>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isLoading || _scope.state.isSaving,
          redundantAttribute: 'expr125',
          selector: '[expr125]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [["config", "Configure"], ["subbing", "Subentries"]]
            }
          ],

          redundantAttribute: 'expr126',
          selector: '[expr126]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.state.isLoading,
          redundantAttribute: 'expr127',
          selector: '[expr127]',

          template: template(
            '<dict-config-nav expr128="expr128"></dict-config-nav><div expr129="expr129"></div><div expr142="expr142" class="row" style="margin-top: 15px;"></div><button expr145="expr145" class="btn waves-effect waves-light" id="submit_button">Save <i class="material-icons right">save</i></button>',
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

                redundantAttribute: 'expr128',
                selector: '[expr128]'
              },
              {
                type: bindingTypes.EACH,
                getKey: null,
                condition: null,

                template: template(
                  '<div class="header"><h5 expr130="expr130"> </h5><button expr131="expr131" type="button" class="btn btn-small red lighten-1" title="Remove subentry" style="margin-right: 15px;"><i class="material-icons">delete</i></button></div><div expr132="expr132" class="att"></div><div expr139="expr139" class="att-new"></div>',
                  [
                    {
                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'data-element',
                          evaluate: _scope => _scope.element.name
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'class',
                          evaluate: _scope => _scope.element.valid ? "element-info" : "element-info text-red"
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr130',
                      selector: '[expr130]',

                      expressions: [
                        {
                          type: expressionTypes.TEXT,
                          childNodeIndex: 0,

                          evaluate: _scope => [
                            _scope.element.name,
                            ' ',
                            _scope.element.valid ? ''  : '(unknown element)!'
                          ].join(
                            ''
                          )
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr131',
                      selector: '[expr131]',

                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onclick',
                          evaluate: _scope => _scope.doDeleteEl
                        }
                      ]
                    },
                    {
                      type: bindingTypes.EACH,
                      getKey: null,
                      condition: null,

                      template: template(
                        '<label expr133="expr133" class="name blue-text flow-text"> </label><select expr134="expr134" class="value"></select><input expr137="expr137" type="text" class="value" placeholder="Value"/><button expr138="expr138" type="button" class="btn btn-small red lighten-1" title="Remove attribute"><i class="material-icons">delete</i></button>',
                        [
                          {
                            expressions: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'data-attribute',
                                evaluate: _scope => _scope.att.name
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr133',
                            selector: '[expr133]',

                            expressions: [
                              {
                                type: expressionTypes.TEXT,
                                childNodeIndex: 0,

                                evaluate: _scope => [
                                  '@',
                                  _scope.att.name
                                ].join(
                                  ''
                                )
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'for',
                                evaluate: _scope => `${_scope.att.name}-value`
                              }
                            ]
                          },
                          {
                            type: bindingTypes.IF,
                            evaluate: _scope => _scope.att.values,
                            redundantAttribute: 'expr134',
                            selector: '[expr134]',

                            template: template(
                              '<option expr135="expr135" value>[any value]</option><option expr136="expr136"></option>',
                              [
                                {
                                  expressions: [
                                    {
                                      type: expressionTypes.EVENT,
                                      name: 'onchange',
                                      evaluate: _scope => _scope.changeAttribute
                                    },
                                    {
                                      type: expressionTypes.ATTRIBUTE,
                                      name: 'value',
                                      evaluate: _scope => _scope.att.value
                                    },
                                    {
                                      type: expressionTypes.ATTRIBUTE,
                                      name: 'name',
                                      evaluate: _scope => `${_scope.att.name}-value`
                                    }
                                  ]
                                },
                                {
                                  redundantAttribute: 'expr135',
                                  selector: '[expr135]',

                                  expressions: [
                                    {
                                      type: expressionTypes.ATTRIBUTE,
                                      name: 'selected',
                                      evaluate: _scope => !_scope.att.value
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
                                            evaluate: _scope => _scope.v.value
                                          },
                                          {
                                            type: expressionTypes.ATTRIBUTE,
                                            name: 'value',
                                            evaluate: _scope => _scope.v.value
                                          },
                                          {
                                            type: expressionTypes.ATTRIBUTE,
                                            name: 'selected',
                                            evaluate: _scope => _scope.v.value === _scope.att.value
                                          }
                                        ]
                                      }
                                    ]
                                  ),

                                  redundantAttribute: 'expr136',
                                  selector: '[expr136]',
                                  itemName: 'v',
                                  indexName: null,
                                  evaluate: _scope => _scope.att.values
                                }
                              ]
                            )
                          },
                          {
                            type: bindingTypes.IF,
                            evaluate: _scope => !_scope.att.values,
                            redundantAttribute: 'expr137',
                            selector: '[expr137]',

                            template: template(
                              null,
                              [
                                {
                                  expressions: [
                                    {
                                      type: expressionTypes.ATTRIBUTE,
                                      name: 'value',
                                      evaluate: _scope => _scope.att.value
                                    },
                                    {
                                      type: expressionTypes.EVENT,
                                      name: 'onchange',
                                      evaluate: _scope => _scope.changeAttribute
                                    }
                                  ]
                                }
                              ]
                            )
                          },
                          {
                            redundantAttribute: 'expr138',
                            selector: '[expr138]',

                            expressions: [
                              {
                                type: expressionTypes.EVENT,
                                name: 'onclick',
                                evaluate: _scope => _scope.deleteAttribute
                              }
                            ]
                          }
                        ]
                      ),

                      redundantAttribute: 'expr132',
                      selector: '[expr132]',
                      itemName: 'att',
                      indexName: null,
                      evaluate: _scope => _scope.element.activeAttributes
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.element.inactiveAttributes.length,
                      redundantAttribute: 'expr139',
                      selector: '[expr139]',

                      template: template(
                        '<label style="width: 100%">(Optional) - Attributes this element should have to be a subentry: </label><select class="name new-attribute" name="new-attribute"><option expr140="expr140"></option></select><button expr141="expr141" class="btn btn-small" type="button"><i class="material-icons">add</i></button>',
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
                                      evaluate: _scope => _scope.att.name
                                    },
                                    {
                                      type: expressionTypes.ATTRIBUTE,
                                      name: 'value',
                                      evaluate: _scope => _scope.att.name
                                    }
                                  ]
                                }
                              ]
                            ),

                            redundantAttribute: 'expr140',
                            selector: '[expr140]',
                            itemName: 'att',
                            indexName: null,
                            evaluate: _scope => _scope.element.inactiveAttributes
                          },
                          {
                            redundantAttribute: 'expr141',
                            selector: '[expr141]',

                            expressions: [
                              {
                                type: expressionTypes.EVENT,
                                name: 'onclick',
                                evaluate: _scope => _scope.addAttribute
                              }
                            ]
                          }
                        ]
                      )
                    }
                  ]
                ),

                redundantAttribute: 'expr129',
                selector: '[expr129]',
                itemName: 'element',
                indexName: null,
                evaluate: _scope => _scope.activeSubentries
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.inactiveSubentries.length,
                redundantAttribute: 'expr142',
                selector: '[expr142]',

                template: template(
                  '<div class="input-field col s6"><select id="new-element"><option expr143="expr143"></option></select><label for="new-element">Subentry element</label><span class="helper-text">Elements listed here function as subentries which can be shared by multiple entries.</span></div><div class="input-field col s1"><a expr144="expr144" class="btn btn-small"><i class="material-icons">add</i></a></div>',
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
                                evaluate: _scope => _scope.elementName
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'value',
                                evaluate: _scope => _scope.elementName
                              }
                            ]
                          }
                        ]
                      ),

                      redundantAttribute: 'expr143',
                      selector: '[expr143]',
                      itemName: 'elementName',
                      indexName: null,
                      evaluate: _scope => _scope.inactiveSubentries
                    },
                    {
                      redundantAttribute: 'expr144',
                      selector: '[expr144]',

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
                redundantAttribute: 'expr145',
                selector: '[expr145]',

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

    name: 'dict-config-subbing'
  };

  var dict_config = {
    css: `dict-config .columnContainer,[is="dict-config"] .columnContainer{ display: flex; gap: 4vw; justify-content: space-between; margin: auto; } dict-config li,[is="dict-config"] li{ padding: 0 0 0.7rem 0.7rem; }`,

    exports: {
      bindings: [["store", "dictionaryChanged", "update"]],

      state: {
         stats: {},
         isResaving: false,
         resaveProgressMessage: '',
      },

      onMounted() {
         this.getStats();
      },

      getStats() {
         $.get(`${this.dictData.dictId}/stats.json`).then(r => this.update({stats: r}));
      },

      async resave() {
         if (this.state.isResaving) return;
         this.update({isResaving: true});
         while (true) {
            try {
               const {progressMessage, finished, errors} = await $.post(`${this.dictData.dictId}/resave.json`);
               if (finished) {
                  this.update({isResaving: false});
                  return;
               }
               this.update({resaveProgressMessage: progressMessage});
            } catch (e) {
               this.update({isResaving: false});
               break
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
      '<dict-nav expr212="expr212"></dict-nav><h1>Configuration</h1><div expr213="expr213" class="row"></div><div expr215="expr215"></div><div class="columnContainer" style="margin-left: 20px;"><div><h3 class="header">Manage dictionary</h3><ul><li><a expr217="expr217">Description</a></li><li><a expr218="expr218">Users</a></li><li><a expr219="expr219">Publishing</a></li><li><a expr220="expr220">Change URL</a></li></ul></div><div><h3 class="header">Entry settings</h3><ul><li><a expr221="expr221">Structure</a></li><li expr222="expr222"></li><li expr224="expr224"></li><li><a expr226="expr226">Headword list</a></li><li><a expr227="expr227">Searching</a></li></ul></div><div style="margin-right: auto;"><h3 class="header">Expert settings</h3><ul><li><a expr228="expr228">Entry editor</a></li><li><a expr229="expr229">Flags</a></li><li><a expr230="expr230">Auto-numbering</a></li><li><a expr231="expr231">Linking</a></li><li><a expr232="expr232">Download settings</a></li><li><a expr233="expr233">Subentries</a></li><li><a expr234="expr234">Sketch Engine</a></li><li><a expr235="expr235">KonText</a></li><li><a expr236="expr236">Multimedia API</a></li></ul></div></div>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [["config", "Configure"]]
            }
          ],

          redundantAttribute: 'expr212',
          selector: '[expr212]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.state.isResaving,
          redundantAttribute: 'expr213',
          selector: '[expr213]',

          template: template(
            ' <button expr214="expr214" class="btn" style="margin-left: 15px;">Do it now </button><br/><span style="opacity: 75%; font-size: 80%;">You don\'t have to do this right now. But your dictionary may take longer to load, and searching entries may not always return the results you expect, until you re-index.</span>',
            [
              {
                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,

                    evaluate: _scope => [
                      'Your dictionary needs to be re-indexed (',
                      _scope.state.stats.needUpdate,
                      ' entries).'
                    ].join(
                      ''
                    )
                  }
                ]
              },
              {
                redundantAttribute: 'expr214',
                selector: '[expr214]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.resave
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isResaving,
          redundantAttribute: 'expr215',
          selector: '[expr215]',

          template: template(
            '<span expr216="expr216"></span><br/><span style="opacity: 75%; font-size: 80%;">You may close or leave this window at any time to pause the process, and return later to resume.</span>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.state.resaveProgressMessage,
                redundantAttribute: 'expr216',
                selector: '[expr216]',

                template: template(
                  ' ',
                  [
                    {
                      expressions: [
                        {
                          type: expressionTypes.TEXT,
                          childNodeIndex: 0,
                          evaluate: _scope => _scope.state.resaveProgressMessage
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
          redundantAttribute: 'expr217',
          selector: '[expr217]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictData.dictId,
                '/config/ident'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr218',
          selector: '[expr218]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictData.dictId,
                '/config/users'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr219',
          selector: '[expr219]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictData.dictId,
                '/config/publico'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr220',
          selector: '[expr220]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictData.dictId,
                '/config/url'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr221',
          selector: '[expr221]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictData.dictId,
                '/config/xema'
              ].join(
                ''
              )
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.dictData.xemplateOverride,
          redundantAttribute: 'expr222',
          selector: '[expr222]',

          template: template(
            '<a expr223="expr223">Formatting</a>',
            [
              {
                redundantAttribute: 'expr223',
                selector: '[expr223]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'href',

                    evaluate: _scope => [
                      '#/',
                      _scope.dictData.dictId,
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
          evaluate: _scope => _scope.dictData.xemplateOverride,
          redundantAttribute: 'expr224',
          selector: '[expr224]',

          template: template(
            '<a expr225="expr225">Formatting</a>',
            [
              {
                redundantAttribute: 'expr225',
                selector: '[expr225]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'href',

                    evaluate: _scope => [
                      '#/',
                      _scope.dictData.dictId,
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
          redundantAttribute: 'expr226',
          selector: '[expr226]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictData.dictId,
                '/config/titling'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr227',
          selector: '[expr227]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictData.dictId,
                '/config/searchability'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr228',
          selector: '[expr228]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictData.dictId,
                '/config/editing'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr229',
          selector: '[expr229]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictData.dictId,
                '/config/flagging'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr230',
          selector: '[expr230]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictData.dictId,
                '/config/autonumber'
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
                _scope.dictData.dictId,
                '/config/links'
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
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictData.dictId,
                '/config/download'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr233',
          selector: '[expr233]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictData.dictId,
                '/config/subbing'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr234',
          selector: '[expr234]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictData.dictId,
                '/config/ske'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr235',
          selector: '[expr235]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictData.dictId,
                '/config/kontext'
              ].join(
                ''
              )
            }
          ]
        },
        {
          redundantAttribute: 'expr236',
          selector: '[expr236]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                '#/',
                _scope.dictData.dictId,
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
      state: {
         isLoading: true,
         isSaving: false,
         data: {
            headwordAnnotationsType: 'simple',
            headwordAnnotations: []
         }
      },

      changeAnnotation() {
         if ($('[name=hwannotype][value=advanced]').is(':checked')) {
            $('#headwordAnnotations').attr('disabled', 'disabled');
            $('#advancedAnnotations').removeAttr('disabled');
         } else {
            $('#advancedAnnotations').attr('disabled', 'disabled');
            $('#headwordAnnotations').removeAttr('disabled');
         }
         $('#headwordAnnotations').formSelect();
      },

      onMounted() {
         this.store.loadDictionaryConfig("titling")
               .done(response => {
                  this.state.data = response.content;
                  if (!this.state.data.numberEntries) this.state.data.numberEntries = 1000;
                  if (!this.state.data.headwordAnnotationsType) this.state.data.headwordAnnotationsType = 'simple';
                  if (!this.state.data.headwordAnnotations) this.state.data.headwordAnnotations = [];

                  // fill locale list for autocomplete
                  if (this.state.data.sort_locale && this.state.data.sort_locale != '') {
                     $('#sort_locale').data('selected-locale', this.state.data.sort_locale);
                  }
                  var localeList = {};
                  var localeData = {};
                  var selected = '';
                  this.state.data.locales.forEach(loc => {
                     localeList[loc['lang']] = null;
                     localeData[loc['lang']] = loc['code'];
                     if (loc['code'] == this.state.data.locale) {
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
               })
               .always(() => {
                  this.update({isLoading: false});
                  M.updateTextFields();
                  M.textareaAutoResize($('#advancedAnnotations'));
               });
      },

      onUpdated() {
         if (this.dictData.dictConfigs.xema && this.dictData.dictConfigs.xema.elements) {
            if ($('#headword option').length == 1) {
               Object.entries(this.dictData.dictConfigs.xema.elements).forEach(([key, info]) => {
                  $('#headword').append('<option value="' + key + '">' + key + '</option>');
               });
            }
            if ($('#headwordSorting option').length == 1) {
               Object.entries(this.dictData.dictConfigs.xema.elements).forEach(([key, info]) => {
                  $('#headwordSorting').append('<option value="' + key + '">' + key + '</option>');
               });
            }
            if ($('#headwordAnnotations option').length == 0) {
               Object.entries(this.dictData.dictConfigs.xema.elements).forEach(([key, info]) => {
                  if (key != this.state.data.headword) {
                     $('#headwordAnnotations').append('<option value="' + key + '">' + key + '</option>');
                  }
               });
            }
            if (this.state.data.headword != '') {
               $('#headword option[value='+this.state.data.headword+']').attr('selected','selected');
            }
            if (this.state.data.headwordSorting != '') {
               $('#headwordSorting option[value='+this.state.data.headwordSorting+']').attr('selected','selected');
            }
            this.state.data.headwordAnnotations.forEach(el => {
               $('#headwordAnnotations option[value='+el+']').attr('selected','selected');
            });


            $('select').formSelect();
         }
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
         return newData
      },

      saveData() {
         this.update({isSaving: true});
         this.store.updateDictionaryConfig("titling", this.getConfigData())
               .always(() => this.update({isSaving: false}));
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<loading-overlay expr148="expr148"></loading-overlay><dict-nav expr149="expr149"></dict-nav><h1>Headword</h1><div class="row"><div class="input-field col s6"><select id="headword"><option value>(not set)</option></select><label for="headword">Headword</label><span class="helper-text">Select the element which contains the entry\'s headword. If you make no selection here Lexonomy will try to guess what the headword of each entry is.</span></div></div><div class="row"><div class="input-field col s6"><select id="headwordSorting"><option value>(not set)</option></select><label for="headwordSorting">Headword sorting</label><span class="helper-text">Select the element which will be used for sorting of headwords in the entry list. If you make no selection here Lexonomy will use the element you chose for headword.</span></div><div class="input-field col s6"><label style="padding-top: 30px;"><input expr150="expr150" type="checkbox" id="sortDesc"/><span>Sort in descending order</span></label></div></div><div class="row"><h4>Headword annotations</h4></div><div class="row"><div class="col s5"><label><input expr151="expr151" name="hwannotype" type="radio" value="simple"/><span>simple</span></label><br/><div class="input-field"><select expr152="expr152" id="headwordAnnotations" multiple></select><span class="helper-text">You can select any elements here whose content you want displayed beside the headword in the entry list, such as homograph numbers or part-of-speech labels.</span></div></div><div class="col s5"><label><input expr153="expr153" name="hwannotype" type="radio" value="advanced"/><span>advanced</span></label><br/><div class="input-field"><textarea expr154="expr154" id="advancedAnnotations" class="materialize-textarea" placeholder="headword annotations"> </textarea><span class="helper-text">You can insert any HTML containing placeholders for elements in the form of \'%(element)\', e.g. \'&lt;b>%(headword)&lt;/b>\'.</span></div></div></div><div class="row"><div class="input-field col s8"><input expr155="expr155" type="text" id="sort_locale" class="autocomplete" placeholder="Type to search for language"/><label for="sort_locale">Alphabetical order</label><span class="helper-text">Select language to sort entries alphabetically in the entry list.</span></div></div><div class="row"><div class="input-field col s6"><input expr156="expr156" id="numberEntries" type="number"/><label for="numberEntries">Number of entries to be shown in the entry list at once</label><span class="helper-text">If your dictionary contains large entries (large XML files), it is recommended to reduce this number for quicker loading of entry list.</span></div></div><dict-config-buttons expr157="expr157"></dict-config-buttons>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isLoading || _scope.state.isSaving,
          redundantAttribute: 'expr148',
          selector: '[expr148]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [["config", "Configure"], ["titling", "Headword list"]]
            }
          ],

          redundantAttribute: 'expr149',
          selector: '[expr149]'
        },
        {
          redundantAttribute: 'expr150',
          selector: '[expr150]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'checked',
              evaluate: _scope => _scope.state.data.sortDesc
            }
          ]
        },
        {
          redundantAttribute: 'expr151',
          selector: '[expr151]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'checked',
              evaluate: _scope => _scope.state.data.headwordAnnotationsType == "simple"
            },
            {
              type: expressionTypes.EVENT,
              name: 'onchange',
              evaluate: _scope => _scope.changeAnnotation
            }
          ]
        },
        {
          redundantAttribute: 'expr152',
          selector: '[expr152]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'disabled',
              evaluate: _scope => _scope.state.data.headwordAnnotationsType == 'advanced'
            }
          ]
        },
        {
          redundantAttribute: 'expr153',
          selector: '[expr153]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'checked',
              evaluate: _scope => _scope.state.data.headwordAnnotationsType == "advanced"
            },
            {
              type: expressionTypes.EVENT,
              name: 'onchange',
              evaluate: _scope => _scope.changeAnnotation
            }
          ]
        },
        {
          redundantAttribute: 'expr154',
          selector: '[expr154]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.state.data.headwordAnnotationsAdvanced
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'disabled',
              evaluate: _scope => _scope.state.data.headwordAnnotationsType == 'simple'
            }
          ]
        },
        {
          redundantAttribute: 'expr155',
          selector: '[expr155]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'data-selected-locale',
              evaluate: _scope => _scope.state.data.locale
            }
          ]
        },
        {
          redundantAttribute: 'expr156',
          selector: '[expr156]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.state.data.numberEntries
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
            }
          ],

          redundantAttribute: 'expr157',
          selector: '[expr157]'
        }
      ]
    ),

    name: 'dict-config-titling'
  };

  var dict_config_url = {
    css: null,

    exports: {
      saveData() {
         this.update({isSaving: true});
         var newurl = $('#url').val();
         if (newurl != "" && $('#url').hasClass('valid')) {
            $.post(window.API_URL + this.dictData.dictId + "/move.json", {url: newurl}, (response) => {
               if (response.success) {
                  $('#success').show();
                  $('#newlink').attr('href', '#/' + newurl);
               } else {
                  $('#error').show();
               }
               this.update({isSaving: false});
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
      '<loading-overlay expr158="expr158"></loading-overlay><dict-nav expr159="expr159"></dict-nav><h1>Change URL</h1><div class="row"><label for="url">Current URL</label><div style="margin: 0 0 30px;"><span expr160="expr160"> </span></div></div><div class="row"><label for="url">New URL</label><div><div style="display: flex; align-items: baseline;"><span id="baseUrl">https://www.lexonomy.eu/</span><span><input id="url" type="text" class="validate inlineBlock" required minlength="5" pattern="[a-zA-Z0-9\\-_]*" style="max-width: 300px;"/></span></div><div class="input-field" style="margin-top: 0;"><span class="helper-text">This will be your dictionary\'s address on the web. You will be able to change this later. Allowed: letters, numbers, - and _</span></div></div></div><dict-config-buttons expr161="expr161" label="Change"></dict-config-buttons><br/><div><span id="error" style="display:none">This URL is already taken.</span><span id="success" style="display:none">\n         Your dictionary has been moved to a new URL.\n         <a href id="newlink">Go to new dictionary URL</a>.\n      </span></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isSaving,
          redundantAttribute: 'expr158',
          selector: '[expr158]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [["config", "Configure"], ["url", "Change URL"]]
            }
          ],

          redundantAttribute: 'expr159',
          selector: '[expr159]'
        },
        {
          redundantAttribute: 'expr160',
          selector: '[expr160]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: _scope => [
                'https://www.lexonomy.eu/',
                _scope.dictData.dictId
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
            }
          ],

          redundantAttribute: 'expr161',
          selector: '[expr161]'
        }
      ]
    ),

    name: 'dict-config-url'
  };

  var dict_config_users = {
    css: `dict-config-users .user-checkbox,[is="dict-config-users"] .user-checkbox{ padding-right: 2em; } dict-config-users .delete-user,[is="dict-config-users"] .delete-user,dict-config-users .add-user,[is="dict-config-users"] .add-user{ float: right; } dict-config-users #userConfigError,[is="dict-config-users"] #userConfigError{ margin-left: 1em; color: red; }`,

    exports: {
      state: {
         isLoading: true,
         isSaving: false,
         data: {users: []}
      },

      onEmailInput(idx, evt){
         this.state.data.users[idx].email = evt.target.value;
      },

      onPermissionChange(idx, evt){
         this.state.data.users[idx][evt.target.name] = evt.target.checked;
      },

      doDeleteUser(idx) {
         this.state.data.users.splice(idx, 1);
         this.update();
      },

      doAddUser(event) {
         this.state.data.users.push({
            id: this.state.data.users.length,
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
         this.store.loadDictionaryConfig("users")
               .done(response => {
                  this.state.data = {users:[]};
                  let id = 0;
                  for (var key in response.content) {
                     var info = response.content[key];
                     info.email = key;
                     info.id = id;
                     id++;
                     this.state.data.users.push(info);
                  }
               })
               .always(() => {
                  this.update({isLoading: false});
               });
      },

      saveData() {
         if (Object.values(this.state.data.users).find(row => row.canConfig) == undefined) {
            $('#userConfigError').html('At least one user must have <i>Configure</i> permission.');
         } else {
            $('#userConfigError').html('');
            let data = {};
            this.state.data.users.forEach(u => {
               data[u.email] = {
                  canEdit: u.canEdit,
                  canConfig: u.canConfig,
                  canDownload: u.canDownload,
                  canUpload: u.canUpload
               };
            });
            this.update({isSaving: true});
            this.store.updateDictionaryConfig('users', data)
                  .always(() => this.update({isSaving: false}));
         }
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<loading-overlay expr162="expr162"></loading-overlay><dict-nav expr163="expr163"></dict-nav><h1>Users</h1><template expr164="expr164"></template>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isLoading || _scope.state.isSaving,
          redundantAttribute: 'expr162',
          selector: '[expr162]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [["config", "Configure"], ["users", "Users"]]
            }
          ],

          redundantAttribute: 'expr163',
          selector: '[expr163]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.state.isLoading,
          redundantAttribute: 'expr164',
          selector: '[expr164]',

          template: template(
            '<div expr165="expr165" class="grey-text center-align"></div><div><div expr168="expr168"></div></div>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => !_scope.state.data.users.length,
                redundantAttribute: 'expr165',
                selector: '[expr165]',

                template: template(
                  '<h2>No users</h2><br/><button expr166="expr166" class="btn btn-primary"><i class="material-icons right">add</i>\n            Add new user\n         </button><br/><br/><br/><br/><div class="buttons" style="justify-content: center;"><dict-config-buttons expr167="expr167"></dict-config-buttons></div>',
                  [
                    {
                      redundantAttribute: 'expr166',
                      selector: '[expr166]',

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
                        }
                      ],

                      redundantAttribute: 'expr167',
                      selector: '[expr167]'
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.state.data.users.length,
                redundantAttribute: 'expr168',
                selector: '[expr168]',

                template: template(
                  '<table><thead><tr style="border-bottom: none;"><th></th><th colspan="5">Privileges</th></tr><tr><th>User email</th><th>Edit</th><th>Configure</th><th>Download</th><th>Upload</th><th></th></tr></thead><tbody><tr expr169="expr169" no-reorder></tr></tbody></table><br/><div><button expr178="expr178" class="btn"><i class="material-icons right">add</i>\n               Add new user\n            </button></div><br/><br/><dict-config-buttons expr179="expr179"></dict-config-buttons><div id="userConfigError"></div>',
                  [
                    {
                      type: bindingTypes.EACH,
                      getKey: _scope => _scope.user.id,
                      condition: null,

                      template: template(
                        '<td><span expr170="expr170"></span><span expr172="expr172"></span></td><td><label><input expr173="expr173" type="checkbox" name="canEdit"/><span></span></label></td><td><label><input expr174="expr174" type="checkbox" name="canConfig"/><span></span></label></td><td><label><input expr175="expr175" type="checkbox" name="canDownload"/><span></span></label></td><td><label><input expr176="expr176" type="checkbox" name="canEdit"/><span></span></label></td><td><a expr177="expr177" class="btn btn-floating delete-user"><i class="material-icons">delete</i></a></td>',
                        [
                          {
                            type: bindingTypes.IF,
                            evaluate: _scope => _scope.user.isEditable,
                            redundantAttribute: 'expr170',
                            selector: '[expr170]',

                            template: template(
                              '<input expr171="expr171" id="new-email" type="email" class="validate" style="max-width: 300px;"/>',
                              [
                                {
                                  redundantAttribute: 'expr171',
                                  selector: '[expr171]',

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
                            redundantAttribute: 'expr172',
                            selector: '[expr172]',

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
                            redundantAttribute: 'expr173',
                            selector: '[expr173]',

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
                            redundantAttribute: 'expr174',
                            selector: '[expr174]',

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
                            redundantAttribute: 'expr175',
                            selector: '[expr175]',

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
                            redundantAttribute: 'expr176',
                            selector: '[expr176]',

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
                            redundantAttribute: 'expr177',
                            selector: '[expr177]',

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

                      redundantAttribute: 'expr169',
                      selector: '[expr169]',
                      itemName: 'user',
                      indexName: 'idx',
                      evaluate: _scope => _scope.state.data.users
                    },
                    {
                      redundantAttribute: 'expr178',
                      selector: '[expr178]',

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
                        }
                      ],

                      redundantAttribute: 'expr179',
                      selector: '[expr179]'
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

      state: {
         isLoading: true,
         isSaving: false,
         override: false,
         currentElement: null, // initialize in beforeMount
         currentAttribute: null,
         xema: undefined, // initialized in beforeMount
      },

      async onBeforeMount(props, state) {
         let xema = (await this.store.loadDictionaryConfig('xema')).content;
         this.state.xema = xema;
         this.state.isLoading = false;
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
         this.update({isSaving: true});
         this.store.updateDictionaryConfig("xema", this.getConfigData())
               .always(() => this.update({isSaving: false}));
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
      '<loading-overlay expr195="expr195"></loading-overlay><dict-nav expr196="expr196"></dict-nav><h1>Entry structure</h1><div expr197="expr197"></div><template expr198="expr198"></template>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isLoading || _scope.state.isSaving,
          redundantAttribute: 'expr195',
          selector: '[expr195]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [["config", "Configure"], ["xema", "Entry structure"]]
            }
          ],

          redundantAttribute: 'expr196',
          selector: '[expr196]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.state.xema,
          redundantAttribute: 'expr197',
          selector: '[expr197]',

          template: template(
            'Loading...',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.xema,
          redundantAttribute: 'expr198',
          selector: '[expr198]',

          template: template(
            '<div expr199="expr199" id="editor" class="editor designer"></div><div expr203="expr203"></div><div><button expr210="expr210" class="btn waves-effect waves-light"> <i class="material-icons right">edit</i></button></div><dict-config-buttons expr211="expr211"></dict-config-buttons>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => !_scope.state.override,
                redundantAttribute: 'expr199',
                selector: '[expr199]',

                template: template(
                  '<div class="list"><dict-config-element-in-tree expr200="expr200"></dict-config-element-in-tree></div><div class="details"><dict-config-xema-element expr201="expr201"></dict-config-xema-element><dict-config-xema-attribute expr202="expr202"></dict-config-xema-attribute></div>',
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

                      redundantAttribute: 'expr200',
                      selector: '[expr200]',
                      itemName: 'root',
                      indexName: null,
                      evaluate: _scope => _scope.state.roots
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.state.currentElement && !_scope.state.currentAttribute,
                      redundantAttribute: 'expr201',
                      selector: '[expr201]',

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
                      redundantAttribute: 'expr202',
                      selector: '[expr202]',

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
                redundantAttribute: 'expr203',
                selector: '[expr203]',

                template: template(
                  '<div class="row"><div class="col s10"><p>To specify your custom Lexonomy schema use either <i>Xonomy Document Specification</i>, or <i>DTD</i>.</p><h3>Xonomy Document Specification</h3><p>A <a href="http://www.lexiconista.com/xonomy/" target="_blank">Xonomy Document Specification</a> is a JavaScript object which configures the Xonomy XML editor used in Lexonomy.</p></div></div><div class="row"><div class="input-field col s10"><textarea expr204="expr204" id="editor_doc" class="materialize-textarea" placeholder> </textarea><label for="editor_doc">Document specification</label><span class="helper-text">Xonomy Document Specification. If you would like to see an example, <a expr205="expr205">click here to load a sample specification</a>.</span></div></div><div class="row"><div class="input-field col s10"><textarea expr206="expr206" id="editor_xml" class="materialize-textarea" placeholder> </textarea><label for="editor_xml">Template for new entries</label><span class="helper-text">XML template for newly created entries. If you would like to see an example, <a expr207="expr207">click here to load a sample XML template</a>.</span></div></div><div class="row"><div class="col s10"><h3>DTD (Document Type Defition)</h3><p><a href="https://en.wikipedia.org/wiki/Document_type_definition" target="_blank">Document Type Definitions</a> are a popular formalism for defining the structure of XML documents.</p></div></div><div class="row"><div class="input-field col s10"><textarea expr208="expr208" id="editor_dtd" class="materialize-textarea" placeholder> </textarea><label for="editor_dtd">Your DTD</label><span class="helper-text">If you would like to see an example, <a expr209="expr209">click here to load a sample DTD</a>.</span></div></div>',
                  [
                    {
                      redundantAttribute: 'expr204',
                      selector: '[expr204]',

                      expressions: [
                        {
                          type: expressionTypes.TEXT,
                          childNodeIndex: 0,
                          evaluate: _scope => _scope.state.xema._xonomyDocSpec || ""
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr205',
                      selector: '[expr205]',

                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onclick',
                          evaluate: _scope => _scope.exampleDoc
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr206',
                      selector: '[expr206]',

                      expressions: [
                        {
                          type: expressionTypes.TEXT,
                          childNodeIndex: 0,
                          evaluate: _scope => _scope.state.xema._css || ""
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr207',
                      selector: '[expr207]',

                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onclick',
                          evaluate: _scope => _scope.exampleXML
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr208',
                      selector: '[expr208]',

                      expressions: [
                        {
                          type: expressionTypes.TEXT,
                          childNodeIndex: 0,
                          evaluate: _scope => _scope.state.xema._dtd || ""
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr209',
                      selector: '[expr209]',

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
                redundantAttribute: 'expr210',
                selector: '[expr210]',

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
                  }
                ],

                redundantAttribute: 'expr211',
                selector: '[expr211]'
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

              // Value from list.
              this.state.isAddingValue = false;
              this.state.newValue = '';
              this.state.newCaption = '';

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
          this.state.newValueError = '';
          this.update();
      },

      /** User commits new value */
      saveNewValue(event) {
          if (event) event.preventDefault(); // form submit

          const value = this.state.newValue;
          this.state.newCaption;
          if (this.state.config.values.find(v => v.value === value)) {
              this.state.newValueError = `Value ${value} already exists`;
              return;
          }

          this.state.config.values.push({
              value: this.state.newValue,
              caption: this.state.newCaption,
          });
          this.state.newValueError = '';
          // Keep open, nice and simple.
          // this.state.isAddingValue = false;
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
      '<div class="block"><div class="title">Element</div><input expr563="expr563" class="textbox tech elName" data-path="config.elementName"/><template expr564="expr564"></template></div><div class="block"><div class="title tight">Attributes</div><table><tr expr568="expr568"></tr></table><button expr574="expr574" class="butAtNewOpener iconAdd"></button><template expr575="expr575"></template></div><div class="block"><div class="title">Content</div><label class="radio"><input expr582="expr582" type="radio" name="filling" value="chd" data-apply data-path="config.filling"/>Child elements</label><label class="radio"><input expr583="expr583" type="radio" name="filling" value="txt" data-apply data-path="config.filling"/>Text</label><label class="radio"><input expr584="expr584" type="radio" name="filling" value="inl" data-apply data-path="config.filling"/>Text with markup</label><label class="radio"><input expr585="expr585" type="radio" name="filling" value="lst" data-apply data-path="config.filling"/>Value from list</label><label class="radio"><input expr586="expr586" type="radio" name="filling" value="emp" data-apply data-path="config.filling"/>Empty</label><label class="radio"><input expr587="expr587" type="radio" name="filling" value="med" data-apply data-path="config.filling"/>Media</label></div><div expr588="expr588" class="block"></div><div expr605="expr605" class="block"></div>',
      [
        {
          redundantAttribute: 'expr563',
          selector: '[expr563]',

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
          redundantAttribute: 'expr564',
          selector: '[expr564]',

          template: template(
            '<button expr565="expr565" type="button" class="butRename iconAccept"></button><button expr566="expr566" type="button" class="butRenameCancel iconCancel" data-path="config.elementName">\n                Cancel renaming\n            </button><div expr567="expr567" class="warn"></div>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.isValidXmlName(_scope.state.config.elementName),
                redundantAttribute: 'expr565',
                selector: '[expr565]',

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
                redundantAttribute: 'expr566',
                selector: '[expr566]',

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
                redundantAttribute: 'expr567',
                selector: '[expr567]',

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
            '<td expr569="expr569" class="cell1"><span class="tech"><span class="ats">@</span><span expr570="expr570" class="att"> </span></span></td><td class="cell2"><span><label class="radio"><input expr571="expr571" type="radio" value="optional" data-apply/>optional</label><label class="radio"><input expr572="expr572" type="radio" value="obligatory" data-apply/>obligatory</label></span></td><td class="cell9"><button expr573="expr573" class="iconOnly iconCross" data-apply>&nbsp;</button></td>',
            [
              {
                redundantAttribute: 'expr569',
                selector: '[expr569]',

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
                redundantAttribute: 'expr570',
                selector: '[expr570]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.att[0]
                  }
                ]
              },
              {
                redundantAttribute: 'expr571',
                selector: '[expr571]',

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
                redundantAttribute: 'expr572',
                selector: '[expr572]',

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
                redundantAttribute: 'expr573',
                selector: '[expr573]',

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

          redundantAttribute: 'expr568',
          selector: '[expr568]',
          itemName: 'att',
          indexName: null,
          evaluate: _scope => Object.entries(_scope.state.config.attributes).sort((a, b) => a[0].localeCompare(b[0]))
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.state.isAddingAttribute,
          redundantAttribute: 'expr574',
          selector: '[expr574]',

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
          redundantAttribute: 'expr575',
          selector: '[expr575]',

          template: template(
            '<form expr576="expr576"><input expr577="expr577" class="textbox tech atName txtAtNew" data-path="newAttributeName" autofocus/><button expr578="expr578" class="butAtNew iconAccept"></button><button expr579="expr579" class="butAtNewCancel iconCancel">Cancel</button></form><div expr580="expr580" class="warn errInvalidAtName"></div><div expr581="expr581" class="warn errAtNameExists"></div>',
            [
              {
                redundantAttribute: 'expr576',
                selector: '[expr576]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onsubmit',
                    evaluate: _scope => _scope.saveNewAttribute
                  }
                ]
              },
              {
                redundantAttribute: 'expr577',
                selector: '[expr577]',

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
                redundantAttribute: 'expr578',
                selector: '[expr578]',

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
                redundantAttribute: 'expr579',
                selector: '[expr579]',

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
                redundantAttribute: 'expr580',
                selector: '[expr580]',

                template: template(
                  'Cannot add, not a valid XML name.',
                  []
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.state.config.attributes[_scope.state.newAttributeName],
                redundantAttribute: 'expr581',
                selector: '[expr581]',

                template: template(
                  'Cannot add, such attribute already exists.',
                  []
                )
              }
            ]
          )
        },
        {
          redundantAttribute: 'expr582',
          selector: '[expr582]',

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
          redundantAttribute: 'expr583',
          selector: '[expr583]',

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
          redundantAttribute: 'expr584',
          selector: '[expr584]',

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
          redundantAttribute: 'expr585',
          selector: '[expr585]',

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
          redundantAttribute: 'expr586',
          selector: '[expr586]',

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
          redundantAttribute: 'expr587',
          selector: '[expr587]',

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
          evaluate: _scope => _scope.state.config.filling === "lst",
          redundantAttribute: 'expr588',
          selector: '[expr588]',

          template: template(
            '<div class="title">Values</div><table><tr expr589="expr589"></tr></table><template expr597="expr597"></template><form expr599="expr599" style="white-space: nowrap;"></form>',
            [
              {
                type: bindingTypes.EACH,
                getKey: null,
                condition: null,

                template: template(
                  '<td class="cell1"><form expr590="expr590" style="white-space: nowrap;"><input expr591="expr591" class="textbox val" placeholder="value"/><input expr592="expr592" class="textbox cap" placeholder="caption"/><template expr593="expr593"></template></form></td><td class="cell9"><button expr596="expr596" class="iconOnly iconCross" data-apply>&nbsp;</button></td>',
                  [
                    {
                      redundantAttribute: 'expr590',
                      selector: '[expr590]',

                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onsubmit',
                          evaluate: _scope => _scope.applyLocalData
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr591',
                      selector: '[expr591]',

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
                      redundantAttribute: 'expr592',
                      selector: '[expr592]',

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
                      redundantAttribute: 'expr593',
                      selector: '[expr593]',

                      template: template(
                        '<button expr594="expr594" class="change iconAccept" type="submit">Change</button><button expr595="expr595" class="cancel iconCancel" type="button">Cancel</button>',
                        [
                          {
                            redundantAttribute: 'expr594',
                            selector: '[expr594]',

                            expressions: [
                              {
                                type: expressionTypes.EVENT,
                                name: 'onclick',
                                evaluate: _scope => _scope.applyLocalData
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr595',
                            selector: '[expr595]',

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
                      redundantAttribute: 'expr596',
                      selector: '[expr596]',

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

                redundantAttribute: 'expr589',
                selector: '[expr589]',
                itemName: 'value',
                indexName: 'index',
                evaluate: _scope => _scope.state.config.values
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => !_scope.state.isAddingValue,
                redundantAttribute: 'expr597',
                selector: '[expr597]',

                template: template(
                  '<button expr598="expr598" class="butNewValue iconAdd">Add...</button>',
                  [
                    {
                      redundantAttribute: 'expr598',
                      selector: '[expr598]',

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
                redundantAttribute: 'expr599',
                selector: '[expr599]',

                template: template(
                  '<input expr600="expr600" class="textbox new val" data-path="newValue" placeholder="value" autofocus/><input expr601="expr601" class="textbox new cap" data-path="newCaption" placeholder="caption"/><button expr602="expr602" class="butNewValueOK iconAccept"></button><button expr603="expr603" class="butNewValueCancel iconCancel" type="button">Cancel</button><div expr604="expr604" class="warn"></div>',
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
                      redundantAttribute: 'expr600',
                      selector: '[expr600]',

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
                      redundantAttribute: 'expr601',
                      selector: '[expr601]',

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
                      redundantAttribute: 'expr602',
                      selector: '[expr602]',

                      template: template(
                        'Add',
                        []
                      )
                    },
                    {
                      redundantAttribute: 'expr603',
                      selector: '[expr603]',

                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onclick',
                          evaluate: _scope => _scope.cancelNewValue
                        }
                      ]
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.state.newValueError,
                      redundantAttribute: 'expr604',
                      selector: '[expr604]',

                      template: template(
                        ' ',
                        [
                          {
                            expressions: [
                              {
                                type: expressionTypes.TEXT,
                                childNodeIndex: 0,
                                evaluate: _scope => _scope.state.newValueError
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
          evaluate: _scope => _scope.state.config.filling === "inl" || _scope.state.config.filling === "chd",
          redundantAttribute: 'expr605',
          selector: '[expr605]',

          template: template(
            '<div class="title tight">Child elements</div><table expr606="expr606"></table><button expr618="expr618" class="butElNewOpener iconAdd"></button><template expr619="expr619"></template>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.state.config.children.length,
                redundantAttribute: 'expr606',
                selector: '[expr606]',

                template: template(
                  '<tr expr607="expr607"></tr>',
                  [
                    {
                      type: bindingTypes.EACH,
                      getKey: null,
                      condition: null,

                      template: template(
                        '<td expr608="expr608" class="cell1"><span class="tech"><span class="brak">&lt;</span><span expr609="expr609" class="elm"> </span><span class="brak">&gt;</span></span></td><td class="cell2" style="white-space: nowrap;"><label>min <input expr610="expr610" class="textbox min" type="number" data-apply/></label><label>max <input expr611="expr611" class="textbox max" type="number" data-apply/></label></td><td class="cell9"><button expr612="expr612" class="iconOnly iconCross" data-apply>&nbsp;</button></td><td><div><button expr613="expr613"></button><template expr614="expr614"></template></div></td>',
                        [
                          {
                            redundantAttribute: 'expr608',
                            selector: '[expr608]',

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
                            redundantAttribute: 'expr609',
                            selector: '[expr609]',

                            expressions: [
                              {
                                type: expressionTypes.TEXT,
                                childNodeIndex: 0,
                                evaluate: _scope => _scope.child.elementName
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr610',
                            selector: '[expr610]',

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
                            redundantAttribute: 'expr611',
                            selector: '[expr611]',

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
                            redundantAttribute: 'expr612',
                            selector: '[expr612]',

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
                            redundantAttribute: 'expr613',
                            selector: '[expr613]',

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
                            redundantAttribute: 'expr614',
                            selector: '[expr614]',

                            template: template(
                              ' <select expr615="expr615"><option expr616="expr616"></option></select><button expr617="expr617">use instead</button>',
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
                                  redundantAttribute: 'expr615',
                                  selector: '[expr615]',

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

                                  redundantAttribute: 'expr616',
                                  selector: '[expr616]',
                                  itemName: 'sibling',
                                  indexName: null,
                                  evaluate: _scope => _scope.child.nameSiblings
                                },
                                {
                                  redundantAttribute: 'expr617',
                                  selector: '[expr617]',

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

                      redundantAttribute: 'expr607',
                      selector: '[expr607]',
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
                redundantAttribute: 'expr618',
                selector: '[expr618]',

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
                redundantAttribute: 'expr619',
                selector: '[expr619]',

                template: template(
                  '<input expr620="expr620" class="textbox tech elName txtElNew" data-path="newElementName"/><button expr621="expr621" class="butElNew iconAccept"></button><button expr622="expr622" class="butElNewCancel iconCancel">Cancel</button><div expr623="expr623" class="warn errInvalidElName"></div>',
                  [
                    {
                      redundantAttribute: 'expr620',
                      selector: '[expr620]',

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
                      redundantAttribute: 'expr621',
                      selector: '[expr621]',

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
                      redundantAttribute: 'expr622',
                      selector: '[expr622]',

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
                      redundantAttribute: 'expr623',
                      selector: '[expr623]',

                      template: template(
                        'Cannot add, not a valid XML name.',
                        []
                      )
                    }
                  ]
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
          // Keep open
          // this.state.isAddingValue = false;
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
      '<div class="block"><div class="title">Attribute</div><form expr540="expr540"><input expr541="expr541" class="textbox tech atName" data-path="newAttributeId"/><button expr542="expr542" class="butRename iconAccept" type="submit"></button><div expr543="expr543" class="warn errInvalidAtName"></div><div expr544="expr544" class="warn errAtNameExists"></div></form></div><div class="block"><div class="title">Content</div><label class="radio"><input expr545="expr545" type="radio" name="filling" value="txt" data-path="config.filling" data-apply/>Text</label><label class="radio"><input expr546="expr546" type="radio" name="filling" value="lst" data-path="config.filling" data-apply/>Value from list</label></div><div expr547="expr547" class="block"></div>',
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
          redundantAttribute: 'expr540',
          selector: '[expr540]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onsubmit',
              evaluate: _scope => _scope.saveNewId
            }
          ]
        },
        {
          redundantAttribute: 'expr541',
          selector: '[expr541]',

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
          redundantAttribute: 'expr542',
          selector: '[expr542]',

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
          redundantAttribute: 'expr543',
          selector: '[expr543]',

          template: template(
            'Cannot rename, not a valid XML name.',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.newAttributeId != _scope.props.attributeId && _scope.props.xema.elements[_scope.props.elementId].attributes[_scope.state.newAttributeId],
          redundantAttribute: 'expr544',
          selector: '[expr544]',

          template: template(
            'Cannot rename, such attribute already exists.',
            []
          )
        },
        {
          redundantAttribute: 'expr545',
          selector: '[expr545]',

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
          redundantAttribute: 'expr546',
          selector: '[expr546]',

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
          redundantAttribute: 'expr547',
          selector: '[expr547]',

          template: template(
            '<div class="title">Values</div><table><tr expr548="expr548"></tr></table><template expr556="expr556"></template><form expr558="expr558" style="white-space: nowrap;"></form>',
            [
              {
                type: bindingTypes.EACH,
                getKey: null,
                condition: null,

                template: template(
                  '<td class="cell1"><form expr549="expr549" style="white-space: nowrap;"><input expr550="expr550" class="textbox val" placeholder="value"/><input expr551="expr551" class="textbox cap" placeholder="caption"/><template expr552="expr552"></template></form></td><td class="cell9"><button expr555="expr555" class="iconOnly iconCross" data-apply>&nbsp;</button></td>',
                  [
                    {
                      redundantAttribute: 'expr549',
                      selector: '[expr549]',

                      expressions: [
                        {
                          type: expressionTypes.EVENT,
                          name: 'onsubmit',
                          evaluate: _scope => _scope.applyLocalData
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr550',
                      selector: '[expr550]',

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
                      redundantAttribute: 'expr551',
                      selector: '[expr551]',

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
                      redundantAttribute: 'expr552',
                      selector: '[expr552]',

                      template: template(
                        '<button expr553="expr553" class="change iconAccept" type="submit">Change</button><button expr554="expr554" class="cancel iconCancel" type="button">Cancel</button>',
                        [
                          {
                            redundantAttribute: 'expr553',
                            selector: '[expr553]',

                            expressions: [
                              {
                                type: expressionTypes.EVENT,
                                name: 'onclick',
                                evaluate: _scope => _scope.applyLocalData
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr554',
                            selector: '[expr554]',

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
                      redundantAttribute: 'expr555',
                      selector: '[expr555]',

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

                redundantAttribute: 'expr548',
                selector: '[expr548]',
                itemName: 'value',
                indexName: 'index',
                evaluate: _scope => _scope.state.config.values
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => !_scope.state.isAddingValue,
                redundantAttribute: 'expr556',
                selector: '[expr556]',

                template: template(
                  '<button expr557="expr557" class="butNewValue iconAdd">Add...</button>',
                  [
                    {
                      redundantAttribute: 'expr557',
                      selector: '[expr557]',

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
                redundantAttribute: 'expr558',
                selector: '[expr558]',

                template: template(
                  '<input expr559="expr559" class="textbox new val" data-path="newValue" placeholder="value" autofocus/><input expr560="expr560" class="textbox new cap" data-path="newCaption" placeholder="caption"/><button expr561="expr561" class="butNewValueOK iconAccept"></button><button expr562="expr562" class="butNewValueCancel iconCancel" type="button">Cancel</button>',
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
                      redundantAttribute: 'expr559',
                      selector: '[expr559]',

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
                      redundantAttribute: 'expr560',
                      selector: '[expr560]',

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
                      redundantAttribute: 'expr561',
                      selector: '[expr561]',

                      template: template(
                        'Add',
                        []
                      )
                    },
                    {
                      redundantAttribute: 'expr562',
                      selector: '[expr562]',

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
      '<div class="horizontal"><span expr373="expr373" class="plusminus"></span></div><div expr374="expr374"><span class="tech"><span class="brak">&lt;</span><span expr375="expr375" class="elm"> </span><span class="brak">&gt;</span></span></div><div expr376="expr376" class="children"></div>',
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
          redundantAttribute: 'expr373',
          selector: '[expr373]',

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
          redundantAttribute: 'expr374',
          selector: '[expr374]',

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
          redundantAttribute: 'expr375',
          selector: '[expr375]',

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
          redundantAttribute: 'expr376',
          selector: '[expr376]',

          template: template(
            '<dict-config-attribute-in-tree expr377="expr377"></dict-config-attribute-in-tree><dict-config-element-in-tree expr378="expr378"></dict-config-element-in-tree>',
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

                redundantAttribute: 'expr377',
                selector: '[expr377]',
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

                redundantAttribute: 'expr378',
                selector: '[expr378]',
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
      '<div class="horizontal"></div><div expr180="expr180"><span class="tech"><span class="ats">@</span><span expr181="expr181" class="att"> </span></span></div>',
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
          redundantAttribute: 'expr180',
          selector: '[expr180]',

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
          redundantAttribute: 'expr181',
          selector: '[expr181]',

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
          enableParentChange: false,
          enableCopying: false,
          readOnly: false,
          hideElementName: false,
          displayType: null,
          popupDetails: null,
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
         this.configData = this.props.configData;
         this.resetElementData();
         this.update();
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

        if (attribute === "displayType") {
          this.update();
        }
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
        if (!this.props.config.xema || !this.elementName) {
          return false
        }
        const structureConfig = this.props.config.xema;
        if (style === "editorInputType" && this.props.config.editing.xonomyMode === "graphical") {
          if (this.props.attributeName) {
            return structureConfig.elements[this.elementName].attributes[this.props.attributeName].filling === "txt"
          } else {
            return structureConfig.elements[this.elementName].filling === "txt"
          }
        }

        if (style === "popupDetails") {
          return this.state.elementData.displayType === "popup"
        }

        if ((style === "separation" || style === "gutter")
          && structureConfig.root === this.elementName) {
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
          type: "enableParentChange",
          label: "Enable moving element between different parent elements"
        },
        {
          type: "enableCopying",
          label: "Enable making copies of element"
        },
        {
          type: "readOnly",
          label: "Disable editing of element"
        },
        {
          type: "hideElementName",
          label: "Hide element name in editor"
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
          type: "popupDetails",
          title: "Detail of popup info next to popup button",
          values: [
            {
              value: "all",
              label: "All info"
            },
            {
              value: "attributes",
              label: "Attributes"
            },
            {
              value: "elements",
              label: "Children elements"
            },
            {
              value: "self",
              label: "Own value"
            }

          ]
        },
        {
          type: "editorInputType",
          title: "Input type in editor",
          values: [
            {
              value: "text",
              label: "Text input"
            },
            {
              value: "textarea",
              label: "Textarea input"
            },
            {
              value: "number",
              label: "Number input"
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
          type: "colour",
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
      '<div class="display-styles"><div><h4 expr624="expr624"> </h4><div class="toggle-input"><label>Visibility</label><div class="switch"><label>\n            Off\n            <input expr625="expr625" id="shown" type="checkbox"/><span class="lever"></span>\n            On\n          </label></div></div><div expr626="expr626" class="toggle-input"></div></div><div class="break"></div><div expr629="expr629"></div></div>',
      [
        {
          redundantAttribute: 'expr624',
          selector: '[expr624]',

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
          redundantAttribute: 'expr625',
          selector: '[expr625]',

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
            '<label expr627="expr627"> </label><div class="switch"><label>\n            Off\n            <input expr628="expr628" type="checkbox"/><span class="lever"></span>\n            On\n          </label></div>',
            [
              {
                redundantAttribute: 'expr627',
                selector: '[expr627]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.setting.label
                  }
                ]
              },
              {
                redundantAttribute: 'expr628',
                selector: '[expr628]',

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

          redundantAttribute: 'expr626',
          selector: '[expr626]',
          itemName: 'setting',
          indexName: null,
          evaluate: _scope => _scope.possibleToggles
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.elementData.shown,
          redundantAttribute: 'expr629',
          selector: '[expr629]',

          template: template(
            '<div expr630="expr630" class="select-input"></div>',
            [
              {
                type: bindingTypes.EACH,
                getKey: null,
                condition: _scope => _scope.shouldRenderStyle(_scope.style.type),

                template: template(
                  '<label expr631="expr631"> </label><select expr632="expr632" required style="display: block"><option expr633="expr633" value>\n            Select option\n          </option><option expr634="expr634"></option></select>',
                  [
                    {
                      redundantAttribute: 'expr631',
                      selector: '[expr631]',

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
                      redundantAttribute: 'expr632',
                      selector: '[expr632]',

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
                      redundantAttribute: 'expr633',
                      selector: '[expr633]',

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

                      redundantAttribute: 'expr634',
                      selector: '[expr634]',
                      itemName: 'option',
                      indexName: null,
                      evaluate: _scope => _scope.style.values
                    }
                  ]
                ),

                redundantAttribute: 'expr630',
                selector: '[expr630]',
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

      state: {
         isLoading: true,
         isSaving: false,
         override: false,
         data: {}
      },

      elementName: null,
      attributeName: null,

      startOverride() {
         this.update({override: true});
      },

      stopOverride() {
         delete this.state.data._xsl;
         delete this.state.data._css;
         this.update({override: false});
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
         this.fillConfigForm();
      },

      onBeforeUpdate() {
         const xema = (this.dictData.dictConfigs || {}).xema;
         if (!xema || !xema.elements) return
         const roots = new Set(Object.keys(xema.elements));
         Object.values(xema.elements).forEach(el => el.children.forEach(c => roots.delete(c.name)));
         this.state.roots = [...roots].map(id => ({...xema.elements[id], id})); // add ID so tree renderer knows the id of every element
      },

      async fillConfigForm() {
         this.store.loadDictionaryConfig("xemplate")
            .done(response => {
               this.state.data = response.content;
               this.state.override = this.state.data._xsl || this.state.data._css;
            })
            .always(() => {
               this.update({isLoading: false});
               if (this.state.override) {
                  M.updateTextFields();
                  M.textareaAutoResize($('#editor_css'));
                  M.textareaAutoResize($('#editor_xsl'));
               }
            });
      },

      getConfigData() {
         var newData = {};
         if (this.state.data) {
            newData = this.state.data;
         }
         if (this.state.override) {
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
            let elementAttributes = this.state.data[elementName].attributes;
            if (elementAttributes) {
               if (elementAttributes[attributeName]) {
                  elementAttributes[attributeName][attribute] = value;
               } else {
                  elementAttributes[attributeName] = {[attribute]: value};
               }
            } else {
               this.state.data[elementName].attributes = {[attribute]: value};
            }
         } else {
            if (!this.state.data[elementName]) {
               this.state.data[elementName] = {};
            }
            this.state.data[elementName][attribute] = value;
         }
      },

      saveData() {
         this.update({isSaving: true});
         this.store.updateDictionaryConfig("xemplate", this.getConfigData())
            .always(() => this.update({isSaving: false}));
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<loading-overlay expr182="expr182"></loading-overlay><dict-nav expr183="expr183"></dict-nav><h1>Entry formatting</h1><div expr184="expr184"></div><div expr188="expr188"></div><dict-config-buttons expr194="expr194"></dict-config-buttons>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isLoading || _scope.state.isSaving,
          redundantAttribute: 'expr182',
          selector: '[expr182]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [["config", "Configure"], ["xemplate", "Entry formatting"]]
            }
          ],

          redundantAttribute: 'expr183',
          selector: '[expr183]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => (!_scope.state.data._xsl || _scope.state.data._xsl == "") && (!_scope.state.data._css || _scope.state.data._css == "") && !_scope.state.override,
          redundantAttribute: 'expr184',
          selector: '[expr184]',

          template: template(
            '<div style="display: flex"><div id="editor" class="designer" style="\n            flex-basis: 0;\n            width: auto;\n            position: static;\n            overflow: initial!important;\n            margin-right: 15px!important"><div class="list"><dict-config-element-in-tree expr185="expr185"></dict-config-element-in-tree></div></div><display-styles expr186="expr186" name="displayStylesComponent"></display-styles></div><div class="row"><div class="col s10"><button expr187="expr187" class="btn waves-effect waves-light">\n               Use your own stylesheet\n               <i class="material-icons right">edit</i></button></div></div>',
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
                          evaluate: _scope => _scope.dictData.dictConfigs.xema
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

                redundantAttribute: 'expr185',
                selector: '[expr185]',
                itemName: 'root',
                indexName: null,
                evaluate: _scope => _scope.state.roots
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.elementName,
                redundantAttribute: 'expr186',
                selector: '[expr186]',

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
                          evaluate: _scope => _scope.state.data[_scope.elementName]
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'configData',
                          evaluate: _scope => _scope.state.data
                        },
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'config',
                          evaluate: _scope => _scope.dictData.dictConfigs
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
                redundantAttribute: 'expr187',
                selector: '[expr187]',

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
          evaluate: _scope => (_scope.state.data._xsl && _scope.state.data._xsl != "") || (_scope.state.data._css && _scope.state.data._css != "") || _scope.state.override,
          redundantAttribute: 'expr188',
          selector: '[expr188]',

          template: template(
            '<div class="row"><div class="input-field col s10"><textarea expr189="expr189" id="editor_xsl" class="materialize-textarea"> </textarea><label for="editor_xsl">XSL</label><span class="helper-text">Custom XSL stylesheet. If you would like to see an example,\n               <a expr190="expr190">click here to load a sample XSL</a>.\n            </span></div></div><div class="row"><div class="input-field col s10"><textarea expr191="expr191" id="editor_css" class="materialize-textarea"> </textarea><label for="editor_css">CSS</label><span class="helper-text">Custom CSS stylesheet. If you would like to see an example,\n               <a expr192="expr192">click here to load a sample CSS</a>.\n            </span></div></div><div class="row"><div class="col s10"><button expr193="expr193" class="btn waves-effect waves-light">\n               Stop using your own stylesheet\n               <i class="material-icons right">edit</i></button></div></div>',
            [
              {
                redundantAttribute: 'expr189',
                selector: '[expr189]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.state.data._xsl
                  }
                ]
              },
              {
                redundantAttribute: 'expr190',
                selector: '[expr190]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.exampleXsl
                  }
                ]
              },
              {
                redundantAttribute: 'expr191',
                selector: '[expr191]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.state.data._css
                  }
                ]
              },
              {
                redundantAttribute: 'expr192',
                selector: '[expr192]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.exampleCss
                  }
                ]
              },
              {
                redundantAttribute: 'expr193',
                selector: '[expr193]',

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
            }
          ],

          redundantAttribute: 'expr194',
          selector: '[expr194]'
        }
      ]
    ),

    name: 'dict-config-xemplate'
  };

  var dict_download = {
    css: null,

    exports: {
      onMounted() {
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
      '<dict-nav expr379="expr379"></dict-nav><h1>Download</h1><div class="input-field"><a expr380="expr380" class="waves-effect waves-light btn btn-primary download-link" target="_blank"><i class="material-icons left">file_download</i> </a></div><div><label><input type="checkbox" class="noAttributes" name="noAttributes"/><span>XML without Lexonomy attributes</span></label></div><small class="helper-text">\n      If you want to import the XML file back to Lexonomy, you need Lexonomy attributes.\n   </small>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [["download", "download"]]
            }
          ],

          redundantAttribute: 'expr379',
          selector: '[expr379]'
        },
        {
          redundantAttribute: 'expr380',
          selector: '[expr380]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 1,

              evaluate: _scope => [
                'Download ',
                _scope.dictData.dictId,
                '.xml'
              ].join(
                ''
              )
            },
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'href',

              evaluate: _scope => [
                window.API_URL,
                _scope.dictData.dictId,
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
    css: `dict-edit-entry .editorContainer,[is="dict-edit-entry"] .editorContainer{ position: relative; margin-bottom: 0; } dict-edit-entry .editorContainer #toolbar,[is="dict-edit-entry"] .editorContainer #toolbar{ box-shadow: none; border-bottom: 1px solid #d9d9d8; } dict-edit-entry .editorContainer #container,[is="dict-edit-entry"] .editorContainer #container{ z-index: 5; background-color: white; transition-delay: 1s; } dict-edit-entry .editorContainer #container #editor.laic,[is="dict-edit-entry"] .editorContainer #container #editor.laic{ padding-left: 30px; } dict-edit-entry .editorContainer #container .viewer,[is="dict-edit-entry"] .editorContainer #container .viewer{ padding: 0; } dict-edit-entry .editorContainer #history,[is="dict-edit-entry"] .editorContainer #history{ position: absolute; top: 45px; border-left: 1px solid #d9d9d8; background-color: #f2f2f2; } dict-edit-entry .xonomy div.modeSwitcher,[is="dict-edit-entry"] .xonomy div.modeSwitcher{ position: absolute; bottom: 26px; } dict-edit-entry #sourceCode,[is="dict-edit-entry"] #sourceCode{ position: absolute; top: 60px; left: 10px; right: 10px; bottom: 40px; } dict-edit-entry #sourceCode textarea,[is="dict-edit-entry"] #sourceCode textarea{ border: none; box-shadow: none; background-color: #f2f2f2; border-radius: 0; }`,

    exports: {
      bindings: [["store", "entryIdChanged", "onEntryIdChanged"]],
      graphicalEditorLoading: false,
      graphicalEditorLoaded: false,

      onEntryIdChanged() {
         this.initEditorIfNeeded();
         this.updateUrl();
         Screenful.Editor[this.dictData.mode](null, this.dictData.entryId);
      },

      initEditorIfNeeded() {
         if (this.dictData.dictId && this.dictData.config && !Screenful.Editor.editor) {
            Screenful.Editor.createUrl = `${window.API_URL}${this.dictData.dictId}/entrycreate.json`;
            Screenful.Editor.readUrl = `${window.API_URL}${this.dictData.dictId}/entryread.json`;
            Screenful.Editor.updateUrl = `${window.API_URL}${this.dictData.dictId}/entryupdate.json`;
            Screenful.Editor.deleteUrl = `${window.API_URL}${this.dictData.dictId}/entrydelete.json`;

            // global variables used by xonomy/screenfull
            var xema = this.dictData.config.xema;
            var xemplate = this.dictData.config.xemplate;
            kontext = this.dictData.config.kontext;
            kex = this.dictData.config.kex;
            subbing = this.dictData.config.subbing;
            xampl = this.dictData.config.xampl;
            thes = this.dictData.config.thes;
            collx = this.dictData.config.collx;
            defo = this.dictData.config.defo;
            titling = this.dictData.config.titling;
            flagging = this.dictData.config.flagging;
            linking = this.dictData.config.linking;
            editing = this.dictData.config.editing;
            gapi = this.dictData.config.gapi;
            dictId = this.dictData.dictId;
            userDicts = this.dictData.dictionaryList;
            ske_username = this.authData.ske_username;
            ske_apiKey = this.authData.ske_apiKey;

            var customizeEditor = "";
            var usingOwnEditor = false;
            if (editing._js) {
               try {
                  customizeEditor = new Function("return " + editing._js)();
                  usingOwnEditor = customizeEditor.editor && customizeEditor.harvester;
               } catch (e) {
                  M.toast({html: "Invalid custom editor code."});
               }
            }
            $("#editorStyle").html(editing._css ? `<style>${editing._css}</style>` : '');
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
                  Gmedia.addVoice(entry);
                  $(div).find("a.xref").on("click", function (e) {
                     var text = $(e.delegateTarget).attr("data-text");
                     window.parent.$("#searchbox").val(text);
                     window.parent.Screenful.Navigator.list();
                  });

               };
            }
            Screenful.Editor.editor = function (div, entry, uneditable) {
               uneditable = !this.dictData.userAccess.canEdit;
               Xonomy.lang = "en";
               Xonomy.baseUrl = window.API_URL;
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
                  var docSpec = Xematron.xema2docspec(xema, editing.xonomyTextEditor);
               }
               if (!newXml) {
                  newXml = Xematron.xema2xml(xema);
               }

               docSpec.allowModeSwitching = true;
               docSpec.onModeSwitch = function (mode) {
                  Cookies.set("xonomyMode_" + this.dictData.dictId, mode);
                  window.parent.$(".doctypes").removeClass("laic");
                  window.parent.$(".doctypes").removeClass("nerd");
                  window.parent.$(".doctypes").addClass(mode);
               }.bind(this);
               if (!uneditable) {
                  docSpec.allowLayby = true;
                  docSpec.laybyMessage = "This is your temporary lay-by for entry fragments. You can drag and drop XML elements here.";
               }

               if (editing["xonomyMode"] !== "graphical") {
                  Xonomy.setMode(Cookies.get("xonomyMode_" + this.dictData.dictId) || editing.xonomyMode);
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
                        return ret;
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
                  if (!Xonomy.keyNav) Xonomy.startKeyNav($("#container")[0], document.getElementById("container"));
                  Gmedia.addVoice();
               } else {
                  customizeEditor.editor(div, entry ? entry : {content: newXml, id: 0}, uneditable);
               }
            }.bind(this);
            Screenful.Editor.harvester = function (div) {
               if (!usingOwnEditor) {
                  if (editing["xonomyMode"] === "graphical") {
                     return window.harvestGraphicalEditorData()
                  }
                  return Xonomy.harvest();
               } else {
                  return customizeEditor.harvester(div);
               }
            };
            Screenful.Editor.allowSourceCode = true;
            Screenful.Editor.formatSourceCode = Screenful.formatXml;
            Screenful.Editor.validateSourceCode = Screenful.isWellFormedXml;
            Screenful.Editor.cleanupSourceCode = Screenful.cleanupXml;

            // history
            Screenful.History.historyUrl = window.API_URL + this.dictData.dictId + "/history.json";
            Screenful.History.isDeletion = revision => revision.action == "delete" || revision.action == "purge";
            Screenful.History.getRevisionID = revision => revision.revision_id;
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
               return content;
            };
            Screenful.History.fakeEntry = function (revision) {
               return {id: revision.entry_id, content: revision.content, contentHtml: revision.contentHtml};
            };
            Screenful.Editor.onListChange = this.onListChange;
            Screenful.Editor.onEntryIdChange = this.onEntryIdChange;
            Screenful.Editor.onModeChange = this.onModeChange;

            Screenful.Editor.populateToolbar();
            Screenful.Editor.updateToolbar();
            Screenful.status(Screenful.Loc.ready);

            if (this.dictData.entryId) {
               Screenful.Editor[this.dictData.mode](null, this.dictData.entryId);
            }
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
         // if (!this.graphicalEditorLoaded) {
         //    if (this.graphicalEditorLoading) {
         //       setTimeout(() => {
         //          this.openGraphicalEditor(entry)
               // }, 500)
            // } else {
            //    this.loadGraphicalEditorDevServer()
            // }
         // } else {
            // console.log(this.dictData)
            window.entryData = {
               entryId: this.dictData.entryId,
               dictId: this.dictData.dictId,
               dictConfigs: this.dictData.dictConfigs,
               userAccess: this.dictData.userAccess,
               userInfo: this.dictData.userInfo,
               content: entry || ""
            };
            window.mountGraphicalEditor();
         // }
      },

      onAlertCloseClick() {
         $(".alertmessage").hide();
      },

      onListChange() {
         this.store.loadEntryList();
      },

      onEntryIdChange(entryId) {
         this.dictData.entryId = entryId;
         this.updateUrl();
      },

      onModeChange(mode) {
         this.dictData.mode = mode;
         this.updateUrl();
      },

      updateUrl() {
         let newUrl = `${window.location.href.split("#")[0]}#/${this.dictData.dictId}/edit/${this.dictData.doctype}/${this.dictData.entryId}/${this.dictData.mode}${url.stringifyQuery(route.query())}`;
         if (newUrl != window.location.href) {
            history.pushState(null, null, newUrl);
         }
      },

      onMounted() {
         // this.loadGraphicalEditorDevServer()
         this.initEditorIfNeeded();
      },

      onUpdated() {
         this.initEditorIfNeeded();
      },

      onBeforeUnmount() {
         Screenful.Editor.editor = null;
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div class="row editorContainer"><div class="xonomy-envelope"><div id="toolbar" class="buttons"></div><div id="container" class="empty"></div><div id="history" style="display: none"></div><div id="waiter" style="display: none"></div><div id="statusbar"><div class="alertmessage yellow"><span class="text">(ALERT)</span><span class="right clickable closeIcon"><i expr237="expr237" class="material-icons">close</i></span></div><span class="statusmessage"></span></div></div><div id="editorStyle"></div></div>',
      [
        {
          redundantAttribute: 'expr237',
          selector: '[expr237]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onClick',
              evaluate: _scope => _scope.onAlertCloseClick
            }
          ]
        }
      ]
    ),

    name: 'dict-edit-entry'
  };

  var dict_edit = {
    css: `dict-edit #dictEditContainer,[is="dict-edit"] #dictEditContainer{ display: flex; } dict-edit .totalEntries,[is="dict-edit"] .totalEntries{ font-size: 0.85rem; color: #b8b8b8; margin-left: 1.3rem; text-transform: none; } dict-edit ul.select-dropdown,[is="dict-edit"] ul.select-dropdown,dict-edit ul.dropdown-content,[is="dict-edit"] ul.dropdown-content{ width: 200% !important; } dict-edit li > span,[is="dict-edit"] li > span{ white-space: nowrap; } dict-edit .resizeHandle,[is="dict-edit"] .resizeHandle{ cursor: ew-resize; width: 5px; min-height: 100%; background-color: whitesmoke; margin: 0 10px; } dict-edit .resizeHandle:hover,[is="dict-edit"] .resizeHandle:hover{ background-color: #cfcfcf; } dict-edit .entry-list,[is="dict-edit"] .entry-list{ max-height: 80vh; overflow-y: auto; } dict-edit .dictLeftCol,[is="dict-edit"] .dictLeftCol{ min-width: 200px; min-height: 50vh; position: relative; } dict-edit .dictRightCol,[is="dict-edit"] .dictRightCol{ min-width: 500px; flex: 1; } dict-edit .entriesCountInfo,[is="dict-edit"] .entriesCountInfo{ font-size: 0.85rem; color: #b8b8b8; } dict-edit .collection-item,[is="dict-edit"] .collection-item{ position: relative; display: flex; border-left: 5px solid white; padding-left: 0.2rem; } dict-edit .collection-item.selected,[is="dict-edit"] .collection-item.selected{ border-left-color: #000; } dict-edit .collection-item .headword-link,[is="dict-edit"] .collection-item .headword-link{ text-decoration: none; font-size: 1.2rem; letter-spacing: 1px; margin-right: auto; } dict-edit .collection-item .flag,[is="dict-edit"] .collection-item .flag{ cursor: pointer; } dict-edit .collection-item .flagKey,[is="dict-edit"] .collection-item .flagKey{ font-family: monospace; } dict-edit .collection-item .badge,[is="dict-edit"] .collection-item .badge{ font-weight: bold; font-size: 1rem; color: #fff; white-space: nowrap; min-width: auto; border-radius: 2px; box-shadow: 0 2px 2px 0 rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 12%), 0 1px 5px 0 rgb(0 0 0 / 20%); } dict-edit .collection-item .noFlag,[is="dict-edit"] .collection-item .noFlag{ font-size: 1rem; color: grey; } dict-edit .collection-item.saving::before,[is="dict-edit"] .collection-item.saving::before{ content: ''; position: absolute; left: 0; right: 0; top: 0; bottom: 0; background-color: #ffffffe8; line-height: 100%; z-index: 500; } dict-edit .collection-item.saving::after,[is="dict-edit"] .collection-item.saving::after{ content: 'saving...'; position: absolute; transform: translateX(-50%) translateY(-50%); left: 50%; top: 50%; color: #6e6e6e; z-index: 501; font-size: 1.3rem; text-transform: uppercase; } dict-edit .collection-item.focused,[is="dict-edit"] .collection-item.focused{ background-color: #eceff1; } dict-edit .lineNum,[is="dict-edit"] .lineNum{ font-size: 0.8rem; color: #b8b8b8; margin-right: 10px; min-width: 30px; text-align: right; }`,

    exports: {
      bindings: [["store", "dictionaryListLoadingChanged", "update"],
                 ["store", "entryListChanged", "update"],
                 ["store", "entryListLoadingChanged", "update"],
                 ["store", "entryIdChanged", "update"]],

      state: {
         focused: false,
         size: 10,
         mousePos: null,
         cursorPosition: null
      },

      getFlagStyle(flag){
         let bgColor = this.store.getFlagColor(flag) || 'initial';
         let color = this.store.getFlagTextColor(bgColor);
         return `color: ${color}; background-color: ${bgColor}`
      },

      onHeadwordClick(entryId, evt){
         this.store.changeEntryId(entryId);
      },

      onHeadwordLinkClick(entryId, evt){
         evt.preventDefault();
         this.onDocumentClick(evt);
         this.store.changeEntryId(entryId);
      },

      onOpenFlagMenuClick(entry, evt){
         evt.stopPropagation();
         let id = "ts_" + Date.now() + Math.floor((Math.random() * 10000));
         // creating copy of list. Without copy, UL is moved as child of target node and after riot update is destroyed
         let menuNode = $(evt.target);//.closest(".collection-item")
         $("#flagDropdown").clone()
              .attr({id: id})
              .data("entryid", entry.id)
              .appendTo($("body"))
              .find("li").each(function(idx, elem){
                  $(elem).click(this.onFlagMenuItemClick.bind(this, entry.id, $(elem).data("flag")));

              }.bind(this));
          menuNode.attr("data-target", id)
              .dropdown({
                  constrainWidth: false,
                  coverTrigger: false,
                  container: $("body")
              })
              .dropdown("open");
      },

      onFlagMenuItemClick(entryId, flag, evt){
         this.store.setEntryFlag(entryId, flag);
      },

      onDocumentClick(evt){
         let entryList = $(".entry-list")[0];
         if(entryList && evt.target.parentNode){ // no parent -> probably detached element by comoponent update()
            let inComponent = entryList.contains(evt.target);
            if(inComponent || inComponent != this.state.focused){
               this.state.focused = inComponent;
               this.state.cursorPosition = inComponent ? $(evt.target).closest(".collection-item").data("idx") + 1 : null;
               this.updateCursor();
            }
         }
      },

      onDocumentKeyDown(evt){
         if([38, 40, 33, 34, 13].includes(evt.keyCode)){
            evt.preventDefault();
            if(evt.keyCode == 38){
             this.moveCursorUp(1);
            } else if(evt.keyCode == 40){
                this.moveCursorDown(1);
            } else if(evt.keyCode == 33){
                this.moveCursorUp(this.state.size); //pgUp
            } else if(evt.keyCode == 34){
                this.moveCursorDown(this.state.size); // pgDown
            } else if(evt.keyCode == 13){
               if(this.state.cursorPosition){
                  let entry = this.dictData.entryList[this.state.cursorPosition - 1];
                  if(entry){
                     this.store.changeEntryId(entry.id);
                     this.updateCursor();
                  }
               }
            }
         } else if(this.dictData.config.flagging.flags.length && this.state.cursorPosition){
            if(evt.keyCode == 46){
               this.store.setEntryFlag(this.dictData.entryList[this.state.cursorPosition - 1].id, '');
            } else if(this.dictData.config.flagging.flags.map(f => f.key).includes(evt.key)){
               let flag = this.dictData.config.flagging.flags.find(f => f.key == evt.key);
               if(flag){
                  this.store.setEntryFlag(this.dictData.entryList[this.state.cursorPosition - 1].id, flag.name);
               }
            }
         }
      },

      onResizeHandleMouseDown(evt){
         this.state.mousePos = evt.x;
         document.addEventListener("mouseup", this.onDocumentMouseUp, false);
         document.addEventListener("mousemove", this.resizeColumn, false);
         $("body").css("user-select", "none");
      },

      onDocumentMouseUp(){
         document.removeEventListener("mousemove", this.resizeColumn, false);
         document.removeEventListener("mouseup", this.onDocumentMouseUp, false);
         $("body").css("user-select", "");
      },

      doChangeDoctype(newdoctype) {
         if (newdoctype != this.dictData.doctype) {
            this.dictData.doctype = newdoctype;
            this.dictData.searchtext = "";
            this.dictData.modifier = "start";
            route(this.dictData.dictId + "/edit/" + newdoctype);
            this.store.loadEntryList()
               .done(() => {
                  if(this.dictData.entryList.length){
                     this.store.changeEntryId(this.dictData.entryList[0].id);
                  } else {
                     $("#container").html("").addClass("empty");
                     Screenful.Editor.updateToolbar();
                  }
               });
            this.update();
         }
      },

      moveCursorDown(step){
         if(!this.state.cursorPosition){
            this.state.cursorPosition = 1;
         } else {
            this.state.cursorPosition = Math.min(this.state.cursorPosition + (step || 1), this.dictData.entryList.length);
         }
         this.updateCursor();
      },

      moveCursorUp(step){
         if(!this.state.cursorPosition){
           this.state.cursorPosition = this.dictData.entryList.length - 1;
         } else {
            this.state.cursorPosition = Math.max(1,  this.state.cursorPosition - (step || 1));
         }
         this.updateCursor();
      },

      updateCursor(){
         $(".collection-item.focused", this.root).removeClass("focused");
         if(this.state.cursorPosition){
            const node = $(".collection-item:nth-child(" + this.state.cursorPosition + ")");
            $(node).addClass("focused");
            if(node){
               this.scrollSelectedIntoView();
            }
         }
      },

      scrollSelectedIntoView(){
         let list = $(".entry-list")[0];
         if(!list){
            return
         }
         let selectedItem = $(".entry-list .focused")[0];
         if(selectedItem){
            let offsetTop = selectedItem.offsetTop;
            let rowHeight = selectedItem.clientHeight;
            let min = list.scrollTop;
            let max = list.scrollTop + list.clientHeight - rowHeight;
            if(offsetTop < min){
               list.scrollTop = offsetTop;
            } else if(offsetTop > max){
               list.scrollTop = offsetTop - list.clientHeight + rowHeight;
            }
         }
      },

      resizeColumn(evt){
         const distance = evt.x - this.state.mousePos;
         this.state.mousePos = evt.x;
         let leftColWidth = $(".dictLeftCol").width();
         $(".dictLeftCol").css("width", leftColWidth + distance + "px");
      },

      setCursorByEntryId(){
         if(this.dictData.entryId){
            let idx = this.dictData.entryList.findIndex(e => e.id == this.dictData.entryId);
            if(idx != -1){
               this.state.cursorPosition = idx + 1;
               this.updateCursor();
            }
         }
      },

      onMounted(){
         document.addEventListener('click', this.onDocumentClick);
         document.addEventListener('keydown', this.onDocumentKeyDown);
         if(this.dictData.isEntryListLoaded){
            this.setCursorByEntryId();
         } else {
            this.store.one("entryListChanged", this.setCursorByEntryId.bind(this));
         }
      },

      onBeforeUnmount(){
         document.removeEventListener('click', this.onDocumentClick);
         document.removeEventListener('keydown', this.onDocumentKeyDown);
      },

      onUpdated() {
         this.updateCursor();
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<loading-overlay expr261="expr261"></loading-overlay><dict-nav expr262="expr262"></dict-nav><h1 expr263="expr263" class="header"> <span expr264="expr264" class="totalEntries"></span></h1><template expr265="expr265"></template>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.dictData.isDictionaryListLoading || _scope.dictData.isDictionaryLoading,
          redundantAttribute: 'expr261',
          selector: '[expr261]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [["edit", "Edit"]]
            }
          ],

          redundantAttribute: 'expr262',
          selector: '[expr262]'
        },
        {
          redundantAttribute: 'expr263',
          selector: '[expr263]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: _scope => [
                _scope.dictData.title
              ].join(
                ''
              )
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.dictData.entryCount,
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

                    evaluate: _scope => [
                      'total ',
                      _scope.dictData.entryCount,
                      ' entries'
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
          evaluate: _scope => _scope.dictData.isDictionaryLoaded && !_scope.dictData.isDictionaryListLoading,
          redundantAttribute: 'expr265',
          selector: '[expr265]',

          template: template(
            '<div expr266="expr266" class="doctypes"></div><div id="dictEditContainer"><div expr269="expr269" class="dictLeftCol"><div expr270="expr270"></div><template expr272="expr272"></template></div><div expr286="expr286" class="resizeHandle"></div><div class="dictRightCol"><dict-edit-entry expr287="expr287"></dict-edit-entry></div></div>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.dictData.doctypes.length > 1,
                redundantAttribute: 'expr266',
                selector: '[expr266]',

                template: template(
                  '<ul class="tabs"><li expr267="expr267" class="tab col s2"></li></ul>',
                  [
                    {
                      type: bindingTypes.EACH,
                      getKey: null,
                      condition: null,

                      template: template(
                        '<a expr268="expr268"> </a>',
                        [
                          {
                            expressions: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'active',
                                evaluate: _scope => _scope.type == _scope.dictData.doctype
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr268',
                            selector: '[expr268]',

                            expressions: [
                              {
                                type: expressionTypes.TEXT,
                                childNodeIndex: 0,
                                evaluate: _scope => _scope.type
                              },
                              {
                                type: expressionTypes.EVENT,
                                name: 'onclick',
                                evaluate: _scope => _scope.doChangeDoctype.bind(_scope, _scope.type)
                              }
                            ]
                          }
                        ]
                      ),

                      redundantAttribute: 'expr267',
                      selector: '[expr267]',
                      itemName: 'type',
                      indexName: null,
                      evaluate: _scope => _scope.dictData.doctypes
                    }
                  ]
                )
              },
              {
                redundantAttribute: 'expr269',
                selector: '[expr269]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'style',

                    evaluate: _scope => [
                      'width: max(',
                      _scope.dictData.config.flagging.flags.length ? '25vw' : '20vw',
                      ', 250px);'
                    ].join(
                      ''
                    )
                  }
                ]
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.dictData.isEntryListLoading,
                redundantAttribute: 'expr270',
                selector: '[expr270]',

                template: template(
                  '<loading-overlay expr271="expr271"></loading-overlay>',
                  [
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'loading-overlay',
                      slots: [],
                      attributes: [],
                      redundantAttribute: 'expr271',
                      selector: '[expr271]'
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.dictData.isEntryListLoaded,
                redundantAttribute: 'expr272',
                selector: '[expr272]',

                template: template(
                  '<dict-entry-filter expr273="expr273"></dict-entry-filter><div expr274="expr274" class="entriesCountInfo"></div><div class="entry-list collection"><div expr275="expr275"></div><div expr280="expr280" style="padding-top: 10vh;"></div></div><ul expr281="expr281" id="flagDropdown" class="dropdown-content flagDropdown"></ul>',
                  [
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'dict-entry-filter',
                      slots: [],

                      attributes: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'search-func',
                          evaluate: _scope => _scope.store.searchEntryList.bind(_scope.store)
                        }
                      ],

                      redundantAttribute: 'expr273',
                      selector: '[expr273]'
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.dictData.entryCount > _scope.dictData.entryList.length,
                      redundantAttribute: 'expr274',
                      selector: '[expr274]',

                      template: template(
                        ' ',
                        [
                          {
                            expressions: [
                              {
                                type: expressionTypes.TEXT,
                                childNodeIndex: 0,

                                evaluate: _scope => [
                                  'Showing ',
                                  _scope.dictData.entryList.length,
                                  ' of ',
                                  _scope.dictData.entryCount,
                                  ' entries.'
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
                      type: bindingTypes.EACH,
                      getKey: null,
                      condition: null,

                      template: template(
                        '<span expr276="expr276" class="lineNum"> </span><a expr277="expr277"><raw-html expr278="expr278"></raw-html></a><span expr279="expr279"></span>',
                        [
                          {
                            expressions: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'data-idx',
                                evaluate: _scope => _scope.idx
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'class',

                                evaluate: _scope => [
                                  'collection-item ',
                                  _scope.entry.isSaving ? 'saving' : '',
                                  ' ',
                                  _scope.entry.id == _scope.dictData.entryId ? 'selected' : ''
                                ].join(
                                  ''
                                )
                              },
                              {
                                type: expressionTypes.EVENT,
                                name: 'onclick',
                                evaluate: _scope => _scope.onHeadwordClick.bind(_scope, _scope.entry.id)
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

                                evaluate: _scope => [
                                  _scope.idx + 1,
                                  '.'
                                ].join(
                                  ''
                                )
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr277',
                            selector: '[expr277]',

                            expressions: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'href',

                                evaluate: _scope => [
                                  '#',
                                  _scope.dictData.dictId,
                                  '/edit/',
                                  _scope.dictData.doctype,
                                  '/',
                                  _scope.entry.id,
                                  '/view'
                                ].join(
                                  ''
                                )
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'class',

                                evaluate: _scope => [
                                  'headword-link ',
                                  _scope.entry.id == _scope.dictData.entryId ? 'red-text' : ''
                                ].join(
                                  ''
                                )
                              },
                              {
                                type: expressionTypes.EVENT,
                                name: 'onclick',
                                evaluate: _scope => _scope.onHeadwordLinkClick.bind(_scope, _scope.entry.id)
                              }
                            ]
                          },
                          {
                            type: bindingTypes.TAG,
                            getComponent: getComponent,
                            evaluate: _scope => 'raw-html',
                            slots: [],

                            attributes: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'content',
                                evaluate: _scope => _scope.entry.title || "&nbsp;"
                              }
                            ],

                            redundantAttribute: 'expr278',
                            selector: '[expr278]'
                          },
                          {
                            type: bindingTypes.IF,
                            evaluate: _scope => _scope.dictData.config.flagging.flags.length,
                            redundantAttribute: 'expr279',
                            selector: '[expr279]',

                            template: template(
                              ' ',
                              [
                                {
                                  expressions: [
                                    {
                                      type: expressionTypes.TEXT,
                                      childNodeIndex: 0,

                                      evaluate: _scope => [
                                        _scope.store.getFlagLabel(_scope.entry.flag) || _scope.entry.flag || "No flag"
                                      ].join(
                                        ''
                                      )
                                    },
                                    {
                                      type: expressionTypes.EVENT,
                                      name: 'onclick',
                                      evaluate: _scope => _scope.onOpenFlagMenuClick.bind(_scope, _scope.entry)
                                    },
                                    {
                                      type: expressionTypes.ATTRIBUTE,
                                      name: 'class',

                                      evaluate: _scope => [
                                        'flag ',
                                        _scope.entry.flag ? 'badge' : 'noFlag'
                                      ].join(
                                        ''
                                      )
                                    },
                                    {
                                      type: expressionTypes.ATTRIBUTE,
                                      name: 'style',
                                      evaluate: _scope => _scope.getFlagStyle(_scope.entry.flag)
                                    }
                                  ]
                                }
                              ]
                            )
                          }
                        ]
                      ),

                      redundantAttribute: 'expr275',
                      selector: '[expr275]',
                      itemName: 'entry',
                      indexName: 'idx',
                      evaluate: _scope => _scope.dictData.entryList
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => !_scope.dictData.entryList.length && !_scope.dictData.isEntryListLoading,
                      redundantAttribute: 'expr280',
                      selector: '[expr280]',

                      template: template(
                        '<h2 class="grey-text center-align">No entries</h2>',
                        []
                      )
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.dictData.config.flagging.flags.length,
                      redundantAttribute: 'expr281',
                      selector: '[expr281]',

                      template: template(
                        '<li data-flag><i class="material-icons" style="color: grey">label_outline</i><div>no flag</div><div class="right flagKey">delete</div></li><li expr282="expr282"></li>',
                        [
                          {
                            type: bindingTypes.EACH,
                            getKey: null,
                            condition: null,

                            template: template(
                              '<i expr283="expr283" class="material-icons">label</i><div expr284="expr284"> </div><div expr285="expr285" class="right flagKey"> </div>',
                              [
                                {
                                  expressions: [
                                    {
                                      type: expressionTypes.ATTRIBUTE,
                                      name: 'data-flag',
                                      evaluate: _scope => _scope.flag.name
                                    }
                                  ]
                                },
                                {
                                  redundantAttribute: 'expr283',
                                  selector: '[expr283]',

                                  expressions: [
                                    {
                                      type: expressionTypes.ATTRIBUTE,
                                      name: 'style',

                                      evaluate: _scope => [
                                        'color: ',
                                        _scope.flag.color
                                      ].join(
                                        ''
                                      )
                                    }
                                  ]
                                },
                                {
                                  redundantAttribute: 'expr284',
                                  selector: '[expr284]',

                                  expressions: [
                                    {
                                      type: expressionTypes.TEXT,
                                      childNodeIndex: 0,
                                      evaluate: _scope => _scope.flag.label
                                    }
                                  ]
                                },
                                {
                                  redundantAttribute: 'expr285',
                                  selector: '[expr285]',

                                  expressions: [
                                    {
                                      type: expressionTypes.TEXT,
                                      childNodeIndex: 0,
                                      evaluate: _scope => _scope.flag.key
                                    }
                                  ]
                                }
                              ]
                            ),

                            redundantAttribute: 'expr282',
                            selector: '[expr282]',
                            itemName: 'flag',
                            indexName: null,
                            evaluate: _scope => _scope.dictData.config.flagging.flags
                          }
                        ]
                      )
                    }
                  ]
                )
              },
              {
                redundantAttribute: 'expr286',
                selector: '[expr286]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onmousedown',
                    evaluate: _scope => _scope.onResizeHandleMouseDown
                  }
                ]
              },
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'dict-edit-entry',
                slots: [],
                attributes: [],
                redundantAttribute: 'expr287',
                selector: '[expr287]'
              }
            ]
          )
        }
      ]
    ),

    name: 'dict-edit'
  };

  var dict_list = {
    css: `dict-list .searchBox,[is="dict-list"] .searchBox{ max-width: 200px; display: inline-block; margin: 0 15px 0 0; } dict-list .searchBox input,[is="dict-list"] .searchBox input{ padding-right: 27px; } dict-list .clearFilterIcon,[is="dict-list"] .clearFilterIcon{ position: absolute; right: 5px; top: 11px; } dict-list .dict-lang,[is="dict-list"] .dict-lang{ padding-left: 0.5em; } dict-list ul li,[is="dict-list"] ul li{ position: relative; } dict-list ul li:hover,[is="dict-list"] ul li:hover{ background-color: #f8f8f8f2!important; } dict-list ul li.selected,[is="dict-list"] ul li.selected{ background-color: #fffde7 !important; } dict-list .title,[is="dict-list"] .title{ padding-left: 35px; } dict-list .checkbox,[is="dict-list"] .checkbox{ display: inline-block; vertical-align: middle; position: absolute; left: 20px; } dict-list .checkbox span,[is="dict-list"] .checkbox span{ opacity: 0.2; } dict-list .checkbox:hover span,[is="dict-list"] .checkbox:hover span{ opacity: 1; } dict-list .checkbox input:checked + span,[is="dict-list"] .checkbox input:checked + span{ opacity: 1; } dict-list .deleteAllBox,[is="dict-list"] .deleteAllBox{ text-align: center; position: fixed; bottom: 0; left: 0; right: 0; padding: 20px; background-color: white; font-size: 1.2rem; z-index: 9999; } dict-list .deleteAllBox button,[is="dict-list"] .deleteAllBox button{ margin-left: 20px; }`,

    exports: {
      bindings: [["store", "dictionaryListChanged", "onDictionaryListLoadingChange"],
                 ["store", "dictionaryListLoadingChanged", "onDictionaryListLoadingChange"]],

      state: {
         isLoading: false,
         lastCheckedIdx: null,
         visibleDictionaries: [],
         selectedCount: 0,
         query: ""
      },

      onDictionaryListLoadingChange(){
         if(this.dictData.isDictionaryListLoaded){
            this.state.visibleDictionaries = this.dictData.dictionaryList;
         }
         this.update();
      },

      onSearchInput(evt){
         this.state.query = evt.target.value;
         this.filter();
      },

      onClearFilterClick(evt){
         if($('#searchBox').val()){
            $('#searchBox').val("");
            this.state.query = "";
            this.filter();
         }
      },

      onCheckboxClick(evt){
         let idx = $(evt.currentTarget).attr("idx");
         this.toggleLineSelection(idx, evt.shiftKey);
         this.state.lastCheckedIdx = idx;
      },

      toggleLineSelection(idx, shiftKey){
         let selected = $("#chb_" + idx).prop("checked");
         let fromIdx = shiftKey ? Math.min(idx, this.state.lastCheckedIdx) : idx;
         let toIdx = shiftKey ? Math.max(idx, this.state.lastCheckedIdx) : idx;
         for(let i = fromIdx; i <= toIdx; i++){
            this.state.visibleDictionaries[i].selected = selected;
         }
         this.update();
      },

      onDeleteSelectedClick(){
         if (confirm("Are you sure you want to delete selected dictionaries? You will not be able to undo this.")) {
            this.update({isLoading: true});
            let toDelete = this.state.visibleDictionaries.filter(dict => dict.selected).map(dict => dict.id);
            this.deleteNextSelected(toDelete);
         }
      },

      filter(){
         this.dictData.dictionaryList.forEach(c => {
            delete c.h_title;
         });
         this.state.visibleDictionaries = this.dictData.dictionaryList;
         if(this.state.query !== ""){
            let sortResult = FuzzySort.go(this.state.query, this.state.visibleDictionaries, {
               key: "id",
               keys: ["title"]
            });
            this.state.visibleDictionaries = sortResult.map(fs => {
               fs.obj.h_title = FuzzySort.highlight(fs[0], '<b class="red-text">', "</b>");
               fs.obj.score = fs.score;
               return fs.obj
            }).sort((a, b) => {

               return (a.score == b.score) ? a.title.localeCompare(b.title) : Math.sign(b.score - a.score)
            });
         }
         this.update();
         this.highlightOccurrences();
      },

      highlightOccurrences(){
         let el, row;
         this.state.visibleDictionaries.forEach((c, idx) => {
            row = this.$(`#r_${idx}`);
            if(row){
               el = this.$(`#t_${idx}`);
               el.innerHTML = c.h_title ? c.h_title : el.innerHTML.replace(/<b class="red-text">|<\/b>/g, '');
            }
         }, this);
      },

      deleteNextSelected(toDelete){
         if(toDelete.length){
            this.store.deleteDictionary(toDelete.pop())
                  .always(this.deleteNextSelected.bind(this, toDelete));
         } else {
            this.state.visibleDictionaries = this.dictData.dictionaryList;
            this.state.isLoading = false;
            this.filter();
         }
      },

      onDeselectAll(){
         this.state.visibleDictionaries.forEach(dict => {dict.selected = false;});
         this.update();
      },

      doEditDict(dictId) {
         route(dictId + "/edit");
      },

      doConfigDict(dictId) {
         route(dictId + "/config");
      },

      doCloneDict(dictId) {
         this.update({isLoading: true});
         this.store.cloneDictionary(dictId);
      },

      doDeleteDict(dictId) {
         var dictTitle = this.store.getDictionary(dictId).title;
         if (confirm("Are you sure you want to delete dictionary " + dictTitle + "? You will not be able to undo this.")) {
            this.update({isLoading: true});
            this.store.deleteDictionary(dictId)
                  .always(() => {this.update({isLoading: false});});
         }
      },

      onBeforeUpdate(){
         this.state.selectedCount = this.state.visibleDictionaries.filter(dict => dict.selected).length;
      },

      onBeforeMount() {
         if(this.dictData.isDictionaryListLoaded){
            this.state.visibleDictionaries = this.dictData.dictionaryList;
         }
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<loading-overlay expr238="expr238"></loading-overlay><template expr239="expr239"></template>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isLoading || _scope.dictData.isDictionaryListLoading,
          redundantAttribute: 'expr238',
          selector: '[expr238]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.dictData.isDictionaryListLoading,
          redundantAttribute: 'expr239',
          selector: '[expr239]',

          template: template(
            '<div expr240="expr240"></div><div expr260="expr260" class="grey-text center-align"></div>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.dictData.dictionaryList.length,
                redundantAttribute: 'expr240',
                selector: '[expr240]',

                template: template(
                  '<h1>Your dictionaries</h1><div style="display: flex; align-items: center; flex-wrap: wrap;"><span expr241="expr241" class="searchBox input-field"></span><span style="margin-left: auto;"><a href="#/make" class="btn waves-effect waves-light"><i class="material-icons left">add</i>\n                  create new dictionary\n               </a></span></div><ul expr244="expr244" class="collection"></ul><div expr255="expr255" class="center" style="margin: 10vh auto;"></div><div expr256="expr256" id="deleteAllBox" class="deleteAllBox z-depth-5"></div>',
                  [
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.dictData.dictionaryList.length,
                      redundantAttribute: 'expr241',
                      selector: '[expr241]',

                      template: template(
                        '<i class="material-icons prefix grey-text">search</i><input expr242="expr242" id="searchBox"/><i expr243="expr243" class="material-icons clearFilterIcon grey-text clickable">close</i>',
                        [
                          {
                            redundantAttribute: 'expr242',
                            selector: '[expr242]',

                            expressions: [
                              {
                                type: expressionTypes.EVENT,
                                name: 'oninput',
                                evaluate: _scope => _scope.onSearchInput
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr243',
                            selector: '[expr243]',

                            expressions: [
                              {
                                type: expressionTypes.EVENT,
                                name: 'onclick',
                                evaluate: _scope => _scope.onClearFilterClick
                              }
                            ]
                          }
                        ]
                      )
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.state.visibleDictionaries.length,
                      redundantAttribute: 'expr244',
                      selector: '[expr244]',

                      template: template(
                        '<li expr245="expr245"></li>',
                        [
                          {
                            type: bindingTypes.EACH,
                            getKey: _scope => _scope.dict.id,
                            condition: null,

                            template: template(
                              '<div><label expr246="expr246" class="checkbox"></label><a expr248="expr248" class="title"> </a><span expr249="expr249" class="dict-lang"></span><span expr250="expr250" class="dict-lang grey-text"> </span><a expr251="expr251" class="secondary-content clickable" title="delete dictionary"></a><a expr252="expr252" class="secondary-content clickable" title="clone dictionary"><i class="material-icons">content_copy</i></a><a expr253="expr253" class="secondary-content clickable" title="config dictionary"></a><a expr254="expr254" class="secondary-content clickable" title="edit dictionary"></a></div>',
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
                                    },
                                    {
                                      type: expressionTypes.ATTRIBUTE,
                                      name: 'class',

                                      evaluate: _scope => [
                                        'collection-item ',
                                        _scope.dict.selected ? 'selected' : ''
                                      ].join(
                                        ''
                                      )
                                    }
                                  ]
                                },
                                {
                                  type: bindingTypes.IF,
                                  evaluate: _scope => _scope.dict.currentUserCanDelete,
                                  redundantAttribute: 'expr246',
                                  selector: '[expr246]',

                                  template: template(
                                    '<input expr247="expr247" type="checkbox"/><span></span>',
                                    [
                                      {
                                        redundantAttribute: 'expr247',
                                        selector: '[expr247]',

                                        expressions: [
                                          {
                                            type: expressionTypes.ATTRIBUTE,
                                            name: 'id',

                                            evaluate: _scope => [
                                              'chb_',
                                              _scope.idx
                                            ].join(
                                              ''
                                            )
                                          },
                                          {
                                            type: expressionTypes.ATTRIBUTE,
                                            name: 'idx',
                                            evaluate: _scope => _scope.idx
                                          },
                                          {
                                            type: expressionTypes.ATTRIBUTE,
                                            name: 'checked',
                                            evaluate: _scope => _scope.dict.selected
                                          },
                                          {
                                            type: expressionTypes.EVENT,
                                            name: 'onclick',
                                            evaluate: _scope => _scope.onCheckboxClick
                                          }
                                        ]
                                      }
                                    ]
                                  )
                                },
                                {
                                  redundantAttribute: 'expr248',
                                  selector: '[expr248]',

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
                                  evaluate: _scope => _scope.dict.lang,
                                  redundantAttribute: 'expr249',
                                  selector: '[expr249]',

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
                                  redundantAttribute: 'expr250',
                                  selector: '[expr250]',

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
                                  redundantAttribute: 'expr251',
                                  selector: '[expr251]',

                                  template: template(
                                    '<i class="material-icons">delete</i>',
                                    [
                                      {
                                        expressions: [
                                          {
                                            type: expressionTypes.EVENT,
                                            name: 'onclick',
                                            evaluate: _scope => _scope.doDeleteDict.bind(_scope, _scope.dict.id)
                                          }
                                        ]
                                      }
                                    ]
                                  )
                                },
                                {
                                  redundantAttribute: 'expr252',
                                  selector: '[expr252]',

                                  expressions: [
                                    {
                                      type: expressionTypes.EVENT,
                                      name: 'onclick',
                                      evaluate: _scope => _scope.doCloneDict.bind(_scope, _scope.dict.id)
                                    }
                                  ]
                                },
                                {
                                  type: bindingTypes.IF,
                                  evaluate: _scope => _scope.dict.currentUserCanDelete,
                                  redundantAttribute: 'expr253',
                                  selector: '[expr253]',

                                  template: template(
                                    '<i class="material-icons">settings</i>',
                                    [
                                      {
                                        expressions: [
                                          {
                                            type: expressionTypes.EVENT,
                                            name: 'onclick',
                                            evaluate: _scope => _scope.doConfigDict.bind(_scope, _scope.dict.id)
                                          }
                                        ]
                                      }
                                    ]
                                  )
                                },
                                {
                                  type: bindingTypes.IF,
                                  evaluate: _scope => _scope.dict.currentUserCanEdit,
                                  redundantAttribute: 'expr254',
                                  selector: '[expr254]',

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
                                            evaluate: _scope => _scope.doEditDict.bind(_scope, _scope.dict.id)
                                          }
                                        ]
                                      }
                                    ]
                                  )
                                }
                              ]
                            ),

                            redundantAttribute: 'expr245',
                            selector: '[expr245]',
                            itemName: 'dict',
                            indexName: 'idx',
                            evaluate: _scope => _scope.state.visibleDictionaries
                          }
                        ]
                      )
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => !_scope.state.visibleDictionaries.length,
                      redundantAttribute: 'expr255',
                      selector: '[expr255]',

                      template: template(
                        '<h1 class="grey-text lighten-2">Nothing found</h1>',
                        []
                      )
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.state.selectedCount,
                      redundantAttribute: 'expr256',
                      selector: '[expr256]',

                      template: template(
                        '<div expr257="expr257"> <button expr258="expr258" class="btn">\n                     delete\n                  </button><button expr259="expr259" class="btn btn-secondary">\n                     cancel\n                  </button></div>',
                        [
                          {
                            redundantAttribute: 'expr257',
                            selector: '[expr257]',

                            expressions: [
                              {
                                type: expressionTypes.TEXT,
                                childNodeIndex: 0,

                                evaluate: _scope => [
                                  'Delete selected dictionaries (',
                                  _scope.state.selectedCount,
                                  ')?'
                                ].join(
                                  ''
                                )
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr258',
                            selector: '[expr258]',

                            expressions: [
                              {
                                type: expressionTypes.EVENT,
                                name: 'onclick',
                                evaluate: _scope => _scope.onDeleteSelectedClick
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr259',
                            selector: '[expr259]',

                            expressions: [
                              {
                                type: expressionTypes.EVENT,
                                name: 'onclick',
                                evaluate: _scope => _scope.onDeselectAll
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
                evaluate: _scope => !_scope.dictData.dictionaryList.length,
                redundantAttribute: 'expr260',
                selector: '[expr260]',

                template: template(
                  '<h1>no dictionaries</h1><div>\n            You have no dictionary yet. Create one using button below.\n         </div><br/><a href="#/make" class="btn waves-effect waves-light"><i class="material-icons left">add</i>\n            create new dictionary\n         </a>',
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

  var dict_new = {
    css: null,

    exports: {
      state: {
         isLoading: true,
         errorMessage: '',
         url: '',
         baseUrl: 'https://www.lexonomy.eu/'
      },

      onMounted() {
         this.store.suggestUrl()
               .done(response => {
                  this.update({
                     isLoading: false,
                     url: response.suggested,
                     baseUrl: response.baseUrl
                  });
                  M.updateTextFields();
                  $('select').formSelect();
               });
      },

      doMake(event) {
         let title = $('#title').val();
         if(title){
            this.update({isLoading: true});
            this.store.createDictionary({
               url: $('#url').val(),
               template: $('#template').val(),
               title: title
            })
                  .done(response => {
                     if (response.success) {
                        route('/' + response.url);
                     } else {
                        this.state.errorMessage = 'Selected URL is already taken.';
                     }
                  })
                  .always(this.update.bind(this, {isLoading: false}));
         }
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<loading-overlay expr288="expr288"></loading-overlay><h1>\n      New dictionary\n   </h1><div class="row"><div class="input-field"><input id="title" type="text" class="validate inlineBlock" required style="max-width: 300px;"/><label for="title">Title</label><span class="helper-text">Enter a human-readable title such as "My Esperanto Dictionary". You will be able to change this later.</span></div></div><div><label for="url">URL</label></div><div class="row"><div style="display: flex; align-items: baseline;"><span expr289="expr289" class="grey-text"> </span><span class="input-field" style="margin-top: 0;"><input expr290="expr290" id="url" type="text" class="validate inlineBlock" required minlength="5" pattern="[a-zA-Z0-9\\-_]*" style="max-width: 300px;"/><span class="helper-text">This will be your dictionary\'s address on the web. You will be able to change this later. Allowed:  letters, numbers, - and _</span></span></div></div><div></div><div class="input-field"><div style="max-width: 300px;"><select id="template"><option value="blank">(none)</option><option value="smd">Simple Monolingual Dictionary</option><option value="sbd">Simple Bilingual Dictionary</option></select></div><label>Template</label><span class="helper-text">You can choose a template here to start you off. Each template comes with a few sample entries. You will be able to change or delete those and to customize the template.</span></div><div expr291="expr291" class="section"></div><div class="buttons"><button expr293="expr293" class="btn waves-effect waves-light" name="makeDict" id="makeButton">Create dictionary\n         <i class="material-icons left">add</i></button><a href="#" class="btn btn-flat">cancel</a></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isLoading,
          redundantAttribute: 'expr288',
          selector: '[expr288]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          redundantAttribute: 'expr289',
          selector: '[expr289]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.state.baseUrl
            }
          ]
        },
        {
          redundantAttribute: 'expr290',
          selector: '[expr290]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.state.url
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.errorMessage != '',
          redundantAttribute: 'expr291',
          selector: '[expr291]',

          template: template(
            '<div expr292="expr292" class="message messageError"> </div>',
            [
              {
                redundantAttribute: 'expr292',
                selector: '[expr292]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,

                    evaluate: _scope => [
                      _scope.state.errorMessage
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
          redundantAttribute: 'expr293',
          selector: '[expr293]',

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
    css: `dict-public-entry .infoIcon,[is="dict-public-entry"] .infoIcon{ margin-left: 1.5rem; } dict-public-entry .infoIcon a,[is="dict-public-entry"] .infoIcon a{ font-size: 1.8rem; } dict-public-entry .leftCol,[is="dict-public-entry"] .leftCol{ position: relative; display: block; min-height: calc(100vh - 260px); } dict-public-entry .entry-list,[is="dict-public-entry"] .entry-list{ max-height: 80vh; overflow-y: auto; } dict-public-entry .collection-item,[is="dict-public-entry"] .collection-item{ position: relative; display: flex; border-left: 5px solid white; padding-left: 0.2rem; } dict-public-entry .collection-item .headword-link,[is="dict-public-entry"] .collection-item .headword-link{ text-decoration: none; font-size: 1.2rem; letter-spacing: 1px; margin-right: auto; } dict-public-entry .collection-item.selected,[is="dict-public-entry"] .collection-item.selected{ border-left-color: #000; } dict-public-entry .collection-item.focused,[is="dict-public-entry"] .collection-item.focused{ background-color: #eceff1; } dict-public-entry .lineNum,[is="dict-public-entry"] .lineNum{ font-size: 0.8rem; color: #b8b8b8; margin-right: 10px; min-width: 30px; text-align: right; } dict-public-entry .noEntries,[is="dict-public-entry"] .noEntries{ padding-top: 10vh; }`,

    exports: {
      bindings: [["store", "entryIdChanged", "entryIdChanged"],
                 ["store", "isDictionaryLoadingChanged", "update"],
                 ["store", "entryListLoadingChanged", "update"],
                 ["store", "isEntryLoadingChanged", "update"]],

      entryIdChanged(){
         this.store.loadEntry();
      },

      onMounted(){
         if (this.dictData.dictId && !this.dictData.isEntryLoading) {
            this.store.loadEntry();
         }
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<loading-overlay expr320="expr320"></loading-overlay><dict-nav expr321="expr321"></dict-nav><h1 expr322="expr322" class="header"></h1><template expr323="expr323"></template>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.dictData.isDictionaryLoading || (_scope.dictData.isEntryListLoading && !_scope.dictData.isEntryListLoaded),
          redundantAttribute: 'expr320',
          selector: '[expr320]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [[_scope.dictData.entryId, "View"]]
            }
          ],

          redundantAttribute: 'expr321',
          selector: '[expr321]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.dictData.title,
          redundantAttribute: 'expr322',
          selector: '[expr322]',

          template: template(
            ' ',
            [
              {
                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,

                    evaluate: _scope => [
                      _scope.dictData.title
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
          evaluate: _scope => _scope.dictData.public && _scope.dictData.isEntryListLoaded,
          redundantAttribute: 'expr323',
          selector: '[expr323]',

          template: template(
            '<div class="row"><div class="col s4 leftCol"><loading-overlay expr324="expr324"></loading-overlay><template expr325="expr325"></template></div><div class="col s8"><div class="divider"></div><entry-view expr333="expr333"></entry-view></div></div><div class="divider"></div><div expr334="expr334" class="section"> </div>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.dictData.isEntryListLoading && _scope.dictData.isEntryListLoaded,
                redundantAttribute: 'expr324',
                selector: '[expr324]',

                template: template(
                  null,
                  [
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'loading-overlay',
                      slots: [],
                      attributes: []
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.dictData.isEntryListLoaded,
                redundantAttribute: 'expr325',
                selector: '[expr325]',

                template: template(
                  '<dict-entry-filter expr326="expr326"></dict-entry-filter><div expr327="expr327" class="entriesCountInfo"></div><div class="entry-list collection"><div expr328="expr328"></div><div expr332="expr332" class="noEntries"></div></div>',
                  [
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'dict-entry-filter',
                      slots: [],

                      attributes: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'search-func',
                          evaluate: _scope => _scope.store.searchEntryList.bind(_scope.store)
                        }
                      ],

                      redundantAttribute: 'expr326',
                      selector: '[expr326]'
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.dictData.openEntryCount > _scope.dictData.entryList.length,
                      redundantAttribute: 'expr327',
                      selector: '[expr327]',

                      template: template(
                        ' ',
                        [
                          {
                            expressions: [
                              {
                                type: expressionTypes.TEXT,
                                childNodeIndex: 0,

                                evaluate: _scope => [
                                  'Showing ',
                                  _scope.dictData.entryList.length,
                                  ' of ',
                                  _scope.dictData.openEntryCount,
                                  ' entries.'
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
                      type: bindingTypes.EACH,
                      getKey: null,
                      condition: null,

                      template: template(
                        '<span expr329="expr329" class="lineNum"> </span><a expr330="expr330"><raw-html expr331="expr331"></raw-html></a>',
                        [
                          {
                            expressions: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'class',

                                evaluate: _scope => [
                                  'collection-item ',
                                  _scope.entry.id == _scope.dictData.entryId ? 'selected' : ''
                                ].join(
                                  ''
                                )
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr329',
                            selector: '[expr329]',

                            expressions: [
                              {
                                type: expressionTypes.TEXT,
                                childNodeIndex: 0,

                                evaluate: _scope => [
                                  _scope.idx + 1,
                                  '.'
                                ].join(
                                  ''
                                )
                              }
                            ]
                          },
                          {
                            redundantAttribute: 'expr330',
                            selector: '[expr330]',

                            expressions: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'href',

                                evaluate: _scope => [
                                  '#/',
                                  _scope.dictData.dictId,
                                  '/',
                                  _scope.entry.id
                                ].join(
                                  ''
                                )
                              },
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'class',

                                evaluate: _scope => [
                                  'headword-link ',
                                  _scope.entry.id == _scope.dictData.entryId ? 'red-text' : ''
                                ].join(
                                  ''
                                )
                              }
                            ]
                          },
                          {
                            type: bindingTypes.TAG,
                            getComponent: getComponent,
                            evaluate: _scope => 'raw-html',
                            slots: [],

                            attributes: [
                              {
                                type: expressionTypes.ATTRIBUTE,
                                name: 'content',
                                evaluate: _scope => _scope.entry.title || "&nbsp;"
                              }
                            ],

                            redundantAttribute: 'expr331',
                            selector: '[expr331]'
                          }
                        ]
                      ),

                      redundantAttribute: 'expr328',
                      selector: '[expr328]',
                      itemName: 'entry',
                      indexName: 'idx',
                      evaluate: _scope => _scope.dictData.entryList
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.dictData.entryList && !_scope.dictData.entryList.length,
                      redundantAttribute: 'expr332',
                      selector: '[expr332]',

                      template: template(
                        '<h2 class="grey-text center-align">No entries</h2>',
                        []
                      )
                    }
                  ]
                )
              },
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'entry-view',
                slots: [],
                attributes: [],
                redundantAttribute: 'expr333',
                selector: '[expr333]'
              },
              {
                redundantAttribute: 'expr334',
                selector: '[expr334]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,

                    evaluate: _scope => [
                      _scope.dictData.licence
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
    css: `dict-public .dictBtns,[is="dict-public"] .dictBtns{ margin-top: 5px; } dict-public .firstRowContainer,[is="dict-public"] .firstRowContainer{ display: flex; } dict-public .sectionDivider,[is="dict-public"] .sectionDivider{ width: 1px; border-left: 1px solid #e0e0e0; padding-left: 30px; margin-left: 30px; } dict-public .firstRowCol,[is="dict-public"] .firstRowCol{ flex: 1; padding-bottom: 30px; } dict-public .description,[is="dict-public"] .description{ word-break: break-word; } dict-public dict-entry-filter,[is="dict-public"] dict-entry-filter{ max-width: 500px; } dict-public .searchResult,[is="dict-public"] .searchResult{ min-height: max(15vh, 200px); } dict-public .searchResultNote,[is="dict-public"] .searchResultNote{ font-size: 0.8rem; margin-left: 10px; } dict-public .noEntries,[is="dict-public"] .noEntries{ padding-top: 30px; } dict-public .entry-list li,[is="dict-public"] .entry-list li{ display: inline-block; padding: 3px 10px; } dict-public .entry-list li a:hover,[is="dict-public"] .entry-list li a:hover{ text-decoration: underline; } dict-public .refreshExamplesBtn,[is="dict-public"] .refreshExamplesBtn{ margin-top: 15px; } dict-public .loadingExamples,[is="dict-public"] .loadingExamples{ min-height: 20px; margin: 15px 10px; } dict-public .licence,[is="dict-public"] .licence{ opacity: .5; }`,

    exports: {
      bindings: [["store", "dictionaryChanged", "onDictionaryChanged"],
                 ["store", "isDictionaryExamplesLoading", "update"]],

      state: {
         isEntryListLoading: false,
         showFoundEntries: false
      },

      reloadDictionaryExamples(){
         if(this.dictData.public || this.authData.authorized){
            this.store.reloadDictionaryExamples();
         }
      },

      search(){
         this.update({isEntryListLoading: true});
         this.store.loadEntryList(20)
               .done(() =>{
                  this.state.showFoundEntries = true;
               })
               .always(() => {
                  this.update({isEntryListLoading: false});
               });
      },

      onReloadExamplesClick(){
         this.reloadDictionaryExamples();
         this.update();
      },

      onDictionaryChanged(){
         this.reloadDictionaryExamples();
      },

      onCloseSearchResultClick(){
         this.update({showFoundEntries: false});
      },

      getEntryUrl(entry){
         if(this.dictData.userAccess && this.dictData.userAccess.canEdit){
            return `#/${this.dictData.dictId}/edit/${this.dictData.doctype}/${entry.id}/view`
         } else {
            return `#/${this.dictData.dictId}/${entry.id}`
         }
      },

      onUpdated(){
         // make all items in list same width to create columns
         [".entry-list li", ".random-entries li"].forEach(selector => {
            let maxWidth = 0;
            $(selector).each((i, e) => {maxWidth = Math.max(maxWidth, $(e).width());});
            $(selector).each((i, e) => {$(e).css("width", Math.min(300, maxWidth + 20) + "px");});
         });
      },

      onMounted(){
         this.dictData.searchtext = "";
         if(!this.dictData.dictionaryExamples && !this.dictData.isDictionaryExamplesLoading){
            this.reloadDictionaryExamples();
         }
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<dict-nav expr294="expr294"></dict-nav><loading-overlay expr295="expr295"></loading-overlay><template expr296="expr296"></template>',
      [
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],
          attributes: [],
          redundantAttribute: 'expr294',
          selector: '[expr294]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.dictData.isDictionaryLoading || _scope.state.isEntryListLoading,
          redundantAttribute: 'expr295',
          selector: '[expr295]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.dictData.isDictionaryLoading,
          redundantAttribute: 'expr296',
          selector: '[expr296]',

          template: template(
            '<h1 expr297="expr297" class="header"> <div class="dictBtns buttons"><a expr298="expr298" class="btn"></a><a expr299="expr299" class="btn"></a><a expr300="expr300" class="btn"></a><a expr301="expr301" class="btn"></a><a expr302="expr302" class="btn"></a></div></h1><div class="firstRowContainer"><div class="firstRowCol description"><h3>Description</h3><raw-html expr303="expr303"></raw-html></div><template expr304="expr304"></template></div><div expr313="expr313"></div>',
            [
              {
                redundantAttribute: 'expr297',
                selector: '[expr297]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,

                    evaluate: _scope => [
                      _scope.dictData.title
                    ].join(
                      ''
                    )
                  }
                ]
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.dictData.userAccess.canEdit,
                redundantAttribute: 'expr298',
                selector: '[expr298]',

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
                            _scope.dictData.dictId,
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
                evaluate: _scope => _scope.dictData.userAccess.canConfig,
                redundantAttribute: 'expr299',
                selector: '[expr299]',

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
                            _scope.dictData.dictId,
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
                evaluate: _scope => _scope.dictData.userAccess.canUpload,
                redundantAttribute: 'expr300',
                selector: '[expr300]',

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
                            _scope.dictData.dictId,
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
                evaluate: _scope => _scope.dictData.userAccess.canDownload,
                redundantAttribute: 'expr301',
                selector: '[expr301]',

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
                            _scope.dictData.dictId,
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
                evaluate: _scope => _scope.authData.authorized,
                redundantAttribute: 'expr302',
                selector: '[expr302]',

                template: template(
                  'links',
                  [
                    {
                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'href',

                          evaluate: _scope => [
                            '#/',
                            _scope.dictData.dictId,
                            '/links'
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
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'raw-html',
                slots: [],

                attributes: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'content',
                    evaluate: _scope => _scope.dictData.blurb
                  }
                ],

                redundantAttribute: 'expr303',
                selector: '[expr303]'
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.dictData.public || _scope.dictData.userAccess,
                redundantAttribute: 'expr304',
                selector: '[expr304]',

                template: template(
                  '<div class="sectionDivider"></div><div class="firstRowCol"><h3>Search</h3><dict-entry-filter expr305="expr305"></dict-entry-filter><div expr306="expr306" class="searchResult"></div></div>',
                  [
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'dict-entry-filter',
                      slots: [],

                      attributes: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'search-func',
                          evaluate: _scope => _scope.search
                        }
                      ],

                      redundantAttribute: 'expr305',
                      selector: '[expr305]'
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => !_scope.state.isEntryListLoading && _scope.state.showFoundEntries && _scope.dictData.entryList,
                      redundantAttribute: 'expr306',
                      selector: '[expr306]',

                      template: template(
                        '<ul expr307="expr307" class="entry-list found-entries"></ul><div expr311="expr311" class="serchResultNote grey-text"></div><div expr312="expr312" class="noEntries"></div>',
                        [
                          {
                            type: bindingTypes.IF,
                            evaluate: _scope => _scope.dictData.entryList.length,
                            redundantAttribute: 'expr307',
                            selector: '[expr307]',

                            template: template(
                              '<li expr308="expr308"></li>',
                              [
                                {
                                  type: bindingTypes.EACH,
                                  getKey: null,
                                  condition: null,

                                  template: template(
                                    '<a expr309="expr309"><raw-html expr310="expr310"></raw-html></a>',
                                    [
                                      {
                                        redundantAttribute: 'expr309',
                                        selector: '[expr309]',

                                        expressions: [
                                          {
                                            type: expressionTypes.ATTRIBUTE,
                                            name: 'href',
                                            evaluate: _scope => _scope.getEntryUrl(_scope.entry)
                                          }
                                        ]
                                      },
                                      {
                                        type: bindingTypes.TAG,
                                        getComponent: getComponent,
                                        evaluate: _scope => 'raw-html',
                                        slots: [],

                                        attributes: [
                                          {
                                            type: expressionTypes.ATTRIBUTE,
                                            name: 'content',
                                            evaluate: _scope => _scope.entry.title
                                          }
                                        ],

                                        redundantAttribute: 'expr310',
                                        selector: '[expr310]'
                                      }
                                    ]
                                  ),

                                  redundantAttribute: 'expr308',
                                  selector: '[expr308]',
                                  itemName: 'entry',
                                  indexName: null,
                                  evaluate: _scope => _scope.dictData.entryList
                                }
                              ]
                            )
                          },
                          {
                            type: bindingTypes.IF,
                            evaluate: _scope => _scope.dictData.entryCount > 20,
                            redundantAttribute: 'expr311',
                            selector: '[expr311]',

                            template: template(
                              ' ',
                              [
                                {
                                  expressions: [
                                    {
                                      type: expressionTypes.TEXT,
                                      childNodeIndex: 0,

                                      evaluate: _scope => [
                                        'Showing first 20 entries of ',
                                        _scope.dictData.entryCount,
                                        '.'
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
                            evaluate: _scope => !_scope.dictData.entryList.length,
                            redundantAttribute: 'expr312',
                            selector: '[expr312]',

                            template: template(
                              '<h2 class="grey-text center-align">No entries</h2>',
                              []
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
                evaluate: _scope => _scope.dictData.public,
                redundantAttribute: 'expr313',
                selector: '[expr313]',

                template: template(
                  '<div class="divider"></div><a expr314="expr314" class="refreshExamplesBtn btn btn-floating waves-effect waves-light right"></a><h3>Examples</h3><div expr315="expr315" class="loadingExamples grey-text"></div><ul expr316="expr316" class="entry-list random-entries"></ul><div class="divider"></div><div expr319="expr319" class="licence section right"> </div>',
                  [
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.dictData.dictionaryExamplesHasMore,
                      redundantAttribute: 'expr314',
                      selector: '[expr314]',

                      template: template(
                        '<i class="material-icons">refresh</i>',
                        [
                          {
                            expressions: [
                              {
                                type: expressionTypes.EVENT,
                                name: 'onclick',
                                evaluate: _scope => _scope.onReloadExamplesClick
                              }
                            ]
                          }
                        ]
                      )
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.dictData.isDictionaryExamplesLoading,
                      redundantAttribute: 'expr315',
                      selector: '[expr315]',

                      template: template(
                        '\n            Loading...\n         ',
                        []
                      )
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => !_scope.dictData.isDictionaryExamplesLoading && _scope.dictData.dictionaryExamples,
                      redundantAttribute: 'expr316',
                      selector: '[expr316]',

                      template: template(
                        '<li expr317="expr317"></li>',
                        [
                          {
                            type: bindingTypes.EACH,
                            getKey: null,
                            condition: null,

                            template: template(
                              '<a expr318="expr318"> </a>',
                              [
                                {
                                  redundantAttribute: 'expr318',
                                  selector: '[expr318]',

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
                                        _scope.dictData.dictId,
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

                            redundantAttribute: 'expr317',
                            selector: '[expr317]',
                            itemName: 'entry',
                            indexName: null,
                            evaluate: _scope => _scope.dictData.dictionaryExamples
                          }
                        ]
                      )
                    },
                    {
                      redundantAttribute: 'expr319',
                      selector: '[expr319]',

                      expressions: [
                        {
                          type: expressionTypes.TEXT,
                          childNodeIndex: 0,

                          evaluate: _scope => [
                            _scope.dictData.licence
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
        }
      ]
    ),

    name: 'dict-public'
  };

  var dict_upload = {
    css: null,

    exports: {
      state: {
         isUploading: false,
         isImporting: false,
         showProgress: false,
         errorMessage: "",
         infoMessage: ""
      },

      doUpload() {
         var fd = new FormData();
         var files = $('#file')[0].files[0];
         fd.append('myfile', files);
         if ($('#purge').is(':checked')) fd.append('purge', 'on');
         this.update({
            isUploading: true,
            errorMessage: "",
            infoMessage: "Upload started, please keep the window open."
         });
         this.store.uploadXML(fd)
               .done((response) => {
                     if (response.success) {
                        this.startImport(response.file, response.uploadStart);
                     } else {
                        this.update({infoMessage: 'Error while uploading file'});
                     }
                  })
               .always(() => {
                  this.update({isUploading: false});
               });
      },

      startImport(file, uploadStart) {
         if (file != '') {
            this.update({isImporting: true});
            this.store.importXML({
               filename: file,
               uploadStart: uploadStart
            })
                  .done(response => {
                     clearTimeout(this.state.timeutHandle);
                     this.state.infoMessage = response.progressMessage;
                     if (response.finished) {
                        this.state.isImporting = false;
                        this.state.infoMessage += ' Dictionary import finished. <a href="#/' + this.dictData.dictId + '">See dictionary</a>';
                     } else if (response.errors) {
                        this.state.infoMessage = 'There were some errors during XML parsing';
                        this.store.importXML({
                           filename: file,
                           uploadStart: uploadStart,
                           showErrors: true,
                           truncate: 10000
                        })
                              .done(response => {
                                 this.update({errorMessage: response.errorData});
                              });
                        this.state.isImporting = false;
                     } else {
                        this.state.timeutHandle = setTimeout(this.startImport.bind(this, file, uploadStart), 2000);
                     }
                     this.update();
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
      '<loading-overlay expr357="expr357"></loading-overlay><dict-nav expr358="expr358"></dict-nav><h1>Upload</h1><div class="file-field input-field buttons" style="max-width: 700px;"><div class="btn"><span>Choose XML file</span><input type="file" id="file"/></div><div class="file-path-wrapper"><input class="file-path validate" type="text"/></div><div><a expr359="expr359" id="startButton"><i class="material-icons left">file_upload</i>Upload file\n         </a></div></div><div><label><input type="checkbox" id="purge"/><span>Purge dictionary before upload</span></label></div><br/><br/><template expr360="expr360"></template>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isUploading,
          redundantAttribute: 'expr357',
          selector: '[expr357]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [["upload", "Upload"]]
            }
          ],

          redundantAttribute: 'expr358',
          selector: '[expr358]'
        },
        {
          redundantAttribute: 'expr359',
          selector: '[expr359]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'class',

              evaluate: _scope => [
                'waves-effect waves-light btn btn-primary ',
                _scope.state.isUploading || _scope.state.isImporting ? 'disabled' : ''
              ].join(
                ''
              )
            },
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.doUpload
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.infoMessage || _scope.state.errorMessage,
          redundantAttribute: 'expr360',
          selector: '[expr360]',

          template: template(
            '<h3>Progress</h3><div expr361="expr361" classs="message messageInfo"></div><div expr363="expr363" class="message messageError"></div>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.state.infoMessage,
                redundantAttribute: 'expr361',
                selector: '[expr361]',

                template: template(
                  '<raw-html expr362="expr362"></raw-html>',
                  [
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'raw-html',
                      slots: [],

                      attributes: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'content',
                          evaluate: _scope => _scope.state.infoMessage
                        }
                      ],

                      redundantAttribute: 'expr362',
                      selector: '[expr362]'
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.state.errorMessage,
                redundantAttribute: 'expr363',
                selector: '[expr363]',

                template: template(
                  '<raw-html expr364="expr364"></raw-html>',
                  [
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'raw-html',
                      slots: [],

                      attributes: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'content',
                          evaluate: _scope => _scope.state.errorMessage
                        }
                      ],

                      redundantAttribute: 'expr364',
                      selector: '[expr364]'
                    }
                  ]
                )
              }
            ]
          )
        }
      ]
    ),

    name: 'dict-upload'
  };

  var dict_links = {
    css: `dict-links .dictName,[is="dict-links"] .dictName{ border-bottom: 1px solid #d9d9d8; } dict-links .dictName i,[is="dict-links"] .dictName i{ margin-left: 10px; } dict-links .dictLinks,[is="dict-links"] .dictLinks{ display: flex; column-gap: 6vw; padding-left: 10px; } dict-links .arrowCell,[is="dict-links"] .arrowCell{ color: #cbcbcb ; padding: 0 20px; }`,

    exports: {
      state: {
         dictionaries: {},
         isLoading: true
      },

      processLinks(links, direction){
         links[direction].forEach(link => {
            let dictId = direction == "from" ? link.source_dict : link.target_dict;
            if(!this.state.dictionaries[dictId]){
               this.state.dictionaries[dictId] = {
                  dictId: dictId,
                  from: [],
                  to: []
               };
            }
            this.state.dictionaries[dictId][direction].push(link);
         });
      },

      openDictInfo(dict){
         $("#modalTitle").html(dict.title);
         $("#modalContent").html(dict.blurb);
         let instance = M.Modal.getInstance($("#modalDictionary"));
         instance.open();
      },

      checkAllLoaded(){
         let isLoading = Object.values(this.state.dictionaries).some(d => d.isLoading);
         if(!isLoading){
            this.update({isLoading: false});
         }
      },

      onMounted() {
         $('.modal').modal();
         this.state.dictionaries = {};
         this.store.loadDictionaryLinks()
               .done(response => {
                  this.processLinks(response.links, "to");
                  this.processLinks(response.links, "from");
                  for(let dictId in this.state.dictionaries){
                     if(dictId != this.dictData.dictId){
                        this.state.dictionaries[dictId].isLoading = true;
                        this.store.loadDictionary(dictId)
                              .done(function(dictId, response) {
                                 if(response.success){
                                    Object.assign(this.state.dictionaries[dictId], {
                                       title: response.publicInfo.title,
                                       blurb: response.publicInfo.blurb,
                                       isLoading: false
                                    });
                                 }
                              }.bind(this, dictId))
                              .always(this.checkAllLoaded.bind(this));
                     } else {
                        Object.assign(this.state.dictionaries[dictId], {
                           isLoading: false,
                           title: this.dictData.title,
                           blurb: this.dictData.blurb
                        });
                     }
                  }
                  this.checkAllLoaded();
               });
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<loading-overlay expr335="expr335"></loading-overlay><dict-nav expr336="expr336"></dict-nav><h1>Links</h1><template expr337="expr337"></template><div id="modalDictionary" class="modal"><div class="modal-content"><h2 id="modalTitle"></h2><div id="modalContent"></div></div><div class="modal-footer"><a class="btn modal-close waves-effect waves-green">Close</a></div></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isLoading,
          redundantAttribute: 'expr335',
          selector: '[expr335]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.TAG,
          getComponent: getComponent,
          evaluate: _scope => 'dict-nav',
          slots: [],

          attributes: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'links',
              evaluate: _scope => [["links", "links"]]
            }
          ],

          redundantAttribute: 'expr336',
          selector: '[expr336]'
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.state.isLoading,
          redundantAttribute: 'expr337',
          selector: '[expr337]',

          template: template(
            '<div expr338="expr338" class="grey-text"></div><div expr339="expr339"></div>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => !Object.values(_scope.state.dictionaries).length,
                redundantAttribute: 'expr338',
                selector: '[expr338]',

                template: template(
                  '<h2>No links</h2>',
                  []
                )
              },
              {
                type: bindingTypes.EACH,
                getKey: null,
                condition: null,

                template: template(
                  '<div><h2 expr340="expr340" class="dictName"> <i expr341="expr341" class="material-icons clickable"></i><a expr342="expr342" class="btn right">open</a></h2></div><div class="dictLinks"><div><h3 class="title">Outgoing links</h3><div expr343="expr343"></div><table expr344="expr344"></table></div><div><h3 class="title">Incoming links</h3><div expr350="expr350"></div><table expr351="expr351"></table></div></div>',
                  [
                    {
                      redundantAttribute: 'expr340',
                      selector: '[expr340]',

                      expressions: [
                        {
                          type: expressionTypes.TEXT,
                          childNodeIndex: 0,

                          evaluate: _scope => [
                            _scope.dict.title
                          ].join(
                            ''
                          )
                        }
                      ]
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.dict.blurb,
                      redundantAttribute: 'expr341',
                      selector: '[expr341]',

                      template: template(
                        '\n                  info_outline\n               ',
                        [
                          {
                            expressions: [
                              {
                                type: expressionTypes.EVENT,
                                name: 'onclick',
                                evaluate: _scope => _scope.openDictInfo.bind(_scope, _scope.dict)
                              }
                            ]
                          }
                        ]
                      )
                    },
                    {
                      redundantAttribute: 'expr342',
                      selector: '[expr342]',

                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'href',

                          evaluate: _scope => [
                            '#/',
                            _scope.dict.dictId
                          ].join(
                            ''
                          )
                        }
                      ]
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => !_scope.dict.to.length,
                      redundantAttribute: 'expr343',
                      selector: '[expr343]',

                      template: template(
                        '<h4 class="grey-text">No links</h4>',
                        []
                      )
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.dict.to.length,
                      redundantAttribute: 'expr344',
                      selector: '[expr344]',

                      template: template(
                        '<tr expr345="expr345"></tr>',
                        [
                          {
                            type: bindingTypes.EACH,
                            getKey: null,
                            condition: null,

                            template: template(
                              '<td><a expr346="expr346"> </a></td><td expr347="expr347" class="grey-text"> </td><td class="arrowCell"><i class="material-icons">arrow_forward</i></td><td><a expr348="expr348"> </a></td><td expr349="expr349" class="grey-text"> </td>',
                              [
                                {
                                  redundantAttribute: 'expr346',
                                  selector: '[expr346]',

                                  expressions: [
                                    {
                                      type: expressionTypes.TEXT,
                                      childNodeIndex: 0,

                                      evaluate: _scope => [
                                        _scope.link.source_hw || _scope.link.source_id
                                      ].join(
                                        ''
                                      )
                                    },
                                    {
                                      type: expressionTypes.ATTRIBUTE,
                                      name: 'href',

                                      evaluate: _scope => [
                                        '#/',
                                        _scope.dictData.dictId,
                                        '/edit/entry/view/',
                                        _scope.link.source_entry
                                      ].join(
                                        ''
                                      )
                                    }
                                  ]
                                },
                                {
                                  redundantAttribute: 'expr347',
                                  selector: '[expr347]',

                                  expressions: [
                                    {
                                      type: expressionTypes.TEXT,
                                      childNodeIndex: 0,

                                      evaluate: _scope => [
                                        _scope.link.source_hw ? ('(' + _scope.link.source_id + ')') : ''
                                      ].join(
                                        ''
                                      )
                                    }
                                  ]
                                },
                                {
                                  redundantAttribute: 'expr348',
                                  selector: '[expr348]',

                                  expressions: [
                                    {
                                      type: expressionTypes.TEXT,
                                      childNodeIndex: 0,

                                      evaluate: _scope => [
                                        _scope.link.target_hw || (_scope.link.target_el + ' ' + _scope.link.target_id)
                                      ].join(
                                        ''
                                      )
                                    },
                                    {
                                      type: expressionTypes.ATTRIBUTE,
                                      name: 'href',

                                      evaluate: _scope => [
                                        '#/',
                                        _scope.link.target_dict,
                                        '/edit/entry/view/',
                                        _scope.link.target_entry
                                      ].join(
                                        ''
                                      )
                                    }
                                  ]
                                },
                                {
                                  redundantAttribute: 'expr349',
                                  selector: '[expr349]',

                                  expressions: [
                                    {
                                      type: expressionTypes.TEXT,
                                      childNodeIndex: 0,

                                      evaluate: _scope => [
                                        _scope.link.target_hw ? (_scope.link.target_el + ' ' + _scope.link.target_id) : ''
                                      ].join(
                                        ''
                                      )
                                    }
                                  ]
                                }
                              ]
                            ),

                            redundantAttribute: 'expr345',
                            selector: '[expr345]',
                            itemName: 'link',
                            indexName: null,
                            evaluate: _scope => _scope.dict.to
                          }
                        ]
                      )
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => !_scope.dict.from.length,
                      redundantAttribute: 'expr350',
                      selector: '[expr350]',

                      template: template(
                        '<h4 class="grey-text">No links</h4>',
                        []
                      )
                    },
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.dict.from.length,
                      redundantAttribute: 'expr351',
                      selector: '[expr351]',

                      template: template(
                        '<tr expr352="expr352"></tr>',
                        [
                          {
                            type: bindingTypes.EACH,
                            getKey: null,
                            condition: null,

                            template: template(
                              '<td><a expr353="expr353"> </a></td><td expr354="expr354" class="grey-text"> </td><td style="padding: 0 20px;" class="grey-text"><i class="material-icons">arrow_forward</i></td><td><a expr355="expr355"> </a></td><td expr356="expr356" class="grey-text"> </td>',
                              [
                                {
                                  redundantAttribute: 'expr353',
                                  selector: '[expr353]',

                                  expressions: [
                                    {
                                      type: expressionTypes.TEXT,
                                      childNodeIndex: 0,

                                      evaluate: _scope => [
                                        _scope.link.source_hw || (_scope.link.source_el + ' ' + _scope.link.source_id)
                                      ].join(
                                        ''
                                      )
                                    },
                                    {
                                      type: expressionTypes.ATTRIBUTE,
                                      name: 'href',

                                      evaluate: _scope => [
                                        '#/',
                                        _scope.link.source_dict,
                                        '/edit/entry/view/',
                                        _scope.link.source_entry
                                      ].join(
                                        ''
                                      )
                                    }
                                  ]
                                },
                                {
                                  redundantAttribute: 'expr354',
                                  selector: '[expr354]',

                                  expressions: [
                                    {
                                      type: expressionTypes.TEXT,
                                      childNodeIndex: 0,

                                      evaluate: _scope => [
                                        _scope.link.source_hw ? (_scope.link.source_el + ' ' + _scope.link.source_id) : ''
                                      ].join(
                                        ''
                                      )
                                    }
                                  ]
                                },
                                {
                                  redundantAttribute: 'expr355',
                                  selector: '[expr355]',

                                  expressions: [
                                    {
                                      type: expressionTypes.TEXT,
                                      childNodeIndex: 0,

                                      evaluate: _scope => [
                                        _scope.link.target_hw || _scope.link.target_id
                                      ].join(
                                        ''
                                      )
                                    },
                                    {
                                      type: expressionTypes.ATTRIBUTE,
                                      name: 'href',

                                      evaluate: _scope => [
                                        '#/',
                                        _scope.dictData.dictId,
                                        '/edit/entry/view/',
                                        _scope.link.target_entry
                                      ].join(
                                        ''
                                      )
                                    }
                                  ]
                                },
                                {
                                  redundantAttribute: 'expr356',
                                  selector: '[expr356]',

                                  expressions: [
                                    {
                                      type: expressionTypes.TEXT,
                                      childNodeIndex: 0,

                                      evaluate: _scope => [
                                        _scope.link.target_hw ? ('(' + _scope.link.target_id + ')') : ''
                                      ].join(
                                        ''
                                      )
                                    }
                                  ]
                                }
                              ]
                            ),

                            redundantAttribute: 'expr352',
                            selector: '[expr352]',
                            itemName: 'link',
                            indexName: null,
                            evaluate: _scope => _scope.dict.from
                          }
                        ]
                      )
                    }
                  ]
                ),

                redundantAttribute: 'expr339',
                selector: '[expr339]',
                itemName: 'dict',
                indexName: null,
                evaluate: _scope => Object.values(_scope.state.dictionaries)
              }
            ]
          )
        }
      ]
    ),

    name: 'dict-links'
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
    css: `entry-view,[is="entry-view"]{ position: relative; display: block; min-height: calc(100vh - 260px); } entry-view .voicetts,[is="entry-view"] .voicetts{ display: inline-block; vertical-align: top; } entry-view .voicetts-icon img,[is="entry-view"] .voicetts-icon img{ width: 30px; cursor: pointer; margin-left: 1em; }`,

    exports: {
      bindings: [["store", "isEntryLoadingChanged", "update"]],

      initViewer(){
         if(this.dictData.entry && this.dictData.entry.content){
            let html = Xemplatron.xml2html(this.dictData.entry.content, this.dictData.config.xemplate, this.dictData.config.xema);
            $('#viewer').html(html);
            Gmedia.addVoicePublic(this.dictData.entry, this.dictData.config.gapi, this.dictData.config.titling);
         }
      },

      onUpdated(){
         this.initViewer();
      },

      onMounted() {
         this.initViewer();
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<loading-overlay expr365="expr365"></loading-overlay><div class="viewer" id="viewer"></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.dictData.isEntryLoading,
          redundantAttribute: 'expr365',
          selector: '[expr365]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],

                attributes: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'fulscreen',
                    evaluate: _scope => false
                  }
                ]
              }
            ]
          )
        }
      ]
    ),

    name: 'entry-view'
  };

  var app_footer = {
    css: `app-footer .footer-logos,[is="app-footer"] .footer-logos{ padding: 15px 20px 50px 50px; background: #d9d9d8; } app-footer .footer-copyright,[is="app-footer"] .footer-copyright{ font-weight: 300; padding: 15px 15px 30px 50px; background: #b8b8b8; } app-footer .logolint a,[is="app-footer"] .logolint a{ height: 30px; display: inline-block; vertical-align: middle; } app-footer .logolint a::after,[is="app-footer"] .logolint a::after{ height: 30px; display: inline-block; content: " "; border-right: 1px solid #fff; margin: 0 10px; } app-footer .logolint a img,[is="app-footer"] .logolint a img{ height: 30px; filter: brightness(0) invert(1); } app-footer .logolint a:hover img,[is="app-footer"] .logolint a:hover img{ filter: none; } app-footer .version,[is="app-footer"] .version{ font-weight: 100; }`,
    exports: {},

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div class="footer-logos"><div class="logolint"><a target="_blank" href="https://www.muni.cz/" title="Masaryk University"><img class="mulogo" src="img/logo_muni_small.png"/></a><a target="_blank" href="https://www.sketchengine.eu/" title="Sketch Engine"><img class="skelogo" src="img/logo_ske_small.png"/></a></div><div expr407="expr407" class="version right white-text"> </div></div><div class="footer-copyright">\n      Lexonomy is developed as part of <a href="https://elex.is/">ELEXIS</a> project.\n      <a class="right" href="https://github.com/elexis-eu/lexonomy" title="GitHub" target="_blank"><img src="img/github.png"/></a></div>',
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
          redundantAttribute: 'expr407',
          selector: '[expr407]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,

              evaluate: _scope => [
                'Version: ',
                window.LEXONOMY_VERSION
              ].join(
                ''
              )
            }
          ]
        }
      ]
    ),

    name: 'app-footer'
  };

  var forgot_password = {
    css: null,

    exports: {
      state: {
         messageSent: false,
         isTokenValid: false,
         isLoading: true,
         errorMessage: ''
      },

      onMounted() {
         this.auth.verifyToken(this.props.token, "recovery")
               .always(response => {
                  this.update({
                     isLoading: false,
                     isTokenValid: response && response.success
                  });
               });
      },

      onKeyUp(evt){
         evt.keyCode == 13 && this.setPassword();
      },

      setPassword() {
         let password = $("#password").val();
         if(password){
            this.update({isResetting: true});
            this.auth.resetPassword(this.props.token, $("#password").val())
               .always(response => {
                     this.update({
                        isResetting: false,
                        messageSent: response.success,
                        errorMessage: !response.success ? "Incorrect e-mail." : ""
                     });
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
      '<loading-overlay expr366="expr366"></loading-overlay><div expr367="expr367"></div><div expr368="expr368" class="section message messageError"></div><div expr369="expr369" class="section message messageError"></div><div expr370="expr370"></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isLoading || _scope.state.isResetting,
          redundantAttribute: 'expr366',
          selector: '[expr366]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.messageSent,
          redundantAttribute: 'expr367',
          selector: '[expr367]',

          template: template(
            '<div class="message messageSuccess">\n         Your password is updated. You can now log in with your e-mail address and password.\n      </div><br/><br/><div class="center-align"><a href="#/" class="btn btn-primary">log in</a></div>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.state.isTokenValid && !_scope.state.isLoading,
          redundantAttribute: 'expr368',
          selector: '[expr368]',

          template: template(
            '\n      This recovery link is invalid. It may have expired or has been used before.\n   ',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.errorMessage,
          redundantAttribute: 'expr369',
          selector: '[expr369]',

          template: template(
            ' ',
            [
              {
                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,

                    evaluate: _scope => [
                      _scope.state.errorMessage
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
          evaluate: _scope => !_scope.state.messageSent && _scope.state.isTokenValid,
          redundantAttribute: 'expr370',
          selector: '[expr370]',

          template: template(
            '<div class="input-field"><input expr371="expr371" id="password" type="password" class="validate"/><label for="password">Your password</label><span class="helper-text">Set your password to access Lexonomy.</span></div><button expr372="expr372" class="btn waves-effect waves-light" name="login" id="loginButton">Set password\n         <i class="material-icons right">send</i></button>',
            [
              {
                redundantAttribute: 'expr371',
                selector: '[expr371]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onkeyup',
                    evaluate: _scope => _scope.onKeyUp
                  }
                ]
              },
              {
                redundantAttribute: 'expr372',
                selector: '[expr372]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.setPassword
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
      state: {
         messageSent: false,
         errorMessage: '',
         isResetting: false
      },

      onKeyUp(evt){
         evt.keyCode == 13 && this.requestResetPassword();
      },

      requestResetPassword(event) {
         let email = $("#email").val();
         if(email){
            this.update({isResetting: true});
            this.auth.requestResetPassword(email)
                  .always(response => {
                     this.update({
                        isResetting: false,
                        messageSent: response.success,
                        errorMessage: !response.success ? "Incorrect e-mail." : ""
                     });
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
      '<loading-overlay expr381="expr381"></loading-overlay><div expr382="expr382" class="section message messageSuccess"></div><div expr383="expr383" class="section message messageError"></div><div expr384="expr384" class="section"></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isResetting,
          redundantAttribute: 'expr381',
          selector: '[expr381]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.messageSent,
          redundantAttribute: 'expr382',
          selector: '[expr382]',

          template: template(
            '\n      We have sent you an e-mail with instructions on how to reset your password.\n   ',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.errorMessage,
          redundantAttribute: 'expr383',
          selector: '[expr383]',

          template: template(
            ' ',
            [
              {
                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,

                    evaluate: _scope => [
                      _scope.state.errorMessage
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
          evaluate: _scope => !_scope.state.messageSent,
          redundantAttribute: 'expr384',
          selector: '[expr384]',

          template: template(
            '<div class="input-field"><input expr385="expr385" id="email" type="email"/><label for="email">Your e-mail</label><span class="helper-text">If you have forgotten your password, enter your e-mail address and we will send you instructions on how to create a new one.</span></div><div class="buttons"><a href="#/" class="btn btn-secondary waves-effect waves-light">\n            Back\n         </a><button expr386="expr386" class="btn waves-effect waves-light" name="login" id="loginButton">Get a new password\n            <i class="material-icons right">send</i></button></div>',
            [
              {
                redundantAttribute: 'expr385',
                selector: '[expr385]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onkeyup',
                    evaluate: _scope => _scope.onKeyUp
                  }
                ]
              },
              {
                redundantAttribute: 'expr386',
                selector: '[expr386]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.requestResetPassword
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

  var app_header = {
    css: `app-header .fontSize,[is="app-header"] .fontSize{ display: flex; user-select: none; margin: 0 15px; } app-header .fontSizeArrows,[is="app-header"] .fontSizeArrows{ display: flex; flex-direction: column; align-self: center; } app-header .fontSizeArrows i,[is="app-header"] .fontSizeArrows i{ height: 20px; line-height: 20px; } app-header .brand-logo,[is="app-header"] .brand-logo{ padding: 0 20px 0 40px; } app-header .site-logo,[is="app-header"] .site-logo{ height: 50px; position: relative; top: 20px } app-header .sidenav-trigger i,[is="app-header"] .sidenav-trigger i{ font-size: 36px; } app-header .sideNavSection,[is="app-header"] .sideNavSection{ text-transform: uppercase; color: #767676; border-bottom: 1px solid #e0e0e0; } app-header .sideNavSection span,[is="app-header"] .sideNavSection span{ padding-left: 1rem; } app-header nav,[is="app-header"] nav{ border-bottom: 1px solid black; box-shadow: none; }`,

    exports: {
      doLogout(event) {
         this.auth.logout();
      },

      onIncreaseFontSize(){
         let size = parseInt($("html").css("font-size").replace("px", "")) + 1;
         if(size <= 22){
            $("html").css("font-size", size + "px");
            document.cookie = "fontSize=" + size;
         }
      },

      onDecreaseFontSize(){
         let size = parseInt($("html").css("font-size").replace("px", "")) - 1;
         if(size >= 14){
            $("html").css("font-size", size + "px");
            document.cookie = "fontSize=" + size;
         }
      },

      getFontSizeFromCookies(){
        let decodedCookie = decodeURIComponent(document.cookie);
        let cookies = decodedCookie.split(';');
        for(let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.indexOf("fontSize=") == 0) {
                return cookie.substring(9, cookie.length)
            }
        }
        return ""
      },

      onUpdated() {
         $(".dropdown-trigger").each((idx, el) => {
            $el = $(el);
            $el[0].M_Dropdown && $el[0].M_Dropdown.destroy();
            $el.dropdown({coverTrigger: false, constrainWidth: false});
         });
      },

      onBeforeMount(){
         let size = this.getFontSizeFromCookies();
         if(size){
            $("html").css("font-size", size + "px");
         }
      },

      onMounted(){
         $(".dropdown-trigger").dropdown({coverTrigger: false, constrainWidth: false});
         $('.sidenav').sidenav();
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<ul expr408="expr408" id="dropdown-menu-dict" class="dropdown-content"></ul><ul expr420="expr420" id="dropdown-menu-anon" class="dropdown-content"></ul><ul expr421="expr421" id="dropdown-menu-user" class="dropdown-content"></ul><nav class="white"><div class="nav-wrapper"><a href="#" class="brand-logo"><img class="site-logo" src="img/logo_50.png"/></a><span class="fontSize black-text right"><span style="font-size: 15px; position: relative; top: 2px;">A</span><span style="font-size: 22px; margin-right: 10px;">A</span><span class="fontSizeArrows"><i expr423="expr423" class="material-icons clickable">arrow_drop_up</i><i expr424="expr424" class="material-icons clickable">arrow_drop_down</i></span></span><ul class="right hide-on-med-and-down"><li expr425="expr425"></li><li expr426="expr426"></li><li expr427="expr427"></li></ul></div></nav><ul class="sidenav"><template expr429="expr429"></template><template expr441="expr441"></template><template expr442="expr442"></template></ul>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.authData.authorized && _scope.dictData.isDictionaryLoaded && _scope.dictData.userAccess,
          redundantAttribute: 'expr408',
          selector: '[expr408]',

          template: template(
            '<li expr409="expr409"></li><li expr411="expr411"></li><li expr413="expr413"></li><li expr415="expr415"></li><li expr417="expr417"></li><li><a expr419="expr419">Links</a></li>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.dictData.userAccess.canEdit,
                redundantAttribute: 'expr409',
                selector: '[expr409]',

                template: template(
                  '<a expr410="expr410">View</a>',
                  [
                    {
                      redundantAttribute: 'expr410',
                      selector: '[expr410]',

                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'href',

                          evaluate: _scope => [
                            '#/',
                            _scope.dictData.dictId
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
                evaluate: _scope => _scope.dictData.userAccess.canEdit,
                redundantAttribute: 'expr411',
                selector: '[expr411]',

                template: template(
                  '<a expr412="expr412">Edit</a>',
                  [
                    {
                      redundantAttribute: 'expr412',
                      selector: '[expr412]',

                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'href',

                          evaluate: _scope => [
                            '#/',
                            _scope.dictData.dictId,
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
                evaluate: _scope => _scope.dictData.userAccess.canConfig,
                redundantAttribute: 'expr413',
                selector: '[expr413]',

                template: template(
                  '<a expr414="expr414">Configure</a>',
                  [
                    {
                      redundantAttribute: 'expr414',
                      selector: '[expr414]',

                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'href',

                          evaluate: _scope => [
                            '#/',
                            _scope.dictData.dictId,
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
                evaluate: _scope => _scope.dictData.userAccess.canDownload,
                redundantAttribute: 'expr415',
                selector: '[expr415]',

                template: template(
                  '<a expr416="expr416">Download</a>',
                  [
                    {
                      redundantAttribute: 'expr416',
                      selector: '[expr416]',

                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'href',

                          evaluate: _scope => [
                            '#/',
                            _scope.dictData.dictId,
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
                evaluate: _scope => _scope.dictData.userAccess.canUpload,
                redundantAttribute: 'expr417',
                selector: '[expr417]',

                template: template(
                  '<a expr418="expr418">Upload</a>',
                  [
                    {
                      redundantAttribute: 'expr418',
                      selector: '[expr418]',

                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'href',

                          evaluate: _scope => [
                            '#/',
                            _scope.dictData.dictId,
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
                redundantAttribute: 'expr419',
                selector: '[expr419]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'href',

                    evaluate: _scope => [
                      '#/',
                      _scope.dictData.dictId,
                      '/links'
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
          evaluate: _scope => !_scope.authData.authorized,
          redundantAttribute: 'expr420',
          selector: '[expr420]',

          template: template(
            '<li><a href="#/">Log in</a></li><li><a href="#/register">Get an account</a></li><li><a href="#/forgot">Forgot your password?</a></li>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.authData.authorized,
          redundantAttribute: 'expr421',
          selector: '[expr421]',

          template: template(
            '<li><a expr422="expr422" href="#/">Log out</a></li><li><a href="#/userprofile">Your profile</a></li>',
            [
              {
                redundantAttribute: 'expr422',
                selector: '[expr422]',

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
          redundantAttribute: 'expr423',
          selector: '[expr423]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.onIncreaseFontSize
            }
          ]
        },
        {
          redundantAttribute: 'expr424',
          selector: '[expr424]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.onDecreaseFontSize
            }
          ]
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.authData.authorized && _scope.dictData.isDictionaryLoaded,
          redundantAttribute: 'expr425',
          selector: '[expr425]',

          template: template(
            '<a class="dropdown-trigger" href="#/" data-target="dropdown-menu-dict">\n                  Dictionary\n                  <i class="material-icons right">arrow_drop_down</i></a>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.authData.authorized,
          redundantAttribute: 'expr426',
          selector: '[expr426]',

          template: template(
            '<a class="dropdown-trigger" href="#/" data-target="dropdown-menu-anon">\n                  anonymous user\n                  <i class="material-icons right">arrow_drop_down</i></a>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.authData.authorized,
          redundantAttribute: 'expr427',
          selector: '[expr427]',

          template: template(
            '<a expr428="expr428" class="dropdown-trigger" href="#/" data-target="dropdown-menu-user"> <i class="material-icons right">arrow_drop_down</i></a>',
            [
              {
                redundantAttribute: 'expr428',
                selector: '[expr428]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,

                    evaluate: _scope => [
                      _scope.authData.username
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
          evaluate: _scope => _scope.authData.authorized && _scope.dictData.isDictionaryLoaded && _scope.dictData.userAccess,
          redundantAttribute: 'expr429',
          selector: '[expr429]',

          template: template(
            '<li class="sideNavSection"><span>Dictionary</span></li><li expr430="expr430"></li><li expr432="expr432"></li><li expr434="expr434"></li><li expr436="expr436"></li><li expr438="expr438"></li><li><a expr440="expr440">Links</a></li>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.dictData.userAccess.canEdit,
                redundantAttribute: 'expr430',
                selector: '[expr430]',

                template: template(
                  '<a expr431="expr431">View</a>',
                  [
                    {
                      redundantAttribute: 'expr431',
                      selector: '[expr431]',

                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'href',

                          evaluate: _scope => [
                            '#/',
                            _scope.dictData.dictId
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
                evaluate: _scope => _scope.dictData.userAccess.canEdit,
                redundantAttribute: 'expr432',
                selector: '[expr432]',

                template: template(
                  '<a expr433="expr433">Edit</a>',
                  [
                    {
                      redundantAttribute: 'expr433',
                      selector: '[expr433]',

                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'href',

                          evaluate: _scope => [
                            '#/',
                            _scope.dictData.dictId,
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
                evaluate: _scope => _scope.dictData.userAccess.canConfig,
                redundantAttribute: 'expr434',
                selector: '[expr434]',

                template: template(
                  '<a expr435="expr435">Configure</a>',
                  [
                    {
                      redundantAttribute: 'expr435',
                      selector: '[expr435]',

                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'href',

                          evaluate: _scope => [
                            '#/',
                            _scope.dictData.dictId,
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
                evaluate: _scope => _scope.dictData.userAccess.canDownload,
                redundantAttribute: 'expr436',
                selector: '[expr436]',

                template: template(
                  '<a expr437="expr437">Download</a>',
                  [
                    {
                      redundantAttribute: 'expr437',
                      selector: '[expr437]',

                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'href',

                          evaluate: _scope => [
                            '#/',
                            _scope.dictData.dictId,
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
                evaluate: _scope => _scope.dictData.userAccess.canUpload,
                redundantAttribute: 'expr438',
                selector: '[expr438]',

                template: template(
                  '<a expr439="expr439">Upload</a>',
                  [
                    {
                      redundantAttribute: 'expr439',
                      selector: '[expr439]',

                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'href',

                          evaluate: _scope => [
                            '#/',
                            _scope.dictData.dictId,
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
                redundantAttribute: 'expr440',
                selector: '[expr440]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'href',

                    evaluate: _scope => [
                      '#/',
                      _scope.dictData.dictId,
                      '/links'
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
          evaluate: _scope => !_scope.authData.authorized,
          redundantAttribute: 'expr441',
          selector: '[expr441]',

          template: template(
            '<li><a href="#/">Log in</a></li><li><a href="#/register">Get an account</a></li><li><a href="#/forgot">Forgot your password?</a></li>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.authData.authorized,
          redundantAttribute: 'expr442',
          selector: '[expr442]',

          template: template(
            '<li class="sideNavSection"><span>User</span></li><li><a expr443="expr443" href="#/">Log out</a></li><li><a href="#/userprofile">Your profile</a></li>',
            [
              {
                redundantAttribute: 'expr443',
                selector: '[expr443]',

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
        }
      ]
    ),

    name: 'app-header'
  };

  var login = {
    css: `login .skelogin,[is="login"] .skelogin{ width: 80px; height: 30px; vertical-align: middle; } login small,[is="login"] small{ position: relative; top: -10px; }`,

    exports: {
      state: {
         isLoggingIn: false,
         message: ""
      },

      onKeyUp(evt){
         evt.keyCode == 13 && this.doLogin();
      },

      doLogin() {
         let username = $('#username').val();
         let password = $('#password').val();
         if(username && password){
            this.update({isLoggingIn: true});
            this.auth.login(username, password)
                  .always(response =>{
                     this.update({
                        isLoggingIn: false,
                        message: response.success ? "" : "Incorrect username or password."
                     });
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
      '<loading-overlay expr459="expr459" fullscreen="1"></loading-overlay><div expr460="expr460" class="section message messageError"></div><div class="section"><div class="input-field"><input id="username" type="email" class="validate"/><label for="username">Username</label><small>\n            No account?\n            <a href="#register" tabindex="-1">Sign up</a></small></div><div class="input-field"><input expr461="expr461" id="password" type="password"/><label for="password">Password</label><small><a href="#forgot" tabindex="-1">Forgot password?</a></small></div><button expr462="expr462" class="btn btn-primary waves-effect waves-light" name="login" id="loginButton">\n         Log in\n         <i class="material-icons right">send</i></button></div><div expr463="expr463" class="section"></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isLoggingIn,
          redundantAttribute: 'expr459',
          selector: '[expr459]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.message,
          redundantAttribute: 'expr460',
          selector: '[expr460]',

          template: template(
            ' ',
            [
              {
                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,

                    evaluate: _scope => [
                      _scope.state.message
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
          redundantAttribute: 'expr461',
          selector: '[expr461]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onkeyup',
              evaluate: _scope => _scope.onKeyUp
            }
          ]
        },
        {
          redundantAttribute: 'expr462',
          selector: '[expr462]',

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
          evaluate: _scope => _scope.dictData.siteconfig && _scope.dictData.siteconfig.sketchengineLoginPage,
          redundantAttribute: 'expr463',
          selector: '[expr463]',

          template: template(
            '<a expr464="expr464" class="btn waves-effect waves-light">Sign up or log in with &nbsp;\n         <img class="skelogin" alt="Sketch Engine" title="Sketch Engine" src="img/logo_ske_white.png"/><i class="material-icons right">send</i></a>',
            [
              {
                redundantAttribute: 'expr464',
                selector: '[expr464]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'href',
                    evaluate: _scope => _scope.dictData.siteconfig.sketchengineLoginPage + encodeURIComponent(window.location.href)
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
    css: `main-page,[is="main-page"]{ margin-top: 20px; } main-page .resource-list-inline,[is="main-page"] .resource-list-inline{ padding-left: 0; margin-left: -5px; list-style: none; } main-page .resource-list-inline > li,[is="main-page"] .resource-list-inline > li{ display: inline-block; padding-right: 5px; padding-left: 5px; }`,
    exports: null,

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div expr444="expr444"></div><div expr451="expr451" class="row"></div><div class="divider" style="margin-top: 50px;"></div><div expr458="expr458" class="section" style="opacity: 0.6;"></div><div class="section" style="opacity: 0.6;"><h3>Reference</h3><p>Měchura, M. B. (2017) ‘<a href="docs/elex2017.pdf">Introducing Lexonomy: an open-source dictionary writing and publishing system</a>’ in <i>Electronic Lexicography in the 21st Century: Lexicography from Scratch. Proceedings of the eLex 2017 conference, 19-21 September 2017, Leiden, The Netherlands.</i><br/><span>If you are referring to Lexonomy from an academic publication, it is recommended that you cite this paper.</span></p></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.authData.authorized,
          redundantAttribute: 'expr444',
          selector: '[expr444]',

          template: template(
            '<template expr445="expr445"></template><template expr447="expr447"></template>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.dictData.siteconfig.consent && _scope.dictData.siteconfig.consent.terms && !_scope.authData.consent,
                redundantAttribute: 'expr445',
                selector: '[expr445]',

                template: template(
                  '<user-consent expr446="expr446"></user-consent>',
                  [
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'user-consent',
                      slots: [],
                      attributes: [],
                      redundantAttribute: 'expr446',
                      selector: '[expr446]'
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => !_scope.dictData.siteconfig.consent || !_scope.dictData.siteconfig.consent.terms || _scope.authData.consent,
                redundantAttribute: 'expr447',
                selector: '[expr447]',

                template: template(
                  '<dict-list expr448="expr448"></dict-list><dict-new expr449="expr449"></dict-new><userprofile expr450="expr450"></userprofile>',
                  [
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.props.mainSubPage != 'new' && _scope.props.mainSubPage != 'userprofile',
                      redundantAttribute: 'expr448',
                      selector: '[expr448]',

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
                      redundantAttribute: 'expr449',
                      selector: '[expr449]',

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
                      redundantAttribute: 'expr450',
                      selector: '[expr450]',

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
                                evaluate: _scope => _scope.authData
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
          evaluate: _scope => !_scope.authData.authorized,
          redundantAttribute: 'expr451',
          selector: '[expr451]',

          template: template(
            '<div class="col m7 s12"><welcome expr452="expr452"></welcome></div><div class="col m5 s12"><login expr453="expr453"></login><register expr454="expr454"></register><register-password expr455="expr455"></register-password><forgot expr456="expr456"></forgot><forgot-password expr457="expr457"></forgot-password></div>',
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'welcome',
                slots: [],
                attributes: [],
                redundantAttribute: 'expr452',
                selector: '[expr452]'
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.props.mainSubPage == 'login',
                redundantAttribute: 'expr453',
                selector: '[expr453]',

                template: template(
                  null,
                  [
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'login',
                      slots: [],
                      attributes: []
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.props.mainSubPage == 'register',
                redundantAttribute: 'expr454',
                selector: '[expr454]',

                template: template(
                  null,
                  [
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'register',
                      slots: [],
                      attributes: []
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.props.mainSubPage == 'registerPassword',
                redundantAttribute: 'expr455',
                selector: '[expr455]',

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
                redundantAttribute: 'expr456',
                selector: '[expr456]',

                template: template(
                  null,
                  [
                    {
                      type: bindingTypes.TAG,
                      getComponent: getComponent,
                      evaluate: _scope => 'forgot',
                      slots: [],
                      attributes: []
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.props.mainSubPage == 'forgotPassword',
                redundantAttribute: 'expr457',
                selector: '[expr457]',

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
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.authData.authorized,
          redundantAttribute: 'expr458',
          selector: '[expr458]',

          template: template(
            '<h3>Resources</h3><ul class="resource-list-inline"><li><a href="#/docs/intro">Gentle introduction to Lexonomy</a></li><li><a href="#/opendictionaries">Public dictionaries</a></li></ul>',
            []
          )
        }
      ]
    ),

    name: 'main-page'
  };

  var open_dict_list = {
    css: null,

    exports: {
      bindings: [["store", "isPublicDictionaryListLoadingChanged", "update"]],

      state: {
         visibleDictionaries: [],
         language: "",
         query: ""
      },

      loadData(){
         this.store.loadPublicDictionaryList()
               .done(response => {
                  this.state.visibleDictionaries = this.dictData.publicDictionaryList;
               })
               .always(() => {
                  this.update({isLoading: false});
                  this.initializeLanguageSelect();
                  $("#search").focus();
               });
      },

      onSearchInput(evt){
         this.state.query = evt.target.value;
         this.filter();
      },

      onLanguageChange(evt){
         this.state.language = evt.target.value;
         this.filter();
      },

      filter(){
         this.dictData.publicDictionaryList.forEach(c => {
            delete c.h_title;
            delete c.h_lang;
            delete c.h_author;
            delete c.h_licence;
         });
         this.state.visibleDictionaries = this.dictData.publicDictionaryList;
         if(this.state.language){
            this.state.visibleDictionaries = this.state.visibleDictionaries.filter(d => d.lang == this.state.language);
         }
         if(this.state.query !== ""){
            let sortResult = FuzzySort.go(this.state.query, this.state.visibleDictionaries, {
               key: "id",
               keys: ["title", "lang", "author", "licence"]
            });
            this.state.visibleDictionaries = sortResult.map(fs => {
               fs.obj.h_title = FuzzySort.highlight(fs[0], '<b class="red-text">', "</b>");
               fs.obj.h_lang = FuzzySort.highlight(fs[1], '<b class="red-text">', "</b>");
               fs.obj.h_author = FuzzySort.highlight(fs[2], '<b class="red-text">', "</b>");
               fs.obj.h_licence = FuzzySort.highlight(fs[3], '<b class="red-text">', "</b>");
               fs.obj.score = fs.score;
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
         this.state.visibleDictionaries.forEach((c, idx) => {
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

      onBeforeMount(){
         if(this.dictData.isPublicDictionaryListLoaded){
            this.state.visibleDictionaries = this.dictData.publicDictionaryList;
         } else {
            this.loadData();
         }
      },

      onMounted(){
         if(this.dictData.isPublicDictionaryListLoaded){
            this.initializeLanguageSelect();
         }
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<h1>Open dictionaries</h1><loading-overlay expr495="expr495"></loading-overlay><div expr496="expr496"></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.dictData.isPublicDictionaryListLoading,
          redundantAttribute: 'expr495',
          selector: '[expr495]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.dictData.isPublicDictionaryListLoading,
          redundantAttribute: 'expr496',
          selector: '[expr496]',

          template: template(
            '<div><div class="input-field" style="display: inline-block; margin-right: 40px;"><i class="material-icons prefix grey-text">search</i><input expr497="expr497" id="search" type="text" style="width: 200px;"/><label for="search">Find</label></div><div class="input-field" style="display: inline-block;"><i class="material-icons prefix grey-text">translate</i><select id="languageSelect" style="width: 200px;"><option value>All languages</option><option expr498="expr498"></option></select><label>Language</label></div></div><div expr499="expr499" class="center" style="margin: 20vh auto;"></div><table expr500="expr500" class="striped highlight" style="margin: 0 15px;"></table>',
            [
              {
                redundantAttribute: 'expr497',
                selector: '[expr497]',

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

                redundantAttribute: 'expr498',
                selector: '[expr498]',
                itemName: 'language',
                indexName: null,
                evaluate: _scope => _scope.dictData.publicDictionaryLanguageList
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => !_scope.state.visibleDictionaries.length,
                redundantAttribute: 'expr499',
                selector: '[expr499]',

                template: template(
                  '<h1 class="grey-text lighten-2">Nothing found</h1>',
                  []
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.state.visibleDictionaries.length,
                redundantAttribute: 'expr500',
                selector: '[expr500]',

                template: template(
                  '<thead><th>Title</th><th>Language</th><th>Size</th><th>Author</th><th>Licence</th><th></th></thead><tbody><tr expr501="expr501"></tr></tbody>',
                  [
                    {
                      type: bindingTypes.EACH,
                      getKey: null,
                      condition: null,

                      template: template(
                        '<td><a expr502="expr502"><span expr503="expr503"> </span></a></td><td><span expr504="expr504"> </span></td><td><span expr505="expr505"> </span></td><td><span expr506="expr506"> </span></td><td><span expr507="expr507"> </span></td><td><a expr508="expr508" title="edit dictionary"></a></td>',
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
                            redundantAttribute: 'expr502',
                            selector: '[expr502]',

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
                            redundantAttribute: 'expr503',
                            selector: '[expr503]',

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
                            redundantAttribute: 'expr504',
                            selector: '[expr504]',

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
                            redundantAttribute: 'expr505',
                            selector: '[expr505]',

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
                            redundantAttribute: 'expr506',
                            selector: '[expr506]',

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
                            redundantAttribute: 'expr507',
                            selector: '[expr507]',

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
                          },
                          {
                            type: bindingTypes.IF,
                            evaluate: _scope => _scope.row.isAdmin,
                            redundantAttribute: 'expr508',
                            selector: '[expr508]',

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
                          }
                        ]
                      ),

                      redundantAttribute: 'expr501',
                      selector: '[expr501]',
                      itemName: 'row',
                      indexName: 'idx',
                      evaluate: _scope => _scope.state.visibleDictionaries
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
      state:{
         messageSent: false,
         tokenValid: false,
         errorMessage: '',
         isCheckingToken: true,
         isRegisteringPassword: false
      },

      onMounted() {
         this.auth.verifyToken(this.props.token, "register")
               .done(response => {
                  if (response.success) {
                     this.state.tokenValid = true;
                  }
               })
               .always(() => {
                  this.update({isCheckingToken: false});
               });
      },

      onKeyUp(evt){
          evt.keyCode == 13 && this.registerPassword();
       },

      registerPassword(event) {
         let password = $("#password").val();
         if(password){
            this.update({isRegisteringPassword: true});
            this.auth.registerPassword(this.props.token, password)
                  .always(result => {
                     this.update({
                        messageSent: result.success,
                        errorMessage: result.success ? "" : result.errorMessage,
                        isRegisteringPassword: false
                     });
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
      '<loading-overlay expr465="expr465"></loading-overlay><div expr466="expr466"></div><div expr469="expr469" class="row"></div><div expr470="expr470" class="row"></div><div expr471="expr471" class="row"></div><div expr472="expr472" class="row"></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isRegisteringPassword,
          redundantAttribute: 'expr465',
          selector: '[expr465]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.state.messageSent && _scope.state.tokenValid,
          redundantAttribute: 'expr466',
          selector: '[expr466]',

          template: template(
            '<div class="row"><div class="input-field col s12"><input expr467="expr467" id="password" type="password" class="validate"/><label for="password">Your password</label><span class="helper-text">Set your password to access Lexonomy.</span></div></div><div class="row"><button expr468="expr468" class="btn waves-effect waves-light" name="login">Set password\n            <i class="material-icons right">send</i></button></div>',
            [
              {
                redundantAttribute: 'expr467',
                selector: '[expr467]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onkeypress',
                    evaluate: _scope => _scope.onKeyUp
                  }
                ]
              },
              {
                redundantAttribute: 'expr468',
                selector: '[expr468]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.registerPassword
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => !_scope.state.tokenValid && !_scope.state.isCheckingToken,
          redundantAttribute: 'expr469',
          selector: '[expr469]',

          template: template(
            '<div class="col s12"><div class="card red darken-2"><div class="card-content white-text"><p>This signup link is invalid. It may have expired or has been used before.</p></div></div></div>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isCheckingToken,
          redundantAttribute: 'expr470',
          selector: '[expr470]',

          template: template(
            '<p>Validating signup token...</p>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.messageSent,
          redundantAttribute: 'expr471',
          selector: '[expr471]',

          template: template(
            '<p>We have created your account. You can now <a href="#/">log in</a> with your e-mail address and password.</p>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.errorMessage != '',
          redundantAttribute: 'expr472',
          selector: '[expr472]',

          template: template(
            '<div class="col s6"><div class="card red darken-2"><div class="card-content white-text"><p expr473="expr473"> </p></div></div></div>',
            [
              {
                redundantAttribute: 'expr473',
                selector: '[expr473]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.state.errorMessage
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
      state: {
         messageSent: false,
         errorMessage: '',
         isRegistering: false
      },

      onKeyUp(evt){
         evt.keyCode == 13 && this.doRegister();
      },

      doRegister() {
         let email = $("#email").val();
         if(email){
            this.update({isRegistering: true});
            this.auth.register(email)
                     .always(response => {
                        this.update({
                           messageSent: response.success,
                           errorMessage: !response.success ? "Incorrect e-mail." : "",
                           isRegistering: false
                        });
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
      '<loading-overlay expr530="expr530" fullscreen="1"></loading-overlay><div expr531="expr531" class="section message messageSuccess"></div><div expr532="expr532" class="section message messageError"></div><div expr533="expr533" class="section"></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.isRegistering,
          redundantAttribute: 'expr530',
          selector: '[expr530]',

          template: template(
            null,
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'loading-overlay',
                slots: [],
                attributes: []
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.messageSent,
          redundantAttribute: 'expr531',
          selector: '[expr531]',

          template: template(
            '<p>We have sent you an e-mail with instructions on how to create a new account.</p>',
            []
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.errorMessage,
          redundantAttribute: 'expr532',
          selector: '[expr532]',

          template: template(
            ' ',
            [
              {
                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,

                    evaluate: _scope => [
                      _scope.state.errorMessage
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
          evaluate: _scope => !_scope.state.messageSent,
          redundantAttribute: 'expr533',
          selector: '[expr533]',

          template: template(
            '<div class="input-field"><input expr534="expr534" id="email" type="email" class="validate"/><label for="email">Your e-mail</label><span class="helper-text">To get a new account, enter your e-mail address and we will send you instructions.</span></div><div class="buttons"><a href="#/" class="btn btn-secondary waves-effect waves-light">\n            Back\n         </a><button expr535="expr535" class="btn waves-effect waves-light" name="login" id="loginButton">Register\n            <i class="material-icons right">send</i></button></div>',
            [
              {
                redundantAttribute: 'expr534',
                selector: '[expr534]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onkeyup',
                    evaluate: _scope => _scope.onKeyUp
                  }
                ]
              },
              {
                redundantAttribute: 'expr535',
                selector: '[expr535]',

                expressions: [
                  {
                    type: expressionTypes.EVENT,
                    name: 'onclick',
                    evaluate: _scope => _scope.doRegister
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
      state: {
         passMessage: '',
         apiMessage: '',
         skeuserMessage: '',
         skeapiMessage: ''
      },

      onMounted() {
         M.updateTextFields();
      },

      doChangePass(event) {
         if ($('#password').val() != '') {
            $.post(window.API_URL + "changepwd.json", {password: $('#password').val()}, (response) => {
               if (response.success) {
                  this.passMessage = 'Password changed.';
               } else {
                  this.passMessage = 'There was an error saving the password.';
               }
               this.update();
            });
         }
      },

      doChangeUser(event) {
         if ($('#skeusername').val() != '') {
            $.post(window.API_URL + "changeskeusername.json", {ske_userName: $('#skeusername').val()}, (response) => {
               if (response.success) {
                  this.state.skeuserMessage = 'Username changed.';
               } else {
                  this.state.skeuserMessage = 'There was an error saving the username.';
               }
               this.update();
            });
         }
      },

      doChangeKey(event) {
         if ($('#skeapi').val() != '') {
            $.post(window.API_URL + "changeskeapi.json", {ske_apiKey: $('#skeapi').val()}, (response) => {
               if (response.success) {
                  this.state.skeapiMessage = 'API key changed.';
               } else {
                  this.state.skeapiMessage = 'There was an error saving the API key.';
               }
               this.update();
            });
         }
      },

      doNewKey(event) {
         var newkey = this.generateKey();
         $.post(window.API_URL + "changeoneclickapi.json", {apiKey: newkey}, (response) => {
            if (response.success) {
               this.state.apiMessage = 'API key changed.';
               this.authData.apiKey = newkey;
            } else {
               this.state.apiMessage = 'There was an error saving the API key.';
            }
            this.update();
         });
      },

      doDeleteKey(event) {
         $.post(window.API_URL + "changeoneclickapi.json", {apiKey: ""}, (response) => {
            if (response.success) {
               this.state.apiMessage = 'API key deleted.';
               this.authData.apiKey = "";
            } else {
               this.state.apiMessage = 'There was an error saving the API key.';
            }
            this.update();
         });
      },

      generateKey() {
         var alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
         var key="";
         while(key.length<32) {
            var i=Math.floor(Math.random() * alphabet.length);
            key+=alphabet[i];
         }
         return key
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<h1>Account settings</h1><div expr474="expr474" class="row"></div><div class="row"><label>Sketch Engine API key</label><p expr484="expr484"></p><p expr485="expr485"></p><div class="input-field" style="margin-top: 0;"><div style="display: flex; gap: 10px; align-items: center;"><input expr487="expr487" id="skeapi" type="text" class="validate" style="width: 350px;"/><button expr488="expr488" class="btn waves-effect waves-light" style="margin-bottom: 10px;">Change API key\n               <i class="material-icons right">send</i></button></div><span class="helper-text">Set your API key for Sketch Engine.</span></div></div><div class="row"><p expr489="expr489"> </p><label>Lexonomy API key</label><div class="input-field" style="margin-top: 0;"><div style="display: flex; gap: 10px; align-items: center;"><input expr490="expr490" type="text" disabled style="width: 350px;"/><button expr491="expr491" class="btn waves-effect waves-light" style="margin-bottom: 10px;">\n               Generate new API key\n               <i class="material-icons right">autorenew</i></button><button expr492="expr492" class="btn waves-effect waves-light" style="margin-bottom: 10px;">\n               Remove API key\n               <i class="material-icons right">delete</i></button></div><span class="helper-text">This key allows external tools such as Sketch Engine to create a dictionary in your account and to populate it with pre-generated entries.</span></div></div><div class="row"><p expr493="expr493"> </p><label>New password</label><div class="input-field" style="margin-top: 0;"><div style="display: flex; gap: 10px; align-items: center;"><input id="password" type="password" class="validate" style="width: 350px;"/><button expr494="expr494" class="btn waves-effect waves-light" style="margin-bottom: 10px;">Change password\n               <i class="material-icons right">send</i></button></div><span class="helper-text">Set your password to access Lexonomy.</span></div></div><div><a class="btn" href="#/" onclick="window.history.back()">Back</a></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.dictData.siteconfig && !_scope.dictData.isSiteconfigLoading,
          redundantAttribute: 'expr474',
          selector: '[expr474]',

          template: template(
            '<label>Sketch Engine login</label><div expr475="expr475"></div><div expr478="expr478"></div><div expr480="expr480"></div>',
            [
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.dictData.siteconfig.sketchengineLoginPage && _scope.authData.ske_username,
                redundantAttribute: 'expr475',
                selector: '[expr475]',

                template: template(
                  '<p>Your Lexonomy account is linked to your Sketch Engine account <b expr476="expr476"> </b><br/><a expr477="expr477">Link to a different Sketch Engine account&nbsp;»</a></p>',
                  [
                    {
                      redundantAttribute: 'expr476',
                      selector: '[expr476]',

                      expressions: [
                        {
                          type: expressionTypes.TEXT,
                          childNodeIndex: 0,
                          evaluate: _scope => _scope.authData.ske_username
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr477',
                      selector: '[expr477]',

                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'href',
                          evaluate: _scope => _scope.dictData.siteconfig.sketchengineLoginPage
                        }
                      ]
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => _scope.dictData.siteconfig.sketchengineLoginPage && !_scope.authData.ske_username,
                redundantAttribute: 'expr478',
                selector: '[expr478]',

                template: template(
                  '<p><strong>Sketch Engine login</strong></p><p><a expr479="expr479">Link Lexonomy to your Sketch Engine account&nbsp;»</a></p>',
                  [
                    {
                      redundantAttribute: 'expr479',
                      selector: '[expr479]',

                      expressions: [
                        {
                          type: expressionTypes.ATTRIBUTE,
                          name: 'href',
                          evaluate: _scope => _scope.dictData.siteconfig.sketchengineLoginPage
                        }
                      ]
                    }
                  ]
                )
              },
              {
                type: bindingTypes.IF,
                evaluate: _scope => !_scope.dictData.siteconfig.sketchengineLoginPage,
                redundantAttribute: 'expr480',
                selector: '[expr480]',

                template: template(
                  '<p expr481="expr481"></p><div class="input-field" style="margin-top: 0;"><div style="display: flex; gap: 10px; align-items: center;"><input expr482="expr482" id="skeusername" type="text" class="validate" style="width: 350px;"/><button expr483="expr483" class="btn waves-effect waves-light" style="margin-bottom: 10px;">Change username\n                  <i class="material-icons right">send</i></button></div><span class="helper-text">Set your login username to Sketch Engine.</span></div>',
                  [
                    {
                      type: bindingTypes.IF,
                      evaluate: _scope => _scope.state.skeuserMessage != '',
                      redundantAttribute: 'expr481',
                      selector: '[expr481]',

                      template: template(
                        ' ',
                        [
                          {
                            expressions: [
                              {
                                type: expressionTypes.TEXT,
                                childNodeIndex: 0,
                                evaluate: _scope => _scope.state.skeuserMessage
                              }
                            ]
                          }
                        ]
                      )
                    },
                    {
                      redundantAttribute: 'expr482',
                      selector: '[expr482]',

                      expressions: [
                        {
                          type: expressionTypes.VALUE,
                          evaluate: _scope => _scope.authData.ske_username
                        }
                      ]
                    },
                    {
                      redundantAttribute: 'expr483',
                      selector: '[expr483]',

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
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.state.skeapiMessage,
          redundantAttribute: 'expr484',
          selector: '[expr484]',

          template: template(
            ' ',
            [
              {
                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,
                    evaluate: _scope => _scope.state.skeapiMessage
                  }
                ]
              }
            ]
          )
        },
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.dictData.siteconfig.sketchengineLoginPage,
          redundantAttribute: 'expr485',
          selector: '[expr485]',

          template: template(
            '\n         Unless you need special setup, Please, <a expr486="expr486">login via Sketch Engine</a> to set API key automatically.\n      ',
            [
              {
                redundantAttribute: 'expr486',
                selector: '[expr486]',

                expressions: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'href',
                    evaluate: _scope => _scope.dictData.siteconfig.sketchengineLoginPage
                  }
                ]
              }
            ]
          )
        },
        {
          redundantAttribute: 'expr487',
          selector: '[expr487]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.authData.ske_apiKey
            }
          ]
        },
        {
          redundantAttribute: 'expr488',
          selector: '[expr488]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.doChangeKey
            }
          ]
        },
        {
          redundantAttribute: 'expr489',
          selector: '[expr489]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.state.apiMessage
            }
          ]
        },
        {
          redundantAttribute: 'expr490',
          selector: '[expr490]',

          expressions: [
            {
              type: expressionTypes.VALUE,
              evaluate: _scope => _scope.authData.apiKey || "not set"
            }
          ]
        },
        {
          redundantAttribute: 'expr491',
          selector: '[expr491]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.doNewKey
            }
          ]
        },
        {
          redundantAttribute: 'expr492',
          selector: '[expr492]',

          expressions: [
            {
              type: expressionTypes.EVENT,
              name: 'onclick',
              evaluate: _scope => _scope.doDeleteKey
            }
          ]
        },
        {
          redundantAttribute: 'expr493',
          selector: '[expr493]',

          expressions: [
            {
              type: expressionTypes.TEXT,
              childNodeIndex: 0,
              evaluate: _scope => _scope.state.passMessage
            }
          ]
        },
        {
          redundantAttribute: 'expr494',
          selector: '[expr494]',

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
      '<div class="welcome"><h3>Welcome to <strong>Lexonomy</strong>, a cloud-based, open-source platform for writing and publishing dictionaries.</h3><ul><li><a href="#/docs/intro">Gentle introduction to Lexonomy</a><br/>A short and sweet guided tour of Lexonomy for beginners.</li><li><a href="docs/elex2017.pdf">Introducing Lexonomy: an open-source dictionary writing and publishing system&nbsp;<span class="pdf">PDF</span></a><br/>A conference paper offering a detailed review of Lexonomy\'s features.</li><li><a href="#/opendictionaries">Public dictionaries</a><br/>Have a look at publicly available dictionaries created with Lexonomy.</li></ul></div>',
      []
    ),

    name: 'welcome'
  };

  var user_consent = {
    css: null,

    exports: {
      doConsent() {
         this.auth.consent();
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div expr536="expr536"></div>',
      [
        {
          type: bindingTypes.IF,
          evaluate: _scope => _scope.dictData.siteconfig,
          redundantAttribute: 'expr536',
          selector: '[expr536]',

          template: template(
            '<h1>Terms of use</h1><div class="row"><div class="col"><raw-html expr537="expr537"></raw-html></div></div><div class="row"><div class="col"><button expr538="expr538" class="btn waves-effect waves-light"> <i class="material-icons right">check</i></button></div></div>',
            [
              {
                type: bindingTypes.TAG,
                getComponent: getComponent,
                evaluate: _scope => 'raw-html',
                slots: [],

                attributes: [
                  {
                    type: expressionTypes.ATTRIBUTE,
                    name: 'content',
                    evaluate: _scope => _scope.dictData.siteconfig.consent.terms
                  }
                ],

                redundantAttribute: 'expr537',
                selector: '[expr537]'
              },
              {
                redundantAttribute: 'expr538',
                selector: '[expr538]',

                expressions: [
                  {
                    type: expressionTypes.TEXT,
                    childNodeIndex: 0,

                    evaluate: _scope => [
                      _scope.dictData.siteconfig.consent.confirm
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
          )
        }
      ]
    ),

    name: 'user-consent'
  };

  var raw_html = {
    css: null,

    exports: {
      upd () {
         this.root.innerHTML = this.props.content;
      },

      onMounted(){
         this.upd();
      },

      onUpdated() {
         this.upd();
      }
    },

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      null,
      [
        {
          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'class',
              evaluate: _scope => 'raw-html'
            }
          ]
        }
      ]
    ),

    name: 'raw-html'
  };

  var loading_overlay = {
    css: `loading-overlay .overlay,[is="loading-overlay"] .overlay{ position: absolute; top: 0; right: 0; bottom: 0; left: 0; background-color: rgba(255, 255, 255, 0.7); z-index: 999999999; } loading-overlay .overlay.fullscreen,[is="loading-overlay"] .overlay.fullscreen{ position: fixed; } loading-overlay #loading-bar-spinner.spinner,[is="loading-overlay"] #loading-bar-spinner.spinner{ left: 50%; margin-left: -30px; top: 40%; position: absolute; z-index: 999999999 !important; animation: loading-bar-spinner 400ms linear infinite; } loading-overlay #loading-bar-spinner.spinner .spinner-icon,[is="loading-overlay"] #loading-bar-spinner.spinner .spinner-icon{ width: 60px; height: 60px; border: solid 1px transparent; border-top-color: #000000 !important; border-left-color: #000000 !important; border-radius: 50%; } @keyframes loading-bar-spinner { 0% { transform: rotate(0deg); transform: rotate(0deg); } 100% { transform: rotate(360deg); transform: rotate(360deg); } }`,
    exports: null,

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div expr539="expr539"><div id="loading-bar-spinner" class="spinner"><div class="spinner-icon"></div></div></div>',
      [
        {
          redundantAttribute: 'expr539',
          selector: '[expr539]',

          expressions: [
            {
              type: expressionTypes.ATTRIBUTE,
              name: 'class',

              evaluate: _scope => [
                'overlay ',
                _scope.props.fullscreen ? 'fullscreen' : ''
              ].join(
                ''
              )
            }
          ]
        }
      ]
    ),

    name: 'loading-overlay'
  };

  var docs_intro = {
    css: null,
    exports: null,

    template: (
      template,
      expressionTypes,
      bindingTypes,
      getComponent
    ) => template(
      '<div><h1>Gentle introduction to Lexonomy</h1><p><em>Lexonomy</em> is a free tool for writing and publishing\n      dictionaries and other dictionary-like things. Lexonomy runs in your web\n      browser and all data is stored on the server, so you don\'t have to\n      install anything on your computer. This page will give you a brief\n      introduction to Lexonomy, showing you how to create a simple dictionary\n      and how to publish it on the web.</p><h2>Registration</h2><h3>Creating an account</h3><p>To use Lexonomy, you first need to sign up for a Lexonomy account. For that, you need to click on Get an account on the home page, provide your email address (which will be your username) and the password will be sent to you. <a href="/signup/">Go here</a> to sign up for an account. Alternatively, you can log in with your Sketch Engine account (not available on local installations). Once you have a Lexonomy account, you can login using your email and password.</p><h3>Changing your password</h3><p>Once logged in, you can click on your username in the top right hand corner of the screen and open the menu. Select “Your profile” and at the bottom, there is an option for changing your password. Type in your new password and click “Change”.</p><h3>Forgot your password?</h3><p>If you forgot your password, click on the “Forgot your password?” link on the Lexonomy homepage, type in the email address you used when signing up and you will receive instructions on how to create a new password.</p><h2>Creating a new dictionary</h2><p>When you\'re logged in, the Lexonomy home page has a section titled <em>Your dictionaries</em>. That section is empty at first but there is a link to create a new dictionary.</p><p><img alt="Screenshot" src="/docs/01-01.png" width="90%"/></p><p>Don\'t be shy about creating a new dictionary, you will always be able to delete it later and you can create as many as you want. Also, your dictionary will not be publicly visible until you decide you want it to be.</p><p><img alt="Screenshot" src="/docs/01-02.png" width="90%"/></p><p>You have to give your dictionary a title and each new dictionary is automatically assigned a URL. This URL will be your dictionary’s address on the web. It can be changed later in the Configure settings.</p><h3>Creating a dictionary from a template</h3><p>Finally, you have to choose whether you want to create a dictionary from a template or not. If this is your first time doing this, it is recommended that you select a template in the drop-down list. There are two templates, i.e. <em>simple monolingual dictionary</em> and <em>simple bilingual dictionary</em>.</p><p><img alt="Screenshot" src="/docs/01-03.png" width="90%"/></p><p>Voilà, your dictionary is ready! Click the URL to go to its homepage.</p><h3>Creating a dictionary without a template</h3><p>It is also possible to use your own XML schema. In that case you chose the option none under template. See the section on <em>configuring your dictionary</em> on how to use your own XML schema.</p><h3>Cloning an existing dictionary</h3><p>You can also use an existing dictionary as a template. If you hover over an existing dictionary, two options appear behind it, i.e. delete and clone. By clicking on clone, a clone of the dictionary of your choice will be created and it will appear in the list of <em>Your dictionaries</em> under the dictionary that you have cloned.</p><h2>Editing entries</h2><p>Click the <em>Edit</em> link on your dictionary\'s homepage and you will be taken to Lexonomy\'s editing interface. This is where you create and edit entries.</p><p><img alt="Screenshot" src="/docs/02-01.png" width="90%"/></p><p>There is a list of entries on the left-hand side. If you had selected a template while creating your dictionary, you will see one or two sample entries here that have been created for you automatically. You can delete the sample entries if you want, and you can create as many new entries as you want. There is no upper limit to the number of entries your dictionary can contain. But for now, click one of the sample entries to see it displayed.</p><p><img alt="Screenshot" src="/docs/02-02.png" width="90%"/></p><p>What you\'re looking at here is a pretty-printed rendering of the entry. This is what it will look like if you decide to make your dictionary public on the Lexonomy server later. To edit the entry, click the <em>Edit</em> button at the top.</p><p><img alt="Screenshot" src="/docs/02-03.png" width="90%"/></p><p>Now it gets interesting! What you have here is the underlying structure of the entry, with things like headwords and senses and parts of speech marked up explicitly with XML (Extensible Markup Language).  Note that by default there are two editing views, a Nerd view and a Laic view. You can easily switch between the two views by clicking on the icons at the bottom of the editing screen. The Laic view may be slightly more user-friendly if you’re not used to working with XML.</p><p>You don\'t need to be an XML expert to use Lexonomy, but you do need to understand that every entry in Lexonomy is a small XML document which consists of <strong>elements</strong>. Each element has a name such as <code>headword</code> and consists of an <strong>opening tag</strong> such as <code>&lt;headword&gt;</code>, a <strong>closing tag</strong> such as <code>&lt;/headword&gt;</code>, and text or other elements between them. The tags are there to tell us what the various pieces of text mean. You can click on any piece of text between tags and a textbox will appear allowing you to change it.</p><p><img alt="Screenshot" src="/docs/02-04.png" width="90%"/></p><p>Sometimes, when you click on a piece of text between tags, you will be given a choice from a list instead of a free-form textbox. This is because Lexonomy knows what is supposed to go inside each element and acts accordingly.</p><p><img alt="Screenshot" src="/docs/02-05.png" width="90%"/></p><p>If you do something Lexonomy doesn\'t like, such as leaving the text inside an element blank, Lexonomy will tell you by displaying a little warning triangle. You can click the warning triangle to read a description of the error.</p><p><img alt="Screenshot" src="/docs/02-06.png" width="90%"/></p><p>Besides clicking on text, you can click on the element names themselves. A menu will come up listing all the actions you can perform on that element. This is how you add new examples to senses (more accurately: new <code>example</code> elements inside <code>sense</code> elements) and so on.</p><p><img alt="Screenshot" src="/docs/02-07.png" width="90%"/></p><p>Notice how Lexonomy always only offers you choices that "make sense": it lets you add new examples inside senses but not inside other elements, and so on. This is because, again, Lexonomy knows what an entry is supposed to be structured like and makes sure the structure is always adhered to. This may sound limiting but it isn\'t, it promotes consistency: all your entries will be guaranteed to have the same structure. And besides, you can decide yourself what the structure is supposed to be. That\'s what we will get to next, so keep on reading.</p><h2>Configuring your dictionary</h2><p>Click the <em>Configure</em> link and Lexonomy will take you to its configuration interface. This is where you can set up various things that affect the entire dictionary, i.e. <strong>Dictionary settings</strong>, <strong>Entry settings</strong>, <strong>Publishing</strong>, <strong>External data sources</strong>.</p><p><img alt="Screenshot" src="/docs/03-01.png" width="90%"/></p><h3>Dictionary settings</h3><h4>Name and description</h4><p>This setting allows you to change the name of your dictionary, and provide its description (e.g. size, last time of update, authors, how to reference it etc.). You can use more advanced presentation format with MarkDown. Don\'t forget to click the <em>Save</em> button if you change anything here!</p><p><img alt="Screenshot" src="/docs/03-02.png" width="90%"/></p><h4>Users</h4><p>Another thing you have control over is who has access to the dictionary and who can make changes there, beside yourself. This can be found under <em>Users</em>. You will see your own e-mail address listed there. This means that you have access to this dictionary. To add another user, type their e-mail address into the text box and click <em>Add</em>, and then select the level of access for them:</p><ul><li>Edit: they will be able to edit the dictionary entries.</li><li>Configure: they will be able to enter Configure options.</li><li>Download: they will be able to download dictionary entries.</li><li>Upload: they will be able to upload new entries.</li></ul><p>Be careful about <em>Configure:</em> users who have access to this can do what you\'re doing now, which means they could even remove you as a user or downgrade your access privileges. If you have a team of people collaborating on a single dictionary, it\'s a good idea that only one of them has access to the configuration interface.\n      If you want to give the new user a view-only access (relevant only for private dictionaries), then add them without selecting any of the above options. Again, don\'t forget to click the <em>Save</em> button afterwards.</p><p><img alt="Screenshot" src="/docs/03-03.png" width="90%"/></p><p>Once you\'ve saved the user list, any users on that list will have access to your dictionary – provided they have a Lexonomy account. The next time they log in, they will see the dictionary listed under <em>Your dictionaries</em> on the Lexonomy homepage.</p><h3>Entry settings</h3><h4>Entry structure</h4><p>Another thing you have control over in the configuration interface is the structure of entries: what elements are allowed to be there, what content is supposed to be inside them and so on. You\'ll find all that under <em>Entry structure</em> in the <em>Configure</em> section.</p><p><img alt="Screenshot" src="/docs/04-01.png" width="90%"/></p><p>You may get the impresion that this part of Lexonomy is overwhelmingly complex. Don\'t let that bother you, it\'s not for beginners. If you have started your dictionary from a template, everything here has already been set up for you and you don\'t need to come near it. If, on the other hand, you have worked with XML Schemas or DTDs (= Documents Type Definitions) or similar things before, you will find this familiar: Lexonomy\'s formalism for specifying the structure of entries is about as expressive as a DTD.</p><p>One last warning before we move on. At the beginning of your project when the dictionary is empty, you can change the entry structure as much as you want. Later on, though, once you\'ve created some entries, you need to tread carefully. Don\'t make changes that would disturb entries you\'ve created already. For example, do not rename elements that are already in use in the entries, and do not change the hierarchy of parent and child elements. That would cause your existing entries to become "invalid" (there will be warning triangles everywhere) and you will have to correct them manually one by one. The rule of thumb is, do add but do not take away.</p><h4>Subentries</h4><p>Lexonomy provides the option of subentries. That is, while defining the entry schema, you can designate certain sections of the XML tree, for example phraseological subentries, to be ‘shareable’, turning them into snippets of XML which are allowed to appear in several entries simultaneously. All the elements you list here will be treated as subentries by Lexonomy, and you will be able to share them among several entries. Shareable subentries have a shaded background in the editing interface and are followed by a button which tells you how\n      many other entries, besides this one, share this subentry.</p><h4>Headwords</h4><p>This section allows you to configure the headword list and its display. You can select the element which contains the entry\'s headword. If you make no selection here Lexonomy will try to guess what the headword of each entry is. You can also adjust the order of the headwords in the entry list by specifying the element that should be used for sorting, e.g. part of speech and you can hard-code the alphabetical order that should be used for sorting.</p><p>In this section you can also specify any elements whose content you want be displayed beside the headword in the entry list, such as homograph numbers or part-of-speech labels.</p><h4>Flags</h4><p>In this section, you can set different flags (coloured circles) to each entry in order to be able to easily monitor its status. This can then be used to control the workflow in your project. To be able to use this function, each entry needs to have a specific element containing one of the values you have selected for your workflow. For example, let\'s say you have three stages:</p><ol><li>automatic entries not yet checked by lexicographers: status = AE (automatic entry)</li><li>entries checked by a lexicographer: status = L (lexicographer)</li><li>entries confirmed by the editor: status = C (complete)</li></ol><p>Each entry needs to have an element, let\'s say <code>&lt;status&gt;</code>, into which one of these values is put. Then, you need to select that element in the Flags section, and enter the value and (optionally) explanatory label, and choose the colour for each status type. This information is then visualised in the form of a coloured circle next to each headword. By clicking on the circle, you can see the label of the status (if provided), and change the status of the entry.</p><p><img alt="screenshot" src="/docs/ConfigFlags1.png" width="90%"/></p><p><img alt="screenshot" src="/docs/ConfigFlags2.png" width="90%"/></p><h4>Search</h4><p>The search section allows you to specify searchable elements. The contents of elements you select here will be searchable (in addition to each entry\'s headword) in the search box on top of the headword list on the editing screen.</p><h3>Publishing</h3><h4>Entry formatting</h4><p>This is where you tell Lexonomy what your entries should look like to the end-user: which parts should be in which font and so on. If you have worked with CSS (Cascading Stylesheets) or XSL (Extensible Stylesheet Language) before, you will be at home here. If not, leave the worrying to us and start your dictionary from a template.</p><p><img alt="Screenshot" src="/docs/04-02.png" width="90%"/></p><h4>Public access</h4><p>Lexonomy is not just a tool for writing dictionaries, it is a tool for making dictionaries publicly available on the web too. Doing that is almost effortless, you just need to change a few things in the configuration: go into <em>Public access</em> and change the access level from <em>Private</em> to <em>Public</em>.</p><p><img alt="Screenshot" src="/docs/05-01.png" width="90%"/></p><p>From the moment you click the <em>Save</em> button, your dictionary will be publicly viewable.</p><p><img alt="Screenshot" src="/docs/05-02.png" width="90%"/></p><p>When you visit the dictionary\'s homepage now, you will notice that it has changed: it now contains a searchbox and a few other things that allow people to search and browse the dictionary.</p><p><img alt="Screenshot" src="/docs/05-03.png" width="90%"/></p><p>You can of course change the dictionary back to <em>Private</em> any time. One thing you need to be aware of is that when making a dictionary public, you\'re making it available under an open-source licence. The exact type of licence is up to you and can be selected in <em>Public access</em> in the <em>Configure</em> section, as you\'ve probably noticed. All the options available there are open-source licences which allow other people to reuse your data freely, without the restrictions of copyright (the only thing they are legally required to do is acknowledge you publicly as the author of the data).</p><h3>External data sources</h3><p>Your Lexonomy dictionary can be paired up with <a href="https://www.sketchengine.co.uk/">Sketch Engine</a>, a popular corpus query system. Lexonomy has a feature which allows you to "pull" example sentences and other things from a Sketch Engine corpus and, vice versa, Sketch Engine has a feature that allows you to "push" an entire pre-generated dictionary into Lexonomy (and then post-edit it there).</p><h4>Sketch Engine connection</h4><p>In this section you will find options for configuring your connection with the Sketch Engine. Sketch Engine URL, Sketch Engine API URL and Corpus name are mandatory fields, others are optional.</p><h4>Examples</h4><p>Here you configure the pulling of example sentences from Sketch Engine. You need to select the element in which every example will be wrapped, then provide an XML template for every example that will be inserted into your entries, and select the element that marks the headword in the entries, if relevant.</p><p><img alt="screenshot" src="/docs/ConfigExampleSkE.png" width="90%"/></p><h4>Collocations</h4><p>Here you configure the pulling of collocations from Sketch Engine. You need to select the element in which every collocation will be wrapped, then provide an XML template for every collocation that will be inserted into your entries.</p><p><img alt="screenshot" src="/docs/ConfigCollocationSkE.png" width="90%"/></p><h4>Thesaurus items</h4><p>Here you configure the pulling of thesaurus items from Sketch Engine. You need to select the element in which every thesaurus item will be wrapped, then provide an XML template for every thesaurus item that will be inserted into your entries.</p><p><img alt="screenshot" src="/docs/ConfigThesaurusSkE.png" width="90%"/></p><h4>Definitions</h4><p>Here you configure the pulling of definitions from Sketch Engine. You need to select the element in which every definition will be wrapped, then provide an XML template for every definition that will be inserted into your entries.</p><p><img alt="screenshot" src="/docs/ConfigDefinitionSkE.png" width="90%"/></p><h2>Download</h2><p>Lexonomy offers the ability to download your entire dictionary (under the <em>Download</em> link). It is a good idea to this regularly, as a form of backup. If for any reason the server failed and your data got lost, you would be able to recover everything from your latest download. Do bear in mind that Lexonomy doesn\'t provide any guarantees and we do not make any backups on the server, so it is up to you to take care of that.</p><h2>Upload</h2><p>Another interesting feature is the ability to upload existing data into Lexonomy instead of creating all entries by hand. This is available under the <em>Upload</em> link. It is an advanced feature, though, and you would be well advised to shy away from it unless you know exactly what you\'re doing. The data you\'re uploading must be in XML and must comply exactly with the entry structure as specified in your configuration or you must upload your own XML schema as well. If you tick the box <em>purge before upload</em> all data which is currently in your dictionary will first be permanently erased and removed from your dictionary.</p><h2>Conclusion</h2><p>This brings us to the end of this introduction. You can read more about Lexonomy in the paper <a href="/docs/elex2017.pdf">Introducing Lexonomy: an open-source dictionary writing and publishing system</a>.</p></div>',
      []
    ),

    name: 'docs-intro'
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
  register$1('dict-nav', dict_nav);
  register$1('dict-entry-filter', dict_entry_filter);
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
  register$1('dict-new', dict_new);
  register$1('dict-public-entry', dict_public_entry);
  register$1('dict-public', dict_public);
  register$1('dict-upload', dict_upload);
  register$1('dict-links', dict_links);
  register$1('e404', e404);
  register$1('entry-view', entry_view);
  register$1('app-footer', app_footer);
  register$1('forgot-password', forgot_password);
  register$1('forgot', forgot);
  register$1('app-header', app_header);
  register$1('login', login);
  register$1('main-page', main_page);
  register$1('main', App);
  register$1('open-dict-list', open_dict_list);
  register$1('register-password', register_password);
  register$1('register', register);
  register$1('userprofile', userprofile);
  register$1('welcome', welcome);
  register$1('user-consent', user_consent);
  register$1('raw-html', raw_html);
  register$1('loading-overlay', loading_overlay);
  register$1('docs-intro', docs_intro);


  component(App)(document.getElementById('root'));

})();
