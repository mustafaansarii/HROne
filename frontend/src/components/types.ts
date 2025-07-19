export interface SchemaField {
  id: string;
  key: string;
  type: 'string' | 'number' | 'nested';
  children?: SchemaField[];
}

export interface SchemaBuilderProps {
  initialData?: {
    fields: SchemaField[];
  };
}

export interface SchemaFieldProps {
  field: SchemaField;
  index: number;
  remove: (index?: number | number[]) => void;
  control: any;
  namePrefix: string;
  nestingLevel: number;
}
