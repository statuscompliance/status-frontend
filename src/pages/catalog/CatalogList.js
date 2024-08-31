import React from "react";
import { Button, Card } from "react-bootstrap";
import { useCatalogs } from "../../hooks/useCatalogs";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearControls } from "../../features/controls/controlSlice";
import { clearInputs } from "../../features/inputs/inputSlice";

function CatalogList({ onCatalogSelect }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { catalogs } = useCatalogs();

  const handleCatalogClick = (catalog) => {
    onCatalogSelect(catalog);
  };

  const handleNewCatalogClick = () => {
    dispatch(clearControls());
    dispatch(clearInputs());
    navigate("/new_catalog");
  };

  // JSX representing the component's UI
  return (
    <div className="container" style={{ height: "100vh" }}>
      <Card className="shadow-sm h-100 d-flex flex-column">
        <Card.Header style={{ backgroundColor: "#bf0a2e", color: "#ffffff" }}>
          <h2 className="text-center mb-0">Catalogs</h2>
        </Card.Header>
        <Card.Body className="d-flex flex-column overflow-hidden">
          <div className="flex-grow-1 overflow-auto mb-4">
            <ul className="list-unstyled">
              {/* Render each catalog item */}
              {catalogs.map((catalog) => (
                <li key={catalog.id} className="mb-2">
                  <Button
                    variant="outline-danger"
                    className="w-100 text-left catalog-item"
                    onClick={() => handleCatalogClick(catalog)}
                    style={{ borderColor: "#bf0a2e", color: "#bf0a2e" }}
                  >
                    {catalog.name}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          <Button
            style={{ backgroundColor: "#bf0a2e", borderColor: "#bf0a2e" }}
            className="w-100 mt-auto d-flex align-items-center justify-content-center"
            onClick={handleNewCatalogClick}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            New Catalog
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
}

export default CatalogList;
