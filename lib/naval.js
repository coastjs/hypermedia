/**
 * Falsy Values: false, 0, "", null, undefined, NaN
 */

/**
 * Module Dependencies.
 */
var plugin = require('./plugin.js'),
    affordances = require('./affordances.js'),
    affordance = require('./affordance.js'),
    input = require('./input.js');
/**
 * NavAL is an instance of Plugin. It will encode Affordance or Affordances instances into a NavAL JSON representation,
 * and return the encoded string immediately.
 */
var naval = plugin();

/**
 * Revivers:
 * If a reviver is specified, the value computed by parsing is transformed before being returned. Specifically, the
 * computed value, and all its properties (beginning with the most nested properties and proceeding to the original
 * value itself), are individually run through the reviver, which is called with the object containing the property
 * being processed as 'this' and with the property name as a string and the property value as arguments. If the reviver
 * function returns undefined (or returns no value, e.g. if execution falls off the end of the function), the property
 * is deleted from the object. Otherwise the property is redefined to be the return value.
 *
 * The reviver is ultimately called with the empty string and the topmost value to permit transformation of the topmost
 * value.  Be certain to handle this case properly, usually by returning the provided value, or JSON.parse will return
 * undefined.
 *
 * NavAL JSON Reviver:
 * Attempts to revive a NavAL JSON string back into its analogous Affordance, Affordances, and Input instances
 * at runtime.
 *
 * @param key is the string property on an Object or Array being revived during JSON string parsing.
 * @param value is the value associated with the string property being revived during JSON string parsing.
 * @return a transformed value. If the reviver function returns undefined (or returns no value, e.g. if execution falls
 * off the end of the function), the property is deleted from the object. Otherwise the property is redefined to be the
 * return value.
 */
function navalJsonReviver(key, value) {
    if (!!value && typeof value === 'object') {
        if (affordance.canRevive(value)) {
            return affordance.revive(value);
        } else if (input.canRevive(value)) {
            return input.revive(value);
        } else if (affordances.canRevive(value)) {
            return affordances.revive(value);
        }
    }
    return value;
}

/**
 * Set the delegate callback function that handles the encoding for this particular media type
 * (NavAL JSON in this case.)
 *
 * @param affordances should be an instance of Affordance or Affordances.
 * @return should be an encoded string representation of the Affordance or Affordances.
 */
naval.setShouldEncodeDelegate(function (hypermedia) {
    return JSON.stringify(hypermedia, null, '    ');
});

/**
 * Set the delegate callback function that handles the decoding for this particular media type
 * (NavAL JSON in this case.)
 *
 * @param string should be an instance of String, and should be of media type NavAL JSON.
 * @return {Affordance} or {Affordances} if succeeded. Else, null.
 */
naval.setShouldDecodeDelegate(function (string) {
    /**
     * If parsing the JSON fails because the argument is:
     * - not a string instance
     * - an invalid JSON string instance,
     * then catch the error.
     * If the parsing succeeds, but it did NOT revive an Affordance or Affordances instance, then return null.
     * If the parsing succeeds, and it did revive an Affordance or Affordances instance, then return the reference.
     */
    try {
        var object = JSON.parse(string, navalJsonReviver);
        if (affordance.isPrototypeOf(object) || affordances.isPrototypeOf(object)) {
            return object;
        }
    } catch (e) {
        console.log(e.message);
    }
    return null;
});

module.exports = exports = naval;
