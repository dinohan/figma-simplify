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
  mainComponent?: {
    name: string;
  };
}
