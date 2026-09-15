import React, { useId } from "react";
import FormItem from "@theme/ApiExplorer/FormItem";
import FormLabel from "@theme/ApiExplorer/FormLabel";

export default function Authorization(): React.JSX.Element | null {
  const id = useId();
  return (
    <FormItem>
      <FormLabel htmlFor={id} label="X-API-Key" />
      <input
        id={id}
        className="openapi-explorer__form-item-input"
        type="text"
        value="YOUR_API_KEY"
        readOnly
        style={{ opacity: 0.7, cursor: "default" }}
      />
    </FormItem>
  );
}
