/* eslint-disable no-undef */
import { useState } from "react";
import { useSubmit } from "react-router";
import { createTitle, validateTitle } from "../models/Title.server";

export async function action({ request }) {
  if (request.method !== "POST")
    return ({ error: "Method not allowed" }, { status: 405 });

  const formData = await request.formData();
  const data = {
    title: formData.get("title"),
    description: formData.get("description"),
  };

  const errors = validateTitle(data);
  if (errors) return ({ errors }, { status: 400 });

  try {
    const newTitle = await createTitle(data);
    return ({ success: true, title: newTitle });
  } catch {
    return ({ error: "Failed to save title" }, { status: 500 });
  }
}

export default function InputPage() {
  const submit = useSubmit();
  const [form, setForm] = useState({ title: "", description: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submit(form, { method: "post" });
    setForm({ title: "", description: "" }); // Reset form
  };

  return (
    <s-page>
      <s-section heading="Product Information">
        <form data-save-bar onSubmit={handleSubmit}>
          <s-text-field
            label="Product Title"
            name="title"
            value={form.title}
            onInput={handleChange}
            required
          />
          <s-text-area
            label="Description"
            name="description"
            rows="4"
            value={form.description}
            onInput={handleChange}
          />
        </form>
      </s-section>
      <s-section slot="aside" heading="Resources" />
    </s-page>
  );
}
