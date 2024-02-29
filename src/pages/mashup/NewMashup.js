import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function NewMashup() {
    const [mashupName, setMashupName] = useState('');
    const [mashupDescription, setMashupDescription] = useState('');
    const navigate = useNavigate(); // Hook for navigation

    // Handler function for updating mashup name
    const handleNameChange = (e) => {
        setMashupName(e.target.value);
    };

    // Handler function for updating mashup description
    const handleDescriptionChange = (e) => {
        setMashupDescription(e.target.value);
    };

    // Handler function for form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const requestBody = {
            name: mashupName,
            description: mashupDescription, // Include description in the request body
        };

        try {
            const response = await fetch('http://localhost:3001/api/mashup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                console.log('Catálogo creado exitosamente.');
                navigate('/mashups');
            } else {
                console.error('Error al crear el mashup.');
            }
        } catch (error) {
            console.error('Error al realizar la solicitud:', error);
        }
    };

    // JSX representing the component's UI
    return (
        <div className="container">
            <Card>
                <Card.Body>
                    <h2 className="text-center mt-5 mb-4">Nuevo Mashup</h2>
                    {/* Form for creating a new mashup */}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="mashupName">
                            <Form.Label>Nombre del Mashup:</Form.Label>
                            <Form.Control
                                type="text"
                                value={mashupName}
                                onChange={handleNameChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="mashupDescription">
                            <Form.Label>Descripción del Mashup:</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={mashupDescription}
                                onChange={handleDescriptionChange}
                            />
                        </Form.Group>
                        <div className="actions text-center">
                            <Button variant="success" type="submit">
                                Crear Mashup
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}

export default NewMashup;
