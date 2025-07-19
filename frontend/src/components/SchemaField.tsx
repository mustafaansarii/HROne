import { useFieldArray, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import type { SchemaField, FieldPath } from './types';

interface SchemaFieldProps {
  field: SchemaField;
  index: number;
  remove: (index?: FieldPath | FieldPath[]) => void;
  control: UseFormReturn<{ schemaFields: SchemaField[] }>['control'];
  namePrefix: string;
  nestingLevel: number;
}

export function SchemaField({ field, index, remove, control, namePrefix, nestingLevel }: SchemaFieldProps) {
  const { fields: nestedFields, append: appendNested, remove: removeNested } = useFieldArray({
    control,
    name: `${namePrefix}.children` as 'schemaFields',
  });

  const isNested = field.type === 'nested';

  return (
    <div
      className={`flex flex-col gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 mb-4 ${nestingLevel > 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}`}
      style={{ marginLeft: `${nestingLevel * 20}px` }}
    >
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1">
          <Label htmlFor={`${namePrefix}.key`} className="sr-only">
            Field Key
          </Label>
          <Controller
            name={`${namePrefix}.key` as `schemaFields.${number}.key`}
            control={control}
            rules={{ required: 'Key is required' }}
            render={({ field: controllerField, fieldState: { error } }) => (
              <>
                <Input
                  {...controllerField}
                  id={`${namePrefix}.key`}
                  placeholder="Field Name/Key"
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  value={controllerField.value as string}
                  onChange={controllerField.onChange}
                  onBlur={controllerField.onBlur}
                />
                {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
              </>
            )}
          />
        </div>

        <div className="w-32">
          <Label htmlFor={`${namePrefix}.type`} className="sr-only">
            Field Type
          </Label>
          <Controller
            name={`${namePrefix}.type` as `schemaFields.${number}.type`}
            control={control}
            render={({ field: controllerField }) => (
              <Select
                onValueChange={controllerField.onChange}
                value={controllerField.value as string}
              >
                <SelectTrigger className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="nested">Nested</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <Button
          type="button"
          onClick={() => remove(`${namePrefix}` as FieldPath)}
          variant="ghost"
          size="icon"
          className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {isNested && (
        <div className="flex flex-col gap-2 mt-2 w-full">
          {nestedFields.map((nestedField, nestedIndex) => (
            <SchemaField
              key={nestedField.id}
              field={nestedField}
              index={nestedIndex}
              remove={(index?: number) => removeNested(nestedIndex)}
              control={control}
              namePrefix={`${namePrefix}.children.${nestedIndex}`}
              nestingLevel={nestingLevel + 1}
            />
          ))}
          <Button
            type="button"
            onClick={() => appendNested({ id: crypto.randomUUID(), key: '', type: 'string' })}
            className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Nested Item
          </Button>
        </div>
      )}
    </div>
  );
}
