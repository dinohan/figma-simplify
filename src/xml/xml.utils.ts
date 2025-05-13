import { Attributes, Element, js2xml } from "xml-js";
import { SimplifiedNode } from "../simplified.types";
import { toKebabCase } from "../utils/string.utils";

function getName(node: SimplifiedNode) {
  let name: string = node.type;

  if (node.type === "FRAME") {
    if (node.layout?.mode === "column") {
      return "VStack";
    } else if (node.layout?.mode === "row") {
      return "HStack";
    }
  }

  if (node.component) {
    name = node.component.name;
  }
  // replace `/` with `_`
  name = name.replaceAll("/", "-");

  return name;
}

function simplified2element(node: SimplifiedNode): Element {
  const name = getName(node);

  const element: Element = {
    name,
    type: "element",
  };

  let attributes: Attributes = {};

  if (node.component) {
    const properties = Object.entries(node.component.properties).map(
      ([key, value]) => [toKebabCase(key), value]
    );
    if (properties.length) {
      attributes = {
        ...attributes,
        ...Object.fromEntries(properties),
      };
    }
  }

  if (node.textStyle && Object.keys(node.textStyle).length) {
    if (node.textStyle.fontSize) {
      attributes.typo = `${node.textStyle.fontSize}`;
    }
    if (node.textStyle.fontWeight === "bold") {
      attributes.bold = "true";
    }
  }

  if (node.type === "FRAME") {
    const layout = node.layout;
    if (layout) {
      if (layout.gap !== "0px") {
        attributes.spacing = layout.gap;
      }
      if (layout.justifyContent) {
        attributes.justify = layout.justifyContent.replace("flex-", "");
      }
      if (layout.alignItems) {
        attributes.align = layout.alignItems.replace("flex-", "");
      }
    }
  }

  if (Object.keys(attributes).length) {
    element.attributes = attributes;
  }

  if (node.text) {
    element.elements = [{ type: "text", text: node.text }];
  } else if (node.children && node.children.length > 0) {
    element.elements = node.children.map(simplified2element);
  }

  return element;
}

export function simplified2xml(node: SimplifiedNode) {
  const element = simplified2element(node);
  console.log(element);
  return js2xml(
    { type: "elements", elements: [element] },
    {
      spaces: 2,
    }
  );
}
