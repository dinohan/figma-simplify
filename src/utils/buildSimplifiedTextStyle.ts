import { SimplifiedTextStyle } from "../common.types";

// 텍스트 노드인지 확인하는 함수
function isTextNode(node: SceneNode): node is TextNode {
  return node.type === "TEXT";
}

// Figma 노드에서 텍스트 스타일 정보 추출
export function buildSimplifiedTextStyle(
  node: SceneNode
): SimplifiedTextStyle | undefined {
  // 텍스트 노드가 아니면 undefined 반환
  if (!isTextNode(node)) {
    return undefined;
  }

  // 텍스트 노드에서 스타일 정보 추출
  const textStyle: SimplifiedTextStyle = {};

  // 폰트 무게 - 'bold' 또는 'normal'로만 표시
  if (node.fontName && node.fontName !== figma.mixed) {
    // bold일 경우에만 표시, 나머지는 normal로 간주
    if (node.fontName.style.includes("Bold")) {
      textStyle.fontWeight = "bold";
    } else {
      textStyle.fontWeight = "normal";
    }
  }

  // 폰트 크기
  if (node.fontSize && node.fontSize !== figma.mixed) {
    textStyle.fontSize = node.fontSize;
  }

  // 속성이 하나도 없으면 undefined 반환
  if (Object.keys(textStyle).length === 0) {
    return undefined;
  }

  return textStyle;
}
