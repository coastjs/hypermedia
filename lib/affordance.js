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
 * Module Dependencies.
 */
var input = require('./input.js');

/**
 * Psychologist James J. Gibson originally introduced the term in his 1977 article "The Theory of Affordances"[1] and
 * explored it more fully in his book The Ecological Approach to Visual Perception[2] in 1979. He defined affordances
 * as all "action possibilities" latent in the environment, objectively measurable and independent of the individual's
 * ability to recognize them, but always in relation to agents and therefore dependent on their capabilities.
 * For instance, a set of steps which rises four feet high does not afford the act of climbing if the actor is a
 * crawling infant. Gibson's is the prevalent definition in cognitive psychology.
 *
 * In the context of this application, an Affordance is an "action possibility" on a Resource-Oriented Architecture web
 * API.
 *
 * @param id should be a string representative of a globally-unique identifier for the respective Affordance instance
 * when serialized to a document using an encoder.
 * @param method should be a string representative of a protocol method.
 * @param uri should be a string representative of a URI.
 * @return {*}
 * @constructor
 */
function Affordance(id, method, uri) {
    this._id = (typeof id === 'string') ? id : '';
    this._method = (typeof method === 'string') ? method : '';
    this._uri = (typeof uri === 'string') ? uri : '';
    this._messages = {'*': [ this._id ]};
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
 * @return {Object} representative of the most basic semantics of an {Affordance}.
 */
Affordance.method('toJSON', function () {
    return {
        '_id': this._id,
        '_method': this._method,
        '_uri': this._uri,
        '_relation': this._relation,
        '_metadata': this._metadata,
        '_controls': this._controls
    };
});

/**
 *
 */
Affordance.method('addMessage', function (response, message) {
    var messages = this._messages;
    if (typeof response === 'string' && Array.isArray(message) && message.length > 0) {
        for (var id in message) {
            id = message[id];
            if (typeof id !== 'string') {
                return this;
            }
        }
        messages[response] = message;
    }
    return this;
});

/**
 *
 */
Affordance.method('getMessage', function (response) {
    var messages = this._messages,
        message = messages[response];
    return !!message ? message : messages['*'];
});

/**
 *
 */
Affordance.method('requestHandler', function (req, res) {
    res.statusCode = '200';
    res.headers = {
        'Content-Type': 'application/json'
    };
    res.body = '{}';
});

/**
 *
 */
Affordance.method('addRequestHandler', function (handler) {
    this.requestHandler = (typeof handler === 'function') ? handler : this.requestHandler;
    return this;
});

/**
 *
 */
Affordance.method('removeRequestHandler', function () {
    if (this.hasOwnProperty(this.requestHandler)) {
        delete this.requestHandler;
    }
    return this;
});

/**
 * Accessor method to allow the setting of the relation field.
 *
 * @param relation should be a string representative of an IANA relation.
 * @return {*} for chaining.
 */
Affordance.method('setRelation', function (relation) {
    this._relation = (typeof relation === 'string') ? relation : this._relation;
    return this;
});

/**
 * Accessor method to allow the setting of the metadata field.
 *
 * @param metadata should be an object representative of protocol headers.
 * Example: {'Content_Type':'application/json'}
 * @return {*} for chaining.
 */
Affordance.method('setMetadata', function (metadata) {
    this._metadata = (!!metadata && (typeof metadata === 'object')) ? metadata : this._metadata;
    return this;
});

/**
 * Accessor method to allow the retrieval of the identifier field.
 *
 * @return {string} affordance identifier. String may be empty.
 */
Affordance.method('getId', function () {
    return this._id;
});

/**
 * Accessor method to allow the retrieval of the method field.
 *
 * @return {string} protocol method. String may be empty.
 */
Affordance.method('getMethod', function () {
    return this._method;
});

/**
 * Accessor method to allow the retrieval of the URI field.
 *
 * @return {string} Uniform Resource Identifier. String may be empty.
 */
Affordance.method('getUri', function () {
    return this._uri;
});

/**
 * Accessor method to allow the retrieval of the IANA relation field.
 *
 * @return {string} IANA relation or {undefined}. String may be empty.
 */
Affordance.method('getRelation', function () {
    return this._relation;
});

/**
 * Accessor method to allow the retrieval of the metadata field.
 *
 * @return {Object} protocol metadata or {undefined}. Object may have no properties.
 */
Affordance.method('getMetadata', function () {
    return this._metadata;
});

/**
 * Allows for the addition of an Input instance to the Affordance with the intention of treating the Affordance as a
 * "form."
 *
 * @param control should be an instance of Input.
 * @return {*} for chaining.
 */
Affordance.method('addInput', function (control) {
    /**
     * Get a stack frame reference to the controls array if it exists.
     * @type {Array}
     */
    var controls = this._controls;
    /**
     * Create the controls array if it did not exist.
     */
    if (!controls) {
        controls = this._controls = [];
    }
    /**
     * Add the input control to the controls array if the reference to the input control did not already exist within
     * the array.
     */
    if (input.isPrototypeOf(control) && (controls.lastIndexOf(control) === -1)) {
        controls.push(control);
    }
    return this;
});

/**
 * Cascades the metadata of a parent Affordances onto its child Affordance or Affordances.
 *
 * This is useful in the case of retrieval of a child Affordance or Affordances because collection metadata spans all
 * nested children.
 *
 * Lower depth metadata has a higher precedence. This means children metadata overwrites parent metadata upon cascading
 * if name collisions arise with the keys in the Object.
 *
 * @param parentMetadata is an Object representative of the metadata of a parent Affordances instance.
 * @return {*} for chaining.
 */
Affordance.method('cascadeMetadata', function (parentMeta) {
    /**
     * Metadata on Affordance or Affordances may be undefined or Object because the field is optional.
     *
     * Get a reference to the current metadata. (augmented this operator)
     * Get a reference to the parent collections metadata. (method argument)
     * Check both of them to determine if they're enumerable.
     * If either one, or both, are an Object, then merge their fields onto a new Object with precedence given to child.
     * Else, if neither are Objects, then both were undefined, and the field stays undefined.
     */
    var childMeta = this._metadata,
        parentMetaIsObject = !!parentMeta && (typeof parentMeta === 'object'),
        childMetaIsObject = !!childMeta && (typeof childMeta === 'object'),
        mergedMetadata = (parentMetaIsObject || childMetaIsObject) ? {} : undefined;

    if (parentMetaIsObject) {
        for (var meta in parentMeta) {
            if (parentMeta.hasOwnProperty(meta)) {
                mergedMetadata[meta] = parentMeta[meta];
            }
        }
    }
    /**
     * Precedence given to child by merging it last.
     * If the meta keys collide with previous meta keys, then the values override.
     */
    if (childMetaIsObject) {
        for (var meta in childMeta) {
            if (childMeta.hasOwnProperty(meta)) {
                mergedMetadata[meta] = childMeta[meta];
            }
        }
    }

    /**
     * This will only remain undefined if neither the parent, nor child, had metadata to contribute.
     * If either, or both, had metadata to contribute, then this is now a new Object with merged fields.
     * We can set the reference to the current child directly because this is meant be set on a copy's field.
     */
    this._metadata = mergedMetadata;
    /**
     * For chaining.
     */
    return this;
});

/**
 * Convenience method to allow a shallow copy of an Affordance instance to be created from the current instance.
 * @return {Affordance} a new instance with copied fields.
 */
Affordance.method('copy', function () {
    var copy =
            new Affordance(this._id, this._method, this._uri)
                .setRelation(this._relation)
                .setMetadata(this._metadata),
        controls = this._controls;

    if (Array.isArray(controls)) {
        for (var control in controls) {
            control = controls[control];
            copy.addInput(control.copy());
        }
    }
    return copy;
});

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 *
 * @param id should be a string representative of a globally-unique identifier for the respective Affordance instance
 * when serialized to a document using an encoder.
 * @param method should be a string representative of a protocol method.
 * @param uri should be a string representative of a URI.
 * @return {Affordance}
 */
function affordance(id, method, uri) {
    return new Affordance(id, method, uri);
}

/**
 * Convenience method to allow for type checking outside of the scope of this module.
 *
 * @param object is a reference to an object you would like to test the prototypal inheritance chain on.
 * @return {Boolean}
 */
affordance.isPrototypeOf = function (object) {
    return object instanceof Affordance;
};

/**
 * Convenience method to allow for duck-type checking of a generic Object outside of the scope of this module.
 *
 * @param object is a reference to an object you would like to duck-type check as an Affordance.
 * @return {Boolean}
 */
affordance.canRevive = function (object) {
    /**
     * Is the argument an Object, and does it have the minimum properties necessary to be duck-typed an Affordance?
     */
    return !!object &&
        typeof object === 'object' &&
        typeof object._id === 'string' &&
        typeof object._method === 'string' &&
        typeof object._uri === 'string';
};

/**
 * Convenience method to allow for reviving a JSON encoded Affordance outside of the scope of this module.
 *
 * @param object is a reference to an object you would like to revive to an Affordance instance.
 * @return {Affordance} if revivable; null, otherwise.
 */
affordance.revive = function (object) {
    if (!!object &&
        typeof object === 'object' &&
        typeof object._id === 'string' &&
        typeof object._method === 'string' &&
        typeof object._uri === 'string') {
        var instance =
                new Affordance(object._id, object._method, object._uri)
                    .setRelation(object._relation)
                    .setMetadata(object._metadata),
            controls = object._controls;

        if (Array.isArray(controls)) {
            for (var control in controls) {
                control = controls[control];
                instance.addInput(control);
            }
        }
        return instance;
    }
    return null;
};

module.exports = exports = affordance;
