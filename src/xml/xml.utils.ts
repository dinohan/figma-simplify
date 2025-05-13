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

function transformSizing(
  sizing: "hug" | "fill" | "fixed" | undefined,
  raw: string
) {
  if (sizing === "hug") {
    return undefined;
  } else if (sizing === "fill") {
    return "100%";
  } else {
    return raw;
  }
}

function sanitizeValue(value: string | undefined) {
  if (value === undefined || value === "0px") {
    return undefined;
  }
  return value;
}

function getSizing(node: SimplifiedNode) {
  let width: string | undefined = `${node.layout?.width}px`;
  let height: string | undefined = `${node.layout?.height}px`;

  if (node.layout?.sizing) {
    width = transformSizing(node.layout.sizing.horizontal, width);
    height = transformSizing(node.layout.sizing.vertical, height);
  }

  return { width, height };
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

  const layout = node.layout;

  if (node.type === "FRAME") {
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

  if (node.fills && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill?.boundVariable) {
      const variableName = fill.boundVariable.name.replaceAll("/", "-");
      if (node.type === "TEXT") {
        attributes.color = variableName;
      } else {
        attributes.backgroundColor = variableName;
      }
    }
  }

  if (node.effects) {
    if (node.effects.style) {
      const effectStyle = node.effects.style;
      if (effectStyle.startsWith("ev/")) {
        attributes.elevation = effectStyle.replace("ev/", "");
      }
    }
  }

  const styles = [
    ["padding", sanitizeValue(layout?.padding)],
    ["border-radius", sanitizeValue(node.borderRadius)],
    ["width", getSizing(node).width],
    ["height", getSizing(node).height],
  ]
    .filter(([_, value]) => !!value)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
  if (styles.length) {
    attributes.style = styles;
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
  return js2xml(
    { type: "elements", elements: [element] },
    {
      spaces: 2,
    }
  );
}
