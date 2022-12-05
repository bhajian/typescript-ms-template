# Developer Setup

Run this command to get the latest version of typescript and cdk:

```sh
npm install -g typescript aws-cdk
```

# Deployment

Example:

```sh
cdk deploy -c account=dev -c env=alex2 -c dr=false --no-previous-parameters --all
```

# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
- `cdk ls` lists all stacks
# typescript-ms-template
