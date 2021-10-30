const { expect } = require("chai")
const mock = require("mock-fs")
const sinon  = require("sinon")
const index = require("../index")
const inquirer = require("inquirer")

let consoleSpy

beforeEach(() => {
    consoleSpy = sinon.stub(console, "error")
})

afterEach(() => {
    consoleSpy.restore()
    mock.restore()
})

describe("Given the package.json does not exist", () => {
    before(() => {
        mock()
    })
    it("Should return an error", () => {
        index.run()
        expect(consoleSpy.calledWith("package.json not found")).to.be.true
    })
})

describe("Given the package.json is not a json file", () => {
    before(() => {
        mock({
            "./package.json": "asdq213"
        })
    })
    it("Should return an error indicating that it was not parsed correctly", () => {
        index.run()
        expect(consoleSpy.calledWith("There was an issue parsing the package.json.")).to.be.true
    })
})

describe("Given the scripts property does not exist in the package.json", () => {
    before(() => {
        mock({
            "./package.json": "{}"
        })
    })
    it("Should return an error that scripts is missing", () => {
        index.run()
        expect(consoleSpy.calledWith("The package.json does not have the script property defined.")).to.be.true
    })
})

describe("Given no scripts are defined in the package.json", () => {
    before(() => {
        mock({
            "./package.json": `{ "scripts": { } }`
        })
    })
    it("Should return an error indicating that there are no scripts defined", () => {
        index.run()
        expect(consoleSpy.calledWith("The package.json does not have any scripts defined.")).to.be.true
    })
})

describe("Given there is a valid package.json", () => {
    before(() => {
        mock({
            "./package.json": `{ "scripts": { "test": "mocha test", "build": "tsc" } }`
        })
    })

    it("Should call inquirer correctly", () => {
        const promptStub = sinon.stub(inquirer, "prompt").returns(Promise.resolve())
        index.run()
        const firstCallArgs = promptStub.args[0][0]
        expect(firstCallArgs.type).to.equal("autocomplete")
        expect(firstCallArgs.name).to.equal("script")
        expect(firstCallArgs.message).to.equal("Choose a npm command to run:")

        expect(firstCallArgs.source()).to.deep.equal(["test", "build"])
        expect(firstCallArgs.source({}, "build")).to.deep.equal(["build"])
    })
})
