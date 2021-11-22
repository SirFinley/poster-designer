const { exec } = require('child_process');

const json = require(`${process.cwd()}/claudia.json`);
console.log(json);

const command = `aws apigatewayv2 create-api-mapping`
+ ` --domain-name api.visualinkworks.com` 
+ ` --api-mapping-key ${json.lambda.name}`
+ ` --api-id ${json.api.id}`
+ ` --stage latest`
+ '';

console.log(command);
exec(command, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
})