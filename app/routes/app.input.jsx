/* eslint-disable no-undef */
import { useState, useEffect } from "react";
import { useLoaderData, useSubmit, useActionData, useNavigation } from "react-router";
import { createTitle, validateTitle } from "../models/Title.server";
import { allDataTitles } from "../models/Title.server";

export async function loader() {
  const getTitleData = await allDataTitles();
  if (getTitleData) {
    return { getTitleData };
  }
  return {};
}

export async function action({ request }) {
  if (request.method !== "POST") {
    return { error: "Method not allowed" };
  }

  const formData = await request.formData();
  const data = {
    title: formData.get("title"),
    description: formData.get("description"),
  };

  const errors = validateTitle(data);
  if (errors) return { errors };

  try {
    const newTitle = await createTitle(data);
    return { success: true, title: newTitle };
  } catch (err) {
    console.error("Error saving title:", err);
    return { error: "Failed to save title" };
  }
}

export default function InputPage() {
  const { getTitleData } = useLoaderData();

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [validationError, setValidationError] = useState("");

  const submit = useSubmit();
  const actionData = useActionData();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  // Handle action responses and show toasts
  useEffect(() => {
    if (actionData?.success) {
      // Show success toast
      shopify.toast.show("Product info saved!", { duration: 2000 });

      // Clear form
      setForm({ title: "", description: "" });
      setValidationError("");
    } else if (actionData?.error) {
      // Show error toast
      shopify.toast.show(actionData.error, {
        duration: 3000,
        isError: true
      });
    } else if (actionData?.errors) {
      // Show validation error toast
      const errorMessage = Object.values(actionData.errors).join(', ');
      shopify.toast.show(errorMessage, {
        duration: 3000,
        isError: true
      });
    }
  }, [actionData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Client-side validation
    if (!form.title || form.title.trim() === "") {
      setValidationError("Product Title is required!");
      shopify.toast.show("Product Title is required!", {
        duration: 2000,
        isError: true
      });
      return;
    }

    // Clear validation error and submit
    setValidationError("");
    submit(form, { method: "post" });
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
      shopify.toast.show(`${selected.length} product(s) selected!`, {
        duration: 2000
      });
    } catch (err) {
      console.error("Error selecting products:", err);
      shopify.toast.show("Failed to select products", {
        duration: 2000,
        isError: true
      });
    }
  }

  return (
    <s-page heading="input data store on database">
      <s-button
            href="/app"
            slot="breadcrumb-actions"
          >
            QR Codes
          </s-button>
  <s-button slot="secondary-actions">Cancel</s-button>
      <s-section heading="Product Information">
        <form data-save-bar onSubmit={handleSubmit}>
          <s-stack gap="large">
            <s-text-field
              label="Product Title"
              name="title"
              value={form.title}
              onInput={handleChange}
              required
              disabled={isSubmitting}
              error={validationError}
            />
          </s-stack>
          <div style={{ marginTop: "0.5rem" }}>
            <s-text-area
              label="Description"
              name="description"
              rows="4"
              value={form.description}
              onInput={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </form>
      </s-section>

      <s-section slot="aside" heading="Resources">
        <s-button onClick={selectProduct} disabled={isSubmitting}>
          Select Products
        </s-button>

        {selectedProducts.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            {selectedProducts.map((product) => (
              <div key={product.id} style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <s-clickable
                  border="base"
                  borderRadius="base"
                  overflow="hidden"
                  inlineSize="40px"
                  blockSize="40px"
                >
                  <s-image objectFit="cover" src={product.image}></s-image>
                </s-clickable>
                <s-text>{product.title}</s-text>
              </div>
            ))}
          </div>
        )}
      </s-section>

      <s-section heading="Saved Titles" subheading="List of all saved product titles">
        <div style={{ height: "300px", overflowY: "auto" }}>
          {getTitleData && getTitleData.length > 0 ? (
            <s-table>
              <s-table-header-row>
                <s-table-header>ID</s-table-header>
                <s-table-header>Title</s-table-header>
                <s-table-header>Description</s-table-header>
                <s-table-header>Date Created</s-table-header>
              </s-table-header-row>
              <s-table-body>
                {getTitleData.map((item, index) => (
                  <s-table-row key={item.id}>
                    <s-table-cell>{index + 1}</s-table-cell>
                    <s-table-cell>{item.title}</s-table-cell>
                    <s-table-cell>{item.description || "N/A"}</s-table-cell>
                    <s-table-cell>
                      {new Date(item.createdAt).toDateString()}
                    </s-table-cell>
                  </s-table-row>
                ))}
              </s-table-body>
            </s-table>
          ) : (
            <s-text>No saved titles yet.</s-text>
          )}
        </div>
      </s-section>
    </s-page>
  );
}