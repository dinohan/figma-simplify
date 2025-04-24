import { SimplifiedEffects } from "../common.types";

// 그림자, 블러 등의 이펙트를 가진 노드인지 확인하는 함수
function hasEffects<T extends SceneNode>(
  node: T
): node is T & { effects: Effect[] } {
  return (
    "effects" in node && Array.isArray(node.effects) && node.effects.length > 0
  );
}

// RGBA 색상을 CSS 문자열로 변환
function formatRGBAColor(color: RGBA): string {
  const { r, g, b, a } = color;
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(
    b * 255
  )}, ${a.toFixed(2)})`;
}

// Drop Shadow 효과를 CSS box-shadow 문자열로 변환
function simplifyDropShadow(effect: DropShadowEffect): string {
  if (effect.type !== "DROP_SHADOW") return "";
  return `${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${
    effect.spread ?? 0
  }px ${formatRGBAColor(effect.color)}`;
}

// Inner Shadow 효과를 CSS box-shadow 문자열로 변환 (inset 추가)
function simplifyInnerShadow(effect: InnerShadowEffect): string {
  if (effect.type !== "INNER_SHADOW") return "";
  return `inset ${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${
    effect.spread ?? 0
  }px ${formatRGBAColor(effect.color)}`;
}

// Blur 효과를 CSS blur() 함수로 변환
function simplifyBlur(effect: BlurEffect): string {
  return `blur(${effect.radius}px)`;
}

export async function buildSimplifiedEffects(
  node: SceneNode
): Promise<SimplifiedEffects | undefined> {
  const result: SimplifiedEffects = {};

  // 먼저 스타일 ID가 있는지 확인하고 스타일 정보 가져오기
  if ("effectStyleId" in node && node.effectStyleId) {
    try {
      const style = await figma.getStyleByIdAsync(node.effectStyleId as string);
      if (style) {
        result.style = style.name;
        return result;
      }
    } catch (error) {
      console.error("효과 스타일을 불러오는 중 오류 발생:", error);
    }
  }

  // 이펙트가 없는 노드는 스타일 정보만 반환
  if (!hasEffects(node)) {
    // 스타일 정보가 있으면 반환, 없으면 undefined
    return Object.keys(result).length > 0 ? result : undefined;
  }

  // visible 속성이 true인 이펙트만 필터링
  const effects = node.effects.filter((e) => e.visible);
  if (effects.length === 0 && Object.keys(result).length === 0) {
    return undefined;
  }

  // Drop Shadow와 Inner Shadow 처리 (box-shadow로 변환)
  const dropShadows = effects
    .filter((e) => e.type === "DROP_SHADOW")
    .map((e) => simplifyDropShadow(e as DropShadowEffect));

  const innerShadows = effects
    .filter((e) => e.type === "INNER_SHADOW")
    .map((e) => simplifyInnerShadow(e as InnerShadowEffect));

  const boxShadow = [...dropShadows, ...innerShadows]
    .filter((shadow) => shadow)
    .join(", ");
  if (boxShadow) {
    result.boxShadow = boxShadow;
  }

  // Layer Blur 처리 (filter로 변환)
  const filterBlurValues = effects
    .filter((e) => e.type === "LAYER_BLUR")
    .map((e) => simplifyBlur(e as BlurEffect))
    .join(" ");
  if (filterBlurValues) {
    result.filter = filterBlurValues;
  }

  // Background Blur 처리 (backdrop-filter로 변환)
  const backdropFilterValues = effects
    .filter((e) => e.type === "BACKGROUND_BLUR")
    .map((e) => simplifyBlur(e as BlurEffect))
    .join(" ");
  if (backdropFilterValues) {
    result.backdropFilter = backdropFilterValues;
  }

  // 아무 값도 없으면 undefined 반환
  if (Object.keys(result).length === 0) {
    return undefined;
  }

  return result;
}
