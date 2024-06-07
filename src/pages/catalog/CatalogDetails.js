import React, { useState, useEffect } from "react";
import { Button, Card, Form, Row, Col } from "react-bootstrap";
import { useControls } from "../../hooks/useControls";
import { useBluejay } from "../../hooks/useBluejay";
import { useSelector, useDispatch } from "react-redux";
import {
  addEmptyControl,
  removeControl,
  clearControls,
} from "../../features/controls/controlSlice";
import {
  addEmptyInput,
  removeInput,
  clearInputs,
} from "../../features/inputs/inputSlice";
import ControlForm from "./ControlForm";

const CatalogDetails = ({ selectedCatalog }) => {
  const [specificCatalog, setSpecificCatalog] = useState(selectedCatalog);
  const [catalogToUpdate, setCatalogToUpdate] = useState(null);
  const [catalogToDelete, setCatalogToDelete] = useState(null);
  const [controlsToDelete, setControlsToDelete] = useState([]);
  const [selectedMashupId, setSelectedMashupId] = useState("");
  const controls = useSelector((state) => state.controls.controls);
  const inputs = useSelector((state) => state.inputs);
  const lastAddedId = useSelector((state) => state.controls.lastAddedId);
  const dispatch = useDispatch();
  const {
    getInputControlsByControlIdFromDB,
    createControlInDB,
    updateControlInputInDb,
    deleteControlByIdInDb,
    deleteInputControlsByControlIdInDb,
    createControlInputInDB,
  } = useControls();
  const {
    postAgreement,
    deleteAgreement,
    createPoints,
  } = useBluejay();

  const handleNameChange = (event) => {
    setSpecificCatalog((prevCatalog) => ({
      ...prevCatalog,
      name: event.target.value,
    }));
  };

  const handleStartDateChange = (event) => {
    setSpecificCatalog((prevCatalog) => ({
      ...prevCatalog,
      startDate: event.target.value,
    }));
  };

  const handleEndDateChange = (event) => {
    setSpecificCatalog((prevCatalog) => ({
      ...prevCatalog,
      endDate: event.target.value,
    }));
  };

  // Change the selected catalog and mashup
  useEffect(() => {
    setSpecificCatalog(selectedCatalog);
    if (controls.length > 0) {
      setSelectedMashupId(controls[0].mashup_id);
    }
  }, [selectedCatalog]);

  // Adds an empty input for the last added control
  useEffect(() => {
    if (lastAddedId) {
      dispatch(addEmptyInput({ controlId: lastAddedId }));
    }
  }, [lastAddedId, dispatch]);

  // Handler function for updating catalog (triggered by "Save" button click)
  const handleSubmit = async (event) => {
    event.preventDefault();
    await Promise.all(
      controlsToDelete.map(async (controlId) => {
        await deleteInputControlsByControlIdInDb(controlId);
        await deleteControlByIdInDb(controlId);
      })
    );
    setCatalogToUpdate(selectedCatalog.id);
    setControlsToDelete([]);
  };

  // Handler function for deleting catalog (triggered by "Delete" button click)
  const handleDeleteClick = () => {
    setCatalogToDelete(selectedCatalog.id);
  };

  // Triggers catalog deletion or updates
  useEffect(() => {
    if (catalogToDelete !== null) {
      deleteTpaByCatalogId(selectedCatalog.id)
      deleteCatalog(catalogToDelete);
    }
    if (catalogToUpdate !== null) {
      const requestBody = {
        name: specificCatalog.name,
        startDate: specificCatalog.startDate,
        endDate: specificCatalog.endDate,
      };
      updateCatalog(catalogToUpdate, requestBody);
    }
  }, [catalogToDelete, catalogToUpdate, specificCatalog]);

  const deleteTpaByCatalogId = async (catalogId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/catalogs/${catalogId}/tpa`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (response.ok) {
        console.log("TPA eliminado del servidor");
      } else {
        console.error("Error al eliminar el TPA:", response.statusText);
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
    }
  };

  // Delete a catalog by ID
  const deleteCatalog = async (catalogId) => {
    try {
      // Fetch all controls associated with the catalog
      const controlsResponse = await fetch(`http://localhost:3001/api/catalogs/${catalogId}/controls`);
      if (!controlsResponse.ok) throw new Error("Error al obtener los controles del catálogo");
      
      const controls = await controlsResponse.json();

      // Loop through each control and delete its associated inputs and input_controls
      for (const control of controls) {
        // Fetch input_controls associated with the control
        const inputControlsResponse = await fetch(`http://localhost:3001/api/controls/${control.id}/input_controls`);
        if (!inputControlsResponse.ok) throw new Error(`Error al obtener input_controls del control ${control.id}`);
        
        const inputControls = await inputControlsResponse.json();

        // Delete each input_control
        for (const inputControl of inputControls) {
          await fetch(`http://localhost:3001/api/input_controls/${inputControl.id}`, {
            method: "DELETE",
          });
        }

        // Delete the control itself
        await fetch(`http://localhost:3001/api/controls/${control.id}`, {
          method: "DELETE",
        });
      }

      // Finally, delete the catalog
      const catalogResponse = await fetch(`http://localhost:3001/api/catalogs/${catalogId}`, {
        method: "DELETE",
      });

      if (!catalogResponse.ok) throw new Error("Error al eliminar el catálogo");

      console.log("Catálogo eliminado exitosamente.");
      dispatch(clearControls());
      dispatch(clearInputs());
      window.location.reload();
    } catch (error) {
      console.error("Error al eliminar el catálogo y sus dependencias:", error);
    } finally {
      setCatalogToDelete(null);
    }
  };

  // Update a catalog by ID
  const updateCatalog = async (catalogId, catalogData) => {
    try {
      await updateCatalogInfo(catalogId, catalogData);

      for (const control of controls) {
        const controlInputs = inputs.inputs[control.id];
        if (typeof control.id === "number") {
          // If it existed, we updated it
          await updateExistingControl(control, controlInputs);
        } else {
          // If it is a new control, we create it
          await handleCreateControl(control, catalogId);
        }
      }

      console.log("Catálogo y controles actualizados con éxito.");
      window.location.reload();
    } catch (error) {
      console.error(error.message);
    }
  };

  // Update catalog information
  const updateCatalogInfo = async (id, catalogData) => {
    console.log(id)
    const response = await fetch(
      `http://localhost:3001/api/catalogs/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(catalogData),
      }
    ).finally(() => {
      setCatalogToUpdate(null);
    });

    if (!response.ok) {
      throw new Error("Error al actualizar el catálogo.");
    }

    return response.json();
  };

  // Update an existing control
  const updateExistingControl = async (control) => {
    const currentControl = await getCurrentControlState(control.id);
    const mashupIdChanged = currentControl.mashup_id !== control.mashup_id;

    const response = await fetch(
      `http://localhost:3001/api/controls/${control.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: control.name,
          description: control.description,
          period: control.period,
          startDate: control.startDate,
          endDate: control.endDate,
          mashup_id: control.mashup_id,
          catalog_id: control.catalog_id,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error al actualizar el control con ID ${control.id}`);
    }

    // If the mashup_id has been changed, we update the input_controls
    if (mashupIdChanged) {
      await deleteInputControlsForControl(control.id);
      await createInputControlsForControl(control.id);
    } else {
      await updateInputControlsForControl(control.id);
    }
  };

  // Get the current status of a control by ID
  const getCurrentControlState = async (controlId) => {
    const response = await fetch(
      `http://localhost:3001/api/controls/${controlId}`
    );
    if (!response.ok) {
      throw new Error("Error al obtener el estado actual del control");
    }
    return response.json();
  };

  // Create input_controls from a control
  const createInputControlsForControl = async (controlId) => {
    for (const input of inputs.inputs[controlId]) {
      await handleCreateControlInput(
        controlId,
        input.id,
        input.value ? input.value : -1
      );
    }
  };

  // Update input_control frrom a control
  const updateInputControlsForControl = async (controlId) => {
    const inputControls = await getInputControlsByControlIdFromDB(controlId);
    for (const inputControl of inputControls) {
      handleUpdateControlInput(
        inputControl.id,
        inputs.inputs[inputControl.control_id].filter(
          (input) => input.id === inputControl.input_id
        )[0]
      );
    }
  };

  // Remove input_controls from a control
  const deleteInputControlsForControl = async (controlId) => {
    const inputControls = await getInputControlsByControlIdFromDB(controlId);
    for (const inputControl of inputControls) {
      await handleDeleteControlInput(inputControl.control_id);
    }
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

  // Handler function for update a control input
  const handleUpdateControlInput = async (id, input) => {
    let value = input.value;
    if (input.type === "NUMBER") {
      value = parseInt(input.value);
    }
    await updateControlInputInDb(id, value);
  };

  // Handler function for delete a control input
  const handleDeleteControlInput = async (id) => {
    const inputControlResponse = await deleteInputControlsByControlIdInDb(id);
    return inputControlResponse;
  };

  // Handler function for add a empty control
  const addControl = () => {
    dispatch(addEmptyControl());
  };

  // Handler function for remove a control
  const handleRemoveControl = (controlId) => {
    dispatch(removeControl({ id: controlId }));
    dispatch(removeInput({ index: controlId }));
    if (typeof controlId === "number") {
      setControlsToDelete((prev) => [...prev, controlId]);
    }
  };

  const handleCalculateClick = async () => {
    try {
      const catalogId = selectedCatalog.id;
      const tpaResponse = await fetch(
        `http://localhost:3001/api/catalogs/${catalogId}/tpa`
      );
      if (!tpaResponse.ok) throw new Error("Fallo al obtener el TPA");
      const tpaData = await tpaResponse.json();
      const contractData = {
        periods: [
          {
            from: selectedCatalog.startDate,
            to: selectedCatalog.endDate,
          },
        ],
      };

      await deleteAgreement();
      await postAgreement(tpaData);
      await createPoints(contractData)

      window.open(
        "http://localhost:5600/dashboard/script/dashboardLoader.js?dashboardURL=http:%2F%2Flocalhost:5300%2Fapi%2Fv4%2Fdashboards%2Ftpa-example-project%2Fmain&orgId=1",
        "_blank"
      );
    } catch (error) {
      console.error("Error realizando las peticiones:", error);
    }
  };

  // JSX representing the component's UI
  return (
    <div className="detail-panel">
      <Card style={{ backgroundColor: "#bf0a2e", color: "#ffff" }}>
        <form onSubmit={handleSubmit}>
          <Card.Body>
            {/* Basic catalog information */}
            <Row>
              <Form.Group className="mb-3" controlId="catalogName">
                <Form.Label>Nombre del Catálogo:</Form.Label>
                <Form.Control
                  maxLength={100}
                  onChange={handleNameChange}
                  required
                  type="text"
                  value={specificCatalog.name}
                />
              </Form.Group>
            </Row>
            <Row>
              <Col>
                <Form.Group className="mb-3" controlId="catalogStartDate">
                  <Form.Label>Fecha de inicio:</Form.Label>
                  <Form.Control
                    type="date"
                    value={specificCatalog.startDate || ""}
                    onChange={handleStartDateChange}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3" controlId="catalogEndDate">
                  <Form.Label>Fecha de fin:</Form.Label>
                  <Form.Control
                    type="date"
                    value={specificCatalog.endDate || ""}
                    onChange={handleEndDateChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <ControlForm handleRemoveControl={handleRemoveControl} />
            {/* Action buttons */}
            <Row className="mt-3 mb-3 d-flex justify-content-center">
              {controls.length === 0 && (
                <Col xs="auto">
                  <Button onClick={addControl} variant="primary">
                    Agregar control
                  </Button>
                </Col>
              )}
              <Col xs="auto">
                <div className="d-flex">
                  <Button
                    className="btn-primary"
                    onClick={handleCalculateClick}
                  >
                    Calcular
                  </Button>
                  <Button type="submit" className="ms-3 btn btn-success">
                    Actualizar
                  </Button>
                  <Button
                    className="ms-3 btn btn-danger"
                    onClick={handleDeleteClick}
                  >
                    Eliminar
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </form>
      </Card>
    </div>
  );
};

export default CatalogDetails;
