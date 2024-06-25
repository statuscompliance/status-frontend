import React from "react";
import { generateTPA } from './TpaUtils';
import { Form, Card, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useCatalogs } from "../../hooks/useCatalogs";
import { useControls } from "../../hooks/useControls";
import { useTpas } from "../../hooks/useTpas";
import { useSelector, useDispatch } from "react-redux";
import {
  addEmptyControl,
  removeControl,
} from "../../features/controls/controlSlice";
import { removeInput } from "../../features/inputs/inputSlice";
import ControlForm from "./ControlForm";
import { useMashups } from "../../hooks/useMashups";

function NewCatalog() {
  const {
    createCatalogInDB,
    catalogName,
    catalogStartDate,
    catalogEndDate,
    handleNameChange,
    handleStartDateChange,
    handleEndDateChange,
  } = useCatalogs();
  const inputs = useSelector((state) => state.inputs);
  const dispatch = useDispatch();
  const controls = useSelector((state) => state.controls.controls);
  const navigate = useNavigate();
  const { getMashupByIdFromTheDB } = useMashups();
  const {
    createTpaInDB,
    deleteTpaByIdFromTheDatabase,
  } = useTpas();

  const { createControlInDB, createControlInputInDB } = useControls();

  // Handler function for remove a control
  const handleRemoveControl = (controlId) => {
    dispatch(removeControl({ id: controlId }));
    dispatch(removeInput({ index: controlId }));
  };

  // Handler function for create a control
  const handleCreateControl = async (control, catalogId) => {
    const response = await createControlInDB(
      control.name,
      control.description,
      control.startDate,
      control.endDate,
      control.period,
      control.mashup_id,
      catalogId
    );

    const controlData = await response;
    const inputControlPromises = Object.entries(inputs.inputs[control.id]).map(
      ([inputId, inputInfo]) =>
        handleCreateControlInput(controlData.id, inputInfo.id, inputInfo.value)
    );

    await Promise.all(inputControlPromises);
    return response.ok;
  };

  // Handler function for create a control input
  const handleCreateControlInput = async (controlDataId, inputId, value) => {
    const inputControlResponse = await createControlInputInDB(
      controlDataId,
      inputId,
      value
    );
    return inputControlResponse;
  };

  // Handler function for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const catalogResponse = await createCatalogInDB(
        catalogName,
        catalogStartDate,
        catalogEndDate
      );

      const catalogData = await catalogResponse;
      const catalogId = catalogData.id;

      const controlPromises = controls.map((control) =>
        handleCreateControl(control, catalogId)
      );
      await Promise.all(controlPromises);

      generateTPA(controls, catalogId, getMashupByIdFromTheDB, inputs, createTpaInDB, deleteTpaByIdFromTheDatabase);

      navigate("/catalogs");
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
    }
  };

  const addControl = () => {
    dispatch(addEmptyControl());
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
              <Row>
                <Form.Group className="mb-3" controlId="catalogName">
                  <Form.Label>Nombre del Catálogo:</Form.Label>
                  <Form.Control
                    maxLength={100}
                    onChange={handleNameChange}
                    required
                    type="text"
                    value={catalogName}
                  />
                </Form.Group>
              </Row>
              <Row>
                <Col>
                  <Form.Group className="mb-3" controlId="catalogStartDate">
                    <Form.Label>Fecha de inicio:</Form.Label>
                    <Form.Control
                      type="date"
                      value={catalogStartDate}
                      onChange={handleStartDateChange}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3" controlId="catalogEndDate">
                    <Form.Label>Fecha de fin:</Form.Label>
                    <Form.Control
                      type="date"
                      value={catalogEndDate}
                      onChange={handleEndDateChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <ControlForm handleRemoveControl={handleRemoveControl} />
              {/* Action buttons */}
              <div className="actions text-center">
                {controls.length === 0 && (
                  <Button
                    className="mt-2"
                    onClick={addControl}
                    variant="primary"
                  >
                    Crear Control
                  </Button>
                )}
                <Button
                  className="text-center ms-2 mt-2"
                  type="submit"
                  variant="success"
                >
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
