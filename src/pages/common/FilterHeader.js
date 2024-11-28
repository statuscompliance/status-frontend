import React from "react";
import { InputText } from "primereact/inputtext";

const FilterHeader = ({ onGlobalFilterChange, handleCreate }) => (
  <div className="filter-header">
    <span className="p-input-icon-left">
      <i className="pi pi-search" />
      <InputText
        type="search"
        onInput={onGlobalFilterChange}
        placeholder="Search..."
      />
    </span>
    <button className="create-button" onClick={handleCreate}>
      +
    </button>
  </div>
);

export default FilterHeader;
