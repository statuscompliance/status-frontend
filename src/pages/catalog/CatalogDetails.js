import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col } from "react-bootstrap";
import { useControls } from "../../hooks/useControls";
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

  // Handler function for updating catalog name
  const handleCatalogChange = (event) => {
    setSpecificCatalog((prevCatalog) => ({
      ...prevCatalog,
      name: event.target.value,
    }));
  };

  // Change the selected catalog and mashup
  useEffect(() => {
    setSpecificCatalog(selectedCatalog);
    if (controls.length > 0) {
      setSelectedMashupId(controls[0].mashup_id);
    }
  }, [selectedCatalog, controls]);

  // Adds an empty input for the last added control
  useEffect(() => {
    if (lastAddedId) {
      dispatch(addEmptyInput({ controlId: lastAddedId }));
    }
  }, [lastAddedId]);

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
      deleteCatalog(catalogToDelete);
    }
    if (catalogToUpdate !== null) {
      const requestBody = {
        name: specificCatalog.name,
      };
      updateCatalog(catalogToUpdate, requestBody);
    }
  }, [catalogToDelete, catalogToUpdate, specificCatalog]);

  // Delete a catalog by ID
  const deleteCatalog = (catalogId) => {
    fetch(`http://localhost:3001/api/catalog/${catalogId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          console.log("Catálogo eliminado exitosamente.");
          dispatch(clearControls());
          dispatch(clearInputs());
          window.location.reload();
        } else {
          console.error("Error al eliminar el catálogo.");
        }
      })
      .catch((error) => {
        console.error("Error al realizar la solicitud:", error);
      })
      .finally(() => {
        setCatalogToDelete(null);
      });
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
  const updateCatalogInfo = async (catalogId, catalogData) => {
    const response = await fetch(
      `http://localhost:3001/api/catalog/${catalogId}`,
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
      `http://localhost:3001/api/control/${control.id}`,
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
      `http://localhost:3001/api/control/${controlId}`
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
    console.log(controlDataId);
    console.log(inputId);
    console.log(value);
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

  // JSX representing the component's UI
  return (
    <div className="detail-panel">
      <Card style={{ backgroundColor: "#bf0a2e", color: "#ffff" }}>
        <form onSubmit={handleSubmit}>
          <Card.Body>
            {/* Basic catalog information */}
            <p>
              Nombre del catálogo:{" "}
              <input
                type="text"
                value={specificCatalog.name}
                className="form-control"
                onChange={handleCatalogChange}
              />
            </p>
            <ControlForm handleRemoveControl={handleRemoveControl} />
            {/* Action buttons */}
            <Row className="mt-3 mb-3 d-flex justify-content-between">
              {controls.length === 0 && (
                <Col xs="auto">
                  <Button onClick={addControl} variant="primary">
                    Agregar control
                  </Button>
                </Col>
              )}
              <Col xs="auto">
                <div className="d-flex">
                  <Button type="submit" variant="success">
                    Actualizar
                  </Button>
                  <Button
                    className="ms-2 btn btn-danger"
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
