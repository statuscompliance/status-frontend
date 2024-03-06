import React from "react";
import { Form, Button, Card, Row, Col } from "react-bootstrap";

const ControlForm = ({
  control,
  index,
  handleControlChange,
  handleRemoveControl,
  handleInputChange,
  period,
  mashups,
}) => {
  return (
    <Card className="bg-secondary" style={{ color: "#ffff" }}>
      <Card.Body>
        <Form.Group className="mb-3" controlId={`controlName_${index}`}>
          <Form.Label>Nombre del Control:</Form.Label>
          <Form.Control
            type="text"
            value={control.name}
            onChange={(e) => handleControlChange(index, "name", e.target.value)}
            required
            maxLength={100}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId={`controlDescription_${index}`}>
          <Form.Label>Descripción:</Form.Label>
          <Form.Control
            as="textarea"
            value={control.description}
            onChange={(e) =>
              handleControlChange(index, "description", e.target.value)
            }
            required
            maxLength={300}
          />
        </Form.Group>
        <Row>
          <Col>
            <Form.Group
              className="mb-3"
              controlId={`controlStartDate_${index}`}
            >
              <Form.Label>Fecha de Inicio:</Form.Label>
              <Form.Control
                type="date"
                value={control.startDate}
                onChange={(e) =>
                  handleControlChange(index, "startDate", e.target.value)
                }
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3" controlId={`controlEndDate_${index}`}>
              <Form.Label>Fecha de Fin:</Form.Label>
              <Form.Control
                type="date"
                value={control.endDate}
                onChange={(e) =>
                  handleControlChange(index, "endDate", e.target.value)
                }
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group className="mb-3" controlId={`controlPeriod_${index}`}>
              <Form.Label>Período:</Form.Label>
              <Form.Select
                value={control.period}
                onChange={(e) =>
                  handleControlChange(index, "period", e.target.value)
                }
                required
              >
                <option value="">Seleccionar...</option>
                {Object.entries(period).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3" controlId={`controlMashup_${index}`}>
              <Form.Label>Mashup:</Form.Label>
              <Form.Select
                value={control.mashup}
                onChange={(e) =>
                  handleControlChange(index, "mashup", e.target.value)
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
        {control.inputs.map((input, inputIndex) => (
          <Form.Group key={input.id} className="mb-3">
            <Form.Label>{input.name}:</Form.Label>
            {input.type === "STRING" ? (
              <Form.Control
                type="text"
                value={control.inputValues[input.id] || ""}
                onChange={(e) =>
                  handleInputChange(index, input.id, e.target.value)
                }
                required
              />
            ) : (
              <Form.Control
                type="number"
                value={control.inputValues[input.id] || ""}
                onChange={(e) =>
                  handleInputChange(index, input.id, e.target.value)
                }
                required
              />
            )}
          </Form.Group>
        ))}
        <Button variant="danger" onClick={() => handleRemoveControl(index)}>
          Eliminar Control
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ControlForm;
