import React, { useState, useEffect } from "react";
import "../../static/css/controlForm.css";
import { Period } from "./Period";
import { Form, Button, Card, Row, Col } from "react-bootstrap";
import { useNode } from "../../hooks/useNode";
import { useControls } from "../../hooks/useControls";
import { useNavigate, useParams } from "react-router-dom";

const ControlForm = () => {
  const { controlId, catalogId } = useParams();
  const { getMashupById, getMashupParameters, getFlows, sendMashupRequest } = useNode();
  const {
    createControlInDB,
    updateControlInDB,
    getControlByIdFromDB,
    getInputControlsByControlIdFromDB,
    createControlInputInDB,
    updateControlInputInDb,
  } = useControls();

  const [control, setControl] = useState({
    name: "",
    description: "",
    period: "",
    startDate: "",
    endDate: "",
    mashup_id: "",
  });
  const [flows, setFlows] = useState([]);
  const [inputs, setInputs] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlows = async () => {
      const fetchedFlows = await getFlows();
      setFlows(fetchedFlows);
    };

    fetchFlows();
  }, []);

  useEffect(() => {
    if (controlId && flows.length > 0) {
      setIsEditMode(true);
      fetchControlData(controlId);
    }
  }, [controlId, flows]);

  const fetchControlData = async (controlId) => {
    try {
      const controlData = await getControlByIdFromDB(controlId);
      setControl({
        name: controlData.name,
        description: controlData.description,
        period: controlData.period,
        startDate: new Date(controlData.startDate).toISOString().split("T")[0],
        endDate: new Date(controlData.endDate).toISOString().split("T")[0],
        mashup_id: controlData.mashup_id,
      });

      if (controlData.mashup_id) {
        const selectedMashup = getMashupById(flows, controlData.mashup_id);
        if (selectedMashup) {
          const parameters = await getMashupParameters(selectedMashup);
          const inputValues = await getInputControlsByControlIdFromDB(
            controlId
          );
          const inputsWithValues = parameters.map((param) => {
            const foundInput = inputValues.find(
              (input) => input.input_id === param.id
            );
            return {
              ...param,
              value: foundInput ? foundInput.value : "",
              controlInputId: foundInput ? foundInput.id : null,
            };
          });
          setInputs(inputsWithValues);
        }
      }
    } catch (error) {
      console.error("Error loading control data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setControl((prevControl) => ({ ...prevControl, [name]: value }));

    if (name === "mashup_id") {
      handleMashupSelection(value);
    }
  };

  const handleMashupSelection = async (mashupId) => {
    if (!mashupId) {
      setInputs([]);
    } else {
      const selectedMashup = getMashupById(flows, mashupId);
      if (selectedMashup) {
        const parameters = await getMashupParameters(selectedMashup);
        setInputs(
          parameters.map((param) => ({
            ...param,
            value: "",
            controlInputId: null,
          }))
        );
      }
    }
  };

  const handleMashupInputChange = (inputId, value) => {
    setInputs((prevInputs) =>
      prevInputs.map((input) =>
        input.id === inputId ? { ...input, value: value } : input
      )
    );
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditMode) {
      await updateControlInDB(
        controlId,
        control.name,
        control.description,
        control.period,
        control.startDate,
        control.endDate,
        control.mashup_id,
        catalogId
      );

      const inputPromises = inputs.map((input) => {
        if (input.controlInputId) {
          return updateControlInputInDb(input.controlInputId, input.value);
        } else {
          return createControlInputInDB(controlId, input.id, input.value);
        }
      });
      await Promise.all(inputPromises);
    } else {
      const controlResponse = await createControlInDB(
        control.name,
        control.description,
        control.period,
        control.startDate,
        control.endDate,
        control.mashup_id,
        catalogId
      );
      const newControlId = controlResponse.id;

      const inputPromises = inputs.map((input) =>
        createControlInputInDB(newControlId, input.id, input.value)
      );
      await Promise.all(inputPromises);
    }

    if (control.mashup_id) {
      const mashupUrl = `http://node-red-status:1880/api/${
        getMashupById(flows, control.mashup_id).url.match(/\/api\/(.+)/)[1]
      }`;
      await sendMashupRequest(mashupUrl, inputs);
    }

    navigate(`/catalog/${catalogId}/controls`);
  };

  return (
    <div className="container py-4">
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="shadow-sm border-0">
            <Card.Header
              style={{ backgroundColor: "#bf0a2e", color: "#ffffff" }}
            >
              <h2 className="text-center mb-0">
                {isEditMode ? "Update Control" : "New Control"}
              </h2>
            </Card.Header>
            <Card.Body className="bg-light" style={{ fontSize: "20px" }}>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="controlName">
                  <Form.Label className="fw-bold">Control name:</Form.Label>
                  <Form.Control
                    maxLength={100}
                    name="name"
                    value={control.name}
                    onChange={handleInputChange}
                    required
                    type="text"
                    className="form-control-lg"
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="controlDescription">
                  <Form.Label className="fw-bold">Description:</Form.Label>
                  <Form.Control
                    as="textarea"
                    maxLength={300}
                    name="description"
                    value={control.description}
                    onChange={handleInputChange}
                    required
                    className="form-control-lg"
                    rows={3}
                  />
                </Form.Group>
                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group controlId="controlStartDate">
                      <Form.Label className="fw-bold">Start date:</Form.Label>
                      <Form.Control
                        name="startDate"
                        type="date"
                        value={control.startDate}
                        onChange={handleInputChange}
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="controlEndDate">
                      <Form.Label className="fw-bold">End date:</Form.Label>
                      <Form.Control
                        name="endDate"
                        type="date"
                        value={control.endDate}
                        onChange={handleInputChange}
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col>
                    <Form.Group controlId="controlPeriod">
                      <Form.Label className="fw-bold">Periodicity:</Form.Label>
                      <Form.Select
                        name="period"
                        value={control.period}
                        onChange={handleInputChange}
                        required
                        className="form-control-lg"
                      >
                        <option value="">Select...</option>
                        {Object.entries(Period).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="controlMashup">
                      <Form.Label className="fw-bold">Check:</Form.Label>
                      <Form.Select
                        name="mashup_id"
                        value={control.mashup_id}
                        onChange={handleInputChange}
                        required
                        className="form-control-lg"
                      >
                        <option value="">Select...</option>
                        {flows.map((mashup, index) => (
                          <option key={index} value={mashup.id}>
                            {mashup.url.match(/\/api\/(.+)/)[1]}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Render the mashup inputs */}
                {inputs.length > 0 && (
                  <Card className="mb-3 border-0 shadow-sm">
                    <Card.Header
                      style={{ backgroundColor: "#bf0a2e", color: "#ffffff" }}
                    >
                      <h4 className="mb-0">Mashup Inputs</h4>
                    </Card.Header>
                    <Card.Body>
                      {inputs.map((input) => (
                        <Form.Group className="mb-3" key={input.id}>
                          <Form.Label className="fw-bold">
                            {input.name}:
                          </Form.Label>
                          <Form.Control
                            type={input.type === "string" ? "text" : "number"}
                            value={input.value || ""}
                            onChange={(e) =>
                              handleMashupInputChange(input.id, e.target.value)
                            }
                            required
                            className="form-control-lg"
                          />
                        </Form.Group>
                      ))}
                    </Card.Body>
                  </Card>
                )}

                <div className="actions text-center mt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    style={{
                      backgroundColor: "#bf0a2e",
                      borderColor: "#bf0a2e",
                    }}
                  >
                    {isEditMode ? "Update control" : "Create control"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ControlForm;
