import { Button } from "primereact/button";
import React from "react";

const NewCollectionButton = (onClick) => {
  return (

    <Button
      icon="pi pi-plus"
      onClick={onClick}
      label="New Collection"
      severity="success"
    />
  );
};

export default NewCollectionButton;
