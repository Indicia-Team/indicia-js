// ES5 shims for Function.prototype.bind, Object.prototype.keys, etc.
require('core-js/es5');
var chai = require('chai');
var dirtyChai = require('dirty-chai');
chai.use(dirtyChai);
// Replace ./src/js with the directory of your application code and
// make sure the file name regexp matches your test files.
const context = require.context('./test/', true, /-test\.js$/);
context.keys().forEach(context);
