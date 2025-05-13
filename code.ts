// This plugin will generate a sample codegen plugin
// that appears in the Element tab of the Inspect panel.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).
import yaml from "js-yaml";
import { parseNode } from "./src/parseNode";
import { simplified2xml } from "./src/xml/xml.utils";

// This provides the callback to generate the code.
figma.codegen.on("generate", async (event) => {
  const rootNode = await parseNode(event.node);

  console.log(event.node);

  const result = {
    // variables: await figma.variables.getLocalVariablesAsync()
    node: rootNode,
  };

  const code = yaml.dump(result);

  return [
    {
      language: "TYPESCRIPT",
      code: simplified2xml(rootNode),
      title: "JSX",
    },
    {
      language: "PLAINTEXT",
      code: code,
      title: "YAML",
    },
  ];
});
