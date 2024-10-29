import jsreportClass from '@jsreport/jsreport-core';
import docx from '@jsreport/jsreport-docx';
import handlebars from '@jsreport/jsreport-handlebars';
import docxtemplater from "./extensions/jsreport-docxtemplater"
import fs from "fs/promises";
import path from "path";

const jsreport = jsreportClass({
    loadConfig: false,
    allowLocalFilesAccess: true,
    extensions: {
        express: { enabled: false },
        studio: { enabled: false }
    },
    // @ts-ignore
    sandbox: {
        allowedModules: '*'
    }
})
jsreport.use(handlebars());
jsreport.use(docx());
jsreport.use(docxtemplater());
(async ()=>{
    await jsreport.init();
    const helpersPath = path.resolve(__dirname,'helpers.tpl.js');
    const helpers = await fs.readFile(helpersPath, 'utf8');
    const templatePath = path.resolve(__dirname,'..', process.argv[2]);
    const content = await fs.readFile(templatePath);
    const pass = content.toString('base64');

    const result = await jsreport.render({
        template: {
            engine: 'handlebars',
            recipe: 'docxtemplater',
            helpers,
            // @ts-ignore
            docxtemplater:{
                templateAsset: {
                    content: pass,
                    encoding: "base64"
                }
            }
        },
        data: {
            firstName: "Danny",
            lastName: "Sivan",
            //gender: "Female",
            custodyExisting: true,
            nameMaidenRestore: true,
            nameMaiden: "Maiden",
            requestAttorneyFees: true,
            requestDisproportionate: true,
            propertySeparate: false,
            numberChildren: 2,
            waiver: true,
            opposingPartyState: "Arizona",
            opposingPartyWorkPlace: "Starbucks",
            opposingPartyLastName: "Doe",
            ssn3: 999,
            dateSeparated: "2021-01-02",
            dvroStatus: false,
            dvroCaseNumber: "6666666",
            children: [{
                name: "Moshe",
                ssn3: 666, gender: "Female"
            }, {
                name: "Kaki",
                birthDate: "2021-01-01",
            }]
        }
    });
    await fs.writeFile('report.docx', result.content);
})();


