#!/usr/bin/env node
const inquirer = require("inquirer")
const fuzzy = require("fuzzy")
const fs = require("fs")
const childProcess = require("child_process")
const AutocompletePrompt = require("inquirer-autocomplete-prompt")

exports.run = () => {
    if (!fs.existsSync("./package.json")) {
        return console.error("package.json not found")
    }

    const packageJson = fs.readFileSync("./package.json")
    let parsedPackage
    try {
        parsedPackage = JSON.parse(packageJson.toString())
    }
    catch {
        return console.error("There was an issue parsing the package.json.")
    }

    if (!parsedPackage.scripts) {
        return console.error("The package.json does not have the script property defined.")
    }

    const scripts = Object.keys(parsedPackage.scripts)

    if (scripts.length === 0) {
        return console.error("The package.json does not have any scripts defined.")
    }

    inquirer.registerPrompt("autocomplete", AutocompletePrompt)
    inquirer.prompt({
        type: "autocomplete",
        name: "script",
        message: "Choose a npm command to run:",
        source: (answers, input) => {
            input = input || "";
            var fuzzyResult = fuzzy.filter(input, scripts)
            return fuzzyResult.map(function (el) {
            return el.original;
            })
        }
    })
    .then((response) => {
        const { script } = response
        const cmd = childProcess.spawn("npm", ["run", script], { stdio: "inherit" });
        cmd.on("exit", (code) => {
            process.exit(code);
        })
    })
}

if (require.main === module) {
    this.run()
}
