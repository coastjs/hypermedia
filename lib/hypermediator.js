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
var plugin = require('./plugin.js');

/**
 * A Hypermediator allows a user to spawn a live HTTP server using various Node HTTP server frameworks with the support
 * of Plugin extensions. It utilizes XHN's HypermediaApi instances to specify how a Hypermedia API is modeled, and
 * creates an HTTP server programmatically from the HAPI DSL.
 *
 * Server instances will default to assigning a random port and accepting connections directed to any IPv4 address
 * (INADDR_ANY).
 *
 * @param extension should be an instance of {Plugin}. This argument is optional, and the field will be initialized
 * to null.
 * @return {*}
 * @constructor
 */
function Hypermediator(extension) {
    this._plugin = (plugin.isPrototypeOf(extension)) ? extension : null;
    this._port = '0';
    return this;
}

/**
 * Accessor method to allow the setting of the Plugin extension.
 *
 * @param extension should be an instance of {Plugin}.
 * @return {*} for chaining.
 */
Hypermediator.method('setPlugin', function (extension) {
    this._plugin = (plugin.isPrototypeOf(extension)) ? extension : this._plugin;
    return this;
});

/**
 * Accessor method to allow the setting of the port the server should begin accepting connections over.
 * A port value of '0' will assign a random port.
 *
 * @param port should be a {string}.
 * Examples: '80', '443'
 * @return {*} for chaining.
 */
Hypermediator.method('setPort', function (port) {
    this._port = (typeof port === 'string' && Number(port) >= 0) ? port : this._port;
    return this;
});

/**
 * Accessor method to allow the setting of the host the server should begin accepting connections over.
 * If the hostname is omitted, the server will accept connections directed to any IPv4 address (INADDR_ANY).
 *
 * @param host should be a {string}.
 * Example: '127.0.0.1'
 * @return {*} for chaining.
 */
Hypermediator.method('setHost', function (host) {
    this._host = (typeof host === 'string') ? host : this._host;
    return this;
});

/**
 * Mediates an instance of {HypermediaApi} using a Plugin extension. This should result in the spawning of an HTTP
 * server from the instance of {HypermediaApi} provided in the function argument.
 *
 * @param api should be an instance of {HypermediaApi}.
 * @return {*} for chaining.
 */
Hypermediator.method('mediate', function (api) {
    /**
     * The extension reference may be a {Plugin} or null.
     */
    var extension = this._plugin;
    /**
     * If api is an instance of HypermediaApi,
     * And api can be hosted,
     * And extensions is capable of bridging the HypermediaApi to a server,
     * Then attempt the bridging.
     */
    if (plugin.isPrototypeOf(extension)) {
        /**
         * The port reference will always be a {string}.
         * The host reference will may be a {string} or undefined.
         */
        extension.bridge(api, this._port, this._host);
    }
    return this;
});

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 *
 * @param extension should be an instance of {Plugin}. This argument is optional, and the field will be initialized
 * to null.
 * @return {Hypermediator}
 */
function hypermediator(extension) {
    return new Hypermediator(extension);
}

/**
 * Convenience method to allow for type checking outside of the scope of this module.
 *
 * @param object is a reference to an object you would like to test the prototypal inheritance chain on.
 * @return {Boolean}
 */
hypermediator.isPrototypeOf = function (object) {
    return object instanceof Hypermediator;
};

module.exports = exports = hypermediator;
