import React, { useState } from 'react';
import { Form, Button, Card, Col, Carousel } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useStatus } from '../../hooks/useStatus'

function NewCatalog() {
    const [catalogName, setCatalogName] = useState('');
    const [controls, setControls] = useState([]);
    const [lastItemRemoved, setLastItemRemoved] = useState(0);
    const navigate = useNavigate();

    const period = {
        DAILY: 'Daily',
        MONTHLY: 'Monthly',
        ANNUALLY: 'Annually',
    };

    // Custom hook to retrieve mashups data
    const { mashups } = useStatus();

    // Handler function for updating catalog name
    const handleNameChange = (e) => {
        setCatalogName(e.target.value);
    };

    // Handler function for adding a new control
    const handleAddControl = () => {
        setControls([...controls, { 
            name: '',
            description: '',
            startDate: '',
            endDate: '',
            period: '',
            mashup_id: '',
            catalog_id: '',
            inputs: [],
            inputValues: {}
        }]);
    };

    // Handler function for change input values for a specific control.
    const handleInputChange = (controlIndex, inputId, inputValue) => {
        const updatedControls = [...controls];

        if (!updatedControls[controlIndex].inputValues) {
            updatedControls[controlIndex].inputValues = {};
        }

        updatedControls[controlIndex].inputValues[inputId] = inputValue;
        setControls(updatedControls);
    };

    // Handler function for remove a control
    const handleRemoveControl = (index) => {
        const isLastItem = index === controls.length - 1;
        const updatedControls = [...controls];
        updatedControls.splice(index, 1);
        setControls(updatedControls);

        if (isLastItem && controls.length > 1) {
            setLastItemRemoved(prev => prev + 1);
        }
    };

    // Handler function for updating control
    const handleControlChange = async (index, field, value) => {
        const updatedControls = [...controls];
        if (field === 'mashup') {
            const inputs = await fetchInputsForMashup(value);
            updatedControls[index][field] = value;
            updatedControls[index]['inputs'] = inputs;
        } else {
            updatedControls[index][field] = value;
        }
        setControls(updatedControls);
    };

    // Get all the inputs of a mashup
    const fetchInputsForMashup = async (mashupId) => {
        try {
            const response = await fetch(`http://localhost:3001/api/${mashupId}/inputs`);
            if (!response.ok) {
                throw new Error('No se pudieron obtener los Inputs del mashup');
            }
            const inputs = await response.json();
            return inputs;
        } catch (error) {
            console.error("Error al obtener los Inputs del mashup:", error);
            return [];
        }
    };

    // Handler function for form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Create catalog
            const catalogResponse  = await fetch('http://localhost:3001/api/catalog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: catalogName }),
            });

            if (!catalogResponse.ok) {
                console.error('Error al crear el catálogo.');
                return;
            }

            const catalogData = await catalogResponse.json();
            const catalogId = catalogData.id;
            
            const controlPromises = controls.map(async (control) => {
                // Create controls
                const response = await fetch('http://localhost:3001/api/control', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: control.name,
                        description: control.description,
                        startDate: control.startDate,
                        endDate: control.endDate,
                        period: control.period,
                        mashup_id: control.mashup,
                        catalog_id: catalogId,
                    }),
                });

                if (!response.ok) {
                throw new Error('Error al crear un control.');
            }

            const controlData = await response.json();

            // Create intermediate table between input and control
            const inputControlPromises = Object.entries(control.inputValues).map(async ([inputId, value]) => {
                const inputControlResponse = await fetch('http://localhost:3001/api/input_control', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        control_id: controlData.id,
                        input_id: inputId,
                        value: value,
                    }),
                });

                if (!inputControlResponse.ok) {
                    throw new Error('Error al crear InputControl.');
                }

                return inputControlResponse.json();
            });

            await Promise.all(inputControlPromises);
                return response.ok;
            });

            const controlResponses = await Promise.all(controlPromises);

            if (controlResponses.every(response => response === true)) {
                console.log('Catálogo y controles creados exitosamente.');
                navigate('/catalogs');
            } else {
                console.error('Error al crear los controles.');
            }
        } catch (error) {
            console.error('Error al realizar la solicitud:', error);
        }
    };

    // JSX representing the component's UI
    return (
        <div className="container">
            <Col md={10}>
                <Card style={{ backgroundColor: '#bf0a2e', color: '#ffff' }}>
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
                            {/* Rendering controls */}
                            {controls.length > 0 && (
                                <Carousel key={`carousel-${controls.length}-${lastItemRemoved}`} controls={false} pause="hover" wrap={false} interval={null}>
                                {controls.map((control, index) => (
                                    <Carousel.Item key={index}>
                                        <div className="col-12" key={index}>
                                            <Card className="bg-secondary" style={{ color: '#ffff' }}>
                                                <Card.Body>
                                                    <Form.Group className="mb-3" controlId={`controlName_${index}`}>
                                                        <Form.Label>Nombre del Control:</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={control.name}
                                                            onChange={(e) => handleControlChange(index, 'name', e.target.value)}
                                                            required
                                                        />
                                                    </Form.Group>
                                                    <Form.Group className="mb-3" controlId={`controlDescription_${index}`}>
                                                        <Form.Label>Descripción:</Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            value={control.description}
                                                            onChange={(e) => handleControlChange(index, 'description', e.target.value)}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group className="mb-3" controlId={`controlStartDate_${index}`}>
                                                        <Form.Label>Fecha de Inicio:</Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            value={control.startDate}
                                                            onChange={(e) => handleControlChange(index, 'startDate', e.target.value)}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group className="mb-3" controlId={`controlEndDate_${index}`}>
                                                        <Form.Label>Fecha de Fin:</Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            value={control.endDate}
                                                            onChange={(e) => handleControlChange(index, 'endDate', e.target.value)}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group className="mb-3" controlId={`controlPeriod_${index}`}>
                                                        <Form.Label>Período:</Form.Label>
                                                        <Form.Select
                                                            value={control.period}
                                                            onChange={(e) => handleControlChange(index, 'period', e.target.value)}
                                                        >
                                                            <option value="">Seleccionar...</option>
                                                            {Object.entries(period).map(([key, value]) => (
                                                                <option key={key} value={key}>{value}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                    <Form.Group className="mb-3" controlId={`controlMashup_${index}`}>
                                                        <Form.Label>Mashup:</Form.Label>
                                                        <Form.Select
                                                            value={control.mashup}
                                                            onChange={(e) => handleControlChange(index, 'mashup', e.target.value)}
                                                        >
                                                            <option value="">Seleccionar...</option>
                                                            {mashups.map((mashup) => (
                                                                <option key={mashup.id} value={mashup.id}>{mashup.name}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                    {/* Render the mashup inputs */}
                                                    {control.inputs.map((input, inputIndex) => (
                                                        <Form.Group key={input.id} className="mb-3">
                                                            <Form.Label>{input.name}:</Form.Label>
                                                            {input.type === 'STRING' ? (
                                                                <Form.Control
                                                                    type="text"
                                                                    value={control.inputValues[input.id] || ''}
                                                                    onChange={(e) => handleInputChange(index, input.id, e.target.value)}
                                                                />
                                                            ) : (
                                                                <Form.Control
                                                                    type="number"
                                                                    value={control.inputValues[input.id] || ''}
                                                                    onChange={(e) => handleInputChange(index, input.id, e.target.value)}
                                                                />
                                                            )}
                                                        </Form.Group>
                                                    ))}
                                                    <Button variant="danger" onClick={() => handleRemoveControl(index)}>
                                                        Eliminar Control
                                                    </Button>
                                                </Card.Body>
                                            </Card>
                                        </div>
                                    </Carousel.Item>
                                ))}
                            </Carousel>
                            )}
                            
                            <div className="actions text-center">
                                <Button variant="secondary" onClick={handleAddControl}>
                                    Agregar Control
                                </Button>
                            </div>
                            <div className="actions text-center">
                                <Button variant="success" type="submit" className="text-center">
                                    Crear Catálogo
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
        </div>
    );
}

export default NewCatalog;