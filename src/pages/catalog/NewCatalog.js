import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function NewCatalog() {
    const [catalogName, setCatalogName] = useState('');
    const navigate = useNavigate(); // Hook for navigation

    // Handler function for updating catalog name
    const handleNameChange = (e) => {
        setCatalogName(e.target.value);
    };

    // Handler function for form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const requestBody = {
            name: catalogName,
        };

        try {
            const response = await fetch('http://localhost:3001/api/catalog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                console.log('Catálogo creado exitosamente.');
                navigate('/catalogs');
            } else {
                console.error('Error al crear el catálogo.');
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
                    <h2 className="text-center mt-5 mb-4">Nuevo Catálogo</h2>
                    {/* Form for creating a new catalog */}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="catalogName">
                            <Form.Label>Nombre del Catálogo:</Form.Label>
                            <Form.Control
                                type="text"
                                value={catalogName}
                                onChange={handleNameChange}
                                required
                            />
                        </Form.Group>
                        <div className="actions text-center">
                            <Button variant="success" type="submit" className="text-center">
                                Crear Catálogo
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}

export default NewCatalog;