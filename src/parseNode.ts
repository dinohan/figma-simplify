import { SimplifiedNode } from "./common.types";
import { buildSimplifiedFills } from "./utils/buildSimplifiedFills";

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

  // 자식 노드가 있는 경우 재귀적으로 처리
  if ("children" in rawNode && rawNode.children) {
    node.children = await Promise.all(
      rawNode.children.map((child) => parseNode(child as SceneNode))
    );
  }

  return node;
}
