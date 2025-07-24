import arg from "arg"
import semver from "semver"
import colors from "picocolors"

import * as commands from "./commands"

const helpText = `
${colors.blueBright("lightningdb")}

  ${colors.underline("Usage")}:
    $ @lightningdb/cli create [${colors.yellowBright("projectDir")}]
    $ @lightningdb/cli init

  ${colors.underline("Options")}:
    --help, -h          Print this help message and exit
    --version, -v       Print the CLI version and exit

  ${colors.underline("Create a new project from template")}:

    $ @lightningdb/cli create

  ${colors.underline("Install server package in existing project")}:

    $ @lightningdb/cli init
`

/**
 * Programmatic interface for running the lightningdb CLI with the given command line
 * arguments.
 */
export async function run(argv: string[] = process.argv.slice(2)) {
  // Check the node version
  let versions = process.versions
  let MINIMUM_NODE_VERSION = 20
  if (
    versions &&
    versions.node &&
    semver.major(versions.node) < MINIMUM_NODE_VERSION
  ) {
    console.warn(
      `️⚠️ Oops, Node v${versions.node} detected. lightningdb requires ` +
        `a Node version greater than ${MINIMUM_NODE_VERSION}.`,
    )
  }

  let args = arg(
    {
      "--help": Boolean,
      "--version": Boolean,
      "-v": "--version",
    },
    {
      argv,
      permissive: true,
    },
  )

  let input = args._

  let flags: any = Object.entries(args).reduce((acc, [key, value]) => {
    key = key.replace(/^--/, "")
    acc[key] = value
    return acc
  }, {} as any)

  // if (flags.help) {
  //   console.log(helpText)
  //   return
  // }
  if (flags.version) {
    let version = require("../package.json").version
    console.log(version)
    return
  }

  let command = input[0]

  // Note: Keep each case in this switch statement small.
  switch (command) {
    case "create":
      await commands.create(argv.slice(1))
      break
    // case "build":
    //   await commands.build(input[1], flags);
    //   break;
    // case "reveal": {
    //   // TODO: simplify getting started guide
    //   await commands.generateEntry(input[1], input[2], flags);
    //   break;
    // }
    // case "dev":
    //   await commands.dev(input[1], flags);
    //   break;
    // case "typegen":
    //   await commands.typegen(input[1], flags);
    //   break;
    default:
      console.log(helpText)
      break
  }
}
