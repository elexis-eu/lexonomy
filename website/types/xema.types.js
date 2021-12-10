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
