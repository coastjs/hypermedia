/**
 * Instantiate my own in-line exports object. This may be redundant, but it makes things verbose.
 * @type {Object}
 */
module.exports = exports = {};

/**
 * Every returned exports object from the require invocations should return a convenience instantiation method for the
 * respective module-scoped constructor function.
 */
module.exports.affordance = exports.affordance = require('./affordance.js');
module.exports.affordances = exports.affordances = require('./affordances.js');
module.exports.argo = exports.argo = require('./argo.js');
module.exports.decoder = exports.decoder = require('./decoder.js');
module.exports.encoder = exports.encoder = require('./encoder.js');
module.exports.hapi = exports.hapi = require('./temp.js');
module.exports.hypermediator = exports.hypermediator = require('./hypermediator.js');
module.exports.input = exports.input = require('./input.js');
module.exports.naval = exports.naval = require('./naval.js');
module.exports.plugin = exports.plugin = require('./plugin.js');
