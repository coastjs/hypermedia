/**
 * Falsy Values: false, 0, "", null, undefined, NaN
 */

Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

/**
 * Module Dependencies.
 * @type {exports|*}
 */
var affordance = require('./affordance.js'),
    affordances = require('./affordances.js'),
    encoder = require('./encoder.js'),
    input = require('./input.js'),
    message = require('./message.js'),
    messages = require('./messages.js'),
    naval = require('./naval.js');

var fs = require('fs'),
    path = require('path');

/**
 * HypermediaApi allows for the creation of hypermedia-aware responses for an API.
 *
 * In order for a HypermediaApi to successfully encode a hypermedia-aware response, it must have a full working
 * knowledge of every possible action within an API. For this to occur, a HypermediaApi must maintain a reference to an
 * Affordances collection representative of all action possibilities.
 *
 * In order for a HypermediaApi to successfully encode a hypermedia-aware response, it must utilize an Encoder capable
 * of encoding Affordances to a hypermedia-aware media type. By default, it uses an Encoder with a NavAL JSON plugin.
 *
 * HypermediaApi allows for a selection of a subset of action possibilities to be encoded into each response. Most
 * action possibilities will represent action templates by default due to the usage of URI templates. However, a
 * HypermediaApi allows for injection of Affordance semantics at run-time to provide dynamic action possibilities.
 *
 * A Hypermedia API may optionally have:
 *  IANA Relations defined in an Affordance-Rich Message
 *  Transfer Protocol Metadata defined in an Affordance or Affordances Collection
 *  Input Controls defined in an Affordance
 *  A Name Identifier
 *
 * A Hypermedia API must have:
 *  Globally-unique Affordance Identifiers
 *  Greater than or equal to 1 Affordance
 *  Greater than or equal to 1 Affordance-Rich Message
 *  A Transfer Protocol
 *  A Hypermedia-Aware Media Type
 *
 * @param id should be a String identifier for your Hypermedia API. This is essentially a name for the API.
 * @returns {HypermediaApi}, the instance created after invoking with a new operator.
 * @constructor
 */
function HypermediaApi(id) {
    if (typeof id === 'string') {
        this._id = id;
    }
    this._protocol = 'HTTP/1.1';
    this._mediatype = 'application/naval+json';
    this._requests = affordances();
    this._responses = messages();
    return this;
}

/**
 * Accessor method that allows you to set the identifier field.
 *
 * @param id should be a String identifier for your Hypermedia API. This is essentially a name for the API.
 * @returns {*} for chaining.
 */
function setId(id) {
    this._id = (typeof id === 'string') ? id : this._id;
    return this;
}

/**
 * Accessor method that allows you to retrieve the identifier field.
 *
 * @returns {string} identifier for your Hypermedia API or {undefined}. String may be empty.
 */
function getId() {
    return this._id;
}

/**
 * Accessor method that allows you to set the protocol field.
 *
 * @param protocol should be a String that identifies the Transfer Protocol for your Hypermedia API. This defaults to
 * HTTP/1.1.
 * @returns {*} for chaining.
 */
function setProtocol(protocol) {
    this._protocol = (typeof protocol === 'string') ? protocol : this._protocol;
    return this;
}

/**
 * Accessor method that allows you to retrieve the protocol field.
 *
 * @returns {string} transfer protocol for your Hypermedia API. String may be empty.
 */
function getProtocol() {
    return this._protocol;
}

/**
 * Accessor method that allows you to set the mediatype field.
 *
 * @param mediatype should be a String that identifies the media type encoding for all the hypermedia responses to be
 * returned from the Hypermedia API. This defaults to application/naval+json.
 * @returns {*} for chaining.
 */
function setMediaType(mediatype) {
    this._mediatype = (typeof mediatype === 'string') ? mediatype : this._mediatype;
    return this;
}

/**
 * Accessor method that allows you to retrieve the mediatype field.
 *
 * @returns {string} mediatype for your Hypermedia API. String may be empty.
 */
function getMediaType() {
    return this._mediatype;
}

/**
 * Accessor method that allows you to set the requests field.
 *
 * @param requests should be an instance of Affordances that represents the entire collection of request possibilities
 * for the Hypermedia API.
 * @returns {*} for chaining.
 */
function setRequests(requests) {
    this._requests = affordances.isPrototypeOf(requests) ? requests : this._requests;
    return this;
}

/**
 * Accessor method that allows you to retrieve the requests field.
 *
 * @returns {Affordances} that represents the entire collection of request possibilities for the Hypermedia API.
 */
function getRequests() {
    return this._requests;
}

/**
 * Accessor method that allows you to set the responses field.
 *
 * @param responses should be an instance of Messages that represents the entire collection of response possibilities
 * for the Hypermedia API.
 * @returns {*} for chaining.
 */
function setResponses(responses) {
    this._responses = messages.isPrototypeOf(responses) ? responses : this._responses;
    return this;
}

/**
 * Accessor method that allows you to retrieve the responses field.
 *
 * @returns {Messages} that represents the entire collection of response possibilities for the Hypermedia API.
 */
function getResponses() {
    return this._responses;
}

/**
 * Convenience method that allows you to add transfer protocol metadata to the collection of requests, or the very last
 * request possibility added.
 *
 * @param meta should be an object representative of protocol headers.
 * Example: {'Content_Type':'application/json'}
 * @returns {*} for chaining.
 */
function addMetadata(meta) {
    var requests = this._requests,
        request = requests.getLastAffordance();
    if (!!request) {
        request.setMetadata(meta);
    } else {
        requests.setMetadata(meta);
    }
    return this;
}

/**
 * Convenience method that allows you to add a request to the collection of requests.
 *
 * @param id should be a string representative of a globally-unique identifier for the respective Affordance instance
 * when serialized to a document using an encoder.
 * @param method should be a string representative of a protocol method.
 * @param uri should be a string representative of a URI.
 * @returns {*} for chaining.
 */
function addRequest(id, method, uri) {
    var requests = this._requests;
    if (typeof id === 'string' && typeof method === 'string' &&
        typeof uri === 'string' && !requests.hasAffordanceWithId(id)) {
        requests.addAffordance(affordance(id, method, uri));
    }
    return this;
}

/**
 * Convenience method that allows you to add input controls to the last request possibility added.
 *
 * @param control is a reference to an Object you would like to revive to an Input instance, and add to the last request
 * possibility. It's intentionally a generic Object to allow for ease of use of the method call by eliminating the need
 * to create Input instances or having to enter unnecessary Function arguments.
 * @returns {*} for chaining.
 */
function addInput(control) {
    var requests = this._requests,
        request = requests.getLastAffordance();
    if (affordance.isPrototypeOf(request) && input.canRevive(control)) {
        request.addInput(input.revive(control));
    }
    return this;
}

/**
 * Convenience method that allows you to add response possibilities to the collection of Affordance-Rich Messages.
 *
 * @param req should be a String identifier from an Affordance. These are arbitrary, but globally unique Strings
 * from the Affordances collection representing an API.
 * Example: 'entry', or 'get-users'
 * @param res should be a String representative of a response code from a client-server protocol capable of
 * facilitating REST.
 * Example: '200', or '400' given HTTP as the transfer protocol.
 * @param msg should be an Array of String identifiers representing the Affordances allowed within the message of
 * the request-response transaction.
 * Example: ['entry'], or ['entry', 'get-users']
 * @returns {*} for chaining.
 */
function addResponse(req, res, msg) {
    var requests = this._requests,
        responses = this._responses;
    if (!responses.hasMessageForExchange(req, res) &&
        requests.hasAffordanceWithId(req) &&
        (Array.isArray(msg) && msg.length > 0)) {
        for (var request in msg) {
            request = msg[request];
            if (!requests.hasAffordanceWithId(request)) {
                return this;
            }
        }
        responses.addMessage(message(req, res, msg));
    }
    return this;
}

function setMiddlewarePath(dir) {
    this._middlewarePath = (typeof dir === 'string') ? dir : this._middlewarePath;
    return this;
}

function addMiddleware(middleware) {
    var base = this._middlewarePath,
        requests = this._requests,
        request = requests.getLastAffordance();
    if (affordance.isPrototypeOf(request)) {
        if (typeof middleware === 'string' && typeof base === 'string') {
            middleware = path.resolve(base, middleware);
//            console.log(middleware);
            if (fs.existsSync(middleware) && fs.statSync(middleware).isFile()) {
                try {
                    middleware = require(middleware);
                    request.addHandler(middleware);
//                    console.log(middleware);
                } catch (e) {
                    console.log(e);
                }
            }
        } else if (typeof middleware === 'function') {
            request.addHandler(middleware);
        }
    }
    return this;
}

function forEachRequest(callback) {
    var requests = this._requests;
    requests.forEachAffordance(callback);
    return this;
}

function setIncomingRequest(request) {
    if (affordance.isPrototypeOf(request)) {
        this._incomingRequest = request;
    }
    return this;
}

function getIncomingRequest() {
    return this._incomingRequest;
}

function handleRequest(req, res) {
    var request = this._incomingRequest;
    if (affordance.isPrototypeOf(request)) {
        request.handler.call(this, req, res);
    }
    delete this._incomingRequest;
    return this;
}

/**
 * Convenience method that allows for the encoding of a hypermedia response for a particular request/response exchange.
 *
 * @param res should be a String representative of a response code from a client-server protocol capable of
 * facilitating REST.
 * Example: '200', or '400' given HTTP as the transfer protocol.
 * @returns a hypermedia media type encoded String representative of all request possibilities after a particular
 * request/response exchange.
 */
function respond(res) {
    var req = affordance.isPrototypeOf(this._incomingRequest) ? this._incomingRequest.getId() : null,
        requests = this._requests,
        responses = this._responses,
        response = responses.getMessageForExchange(req, res);

    /**
     * {Message} or null may be returned from getMessageForExchange.
     */
    if (!response) {
        return '';
    }

    var hypermedia = affordances(),
        message = response.getMessage();

    /**
     * Message will always be an {Array}
     * Message will always have at least one identifier string.
     * Message will never have identifiers to non-existant {Affordance(s)}
     */
    for (var request in message) {
        hypermedia.addAffordance(requests.copyAffordanceById(message[request]));
    }

    return encoder(naval).encode(hypermedia);
}

/**
 * Allows for checking if the instance is capable of being hosted as a fully hypermedia-capable API server.
 *
 * @return {boolean} true if the instance can be hosted; {boolean} false, otherwise.
 */
function canHost() {
    /**
     * If the defined transfer protocol and hypermedia-aware media type are non-empty strings, and
     * If the instance of Affordances contains at least one nested Affordance, and
     * If the instance of Messages contains at least one nested Message,
     * Then this HypermediaApi is capable of being hosted as a fully hypermedia-capable API server.
     */
    return !!this._protocol && !!this._mediatype && this._requests.getCount() > 0 && this._responses.getCount() > 0;
    /**
     * May eventually want the identifier as a hard requirement.
     */
}

/**
 * Convenience method that allows for JSON encoding of the current instance of HypermediaApi.
 *
 * @returns a JSON encoded String of the current HypermediaApi instance.
 */
function toJson() {
    return JSON.stringify(this);
}

/**
 * References to the Function Objects above by Function name.
 * These set references to properties on the HypermediaApi Prototype to allow them to be instance methods.
 */
HypermediaApi.method('setId', setId);
HypermediaApi.method('setProtocol', setProtocol);
HypermediaApi.method('setMediaType', setMediaType);
HypermediaApi.method('setRequests', setRequests);
HypermediaApi.method('setResponses', setResponses);
HypermediaApi.method('getId', getId);
HypermediaApi.method('getProtocol', getProtocol);
HypermediaApi.method('getMediaType', getMediaType);
HypermediaApi.method('getRequests', getRequests);
HypermediaApi.method('getResponses', getResponses);
HypermediaApi.method('addMetadata', addMetadata);
HypermediaApi.method('addRequest', addRequest);
HypermediaApi.method('addInput', addInput);
HypermediaApi.method('addResponse', addResponse);
HypermediaApi.method('addMiddleware', addMiddleware);
HypermediaApi.method('forEachRequest', forEachRequest);
HypermediaApi.method('setIncomingRequest', setIncomingRequest);
HypermediaApi.method('getIncomingRequest', getIncomingRequest);
HypermediaApi.method('handleRequest', handleRequest);
HypermediaApi.method('setBasePath', setMiddlewarePath);
HypermediaApi.method('respond', respond);
HypermediaApi.method('canHost', canHost);
HypermediaApi.method('toJson', toJson);

HypermediaApi.method('id', setId);
HypermediaApi.method('protocol', setProtocol);
HypermediaApi.method('mediatype', setMediaType);
HypermediaApi.method('meta', addMetadata);
HypermediaApi.method('req', addRequest);
HypermediaApi.method('input', addInput);
HypermediaApi.method('res', addResponse);
HypermediaApi.method('use', addMiddleware);
HypermediaApi.method('path', setMiddlewarePath);

/**
 * Convenience method to enforce safe method invocations without the use of the new operator.
 *
 * @param id should be a String identifier for your Hypermedia API. This is essentially a name for the API.
 * @returns {HypermediaApi}
 */
function hapi(id) {
    return new HypermediaApi(id);
}

/**
 * Convenience method to allow for type checking outside of the scope of this module.
 *
 * @param object is a reference to an object you would like to test the prototypal inheritance chain on.
 * @return {Boolean}
 */
hapi.isPrototypeOf = function (object) {
    return object instanceof HypermediaApi;
};

module.exports = exports = hapi;
