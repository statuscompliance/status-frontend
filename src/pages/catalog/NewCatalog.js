import React, { useState, useEffect } from "react";
import { generateTPA } from "./TpaUtils";
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
import { useNode } from "../../hooks/useNode";

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
  const { createTpaInDB } = useTpas();
  const { getFlows, getMashupById } = useNode();
  const { createControlInDB, createControlInputInDB } = useControls();
  const [flows, setFlows] = useState([]);

  useEffect(() => {
    const fetchFlows = async () => {
      const fetchedFlows = await getFlows();
      setFlows(fetchedFlows);
    };
    fetchFlows();
  }, [getFlows]);

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

    const controlData = response;
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

      const catalogData = catalogResponse;
      const catalogId = catalogData.id;

      const controlPromises = controls.map((control) =>
        handleCreateControl(control, catalogId)
      );
      await Promise.all(controlPromises);

      await generateTPA(
        controls,
        catalogId,
        getFlows,
        getMashupById,
        inputs,
        createTpaInDB
      );

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
    <div className="container py-4">
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="shadow-sm border-0">
            <Card.Header
              style={{ backgroundColor: "#bf0a2e", color: "#ffffff" }}
            >
              <h2 className="text-center mb-0">New Catalog</h2>
            </Card.Header>
            <Card.Body className="bg-light">
              {/* Form for creating a new catalog */}
              <Form onSubmit={handleSubmit}>
                <Row className="mb-4">
                  <Col>
                    <Form.Group controlId="catalogName">
                      <Form.Label className="fw-bold">Catalog name:</Form.Label>
                      <Form.Control
                        maxLength={100}
                        onChange={handleNameChange}
                        required
                        type="text"
                        value={catalogName}
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group controlId="catalogStartDate">
                      <Form.Label className="fw-bold">Start date:</Form.Label>
                      <Form.Control
                        type="date"
                        value={catalogStartDate}
                        onChange={handleStartDateChange}
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="catalogEndDate">
                      <Form.Label className="fw-bold">End date:</Form.Label>
                      <Form.Control
                        type="date"
                        value={catalogEndDate}
                        onChange={handleEndDateChange}
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <ControlForm handleRemoveControl={handleRemoveControl} />
                {/* Action buttons */}
                <div className="actions text-center mt-4">
                  {controls.length === 0 && (
                    <Button
                      onClick={addControl}
                      variant="outline-primary"
                      size="lg"
                      className="me-2"
                      style={{ borderColor: "#bf0a2e", color: "#bf0a2e" }}
                    >
                      Create control
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    style={{
                      backgroundColor: "#bf0a2e",
                      borderColor: "#bf0a2e",
                    }}
                  >
                    Create catalog
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default NewCatalog;
