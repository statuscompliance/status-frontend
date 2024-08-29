import React from "react";
import { Button, Card } from "react-bootstrap";
import { useCatalogs } from "../../hooks/useCatalogs";
import { useNavigate } from "react-router-dom";
import "../../static/css/catalogList.css";
import { useDispatch } from "react-redux";
import addSvg from "../../static/images/add.svg";
import { clearControls } from "../../features/controls/controlSlice";
import { clearInputs } from "../../features/inputs/inputSlice";

function CatalogList({ onCatalogSelect }) {
  const navigate = useNavigate(); // Hook for navigation
  const dispatch = useDispatch();

  // Custom hook to retrieve catalogs data
  const { catalogs } = useCatalogs();

  // Handler function for catalog item click
  const handleCatalogClick = (catalog) => {
    onCatalogSelect(catalog);
  };

  // Handler function for new catalog button click
  const handleNewCatalogClick = () => {
    dispatch(clearControls());
    dispatch(clearInputs());
    navigate("/new_catalog");
  };

  // JSX representing the component's UI
  return (
    <div className="container d-flex flex-row align-items-center">
      <Card className="w-100 mb-3">
        <Card.Body className="text-center">
          <ul className="list-group">
            {/* Render each catalog item */}
            {catalogs.map((catalog) => (
              <li
                key={catalog.id}
                className="list-group-item"
                onClick={() => handleCatalogClick(catalog)}
              >
                <h4>{catalog.name}</h4>
              </li>
            ))}
          </ul>
          <Button
            className="btn-add btn-success align-items-center mt-3"
            onClick={handleNewCatalogClick}
          >
              <img src={addSvg} alt="Add" className="add-svg" />
              <p className="ml-3 mb-1">New catalog</p>
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
}

export default CatalogList;
