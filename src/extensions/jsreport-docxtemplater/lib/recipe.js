const Docxtemplater = require('docxtemplater')
const PizZip = require('pizzip')
const { response } = require('@jsreport/office')
const expressionParser = require('docxtemplater/expressions');
// expressionParser.configure({
//   evaluateIdentifier: (tag, scope, scopeList, context) => {
//     if (scope.hasOwnProperty(tag)) {
//       return scope[tag];
//     }
//     return false;
//   },
// });

expressionParser.filters.upper = (input) => (input ? input?.toUpperCase() : '_______');
expressionParser.filters.underline = (input) => (input ? '__________' : input);
expressionParser.filters.startsWith = (input, value) => input?.startsWith(value);
expressionParser.filters.he = (input) =>
    input === 'Male' ? 'he' : input === 'Female' ? 'she' : 'they';
expressionParser.filters.himself = (input) =>
    input === 'Male' ? 'himself' : input === 'Female' ? 'herself' : 'themself';

module.exports = (reporter, definition) => async (req, res) => {
  if (!req.template.docxtemplater || (!req.template.docxtemplater.templateAsset && !req.template.docxtemplater.templateAssetShortid)) {
    throw reporter.createError('docxtemplater requires template.docxtemplater.templateAsset or template.docxtemplater.templateAssetShortid to be set', {
      statusCode: 400
    })
  }

  let templateAsset = req.template.docxtemplater.templateAsset

  if (req.template.docxtemplater.templateAssetShortid) {
    templateAsset = await reporter.documentStore.collection('assets').findOne({ shortid: req.template.docxtemplater.templateAssetShortid }, req)

    if (!templateAsset) {
      throw reporter.createError(`Asset with shortid ${req.template.docxtemplater.templateAssetShortid} was not found`, {
        statusCode: 400
      })
    }
  } else {
    if (!Buffer.isBuffer(templateAsset.content)) {
      templateAsset.content = Buffer.from(templateAsset.content, templateAsset.encoding || 'utf8')
    }
  }

  const zip = new PizZip(templateAsset.content.toString('binary'))
  const docx = new Docxtemplater(zip,{
    paragraphLoop: true,
    linebreaks: true,
    parser: expressionParser,
    delimiters: { start: '{{', end: '}}' },
    nullGetter: () => '________',
  })

  docx.render(req.data)

  return response({
    previewOptions: definition.options.preview,
    officeDocumentType: 'docx',
    buffer: docx.getZip().generate({ type: 'nodebuffer' }),
    logger: reporter.logger
  }, req, res)
}
