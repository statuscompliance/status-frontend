import React, { useState, useEffect } from 'react';
import { Button, Card } from 'react-bootstrap';

const CatalogDetails = ({ selectedCatalog, catalogControls }) => {
  // State variables initialization
  const [specificCatalog, setSpecificCatalog] = useState(selectedCatalog);
  const [specificControls, setSpecificControls] = useState(catalogControls);
  const [selectedMashups, setSelectedMashups] = useState([]);
  const [catalogToDelete, setCatalogToDelete] = useState(null);
  const [catalogToUpdate, setCatalogToUpdate] = useState(null); 

  // Update state when selectedCatalog or catalogControls changes
  useEffect(() => {
    setSpecificCatalog(selectedCatalog);
    setSpecificControls(catalogControls);
  }, [selectedCatalog, catalogControls]);

  // Handler function for updating catalog name
  const handleCatalogChange = (event) => {
    setSpecificCatalog((prevCatalog) => ({
      ...prevCatalog,
      name: event.target.value,
    }));
  };

  // Handler function for updating control details
  const handleControlChange = (index, field, value) => {
    const updatedDetails = [...specificControls];
    updatedDetails[index][field] = value;
    setSpecificControls(updatedDetails);
  };

  // Handler function for updating selected mashups
  const handleMashupChange = (index, value) => {
    const updatedMashups = [...selectedMashups];
    updatedMashups[index] = value;
    setSelectedMashups(updatedMashups);
  };

  // Handler function for updating catalog (triggered by "Save" button click)
  const handleUpdateClick = () => {
    setCatalogToUpdate(selectedCatalog.id);
  };

  // Handler function for deleting catalog (triggered by "Delete" button click)
  const handleDeleteClick = () => {
    setCatalogToDelete(selectedCatalog.id);
  };

  useEffect(() => {
    // If a catalog is to be deleted
    if (catalogToDelete !== null) {
      fetch(`http://localhost:3001/api/catalog/${catalogToDelete}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (response.ok) {
            console.log('Catálogo eliminado exitosamente.');
            window.location.reload();
          } else {
            console.error('Error al eliminar el catálogo.');
          }
        })
        .catch((error) => {
          console.error('Error al realizar la solicitud:', error);
        })
        .finally(() => {
          setCatalogToDelete(null);
        });
    }
    // If a catalog is to be updated
    if (catalogToUpdate !== null) {
      const requestBody = {
        name: specificCatalog.name,
      };
      fetch(`http://localhost:3001/api/catalog/${catalogToUpdate}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
        .then((response) => {
          if (response.ok) {
            console.log('Catálogo actualizado exitosamente.');
            window.location.reload();
          } else {
            console.error('Error al actualizar el catálogo.');
          }
        })
        .catch((error) => {
          console.error('Error al realizar la solicitud:', error);
        })
        .finally(() => {
          setCatalogToUpdate(null);
        });
    }
  }, [catalogToDelete, catalogToUpdate, specificCatalog]);

  // JSX representing the component's UI
  return (
    <div className="detail-panel">
      <Card>
        <Card.Body>
          {/* Basic catalog information */}
          <h3>
            Nombre: <input
              type="text"
              value={specificCatalog.name}
              className="form-control"
              onChange={handleCatalogChange}
            />
          </h3>
          <h3> 
            Url: <input 
              type="text"
              value={specificCatalog.url}
              className="form-control"
              onChange={handleCatalogChange} /> 
          </h3>
          {/* Rendering controls */}
          <h3 className="mt-3">Controles:</h3>
          <div>
            {specificControls.map((control, index) => (
              <div key={index} className="mt-3">
                <input
                  type="text"
                  value={control.name}
                  className="form-control"
                  onChange={(e) => handleControlChange(index, 'name', e.target.value)}
                />
                {/* Select dropdown for mashup selection */}
                <select
                  value={selectedMashups[index]}
                  className="form-select"
                  onChange={(e) => handleMashupChange(index, e.target.value)}
                >
                  <option value="">Selecciona Mashup</option>
                  <option value="Mashup 1">Mashup 1</option>
                  <option value="Mashup 2">Mashup 2</option>
                </select>
                {/* TO DO: Additional inputs based on selected mashup */}
                {selectedMashups[index] === 'Mashup 1' && (
                  <div>
                    <input
                      type="text"
                      placeholder="Nombre"
                      className="form-control"
                      />
                    <input
                      type="text"
                      placeholder="Película favorita"
                      className="form-control"
                    />
                  </div>
                )}
                {selectedMashups[index] === 'Mashup 2' && (
                  <input
                    type="number"
                    placeholder="Edad"
                    className="form-control"
                  />
                )}
              </div>
            ))}
          </div>
          {/* Action buttons */}
          <div className="actions text-center mt-3">
            <Button className="btn btn-success" onClick={handleUpdateClick}>Guardar</Button>
            <Button className="btn btn-danger" onClick={handleDeleteClick}>Eliminar</Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CatalogDetails;
