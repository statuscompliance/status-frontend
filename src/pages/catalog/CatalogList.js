import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { useStatus } from '../../hooks/useStatus'
import { useNavigate } from 'react-router-dom';

function CatalogList({ onCatalogSelect }) {
  const navigate = useNavigate(); // Hook for navigation

  // Custom hook to retrieve catalogs data
  const { catalogs } = useStatus();

  // Handler function for catalog item click
  const handleCatalogClick = (catalog) => {
    onCatalogSelect(catalog);
  };

  // Handler function for new catalog button click
  const handleNewCatalogClick = () => {
    navigate('/new_catalog');
  };

  // JSX representing the component's UI
  return (
    <div className="d-flex flex-column align-items-center">
      <Card className="w-100 mb-3">
        <Card.Body className="text-center">
          <Button className="calculate-button mb-3">Calcular</Button>
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
          <Button variant="success" className="mt-3" onClick={handleNewCatalogClick}>Nuevo catálogo</Button>
        </Card.Body>
      </Card>
    </div>
  );
}

export default CatalogList;
