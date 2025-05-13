export function buildSimplifiedText(node: SceneNode): string | undefined {
  // TextNode 타입인지 확인
  if (node.type !== "TEXT") {
    return undefined;
  }

  // characters 필드가 비어있는지 확인
  if (!node.characters || node.characters.trim() === "") {
    return undefined;
  }

  // 텍스트 내용 반환
  return node.characters;
}
