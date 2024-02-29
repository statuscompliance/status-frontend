import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { useStatus } from '../../hooks/useStatus'
import { useNavigate } from 'react-router-dom';
import "../../static/css/catalogList.css";
import addSvg from '../../static/images/add.svg';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
        

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
    <div className="container d-flex flex-column align-items-center pt-serif-regular">
      <Card className="w-100 mb-3">
        <Card.Body className="text-center">
          <Button variant="danger" className="calculate-button mb-3">Calcular</Button>
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
          <Button className="btn-add btn-success" onClick={handleNewCatalogClick}>
            <div className="d-flex align-items-center">
              <img src={addSvg} alt="Add" className="add-svg ml-5 mb-1" />
              <p className="ml-3 mb-1">Nuevo catálogo</p>
            </div>
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
}

export default CatalogList;
