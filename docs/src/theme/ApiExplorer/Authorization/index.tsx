import React from "react";
import FormItem from "@theme/ApiExplorer/FormItem";

export default function Authorization(): JSX.Element | null {
  return (
    <FormItem label="X-API-Key">
      <input
        className="openapi-explorer__form-item-input"
        type="text"
        value="YOUR_API_KEY"
        readOnly
        style={{ opacity: 0.7, cursor: "default" }}
      />
    </FormItem>
  );
}
