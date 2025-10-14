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
  } catch (err) {
    console.error("Error saving title:", err);
    return ({ error: "Failed to save title" }, { status: 500 });
  }
}

export default function InputPage() {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const submit = useSubmit();
  const [form, setForm] = useState({ title: "", description: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submit(form, { method: "post" });
    shopify.toast.show("Product info saved!", { duration: 2000 });
    setForm({ title: "", description: "" }); // Reset form
  };

  // ✅ Product Picker Function
  async function selectProduct() {
    try {
      const products = await window.shopify.resourcePicker({
        type: "product",
        action: "select",
        multiple: true,
      });

      if (!products?.length) return;

      const selected = products.map((p) => ({
        id: p.id,
        title: p.title,
        image: p.images?.[0]?.originalSrc,
      }));

      console.log("Selected Products:", selected);
      setSelectedProducts(selected);
    } catch (err) {
      console.error("Error selecting products:", err);
    }
  }

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

      <s-section slot="aside" heading="Resources">
        <s-button onClick={selectProduct}>Select Products</s-button>

        {selectedProducts.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            {selectedProducts.map((product) => (
              <div key={product.id} style={{ marginBottom: "8px" }}>
                <img src={product.image} alt={product.title} width="60" />
                <s-text>{product.title}</s-text>
              </div>
              

            ))}
          </div>
        )}
      </s-section>
    </s-page>
  );
}
