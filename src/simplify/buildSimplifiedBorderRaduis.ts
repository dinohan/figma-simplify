export function buildSimplifiedBorderRadius(
  node: SceneNode
): string | undefined {
  if ("cornerRadius" in node && typeof node.cornerRadius === "number") {
    return `${node.cornerRadius}px`;
  }

  const combinedRadius: {
    topLeftRadius: number;
    topRightRadius: number;
    bottomLeftRadius: number;
    bottomRightRadius: number;
  } = {
    topLeftRadius: 0,
    topRightRadius: 0,
    bottomLeftRadius: 0,
    bottomRightRadius: 0,
  };

  if ("topLeftRadius" in node && typeof node.topLeftRadius === "number") {
    combinedRadius.topLeftRadius = node.topLeftRadius;
  }

  if ("topRightRadius" in node && typeof node.topRightRadius === "number") {
    combinedRadius.topRightRadius = node.topRightRadius;
  }

  if ("bottomLeftRadius" in node && typeof node.bottomLeftRadius === "number") {
    combinedRadius.bottomLeftRadius = node.bottomLeftRadius;
  }

  if (
    "bottomRightRadius" in node &&
    typeof node.bottomRightRadius === "number"
  ) {
    combinedRadius.bottomRightRadius = node.bottomRightRadius;
  }

  if (
    combinedRadius.topLeftRadius === 0 &&
    combinedRadius.topRightRadius === 0 &&
    combinedRadius.bottomLeftRadius === 0 &&
    combinedRadius.bottomRightRadius === 0
  ) {
    return undefined;
  }

  return `${combinedRadius.topLeftRadius}px ${combinedRadius.topRightRadius}px ${combinedRadius.bottomLeftRadius}px ${combinedRadius.bottomRightRadius}px`;
}
