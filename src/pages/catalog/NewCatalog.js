import React from "react";
import { Form, Button, Card, Row, Col, Carousel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useCatalogs } from "../../hooks/useCatalogs";
import { useMashups } from "../../hooks/useMashups";
import { useControls } from "../../hooks/useControls";
import { Period } from "./Period";
import ControlForm from "./ControlForm";

function NewCatalog() {
  const { createCatalogInDB, catalogName, handleNameChange } = useCatalogs();
  const { mashups, getInputsForMashupFromTheDB } = useMashups();
  const navigate = useNavigate();

  const {
    controls,
    addEmptyControl,
    createControlInDB,
    updateControl,
    removeControl,
    lastItemRemoved,
    createControlInputInDB,
    updateControlInputs,
  } = useControls();

  // Handler function for change input values for a specific control.
  const handleInputChange = (controlIndex, inputId, inputValue) => {
    updateControlInputs(controlIndex, inputId, inputValue);
  };

  // Handler function for remove a control
  const handleRemoveControl = (index) => {
    removeControl(index);
  };

  // Handler function for updating control
  const handleControlChange = async (index, field, value) => {
    if (field === "mashup") {
      const inputs = await getInputsForMashupFromTheDB(value);
      updateControl(index, field, value);
      updateControl(index, "inputs", inputs);
    } else {
      updateControl(index, field, value);
    }
  };

  // Handler function for create a control input
  const handleCreateControlInput = async (controlDataId, inputId, value) => {
    const inputControlResponse = await createControlInputInDB(
      controlDataId,
      inputId,
      value
    );
    if (!inputControlResponse.ok) {
      throw new Error("Error al crear InputControl.");
    }
    return inputControlResponse.json();
  };

  // Handler function for create a control
  const handleCreateControl = async (control, catalogId) => {
    const response = await createControlInDB(
      control.name,
      control.description,
      control.startDate,
      control.endDate,
      control.period,
      control.mashup,
      catalogId
    );

    if (!response.ok) {
      throw new Error("Error al crear un control.");
    }

    const controlData = await response.json();
    const inputControlPromises = Object.entries(control.inputValues).map(
      ([inputId, value]) =>
        handleCreateControlInput(controlData.id, inputId, value)
    );

    await Promise.all(inputControlPromises);
    return response.ok;
  };

  // Handler function for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const catalogResponse = await createCatalogInDB(catalogName);
      if (!catalogResponse.ok) {
        console.error("Error al crear el catálogo.");
        return;
      }

      const catalogData = await catalogResponse.json();
      const catalogId = catalogData.id;

      const controlPromises = controls.map((control) =>
        handleCreateControl(control, catalogId)
      );
      const controlResponses = await Promise.all(controlPromises);

      if (controlResponses.every((response) => response)) {
        console.log("Catálogo y controles creados exitosamente.");
        navigate("/catalogs");
      } else {
        console.error("Error al crear los controles.");
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
    }
  };

  // JSX representing the component's UI
  return (
    <div className="container">
      <Col md={10}>
        <Card style={{ backgroundColor: "#bf0a2e", color: "#ffff" }}>
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
                  maxLength={100}
                />
              </Form.Group>
              {/* Rendering controls */}
              {controls.length > 0 && (
                <Carousel
                  key={`carousel-${controls.length}-${lastItemRemoved}`}
                  controls={false}
                  pause="hover"
                  wrap={false}
                  interval={null}
                >
                  {controls.map((control, index) => (
                    <Carousel.Item key={index}>
                      <div className="col-12" key={index}>
                        <ControlForm
                          key={index}
                          control={control}
                          index={index}
                          handleControlChange={handleControlChange}
                          handleRemoveControl={handleRemoveControl}
                          handleInputChange={handleInputChange}
                          period={Period}
                          mashups={mashups}
                        />
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel>
              )}
              <Row className="mt-3">
                <Col>
                  <div className="actions text-center">
                    <Button variant="secondary" onClick={addEmptyControl}>
                      Agregar Control
                    </Button>
                  </div>
                </Col>
                <Col>
                  <div className="actions text-center">
                    <Button
                      variant="success"
                      type="submit"
                      className="text-center"
                    >
                      Crear Catálogo
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </div>
  );
}

export default NewCatalog;
