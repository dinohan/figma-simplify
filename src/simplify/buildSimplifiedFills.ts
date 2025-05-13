import { SimplifiedFill } from "../simplified.types";

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

    if (
      [
        "GRADIENT_LINEAR",
        "GRADIENT_RADIAL",
        "GRADIENT_ANGULAR",
        "GRADIENT_DIAMOND",
      ].includes(fill.type)
    ) {
      const graidentPaint = fill as GradientPaint;
      simplifiedFill.gradientTransform = graidentPaint.gradientTransform;
      simplifiedFill.gradientStops = graidentPaint.gradientStops.map(
        (stop) => stop
      );
    }

    simplifiedFills.push(simplifiedFill);
  }

  if (simplifiedFills.length > 0) {
    return simplifiedFills;
  }

  return undefined;
}
