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
var affordance = require('./affordance.js');

/**
 * Represents a collection of Affordance and Affordances instances. They may nest collections to an indefinite depth.
 * They may also contain metadata which cascade across all nested Affordance or Affordances within the collection.
 *
 * @param id should be a string representative of a globally-unique identifier for the respective Affordances instance
 * when serialized to a document using an encoder. This argument is optional.
 * @return {*}
 * @constructor
 */
function Affordances(id) {
    if (typeof id === 'string') {
        this._id = id;
    }
    this._affordances = [];
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
 * @return {Object} representative of the most basic semantics of an {Affordances}.
 */
Affordances.method('toJSON', function () {
    return {
        '_id': this._id,
        '_metadata': this._metadata,
        '_affordances': this._affordances
    };
});

/**
 * Accessor method to allow the setting of the id field.
 *
 * @param id should be a string representative of a globally-unique identifier for the respective Affordances instance
 * when serialized to a document using an encoder.  This field is optional.
 * @return {*} for chaining.
 */
Affordances.method('setId', function (id) {
    this._id = (typeof id === 'string') ? id : this._id;
    return this;
});

/**
 * Accessor method to allow the setting of the metadata field.
 *
 * @param metadata should be an object representative of protocol headers.
 * Example: {'Content_Type':'application/json'}
 * @return {*} for chaining.
 */
Affordances.method('setMetadata', function (metadata) {
    this._metadata = (!!metadata && (typeof metadata === 'object')) ? metadata : this._metadata;
    return this;
});

/**
 * Accessor method to allow the retrieval of the identifier field.
 *
 * @return {string} identifier or {undefined}. String may be empty.
 */
Affordances.method('getId', function () {
    return this._id;
});

/**
 * Accessor method to allow the retrieval of the metadata field.
 *
 * @return {Object} metadata or {undefined}. Object may have no properties.
 */
Affordances.method('getMetadata', function () {
    return this._metadata;
});

/**
 * Allows for the addition of an Affordance or Affordances instance to the Affordances collection.
 *
 * @param action should be an instance of Affordance or Affordances.
 * @return {*} for chaining.
 */
Affordances.method('addAffordance', function (action) {
    if ((affordance.isPrototypeOf(action) || action instanceof Affordances) &&
        (this._affordances.lastIndexOf(action) === -1)) {
        this._affordances.push(action);
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
Affordances.method('cascadeMetadata', function (parentMeta) {
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
 * Convenience method to allow a shallow copy of an Affordances instance to be created from the current instance.
 *
 * @return {Affordances} a new instance with copied fields.
 */
Affordances.method('copy', function () {
    /**
     * Create a new instance of Affordances.
     * Dereference the properties on the current instance.
     * Set the values on the new instance using the respective accessor methods.
     */
    var copy =
            new Affordances()
                .setId(this._id)
                .setMetadata(this._metadata),
        affordances = this._affordances;
    /**
     * The affordances field in 'copy' will be an empty Array.
     * If the 'this' referenced instance contains Affordance or Affordances, then copy them and add them to the new
     * 'copy.'
     */
    if (Array.isArray(affordances)) {
        for (var affordance in affordances) {
            affordance = affordances[affordance];
            copy.addAffordance(affordance.copy());
        }
    }
    return copy;
});

/**
 * Convenience method to allow for the retrieval of instances of Affordance(s) from a specific index in the Array.
 *
 * @param index is an integer representative of the location in the Array you'd like to retrieve an Affordance(s).
 * Legal values are integers greater than or equal to zero.
 *
 * @return {Affordance} or {Affordances} if the index is legal; null, otherwise.
 */
Affordances.method('getAffordanceAtIndex', function (index) {
    var affordances = this._affordances;
    return (index >= affordances.length || index < 0) ? null : affordances[index];
});

/**
 * Convenience method to allow for the retrieval of instances of Affordance(s) from a specific index in the Array.
 * In this case, the index will always be the last possible index in the Array, length - one.
 *
 * @return {Affordance} or {Affordances} if the index is legal; null, otherwise.
 */
Affordances.method('getLastAffordance', function () {
    return this.getAffordanceAtIndex(this.getCount() - 1);
});

/**
 * Search for an identifier amongst all nested Affordance(s) within the root Affordances collection.
 * The intention of this method is to allow for global uniqueness checking of identifiers to disambiguate Affordance(s)
 * instances. Using this method will allow for Affordance(s) to not be added to the collection if they collide with
 * an identifier of another Affordance(s) instance already in the collection.
 *
 * @param id is a String identifier for the Affordance or Affordances sought after.
 * @return true, if the identifier was found on an instance of Affordance(s) nested in the collection; false, otherwise.
 */
Affordances.method('hasAffordanceWithId', function (id) {
    if (typeof id === 'string') {
        /**
         * Get a stack frame reference to:
         * - the Array of affordances contained as a field
         * The affordances field will always be an Array.
         */
        var affordances = this._affordances;
        /**
         * Iterate through the Array, and attempt to introspect each Object contained for their respective identifier.
         * If the Array is empty, the fast enumeration does not take place.
         */
        for (var affordance in affordances) {
            /**
             * Dereference each index in the Array. Each returned Object is guaranteed to be an instance of Affordance
             * or Affordances.
             */
            affordance = affordances[affordance];
            /**
             * The _id property may yield undefined on an instance of Affordances. If defined, it is a String.
             * The _id property is guaranteed to yield a String on an instance of Affordance. The String may be empty.
             * This checks if undefined or the String is equivalent to the String passed in the id argument.
             * This is not a reference check.
             */
            if (affordance._id === id) {
                /**
                 * If the values are equivalent, a match is found.
                 */
                return true;
            }
            /**
             * If the dereferenced index yielded an Affordances instance, and the _id being searched for was not the
             * identifier of the collection itself, then iterate through the nested Affordance or Affordances instances.
             */
            if (affordance instanceof Affordances) {
                /**
                 * Only return if an instance of Affordance or Affordances was found by the identifier.
                 * Else, keep searching the Array on the current level of recursion.
                 */
                affordance = affordance.hasAffordanceWithId(id);
                if (!!affordance) {
                    return true;
                }
            }
        }
    }
    return false;
});

/**
 * Retrieve a shallow-copy of an instance of Affordance or Affordances from the collection of Affordances by its
 * identifier.
 *
 * This intentionally does not return a reference to the original due to the inflexibility regarding
 * modification of an Affordance or Affordances fields. If a direct-reference had been returned, then side-effects may
 * arise between successive invocations due to things like:
 * - Cascading metadata
 * - Introduction of context-sensitive IANA relations
 * - Modification of template URIs with the intention of making them opaque
 *
 * Do note that because a 'shallow' copy is returned, as opposed to a 'deep' copy, modification of the values of its
 * fields may still be modifying references to the originals. It is recommended that the values of the fields not be
 * modified directly, but rather replaced. Treat them as immutable.
 *
 * @param id is a String identifier for the Affordance or Affordances being retrieved.
 * @return a shallow-copy of the found {Affordance} or {Affordances}; null, otherwise.
 */
Affordances.method('copyAffordanceById', function (id) {
    if (typeof id === 'string') {
        /**
         * Get a stack frame reference to:
         * - the Array of affordances contained as a field
         * - the Object of metadata contained as a field
         * The affordances field will always be an Array.
         * The metadata field will always be either:
         * - undefined
         * - Object
         */
        var affordances = this._affordances,
            metadata = this._metadata;
        /**
         * Iterate through the Array, and attempt to introspect each Object contained for their respective identifier.
         * If the Array is empty, the fast enumeration does not take place.
         */
        for (var affordance in affordances) {
            /**
             * Dereference each index in the Array. Each returned Object is guaranteed to be an instance of Affordance
             * or Affordances.
             */
            affordance = affordances[affordance];
            /**
             * The _id property may yield undefined on an instance of Affordances. If defined, it is a String.
             * The _id property is guaranteed to yield a String on an instance of Affordance. The String may be empty.
             * This checks if undefined or the String is equivalent to the String passed in the id argument.
             * This is not a reference check.
             */
            if (affordance._id === id) {
                /**
                 * If the values are equivalent, a match is found.
                 * Return a copy of the instance. Not a direct reference.
                 * Returning a copy of the instance allows us to modify its properties without fear of impacting future
                 * searches for the same instance.
                 */
                return affordance
                    .copy()
                    .cascadeMetadata(metadata);
            }
            /**
             * If the dereferenced index yielded an Affordances instance, and the _id being searched for was not the
             * identifier of the collection itself, then iterate through the nested Affordance or Affordances instances.
             */
            if (affordance instanceof Affordances) {
                affordance = affordance.copyAffordanceById(id);
                /**
                 * Only return if an instance of Affordance or Affordances was found by the identifier.
                 * Else, keep searching the Array on the current level of recursion.
                 */
                if (!!affordance) {
                    /**
                     * Do NOT copy the instance returned above before returning it here. It'd be a needless
                     * instantiation. It's already a shallow copied instance.
                     */
                    return affordance
                        .cascadeMetadata(metadata);
                }
            }
        }
    }
    return null;
});

/**
 * ForEachAffordance executes the provided callback once for each Affordance contained.
 *
 * Callback is invoked with one argument, the Affordance. Affordances instances are never passed as an argument.
 * However, they are enumerated because they may contain more Affordance instances.
 *
 * The reference to the collection is intentionally not passed as a callback argument to deter modification of the
 * collection's contents.
 *
 * Note: There is no way to stop or break a forEachAffordance loop.
 *
 * @param callback should be a {Function} to execute for each {Affordance}. It should expect one argument, and that
 * argument shall be an encountered {Affordance}.
 * @return {*} for chaining.
 */
Affordances.method('forEachAffordance', function (callback) {
    /**
     * Affordances will be an [{Affordance} | {Affordances}].
     */
    var affordances = this._affordances;
    /**
     * If callback is a Function,
     * Then proceed with enumerating the array,
     * Else there is no reason to enumerate.
     */
    if (typeof callback === 'function') {
        /**
         * Enumerate the Array,
         * And check if each item is an instance of Affordance or Affordances.
         * If it is an instance of Affordances,
         * Then invoke Affordances.forEachAffordance,
         * Else callback with the Affordance.
         *
         * Consider eventually using a closure so an anonymous Function does NOT have to be created on each stack frame.
         */
        affordances.forEach(function (affordance) {
            /**
             * Each item will be an instance of Affordance or Affordances. There is no way to add anything else to the
             * collection.
             */
            if (affordance instanceof Affordances) {
                affordance.forEachAffordance(callback);
            } else {
                callback(affordance);
            }
        });
    }
    return this;
});

/**
 * Accessor method to get the amount of Affordance and Affordances children within an instance of Affordances.
 * This does not account for nested Affordances instances. This only counts the amount at the root level.
 *
 * @return Number indicative of the amount of Affordance and Affordances children within this instance.
 */
Affordances.method('getCount', function () {
    return this._affordances.length;
});

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 *
 * @return {Affordances}
 */
function affordances(id) {
    return new Affordances(id);
}

/**
 * Convenience method to allow for type checking outside of the scope of this module.
 *
 * @param object is a reference to an object you would like to test the prototypal inheritance chain on.
 * @return {Boolean}
 */
affordances.isPrototypeOf = function (object) {
    return object instanceof Affordances;
};

/**
 * Convenience method to allow for duck-type checking of a generic Object outside of the scope of this module.
 *
 * @param object is a reference to an object you would like to duck-type check as an Affordances.
 * @return {Boolean}
 */
affordances.canRevive = function (object) {
    /**
     * Is the argument an Object, and does it have the minimum properties necessary to be duck-typed an Affordances?
     */
    return !!object &&
        typeof object === 'object' &&
        Array.isArray(object._affordances);
};

/**
 * Convenience method to allow for reviving a JSON encoded Affordances outside of the scope of this module.
 *
 * @param object is a reference to an object you would like to revive to an Affordances instance.
 * @return {Affordances} if revivable; null, otherwise.
 */
affordances.revive = function (object) {
    if (!!object &&
        typeof object === 'object' &&
        Array.isArray(object._affordances)) {
        var instance =
                new Affordances()
                    .setId(object._id)
                    .setMetadata(object._metadata),
            affordances = object._affordances;

        for (var affordance in affordances) {
            affordance = affordances[affordance];
            instance.addAffordance(affordance);
        }
        return instance;
    }
    return null;
};

module.exports = exports = affordances;
