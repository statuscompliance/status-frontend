import React, { useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import { useStatus } from '../../hooks/useStatus'
import { useNavigate } from 'react-router-dom';

function MashupList({ onMashupSelect }) {
  const [selectedMashup, setSelectedMashup] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  // Custom hook to retrieve mashups data
  const { mashups } = useStatus();

  // Handler function for mashup item click
  const handleMashupClick = (mashup) => {
    setSelectedMashup(mashup);
    onMashupSelect(mashup);
  };

  // Handler function for new mashup button click
  const handleNewMashupClick = () => {
    navigate('/new_mashup');
  };

  // JSX representing the component's UI
  return (
    <div className="d-flex flex-column align-items-center">
      <Card className="w-100 mb-3">
        <Card.Body className="text-center">
          <ul className="list-group">
            {/* Render each mashup item */}
            {mashups.map((mashup) => (
              <li
                key={mashup.id}
                className="list-group-item"
                onClick={() => handleMashupClick(mashup)}
              >
                <h4>{mashup.name}</h4>
              </li>
            ))}
          </ul>
          <Button variant="success" className="mt-3" onClick={handleNewMashupClick}>Nuevo mashup</Button>
        </Card.Body>
      </Card>
    </div>
  );
}

export default MashupList;
