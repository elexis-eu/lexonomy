// Intermediaries (before conversion to xema/docspec)
// ===========================================

/** XmlAttribute
 * @typedef {Object} XmlAttribute
 * @property {string} element element to which this attribute applies
 * @property {string} name name of this attribute
 * @property {string} defaultValue
 * @property {boolean} isRequired
 * @property {boolean} isReadOnly
 * @property {null|string[]} menu list of allowed values, null when allowed values are not restricted
 */

/** XmlElementChild
 * @typedef {Object} XmlElementChild
 * @property {number} minRepeat
 * @property {number} maxRepeat
 * @property {'element'|'choice'|'sequence'} type
 * @property {Array<string|XmlElementChild>} children contains one string when type = 'element' I think?
 */

/** XmlElement
 * @typedef {Object} XmlElement
 * @property {string} name element name
 * @property {boolean} hasText can element include text
 * @property {XmlElementChild[]} children
 */

/** XmlStructure
 * @typedef {Object} XmlStructure
 * @property {XmlElement[]} elements
 * @property {XmlAttribute[]} attributes
 * @property {null|string} root name of the root element, if unambiguous
 */
