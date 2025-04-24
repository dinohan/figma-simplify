import { SimplifiedNode } from "./common.types";
import { buildSimplifiedFills } from "./utils/buildSimplifiedFills";
import { buildSimplifiedLayout } from "./utils/buildSimplifiedLayout";

export async function parseNode(rawNode: SceneNode): Promise<SimplifiedNode> {
  const node: SimplifiedNode = {
    id: rawNode.id,
    name: rawNode.name,
    type: rawNode.type,
  };

  if (rawNode.type === "INSTANCE") {
    const mainComponent = await rawNode.getMainComponentAsync();
    if (mainComponent) {
      node.mainComponent = {
        name: mainComponent.name,
      };
    }
  }

  node.fills = await buildSimplifiedFills(rawNode);

  node.layout = await buildSimplifiedLayout(rawNode);

  // recursive call for children
  if ("children" in rawNode && rawNode.children) {
    node.children = await Promise.all(
      rawNode.children.map((child) => parseNode(child as SceneNode))
    );
  }

  return node;
}
