import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useEffect, useCallback } from 'react';
import { SchemaField } from './SchemaField';
import type { SchemaField as SchemaFieldType, SchemaBuilderProps } from './types';

interface FormValues {
  fields: SchemaFieldType[];
}

export function SchemaBuilder({ initialData }: SchemaBuilderProps) {
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      fields: initialData?.fields || [{ id: crypto.randomUUID(), key: '', type: 'string' as const, children: [] }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fields',
  });

  const formatJsonPreview = useCallback((fields: SchemaField[]): Record<string, string | Record<string, any>> => {
    const result: Record<string, string | Record<string, any>> = {};

    fields.forEach(field => {
      if (field.type === 'nested' && field.children && field.children.length > 0) {
        result[field.key] = formatJsonPreview(field.children);
      } else {
        result[field.key] = field.type.toUpperCase();
      }
    });

    return result;
  }, []);

  const watchedFields = useWatch({ name: 'fields' });

  useEffect(() => {
    if (watchedFields) {
      const formattedJson = formatJsonPreview(watchedFields);
      const json = JSON.stringify(formattedJson, null, 2);
      const previewElement = document.getElementById('json-preview');
      if (previewElement) {
        previewElement.textContent = json;
      }
    }
  }, [watchedFields, formatJsonPreview]);

  const onSubmit = (data: FormValues) => {
    console.log('Form submitted:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-4xl mx-auto">
      <div className="space-y-4">
        {fields.map((field, index) => (
          <SchemaField
            key={field.id}
            field={field}
            index={index}
            remove={remove}
            control={control}
            namePrefix={`fields.${index}`}
            nestingLevel={0}
          />
        ))}
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={() =>
              append({ id: crypto.randomUUID(), key: '', type: 'string' as const })
            }
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Field
          </button>
        </div>
      </div>
    </form>
  );
}
