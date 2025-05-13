import { SimplifiedComponent } from "../simplified.types";

export async function buildSimplifiedComponent(
  node: SceneNode
): Promise<SimplifiedComponent | undefined> {
  if (node.type !== "INSTANCE") {
    return undefined;
  }

  const mainComponent = await node.getMainComponentAsync();
  if (!mainComponent) {
    return undefined;
  }

  const componentSet =
    mainComponent.parent?.type === "COMPONENT_SET"
      ? mainComponent.parent
      : undefined;

  const name = componentSet?.name || mainComponent.name;
  const properties = Object.entries(node.componentProperties).reduce(
    (acc, [key, value]) => {
      acc[key] = `${value.value}`;
      return acc;
    },
    {} as Record<string, string>
  );

  const overrides = node.overrides[0]?.overriddenFields;

  return {
    name,
    properties,
    overrides,
  };
}
