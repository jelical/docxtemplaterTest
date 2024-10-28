import * as path from "node:path";
import * as fs from "node:fs";
import PizZip from "pizzip";
import docxtemplater from "docxtemplater";

console.log("Hello World");
console.log(__dirname);
const templatePath = path.resolve(__dirname, 'exampleDoc.docx');
const content = fs.readFileSync(templatePath, 'binary');
const zip = new PizZip(content);
const doc = new docxtemplater(zip, {paragraphLoop: true, linebreaks: true});
const data = {
firstName: "Danny",
lastName: "Sivan",
}

doc.setData(data)
try {
    // Render the document (replace all occurrences of {{...}} tags)
    doc.render();
} catch (error) {
    // Catch rendering errors
    console.error(JSON.stringify({ error }));
    throw error;
}

// Create the filled document
const output = doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
});

// Save the document to a file
const outputPath = path.resolve(__dirname, 'output.docx');
fs.writeFileSync(outputPath, output);

console.log('Document has been created successfully!');