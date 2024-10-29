// this is not direct part of source code!!!
// it loaded as file into jsreport helpers
const handlebars = require('handlebars');
const helpers = require('handlebars-helpers')({
    handlebars: handlebars
});
handlebars.registerHelper({
    upper: (str)=> helpers.uppercase(str)
})
