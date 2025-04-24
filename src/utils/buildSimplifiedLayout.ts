// import { SimplifiedNode } from "../common.types";

export interface SimplifiedLayout {
  mode: "none" | "row" | "column";
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "baseline"
    | "stretch";
  alignItems?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "baseline"
    | "stretch";
  alignSelf?: "flex-start" | "flex-end" | "center" | "stretch";
  wrap?: boolean;
  gap?: string;
  padding?: string;
  sizing?: {
    horizontal?: "fixed" | "fill" | "hug";
    vertical?: "fixed" | "fill" | "hug";
  };
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  position?: "absolute";
}

// 타입 확인 유틸리티 함수들
function isFrameNode(node: SceneNode): node is FrameNode {
  return node.type === "FRAME";
}

function isComponentNode(node: SceneNode): node is ComponentNode {
  return node.type === "COMPONENT";
}

function isInstanceNode(node: SceneNode): node is InstanceNode {
  return node.type === "INSTANCE";
}

function isTextNode(node: SceneNode): node is TextNode {
  return node.type === "TEXT";
}

function hasLayout(node: SceneNode): boolean {
  return (
    isFrameNode(node) ||
    isComponentNode(node) ||
    isInstanceNode(node) ||
    isTextNode(node)
  );
}

// CSS 유틸리티
function generateCSSShorthand(padding: {
  top: number;
  right: number;
  bottom: number;
  left: number;
}): string {
  const { top, right, bottom, left } = padding;
  if (top === right && right === bottom && bottom === left) {
    return `${top}px`;
  } else if (top === bottom && right === left) {
    return `${top}px ${right}px`;
  } else if (right === left) {
    return `${top}px ${right}px ${bottom}px`;
  } else {
    return `${top}px ${right}px ${bottom}px ${left}px`;
  }
}

// Convert Figma's layout config into a more typical flex-like schema
export function buildSimplifiedLayout(
  node: SceneNode
): SimplifiedLayout | undefined {
  if (!hasLayout(node)) {
    return { mode: "none" };
  }

  // TextNode인 경우 간단한 레이아웃 정보만 반환
  if (isTextNode(node)) {
    return {
      mode: "none",
      width: node.width,
      height: node.height,
      x: node.x,
      y: node.y,
    };
  }

  // FrameNode, ComponentNode, InstanceNode인 경우에만 처리
  if (isFrameNode(node) || isComponentNode(node) || isInstanceNode(node)) {
    const layout: SimplifiedLayout = {
      mode:
        node.layoutMode === "HORIZONTAL"
          ? "row"
          : node.layoutMode === "VERTICAL"
          ? "column"
          : "none",
      width: node.width,
      height: node.height,
      x: node.x,
      y: node.y,
    };

    // 레이아웃 모드가 없는 경우 기본 객체 반환
    if (layout.mode === "none") {
      return layout;
    }

    // justifyContent 설정
    switch (node.primaryAxisAlignItems) {
      case "MIN":
        layout.justifyContent = "flex-start";
        break;
      case "MAX":
        layout.justifyContent = "flex-end";
        break;
      case "CENTER":
        layout.justifyContent = "center";
        break;
      case "SPACE_BETWEEN":
        layout.justifyContent = "space-between";
        break;
    }

    // alignItems 설정
    switch (node.counterAxisAlignItems) {
      case "MIN":
        layout.alignItems = "flex-start";
        break;
      case "MAX":
        layout.alignItems = "flex-end";
        break;
      case "CENTER":
        layout.alignItems = "center";
        break;
      case "BASELINE":
        layout.alignItems = "baseline";
        break;
    }

    // wrapping 설정
    if (node.layoutWrap === "WRAP") {
      layout.wrap = true;
    }

    // gap 설정
    if (node.itemSpacing !== undefined) {
      layout.gap = `${node.itemSpacing}px`;
    }

    // padding 설정
    const hasPadding =
      node.paddingTop !== undefined ||
      node.paddingRight !== undefined ||
      node.paddingBottom !== undefined ||
      node.paddingLeft !== undefined;

    if (hasPadding) {
      layout.padding = generateCSSShorthand({
        top: node.paddingTop || 0,
        right: node.paddingRight || 0,
        bottom: node.paddingBottom || 0,
        left: node.paddingLeft || 0,
      });
    }

    // sizing 설정
    layout.sizing = {};

    if ("layoutSizingHorizontal" in node) {
      switch (node.layoutSizingHorizontal) {
        case "FIXED":
          layout.sizing.horizontal = "fixed";
          break;
        case "FILL":
          layout.sizing.horizontal = "fill";
          break;
        case "HUG":
          layout.sizing.horizontal = "hug";
          break;
      }
    }

    if ("layoutSizingVertical" in node) {
      switch (node.layoutSizingVertical) {
        case "FIXED":
          layout.sizing.vertical = "fixed";
          break;
        case "FILL":
          layout.sizing.vertical = "fill";
          break;
        case "HUG":
          layout.sizing.vertical = "hug";
          break;
      }
    }

    return layout;
  }

  return undefined;
}
