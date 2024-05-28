import React from "react";
import { Form, Card, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useCatalogs } from "../../hooks/useCatalogs";
import { useControls } from "../../hooks/useControls";
import { useSelector, useDispatch } from "react-redux";
import {
  addEmptyControl,
  removeControl,
} from "../../features/controls/controlSlice";
import { removeInput } from "../../features/inputs/inputSlice";
import ControlForm from "./ControlForm";
import tpaTemplate from "./tpa-template.json";
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

  const { createControlInDB, createControlInputInDB } = useControls();
  const { getMashupByIdFromTheDB } = useMashups();

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
        "http://prueba.com",
        catalogStartDate,
        catalogEndDate
      );

      const catalogData = await catalogResponse;
      const catalogId = catalogData.id;

      const controlPromises = controls.map((control) =>
        handleCreateControl(control, catalogId)
      );
      await Promise.all(controlPromises);

      generateTPA(controls, catalogId);

      navigate("/catalogs");
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
    }
  };

  const addControl = () => {
    dispatch(addEmptyControl());
  };

  const toUpperSnakeCase = (name) => {
    return name.toUpperCase().replace(/\s+/g, "_");
  };

  const generateTPA = async (controls, catalogId) => {
    const tpa = JSON.parse(JSON.stringify(tpaTemplate));

    for (const control of controls) {
      const countingMetricName = "NUMBER_OF_ELEMENTS_FOR_" + toUpperSnakeCase(control.name);
      const positiveElementsMetricName = "NUMBER_OF_POSITIVE_ELEMENTS_FOR_" + toUpperSnakeCase(control.name);
      const guaranteeName = "RATE_FOR_" + toUpperSnakeCase(control.name);
      const mashup = await getMashupByIdFromTheDB(control.mashup_id);

      let config = {};
      for (const input of inputs.inputs[control.id]) {
        config[input.name] = input.value;
      }
      let trueConfig = { ...config };
      trueConfig["Status"] = "true";

      addMetricToTPA(tpa, countingMetricName, mashup, config);
      addMetricToTPA(tpa, positiveElementsMetricName, mashup, trueConfig);
      addGuaranteeToTPA(tpa, guaranteeName, control, countingMetricName, positiveElementsMetricName, 50);
    }

    // Convierte el objeto TPA a una cadena JSON
    const tpaString = JSON.stringify(tpa, null, 2);

    saveTpa(tpaString, catalogId);
  };

  const addMetricToTPA = async (tpa, metricName, mashup, config) => {
    tpa.terms.metrics[metricName] = {
      collector: {
        infrastructurePath: "internal.collector.events",
        endpoint: "/api/v2/computations",
        type: "POST-GET-V1",
        config: {
          scopeManager:
            "http://host.docker.internal:5700/api/v1/scopes/development",
        },
      },
      measure: {
        computing: "actual",
        element: "number",
        event: {
          status: {
            [mashup.name]: {},
          },
        },
        config: config,
        scope: {
          project: {
            name: "Project",
            description: "Project",
            type: "string",
            default: "example-project",
          },
          class: {
            name: "Class",
            description: "Group some projects",
            type: "string",
            default: "example-class",
          },
        },
      },
    };
  }

  const addGuaranteeToTPA = async (tpa, guaranteeName, control, countingMetricName, positiveElementsMetricName, objective) => {
    tpa.terms.guarantees.push({
      id: guaranteeName,
      notes: `#### Description\n\`\`\`\n${control.description}`,
      description: control.description,
      scope: {
        project: {
          name: "Project",
          description: "Project",
          type: "string",
          default: "example-project",
        },
        class: {
          name: "Class",
          description: "Group some projects",
          type: "string",
          default: "example-class",
        },
      },
      of: [
        {
          scope: {
            project: "example-project",
          },
          objective: `${positiveElementsMetricName}/${countingMetricName} * 100 > ${objective}`,
          with: {
            [countingMetricName]: {},
            [positiveElementsMetricName]: {},
          },
          window: {
            type: "static",
            period: control.period.toLowerCase(),
            initial: control.startDate,
            end: control.endDate,
          },
        },
      ],
    });
  }

  const saveTpa = async (tpaContent, catalogId) => {
    try {
      const response = await fetch("http://localhost:3001/api/catalogs/tpa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: tpaContent,
          catalogId: catalogId,
        }),
      });

      if (response.ok) {
        console.log("TPA guardado en el servidor");
      } else {
        console.error("Error al guardar el TPA:", response.statusText);
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
