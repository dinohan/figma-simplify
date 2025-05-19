import { Attributes, Element, js2xml } from "xml-js";
import { SimplifiedNode } from "../simplified.types";
import { toKebabCase } from "../utils/string.utils";

function getName(node: SimplifiedNode) {
  let name: string = node.type;

  if (node.component) {
    name = node.component.name;
  }
  // replace `/` with `_`
  name = name.replaceAll("/", "-");

  return name;
}

function transformSizing(
  sizing: "hug" | "fill" | "fixed" | undefined,
  raw: number | undefined
) {
  if (sizing === undefined || raw === undefined || sizing === "hug") {
    return undefined;
  }

  if (sizing === "fill") {
    return "100%";
  }

  return `${raw}px`;
}

function sanitizeValue(value: string | undefined) {
  if (value === undefined || value === "0px") {
    return undefined;
  }
  return value;
}

function getSizing(node: SimplifiedNode) {
  return {
    width: transformSizing(node.layout?.sizing?.horizontal, node.layout?.width),
    height: transformSizing(node.layout?.sizing?.vertical, node.layout?.height),
  };
}

type Style = [string, string | undefined | number];

function simplified2element(node: SimplifiedNode): Element {
  const name = getName(node);

  const element: Element = {
    name,
    type: "element",
  };

  let attributes: Attributes = {};

  if (node.type === "FRAME" || node.type === "TEXT") {
    attributes.name = node.name;
  }

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

  const layout = node.layout;

  let styles: Style[] = [];

  if (node.type === "FRAME") {
    if (layout) {
      styles.push(["flex-direction", layout.mode]);

      if (layout.gap !== "0px") {
        styles.push(["gap", layout.gap]);
      }
      if (layout.justifyContent) {
        styles.push(["justify-content", layout.justifyContent]);
      }
      if (layout.alignItems) {
        styles.push(["align-items", layout.alignItems]);
      }
    }
  }

  styles = [
    ...styles,
    ["padding", sanitizeValue(layout?.padding)],
    ["width", getSizing(node).width],
    ["height", getSizing(node).height],
    ["border-radius", sanitizeValue(node.borderRadius)],
  ];

  if (styles.length) {
    attributes.style = styles
      .filter(([_, value]) => !!value)
      .map(([key, value]) => `${key}: ${value}`)
      .join("; ");
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
