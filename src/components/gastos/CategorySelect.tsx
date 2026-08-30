"use client";

import { useState } from "react";
import { Field, Input, Select } from "@/components/ui/Field";
import { NEW_CATEGORY_VALUE } from "@/lib/categories";

export function CategorySelect({
  categories,
  defaultValue,
}: {
  categories: { value: string; label: string }[];
  defaultValue?: string;
}) {
  const [creating, setCreating] = useState(false);

  return (
    <>
      <Field label="Categoria" htmlFor="category">
        <Select
          id="category"
          name="category"
          defaultValue={defaultValue ?? categories[0]?.value}
          onChange={(e) => setCreating(e.target.value === NEW_CATEGORY_VALUE)}
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
          <option value={NEW_CATEGORY_VALUE}>+ Nova categoria</option>
        </Select>
      </Field>

      {creating && (
        <Field label="Nome da nova categoria" htmlFor="newCategory">
          <Input id="newCategory" name="newCategory" placeholder="Ex: Pet, Presentes..." autoFocus required />
        </Field>
      )}
    </>
  );
}
