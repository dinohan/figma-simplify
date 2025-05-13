import { SimplifiedFill, SimplifiedNode } from "../simplified.types";

export async function buildSimplifiedFills(
  rawNode: SceneNode
): Promise<SimplifiedFill[] | undefined> {
  // fills 속성이 있는지 확인
  if (!("fills" in rawNode)) {
    return undefined;
  }

  // fills가 존재하고 mixed 타입이 아닌지 확인
  if (!rawNode.fills || rawNode.fills === figma.mixed) {
    return undefined;
  }

  const simplifiedFills: SimplifiedFill[] = [];
  for (const fill of rawNode.fills) {
    const simplifiedFill: SimplifiedFill = {};

    if (
      "boundVariables" in fill &&
      fill.boundVariables &&
      Object.keys(fill.boundVariables).length > 0
    ) {
      const variableId = fill.boundVariables.color?.id;
      if (variableId) {
        const variable = await figma.variables.getVariableByIdAsync(variableId);
        if (variable) {
          simplifiedFill.boundVariable = {
            name: variable.name,
            description: variable.description,
          };
        }
      }
    }

    simplifiedFills.push(simplifiedFill);
  }

  if (simplifiedFills.length > 0) {
    return simplifiedFills;
  }

  return undefined;
}

export async function parseNode(rawNode: SceneNode): Promise<SimplifiedNode> {
  const node: SimplifiedNode = {
    id: rawNode.id,
    name: rawNode.name,
    type: rawNode.type,
  };

  const fills = await buildSimplifiedFills(rawNode);
  if (fills) {
    node.fills = fills;
  }

  // 자식 노드가 있는 경우 재귀적으로 처리
  if ("children" in rawNode && rawNode.children) {
    node.children = await Promise.all(
      rawNode.children.map((child) => parseNode(child as SceneNode))
    );
  }

  return node;
}
