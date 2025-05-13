import { SimplifiedNode } from "./simplified.types";
import { buildSimplifiedFills } from "./simplify/buildSimplifiedFills";
import { buildSimplifiedLayout } from "./simplify/buildSimplifiedLayout";
import { buildSimplifiedTextStyle } from "./simplify/buildSimplifiedTextStyle";
import { buildSimplifiedEffects } from "./simplify/buildSimplifiedEffects";
import { buildSimplifiedText } from "./simplify/buildSimplifiedText";
import { buildSimplifiedBorderRadius } from "./simplify/buildSimplifiedBorderRaduis";
import { buildSimplifiedComponent } from "./simplify/buildSimplifiedComponent";

export async function parseNode(rawNode: SceneNode): Promise<SimplifiedNode> {
  const node: SimplifiedNode = {
    id: rawNode.id,
    name: rawNode.name,
    type: rawNode.type,
  };

  node.component = await buildSimplifiedComponent(rawNode);
  node.fills = await buildSimplifiedFills(rawNode);
  node.effects = await buildSimplifiedEffects(rawNode);
  node.borderRadius = buildSimplifiedBorderRadius(rawNode);
  node.textStyle = buildSimplifiedTextStyle(rawNode);
  node.text = buildSimplifiedText(rawNode);
  node.layout = buildSimplifiedLayout(rawNode);

  // recursive call for children
  if ("children" in rawNode) {
    node.children = await Promise.all(
      rawNode.children.map((child) => parseNode(child as SceneNode))
    );
  }

  return node;
}
