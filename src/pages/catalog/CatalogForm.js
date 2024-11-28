import React, { useState, useEffect } from "react";
import { Form, Card, Row, Col, Button, Alert } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useCatalogs } from "../../hooks/useCatalogs";
import { useAuth } from "../../hooks/useAuth";

function CatalogForm() {
  const [catalog, setCatalog] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { catalogId } = useParams();
  const isEditMode = Boolean(catalogId);
  const { getCatalogByIdFromTheDB, createCatalogInDB, updateCatalogInDB } =
    useCatalogs();
  const { checkAdminAuthority } = useAuth();

  useEffect(() => {
    checkAdminAuthority();
  }, [checkAdminAuthority]);

  useEffect(() => {
    if (isEditMode) {
      const loadCatalog = async () => {
        try {
          const catalogData = await getCatalogByIdFromTheDB(catalogId);
          setCatalog({
            name: catalogData.name,
            startDate: catalogData.startDate
              ? new Date(catalogData.startDate).toISOString().split("T")[0]
              : "",
            endDate: catalogData.endDate
              ? new Date(catalogData.endDate).toISOString().split("T")[0]
              : "",
          });
        } catch (error) {
          console.error("Error loading the catalog:", error);
          setError("Unable to load catalog data. Please try again later.");
        }
      };
      loadCatalog();
    }
  }, [catalogId, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCatalog((prevCatalog) => ({ ...prevCatalog, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (new Date(catalog.endDate) < new Date(catalog.startDate)) {
      setError("The end date cannot be earlier than the start date.");
      return;
    }

    try {
      if (isEditMode) {
        await updateCatalogInDB(
          catalogId,
          catalog.name,
          catalog.startDate,
          catalog.endDate
        );
      } else {
        await createCatalogInDB(
          catalog.name,
          catalog.startDate,
          catalog.endDate
        );
      }
      navigate("/catalogs");
    } catch (error) {
      console.error("Error saving the catalog:", error);
      setError("An error occurred while saving the catalog. Please try again later.");
    }
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
                {isEditMode ? "Update Catalog" : "New Catalog"}
              </h2>
            </Card.Header>
            <Card.Body className="bg-light" style={{ fontSize: "20px" }}>
              {error && (
                <div className="d-flex justify-content-center mb-4">
                  <Alert variant="danger" className="text-center w-75">
                    {error}
                  </Alert>
                </div>
              )}
              <Form onSubmit={handleSubmit}>
                <Row className="mb-4">
                  <Col>
                    <Form.Group controlId="catalogName">
                      <Form.Label className="fw-bold">Catalog name:</Form.Label>
                      <Form.Control
                        name="name"
                        maxLength={100}
                        onChange={handleInputChange}
                        required
                        type="text"
                        value={catalog.name}
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
                        name="startDate"
                        type="date"
                        value={catalog.startDate}
                        onChange={handleInputChange}
                        required
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="catalogEndDate">
                      <Form.Label className="fw-bold">End date:</Form.Label>
                      <Form.Control
                        name="endDate"
                        type="date"
                        value={catalog.endDate}
                        onChange={handleInputChange}
                        required
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
                    style={{
                      backgroundColor: "#bf0a2e",
                      borderColor: "#bf0a2e",
                    }}
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
