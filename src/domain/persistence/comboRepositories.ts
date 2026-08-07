import type { PersistenceTransactionContext } from "./transactionContext";

export type ComboRecord = Record<string, unknown>;

export interface ComboUpdateResult {
  combo: ComboRecord;
  previousName: string;
  currentName: string;
  modelsFieldProvided: boolean;
}

export interface ComboReorderResult {
  combos: ComboRecord[];
  rowsReordered: number;
}

export interface ComboRepository {
  list(
    limit?: number,
    offset?: number,
    context?: PersistenceTransactionContext
  ): Promise<ComboRecord[]>;
  count(context?: PersistenceTransactionContext): Promise<number>;
  findById(id: string, context?: PersistenceTransactionContext): Promise<ComboRecord | null>;
  findByName(name: string, context?: PersistenceTransactionContext): Promise<ComboRecord | null>;
  findByNameInsensitive(
    name: string,
    context?: PersistenceTransactionContext
  ): Promise<ComboRecord | null>;
  create(data: ComboRecord, context?: PersistenceTransactionContext): Promise<ComboRecord>;
  update(
    id: string,
    data: ComboRecord,
    context?: PersistenceTransactionContext
  ): Promise<ComboUpdateResult | null>;
  reorder(comboIds: string[], context?: PersistenceTransactionContext): Promise<ComboReorderResult>;
  deleteById(id: string, context?: PersistenceTransactionContext): Promise<boolean>;
}

export interface ModelComboMapping {
  id: string;
  pattern: string;
  comboId: string;
  comboName?: string;
  priority: number;
  enabled: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateModelComboMappingInput {
  pattern: string;
  comboId: string;
  priority?: number;
  enabled?: boolean;
  description?: string;
}

export type UpdateModelComboMappingInput = Partial<CreateModelComboMappingInput>;

export interface ModelComboMappingPage {
  items: ModelComboMapping[];
  total: number;
}

export interface ModelComboMappingRepository {
  list(
    options?: { limit?: number; offset?: number },
    context?: PersistenceTransactionContext
  ): Promise<ModelComboMappingPage>;
  findById(id: string, context?: PersistenceTransactionContext): Promise<ModelComboMapping | null>;
  create(
    data: CreateModelComboMappingInput,
    context?: PersistenceTransactionContext
  ): Promise<ModelComboMapping>;
  update(
    id: string,
    data: UpdateModelComboMappingInput,
    context?: PersistenceTransactionContext
  ): Promise<ModelComboMapping | null>;
  deleteById(id: string, context?: PersistenceTransactionContext): Promise<boolean>;
  resolveForModel(
    model: string,
    context?: PersistenceTransactionContext
  ): Promise<ComboRecord | null>;
}
