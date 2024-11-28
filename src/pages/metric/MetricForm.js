import React, { useState, useEffect } from "react";
import { Form, Button, Card, Row, Col } from "react-bootstrap";
import { useCatalogs } from "../../hooks/useCatalogs";
import { useControls } from "../../hooks/useControls";
import { useGrafana } from "../../hooks/useGrafana";
import { useNavigate, useParams } from "react-router-dom";

const MetricForm = () => {
  const { catalogId, controlId, metricId } = useParams();
  const isEditMode = Boolean(metricId);
  const navigate = useNavigate();
  const { getCatalogByIdFromTheDB } = useCatalogs();
  const { createControlPanel } = useControls();

  const {
    createMetric,
    updateMetric,
    getMetricById,
  } = useGrafana();
  const [metric, setMetric] = useState({
    title: "",
    type: "gauge",
    displayName: "",
    dataset: "computation",
    metricType: "COUNT",
    metricField: "",
    filterField: "",
    filterOperator: ">",
    filterValue: "",
    whereLogic: "AND",
  });
  const [dashboardUid, setDashboardUid] = useState("");

  useEffect(() => {
    const loadCatalogAndMetric = async () => {
      try {
        const catalogData = await getCatalogByIdFromTheDB(catalogId);
        setDashboardUid(catalogData.dashboard_id);

        if (isEditMode) {
          const loadedMetric = await getMetricById(catalogData.dashboard_id, metricId);
          setMetric(loadedMetric);
        }
      } catch (error) {
        console.error("Error loading catalog or metric:", error);
      }
    };

    loadCatalogAndMetric();
  }, [metricId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMetric((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedMetric = {
      title: metric.title,
      type: metric.type,
      displayName: metric.displayName,
      table: metric.dataset,
      sqlQuery: {
        aggregations: [
          {
            func: metric.metricType,
            attr: metric.metricType === "COUNT" ? "id" : metric.metricField,
          },
        ],
        whereConditions: metric.filterField
          ? [
              {
                key: metric.filterField,
                operator: metric.filterOperator || ">",
                value: metric.filterValue || "",
              },
            ]
          : [],
        whereLogic: metric.whereLogic,
        table: metric.dataset,
      },
    };

    try {
      if (isEditMode) {
        await updateMetric(dashboardUid, metricId, formattedMetric);
      } else {
        const newMetric = await createMetric(dashboardUid, formattedMetric);
        await createControlPanel(controlId, newMetric.panelId, dashboardUid);
      }
      navigate(`/catalog/${catalogId}/controls/${controlId}/metrics`);
    } catch (error) {
      console.error("Error saving metric:", error);
    }
  };

  return (
    <div className="container py-4">
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="shadow-sm border-0">
            <Card.Header style={{ backgroundColor: "#bf0a2e", color: "#ffffff" }}>
              <h2 className="text-center mb-0">
                {isEditMode ? "Update Metric" : "New Metric"}
              </h2>
            </Card.Header>
            <Card.Body className="bg-light" style={{ fontSize: "20px" }}>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={4}>
                    <Form.Group controlId="metricTitle">
                      <Form.Label>Title</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={metric.title}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="metricDisplayName">
                      <Form.Label>Display Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="displayName"
                        value={metric.displayName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="metricType">
                      <Form.Label>Type of Panel</Form.Label>
                      <Form.Control
                        as="select"
                        name="type"
                        value={metric.type}
                        onChange={handleChange}
                        required
                      >
                        <option value="gauge">Indicator</option>
                      </Form.Control>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={6}>
                    <Form.Group controlId="metricType">
                      <Form.Label>Metric to Display</Form.Label>
                      <Form.Control
                        as="select"
                        name="metricType"
                        value={metric.metricType}
                        onChange={handleChange}
                        required
                      >
                        <option value="COUNT">Total Number of Items</option>
                        <option value="SUM">Total Sum of [Field]</option>
                        <option value="AVG">Average of [Field]</option>
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  {metric.metricType !== "COUNT" && (
                    <Col md={6}>
                      <Form.Group controlId="metricField">
                        <Form.Label>Select the Field for the Metric</Form.Label>
                        <Form.Control
                          type="text"
                          name="metricField"
                          value={metric.metricField}
                          onChange={handleChange}
                          placeholder="e.g., price, quantity"
                          required
                        />
                      </Form.Group>
                    </Col>
                  )}
                </Row>

                <Form.Group controlId="filterField" className="mt-3">
                  <Form.Label>Filter the Data (Optional)</Form.Label>
                  <Row>
                    <Col md={4}>
                      <Form.Control
                        type="text"
                        name="filterField"
                        value={metric.filterField}
                        onChange={handleChange}
                        placeholder="Attribute (e.g., 'price')"
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        as="select"
                        name="filterOperator"
                        value={metric.filterOperator}
                        onChange={handleChange}
                      >
                        <option value=">">Greater Than</option>
                        <option value="<">Less Than</option>
                        <option value="=">Equal To</option>
                      </Form.Control>
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        type="text"
                        name="filterValue"
                        value={metric.filterValue}
                        onChange={handleChange}
                        placeholder="Value (e.g., 100)"
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <div className="actions text-center mt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    style={{ backgroundColor: "#bf0a2e", borderColor: "#bf0a2e" }}
                  >
                    {isEditMode ? "Update Metric" : "Create Metric"}
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

export default MetricForm;