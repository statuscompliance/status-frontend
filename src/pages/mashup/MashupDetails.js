import React, { useState, useEffect } from 'react';
import { Button, Card } from 'react-bootstrap';

const MashupDetails = ({ selectedMashup }) => {
  const [editedMashup, setEditedMashup] = useState(selectedMashup);
  const [mashupToDelete, setMashupToDelete] = useState(null);
  const [mashupToUpdate, setMashupToUpdate] = useState(null); 

  // Handler function for updating mashup name
  const handleMashupChange = (event) => {
    setEditedMashup((prevMashup) => ({
      ...prevMashup,
      name: event.target.value,
    }));
  };

  // Handler function for updating mashup (triggered by "Save" button click)
  const handleUpdateClick = () => {
    setMashupToUpdate(selectedMashup.id);
  };

  // Handler function for deleting mashup (triggered by "Delete" button click)
  const handleDeleteClick = () => {
    setMashupToDelete(selectedMashup.id);
  };

  // Effect for handling deletion and update of mashup
  useEffect(() => {
    // If a mashup is to be deleted
    if (mashupToDelete !== null) {
      fetch(`http://localhost:3001/api/mashup/${mashupToDelete}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (response.ok) {
            console.log('Mashup eliminado exitosamente.');
            window.location.reload();
          } else {
            console.error('Error al eliminar el mashup.');
          }
        })
        .catch((error) => {
          console.error('Error al realizar la solicitud:', error);
        })
        .finally(() => {
          setMashupToDelete(null);
        });
    }
    // If a mashup is to be updated
    if (mashupToUpdate !== null) {
      const requestBody = {
        name: editedMashup.name,
      };
      fetch(`http://localhost:3001/api/mashup/${mashupToUpdate}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
        .then((response) => {
          if (response.ok) {
            console.log('Mashup actualizado exitosamente.');
            window.location.reload();
          } else {
            console.error('Error al actualizar el mashup.');
          }
        })
        .catch((error) => {
          console.error('Error al realizar la solicitud:', error);
        })
        .finally(() => {
          setMashupToUpdate(null);
        });
    }
  }, [mashupToDelete, mashupToUpdate, editedMashup]);

  // JSX representing the component's UI
  return (
    <div className="detail-panel">
      <Card>
        <Card.Body>
          {/* Basic mashup information */}
          <h3>
            Nombre: <input
              type="text"
              value={editedMashup.name}
              className="form-control"
              onChange={handleMashupChange}
            />
          </h3>
          {/* Action buttons */}
          <div className="actions text-center mt-3">
            <Button className="btn btn-primary">Exportar</Button>
            <Button className="btn btn-success" onClick={handleUpdateClick}>Guardar</Button>
            <Button className="btn btn-danger" onClick={handleDeleteClick}>Eliminar</Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default MashupDetails;
