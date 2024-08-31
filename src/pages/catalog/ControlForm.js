import React, { useState, useEffect } from "react";
import { Period } from "./Period";
import { Form, Button, Card, Row, Col, Carousel } from "react-bootstrap";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";
import { useSelector, useDispatch } from "react-redux";
import { useInputControls } from "../../hooks/useInputControls";
import { editControl } from "../../features/controls/controlSlice";
import { setInputs, editInput } from "../../features/inputs/inputSlice";
import { addEmptyControl } from "../../features/controls/controlSlice";
import { useNode } from "../../hooks/useNode";

const ControlForm = ({ handleRemoveControl }) => {
  const dispatch = useDispatch();
  const controls = useSelector((state) => state.controls.controls);
  const inputs = useSelector((state) => state.inputs);

  const { getValuesByInputIdAndControlIdFromTheDB } = useInputControls();
  const [selectedMashupId, setSelectedMashupId] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [flows, setFlows] = useState([]);
  const { getFlows, getMashupById, getMashupParameters } = useNode();

  useEffect(() => {
    const fetchFlows = async () => {
      const fetchedFlows = await getFlows();
      setFlows(fetchedFlows);
    };
    fetchFlows();
  }, []);

  // Handler function for updating control details
  const handleControlChange = async (controlId, field, value) => {
    if (field === "mashup_id") {
      setSelectedMashupId(value);
      let newInputs = [];

      // Actualiza el control actual con el ID del mashup seleccionado
      dispatch(editControl({ controlId, field, value }));

      if (value && value !== -1) {
        const selectedMashup = getMashupById(flows, value);
        if (selectedMashup) {
          // Obtener las entradas para el mashup seleccionado
          newInputs = await getMashupParameters(selectedMashup);
        }

        newInputs = await Promise.all(
          newInputs.map(async (input) => {
            const inputValue = await getValuesByInputIdAndControlIdFromTheDB(
              input.id,
              controlId
            );
            return { ...input, value: inputValue.value };
          })
        );
      }

      // Actualiza el estado con las nuevas entradas y valores
      dispatch(setInputs({ controlId, inputs: newInputs }));
    } else {
      dispatch(editControl({ controlId, field, value }));
    }
  };

  // Handler function for change input values for a specific control.
  const handleInputChange = (controlId, inputId, value) => {
    dispatch(
      editInput({
        controlId,
        inputId,
        data: {
          value: value,
        },
      })
    );
  };

  // Handler function for add a empty control
  const addControl = () => {
    dispatch(addEmptyControl());
    setActiveIndex(controls.length);
  };

  useEffect(() => {
    if (controls.length === 0) {
      setActiveIndex(0);
    } else if (activeIndex >= controls.length) {
      setActiveIndex(controls.length - 1);
    }
  }, [controls.length]);

  return (
    <>
      {/* Rendering controls */}
      {controls.length > 0 && (
        <Carousel
          activeIndex={activeIndex}
          onSelect={(selectedIndex) => setActiveIndex(selectedIndex)}
          controls={false}
          interval={null}
          key={`carousel-${controls.length}`}
          pause="hover"
          wrap={false}
          className="control-carousel"
          prevIcon={<ChevronLeft size={30} />}
          nextIcon={<ChevronRight size={30} />}
        >
          {controls.map((control, index) => (
            <Carousel.Item key={index}>
              <div className="col-12">
                <Card className="shadow-sm border-0">
                  <Card.Header
                    style={{ backgroundColor: "#bf0a2e", color: "#ffffff" }}
                  >
                    <h3 className="mb-0">Control Details</h3>
                  </Card.Header>
                  <Card.Body className="bg-secondary">
                    <Form.Group
                      className="mb-3"
                      controlId={`controlName_${control.id}`}
                    >
                      <Form.Label className="fw-bold">Control name:</Form.Label>
                      <Form.Control
                        maxLength={100}
                        onChange={(e) =>
                          handleControlChange(
                            control.id,
                            "name",
                            e.target.value
                          )
                        }
                        required
                        type="text"
                        value={control.name}
                        className="form-control-lg"
                      />
                    </Form.Group>
                    <Form.Group
                      className="mb-3"
                      controlId={`controlDescription_${control.id}`}
                    >
                      <Form.Label className="fw-bold">Description:</Form.Label>
                      <Form.Control
                        as="textarea"
                        maxLength={300}
                        onChange={(e) =>
                          handleControlChange(
                            control.id,
                            "description",
                            e.target.value
                          )
                        }
                        required
                        value={control.description}
                        className="form-control-lg"
                        rows={3}
                      />
                    </Form.Group>
                    <Row className="mb-3">
                      <Col>
                        <Form.Group
                          controlId={`controlStartDate_${control.id}`}
                        >
                          <Form.Label className="fw-bold">
                            Start date:
                          </Form.Label>
                          <Form.Control
                            type="date"
                            value={control.startDate}
                            onChange={(e) =>
                              handleControlChange(
                                control.id,
                                "startDate",
                                e.target.value
                              )
                            }
                            className="form-control-lg"
                          />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group controlId={`controlEndDate_${control.id}`}>
                          <Form.Label className="fw-bold">End date:</Form.Label>
                          <Form.Control
                            type="date"
                            value={control.endDate}
                            onChange={(e) =>
                              handleControlChange(
                                control.id,
                                "endDate",
                                e.target.value
                              )
                            }
                            className="form-control-lg"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col>
                        <Form.Group controlId={`controlPeriod_${control.id}`}>
                          <Form.Label className="fw-bold">
                            Periodicity:
                          </Form.Label>
                          <Form.Select
                            value={control.period}
                            onChange={(e) =>
                              handleControlChange(
                                control.id,
                                "period",
                                e.target.value
                              )
                            }
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
                        <Form.Group controlId={`controlMashup_${control.id}`}>
                          <Form.Label className="fw-bold">Check:</Form.Label>
                          <Form.Select
                            value={control.mashup_id}
                            onChange={(e) =>
                              handleControlChange(
                                control.id,
                                "mashup_id",
                                e.target.value
                              )
                            }
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
                    {inputs.inputs[control.id] &&
                      inputs.inputs[control.id].length > 0 && (
                        <Card className="mb-3 border-0 shadow-sm">
                          <Card.Header className="bg-info text-black">
                            <h4 className="mb-0">Mashup Inputs</h4>
                          </Card.Header>
                          <Card.Body>
                            {inputs.inputs[control.id]?.map((input, index) => (
                              <Form.Group
                                className="mb-3"
                                key={`${input.id}+${index}`}
                              >
                                <Form.Label className="fw-bold">
                                  {input.name}:
                                </Form.Label>
                                {input.type === "string" ? (
                                  <Form.Control
                                    type="text"
                                    value={input.value || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        control.id,
                                        input.id,
                                        e.target.value
                                      )
                                    }
                                    required
                                    className="form-control-lg"
                                  />
                                ) : (
                                  <Form.Control
                                    type="number"
                                    value={parseInt(input.value, 10) || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        control.id,
                                        input.id,
                                        parseInt(e.target.value, 10)
                                      )
                                    }
                                    required
                                    className="form-control-lg"
                                  />
                                )}
                              </Form.Group>
                            ))}
                          </Card.Body>
                        </Card>
                      )}
                    <Row className="justify-content-between mt-4">
                      <Col xs="auto">
                        <Button
                          onClick={addControl}
                          variant="success"
                          size="lg"
                          className="ms-2"
                        >
                          Add control
                        </Button>
                      </Col>
                      <Col xs="auto">
                        <Button
                          onClick={() => handleRemoveControl(control.id)}
                          variant="danger"
                          size="lg"
                          className="ms-2"
                        >
                          Delete control
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      )}
    </>
  );
};

export default ControlForm;
