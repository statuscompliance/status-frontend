import React, { useState, useEffect } from "react";
import { Form, Card, Row, Col, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useCatalogs } from "../../hooks/useCatalogs";
import { statusApi } from "../../api/statusApi";
import { getCookie } from "../../hooks/useCookie";

function CatalogForm() {
  const [catalogName, setCatalogName] = useState("");
  const [catalogStartDate, setCatalogStartDate] = useState("");
  const [catalogEndDate, setCatalogEndDate] = useState("");
  const navigate = useNavigate();
  const { catalogId } = useParams();
  const isEditMode = Boolean(catalogId);
  const accessToken = getCookie("accessToken");
  const { getCatalogByIdFromTheDB, createCatalogInDB, updateCatalogInDB } = useCatalogs();

  useEffect(() => {
    if (isEditMode) {
      const loadCatalog = async () => {
        try {
          const catalog = await getCatalogByIdFromTheDB(catalogId);
          setCatalogName(catalog.name);
          setCatalogStartDate(catalog.startDate ? new Date(catalog.startDate).toISOString().split("T")[0] : "");
          setCatalogEndDate(catalog.endDate ? new Date(catalog.endDate).toISOString().split("T")[0] : "");
        } catch (error) {
          console.error("Error loading the catalog:", error);
        }
      };
      loadCatalog();
    }
  }, [catalogId, isEditMode, accessToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        await updateCatalogInDB(catalogId, catalogName, catalogStartDate, catalogEndDate);
      } else {
        await createCatalogInDB(catalogName, catalogStartDate, catalogEndDate);
      }
      navigate("/catalogs");
    } catch (error) {
      console.error("Error saving the catalog:", error);
    }
  };

  const handleNameChange = (e) => {
    setCatalogName(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setCatalogStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setCatalogEndDate(e.target.value);
  };

  return (
    <div className="container py-4">
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="shadow-sm border-0">
            <Card.Header style={{ backgroundColor: "#bf0a2e", color: "#ffffff" }}>
              <h2 className="text-center mb-0">{isEditMode ? "Update Catalog" : "New Catalog"}</h2>
            </Card.Header>
            <Card.Body className="bg-light" style={{ fontSize: "20px" }}>
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
                <div className="actions text-center mt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    style={{ backgroundColor: "#bf0a2e", borderColor: "#bf0a2e" }}
                  >
                    {isEditMode ? "Update Catalog" : "Create Catalog"}
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

export default CatalogForm;