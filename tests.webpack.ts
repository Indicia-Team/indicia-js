
// Replace ./src/js with the directory of your application code and
// make sure the file name regexp matches your test files.
const context = require.context('./test/', true, /-test\.ts$/);
context.keys().forEach(context);
