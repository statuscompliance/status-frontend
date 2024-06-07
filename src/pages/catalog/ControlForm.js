import React, { useState, useEffect } from "react";
import { Period } from "./Period";
import { Form, Button, Card, Row, Col, Carousel } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useMashups } from "../../hooks/useMashups";
import { useInputControls } from "../../hooks/useInputControls";
import { editControl } from "../../features/controls/controlSlice";
import { setInputs, editInput } from "../../features/inputs/inputSlice";
import { addEmptyControl } from "../../features/controls/controlSlice";

const ControlForm = ({ handleRemoveControl }) => {
  const dispatch = useDispatch();
  const controls = useSelector((state) => state.controls.controls);
  const inputs = useSelector((state) => state.inputs);
  const { mashups, getInputsForMashupFromTheDB } = useMashups();
  const { getValuesByInputIdAndControlIdFromTheDB } = useInputControls();
  const [selectedMashupId, setSelectedMashupId] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  // Handler function for updating control details
  const handleControlChange = async (controlId, field, value) => {
    if (field === "mashup_id") {
      setSelectedMashupId(value);
      let newInputs = [];

      // Actualiza el control actual con el ID del mashup seleccionado
      dispatch(editControl({ controlId, field, value }));

      if (value !== -1) {
        // Obtener las entradas para el mashup seleccionado
        newInputs = await getInputsForMashupFromTheDB(value);

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
          onSelect={(selectedIndex) => {
            setActiveIndex(selectedIndex);
          }}
          controls={false}
          interval={null}
          key={`carousel-${controls.length}`}
          pause="hover"
          wrap={false}
        >
          {controls.map((control, index) => (
            <Carousel.Item key={index}>
              <div className="col-12" key={index}>
                <Card className="bg-secondary" style={{ color: "#ffff" }}>
                  <Card.Body>
                    <Form.Group
                      className="mb-3"
                      controlId={`controlName_${control.id}`}
                    >
                      <Form.Label>Nombre del Control:</Form.Label>
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
                      />
                    </Form.Group>
                    <Form.Group
                      className="mb-3"
                      controlId={`controlDescription_${control.id}`}
                    >
                      <Form.Label>Descripción:</Form.Label>
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
                      />
                    </Form.Group>
                    <Row>
                      <Col>
                        <Form.Group
                          className="mb-3"
                          controlId={`controlStartDate_${control.id}`}
                        >
                          <Form.Label>Fecha de inicio:</Form.Label>
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
                          />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group
                          className="mb-3"
                          controlId={`controlEndDate_${control.id}`}
                        >
                          <Form.Label>Fecha de fin:</Form.Label>
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
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form.Group
                          className="mb-3"
                          controlId={`controlPeriod_${control.id}`}
                        >
                          <Form.Label>Periodicidad:</Form.Label>
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
                          >
                            <option value="">Seleccionar...</option>
                            {Object.entries(Period).map(([key, value]) => (
                              <option key={key} value={key}>
                                {value}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group
                          className="mb-3"
                          controlId={`controlMashup_${control.id}`}
                        >
                          <Form.Label>Verificación:</Form.Label>
                          <Form.Select
                            value={control.mashup_id}
                            onChange={(e) =>
                              handleControlChange(
                                control.id,
                                "mashup_id",
                                parseInt(e.target.value)
                              )
                            }
                            required
                          >
                            <option value="">Seleccionar...</option>
                            {mashups.map((mashup) => (
                              <option key={mashup.id} value={mashup.id}>
                                {mashup.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    {/* Render the mashup inputs */}
                    {inputs.inputs[control.id] && inputs.inputs[control.id].length > 0 && (
                      <div className="bg-dark p-3 mb-3">
                        {inputs.inputs[control.id]?.map((input) => (
                          <Form.Group className="mb-3" key={input.id}>
                            <Form.Label>{input.name}:</Form.Label>
                            {input.type === "STRING" ? (
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
                              />
                            )}
                          </Form.Group>
                        ))}
                      </div>
                    )}
                    <Row className="justify-content-between">
                      <Col xs="auto">
                        <Button onClick={addControl} variant="primary">
                          Agregar Control
                        </Button>
                      </Col>
                      <Col xs="auto">
                        <Button
                          onClick={() => handleRemoveControl(control.id)}
                          variant="danger"
                          className="ms-2"
                        >
                          Eliminar Control
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
