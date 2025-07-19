import type { Control } from 'react-hook-form';

export type FieldPath = number | number[] | 'schemaFields' | `schemaFields.${number}` | `schemaFields.${number}.key` | `schemaFields.${number}.type` | `schemaFields.${number}.id` | `schemaFields.${number}.children`;

export interface SchemaField {
  id: string;
  key: string;
  type: 'string' | 'number' | 'nested';
  children?: SchemaField[];
}

export interface SchemaBuilderProps {
  initialData?: {
    schemaFields: SchemaField[];
  };
}

export interface SchemaFieldProps {
  field: SchemaField;
  index: number;
  remove: (index?: FieldPath | FieldPath[]) => void;
  control: Control<{ schemaFields: SchemaField[] }>;
  namePrefix: string;
  nestingLevel: number;
}
