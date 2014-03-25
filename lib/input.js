/**
 * Falsy Values: false, 0, "", null, undefined, NaN
 */

/**
 * Augments the Function type object's prototype with a method called "method."
 * This method allows any Constructor Function, that prototypally inherits from
 * Function.prototype (so all Constructor Functions), to easily add methods to
 * their own prototype objects.
 *
 * @param name is the name of the method passed as a String object argument.
 * @param func is the first-class function object passed in as an argument.
 * @return {*} a reference to your respective Constructor Function.
 */
Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

/**
 * Input represents a typed data field, usually with a "form" control to allow the user to edit data.
 * This is usually representative of a key/value pair in application/x-www-form-urlencoded or a body part in
 * multipart/form-data.
 *
 * Idealistically, Input controls can be represented in any media type when being encoded by a user agent.
 *
 * Input controls should not be concerned with rendering attributes. Those concerns should be addressed in the plugin
 * for each media type used in XHN.
 *
 * @param id should be a globally unique string identifier for the input when serialized into a document.
 * @param value should be an optional, default value to include with an input control. Pass an empty string if a value
 * is not necessary.
 * @return {*}
 * @constructor
 */
function Input(id, value) {
    this._id = (typeof id === 'string') ? id : '';
    this._value = (typeof value !== 'undefined') ? value : '';
    return this;
}

/**
 * If an object being stringified has a property named toJSON whose value is a function, then the toJSON method
 * customizes JSON stringification behavior. Instead of the object being serialized, the value returned by the toJSON
 * method when called will be serialized.
 *
 * Example:
 * var json = JSON.stringify({
 *     x: {
 *            foo: 'foo',
 *            toJSON: function () {
 *                return 'bar';
 *            }
 *        }
 * });
 * json will be {string} '{"x":"bar"}'.
 *
 * @return {Object} representative of the most basic semantics of an {Input}.
 */
Input.method('toJSON', function () {
    return {
        '_id': this._id,
        '_value': this._value,
        '_accept': this._accept,
        '_hidden': this._hidden,
        '_label': this._label,
        '_options': this._options,
        '_readonly': this._readonly,
        '_regexp': this._regexp,
        '_required': this._required
    };
});

/**
 * Accessor method to allow the setting of the id field.
 *
 * @param id should be a globally unique string identifier for the input when serialized into a document.
 * @return {*} for chaining.
 */
Input.method('setId', function (id) {
    this._id = (typeof id === 'string') ? id : this._id;
    return this;
});

/**
 * Accessor method to allow the setting of the value field.
 *
 * @param value should be an optional, default value to include with an input control. Pass an empty string if a value
 * is not necessary.
 * @return {*} for chaining.
 */
Input.method('setValue', function (value) {
    this._value = (typeof value !== 'undefined') ? value : this._value;
    return this;
});

/**
 * Accessor method to allow the setting of the accept field.
 *
 * @param accept should be an array of strings representative of media types that this individual input control
 * can be encoded as. This is useful if the value of a input control is being read from a file. Example: ['text/plain']
 * @return {*} for chaining.
 */
Input.method('setAccept', function (accept) {
    this._accept = (Array.isArray(accept) && accept.length > 0) ? accept : this._accept;
    return this;
});

/**
 * Accessor method to allow the setting of the required field.
 *
 * @param required should be a boolean indicative of whether this input control requires a value by the processing user
 * agent.
 * @return {*} for chaining.
 */
Input.method('setRequired', function (required) {
    this._required = (typeof required === 'boolean') ? required : this._required;
    return this;
});

/**
 * Accessor method to allow the setting of the label field.
 *
 * @param label should be a human readable, string representative of the semantics of the particular input control.
 * This field is optional.
 * @return {*} for chaining.
 */
Input.method('setLabel', function (label) {
    this._label = (typeof label === 'string') ? label : this._label;
    return this;
});

/**
 * Accessor method to allow the setting of the hidden field.
 *
 * @param hidden should be a boolean indicative of whether this input control should be acknowledged by the processing
 * user agent, or just passed along for state purposes. This field is optional.
 * @return {*} for chaining.
 */
Input.method('setHidden', function (hidden) {
    this._hidden = (typeof hidden === 'boolean') ? hidden : this._hidden;
    return this;
});

/**
 * Accessor method to allow the setting of the readonly field.
 *
 * @param readonly should be a boolean indicative of whether this input control should have a mutable value. This field
 * is optional.
 * @return {*} for chaining.
 */
Input.method('setReadonly', function (readonly) {
    this._readonly = (typeof readonly === 'boolean') ? readonly : this._readonly;
    return this;
});

/**
 * Accessor method to allow the setting of the options field.
 *
 * @param options should be an array of length greater than zero with possible options to be selected by the user when
 * entering a value. This field is optional.
 * @return {*} for chaining.
 */
Input.method('setValueOptions', function (options) {
    this._options = (Array.isArray(options) && options.length > 0) ? options : this._options;
    return this;
});

/**
 * Accessor method to allow the setting of the regexp field.
 *
 * @param regexp should be a string representative of a regular expression to be used in the processing user agent to
 * validate an entered value before making a network request.
 * @return {*} for chaining.
 */
Input.method('setRegExp', function (regexp) {
    this._regexp = (typeof regexp === 'string') ? regexp : this._regexp;
    return this;
});

/**
 * Convenience method to allow a shallow copy of an Input instance to be created from the current instance.
 *
 * @return {Input} a new instance with copied fields.
 */
Input.method('copy', function () {
    return new Input()
        .setId(this._id)
        .setValue(this._value)
        .setAccept(this._accept)
        .setRequired(this._required)
        .setLabel(this._label)
        .setHidden(this._hidden)
        .setReadonly(this._readonly)
        .setValueOptions(this._options)
        .setRegExp(this._regexp);
});

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 *
 * @param id should be a globally unique string identifier for the input when serialized into a document.
 * @param value should be an optional, default value to include with an input control. Pass an empty string if a value
 * is not necessary.
 * @return {Input}
 */
function input(id, value) {
    return new Input(id, value);
}

/**
 * Convenience method to allow for type checking outside of the scope of this module.
 *
 * @param object is a reference to an object you would like to test the prototypal inheritance chain on.
 * @return {Boolean}
 */
input.isPrototypeOf = function (object) {
    return object instanceof Input;
};

/**
 * Convenience method to allow for duck-type checking of a generic Object outside of the scope of this module.
 *
 * @param object is a reference to an object you would like to duck-type check as an Input.
 * @return {Boolean}
 */
input.canRevive = function (object) {
    /**
     * Is the argument an Object, and does it have the minimum properties necessary to be duck-typed an Input?
     */
    return !!object &&
        typeof object === 'object' &&
        typeof object._id === 'string' &&
        typeof object._value !== 'undefined';
};

/**
 * Convenience method to allow for reviving a JSON encoded Input outside of the scope of this module.
 *
 * @param object is a reference to an object you would like to revive to an Input instance.
 * @return {Input} if revivable; null, otherwise.
 */
input.revive = function (object) {
    if (!!object &&
        typeof object === 'object' &&
        typeof object._id === 'string' &&
        typeof object._value !== 'undefined') {
        return new Input()
            .setId(object._id)
            .setValue(object._value)
            .setAccept(object._accept)
            .setRequired(object._required)
            .setLabel(object._label)
            .setHidden(object._hidden)
            .setReadonly(object._readonly)
            .setValueOptions(object._options)
            .setRegExp(object._regexp);
    }
    return null;
};

module.exports = exports = input;
