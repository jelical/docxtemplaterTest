import * as path from "node:path";
import * as fs from "node:fs";
import * as Jexl from "jexl";
import PizZip from "pizzip";
import docxtemplater from "docxtemplater";
import expressionParser from "docxtemplater/expressions";
import InspectModule from "docxtemplater/js/inspect-module";

let dependencyArray: Array<any> = [];
function setDependency(input:any, arg1:string, arg2:string) {
    dependencyArray.push({parent:arg1, child:arg2})
    return '';
}

expressionParser.filters.upper = (input:string) => input? input?.toUpperCase(): "_______";
expressionParser.filters.underline = (input:any) => input ? "__________" : input;
expressionParser.filters.startsWith = (input:any, value:any) => input?.startsWith(value);
expressionParser.filters.he = (input:any) => input == "Male" ? "he": input == "Female" ? "she": "they";
expressionParser.filters.himself = (input:any) => input == "Male" ? "himself": input == "Female" ? "herself": "themself";
expressionParser.filters.setDependency = setDependency

console.log(__dirname);

const customParser = (tag: string) => {
    console.log("Blah");
    return {
        get: (scope: any) => {
            console.log("hello", tag, scope, Jexl.evalSync(tag, scope))
            try {
                // console.log(tag, scope, )
                return Jexl.evalSync(tag, scope);
            } catch (error) {
                return undefined;
            }
        },
    };
};

const parser = expressionParser.configure({
    evaluateIdentifier: (tag: string, scope: any, scopeList: any[], context: any) => {
        // Ensure only the current scope is checked for the property
        if (scope.hasOwnProperty(tag)) {
            return scope[tag];
        }
        // Return undefined if the property is not found in the current scope
        return false;
    }
});



const templatePath = path.resolve(__dirname, 'conditions2.docx');
const content = fs.readFileSync(templatePath, 'binary');
const zip = new PizZip(content);
const data = {
    firstName: "Danny",
    lastName: "Sivan",
    gender: "Male",
    nameMaidenRestore: true,
    nameMaiden:"Maiden",
    requestAttorneyFees: true,
    propertySeparate:false,
    numberChildren: 2,
    waiver:true,
    opposingPartyState:"Arizona",
    opposingPartyWorkPlace: "Starbucks",
    opposingPartyLastName:"Doe",
    ssn3: 999,
    dateSeparated: "2021-01-02",
    dvroStatus:true,
    dvroCaseNumber: "6666666",
    children: [{
      name: "Moshe",
        ssn3: 666, gender: "Female"
    }, {
        name: "Kaki",
        birthDate: "2021-01-01",
        last: true
    }]
}

const iModule = new InspectModule();

const doc = new docxtemplater(zip, {paragraphLoop: true, linebreaks: true,
    modules: [iModule],
    parser: customParser,
    delimiters: { start: '{{', end: '}}' },
    nullGetter: () => '________'});

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
console.log(dependencyArray.length)
console.log(dependencyArray);