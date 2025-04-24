import { SimplifiedLayout } from "./utils/buildSimplifiedLayout";

export interface SimplifiedTextStyle {
  fontWeight?: string;
  fontSize?: number;
}

export interface SimplifiedEffects {
  boxShadow?: string;
  filter?: string;
  backdropFilter?: string;
  // 디자인 시스템 스타일 정보
  style?: string;
}

export interface SimplifiedFill {
  boundVariable?: SimplifiedVariable;
}

export interface SimplifiedVariable {
  name: string;
  description: string;
}

export interface SimplifiedNode {
  id: string;
  name: string;
  children?: SimplifiedNode[];
  type?: string;
  // boundVariables?: SimplifiedBoundVariables
  fills?: SimplifiedFill[];
  text?: string;
  textStyle?: SimplifiedTextStyle;
  layout?: SimplifiedLayout;
  effects?: SimplifiedEffects;
  mainComponent?: {
    name: string;
  };
}
