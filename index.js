
'use strict';

/**
 * Module dependencies.
 */

const resolve = require('path').resolve;
const assert = require('assert');
const debug = require('debug')('koa-static');
const send = require('koa-send');
const co = require('co');

/**
 * Expose `serve()`.
 */

module.exports = serve;

/**
 * Serve static files from `root`.
 *
 * @param {String} root
 * @param {Object} [opts]
 * @return {Function}
 * @api public
 */

function serve(root, opts) {
  opts = opts || {};

  assert(root, 'root directory is required to serve files');

  // options
  debug('static "%s" %j', root, opts);
  opts.root = resolve(root);
  if (opts.index !== false) opts.index = opts.index || 'index.html';

  if (!opts.defer) {
    return co.wrap(function *serve(ctx, next){
      if (ctx.method == 'HEAD' || ctx.method == 'GET') {
        if (yield send(ctx, ctx.path, opts)) return;
      }
      yield next();
    });
  }

  return co.wrap(function *serve(ctx, next){
    yield next();

    if (ctx.method != 'HEAD' && ctx.method != 'GET') return;
    // response is already handled
    if (ctx.body != null || ctx.status != 404) return;

    yield send(ctx, ctx.path, opts);
  });
}
