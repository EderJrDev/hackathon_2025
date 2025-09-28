export interface EntityDef {
  name: string;
  type: 'string' | 'date' | 'number' | 'enum';
  format?: string;
  examples?: string[];
}

export interface SlotDef {
  entity: string;
  required: boolean;
  prompt: string;
}

export interface ValidatorDef {
  entity: string;
  rule: 'is_date' | 'non_empty' | 'regex';
  format?: string;
  regex?: string;
}

export interface NodeDef {
  message?: string;
  action?: string;
  params?: Record<string, any>;
  transitions?: Record<string, string>;
  on_success?: string;
  on_error?: string;
  on_complete?: string;
  end?: boolean;
}

export interface FlowDef {
  id: string;
  title: string;
  intents: string[];
  synonyms?: string[];
  description?: string;
  slot_filling?: SlotDef[];
  validators?: ValidatorDef[];
  actions?: { name: string; description?: string }[];
  decision_tree?: {
    start: string;
    nodes: Record<string, NodeDef>;
  };
  qa_bank?: { q: string; a: string }[];
}

export interface FlowsKnowledge {
  version: string;
  updatedAt: string;
  locale: string;
  global_policies: Record<string, any>;
  entities: EntityDef[];
  flows: FlowDef[];
  routing: Record<string, any>;
}
