import React, { useState, useEffect } from "react";
import { generateTPA, deleteTpaByCatalogId } from "./TpaUtils";
import { Button, Card, Form, Row, Col } from "react-bootstrap";
import { useControls } from "../../hooks/useControls";
import { useCatalogs } from "../../hooks/useCatalogs";
import { useInputControls } from "../../hooks/useInputControls";
import { useTpas } from "../../hooks/useTpas";
import { useBluejay } from "../../hooks/useBluejay";
import { useNode } from "../../hooks/useNode";

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
    getControlByIdFromDB,
    getInputControlsByControlIdFromDB,
    createControlInDB,
    updateControlInputInDb,
    updateControlInDb,
    deleteControlByIdInDb,
    deleteInputControlsByControlIdInDb,
    createControlInputInDB,
  } = useControls();
  const {
    getCatalogControlsInDB,
    updateCatalogInDB,
    deleteCatalogByIdFromTheDatabase,
  } = useCatalogs();
  const { getInputControlsByControlIdFromTheDB, deleteInputControlsFromTheDB } =
    useInputControls();
  const {
    getTpaByCatalogIdFromTheDatabase,
    createTpaInDB,
    deleteTpaByIdFromTheDatabase,
  } = useTpas();
  const { postAgreement, deleteAgreement, createPoints } = useBluejay();
  const { getFlows, getMashupById } = useNode();

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
    setControlsToDelete([]);
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
      deleteTpaByCatalogId(selectedCatalog.id, deleteTpaByIdFromTheDatabase);
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

  // ------------------------------------------ Delete catalog ------------------------------------------ //
  const deleteCatalog = async (catalogId) => {
    try {
      const controls = await getCatalogControlsInDB(catalogId);
      if (!controls)
        throw new Error("Error al obtener los controles del catálogo");

      for (const control of controls) {
        const inputControls = await getInputControlsByControlIdFromTheDB(
          control.id
        );
        if (!inputControls)
          throw new Error(
            `Error al obtener input_controls del control ${control.id}`
          );

        for (const inputControl of inputControls) {
          await deleteInputControlsFromTheDB(inputControl.id);
        }

        await deleteControlByIdInDb(control.id);
      }

      await deleteCatalogByIdFromTheDatabase(catalogId);

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

  // -------------------------------------------- Update catalog -------------------------------------------- //
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
      await deleteTpaByCatalogId(catalogId, deleteTpaByIdFromTheDatabase);
      await generateTPA(
        controls,
        catalogId,
        getFlows,
        getMashupById,
        inputs,
        createTpaInDB
      );

      console.log("Catálogo y controles actualizados con éxito.");
      window.location.reload();
    } catch (error) {
      console.error(error.message);
    }
  };

  const updateCatalogInfo = async (id, catalogData) => {
    const response = await updateCatalogInDB(
      id,
      catalogData.name,
      catalogData.startDate,
      catalogData.endDate
    ).finally(() => {
      setCatalogToUpdate(null);
    });

    if (!response) {
      throw new Error("Error al actualizar el catálogo.");
    }

    return response;
  };

  // ---------------------------------- Control and input_control management ---------------------------------- //

  /* Updates the controls that have been modified from the catalog (only 
  those that existed before, not those that have been newly created) */
  const updateExistingControl = async (control) => {
    const currentControl = await getCurrentControlState(control.id);
    const mashupIdChanged = currentControl.mashup_id !== control.mashup_id;

    const response = await updateControlInDb(
      control.id,
      control.name,
      control.description,
      control.period,
      control.startDate,
      control.endDate,
      control.mashup_id,
      control.catalog_id
    );

    if (!response) {
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

  /** Returns the current database status of a control, to know if the
   * mashup has been changed */
  const getCurrentControlState = async (controlId) => {
    const response = await getControlByIdFromDB(controlId);
    if (!response) {
      throw new Error("Error al obtener el estado actual del control");
    }
    return response;
  };

  // Creates the new controls associated with the catalog update
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

  /** Creates all input_controls of a new control that was created when
   * the catalog was updated */
  const createInputControlsForControl = async (controlId) => {
    for (const input of inputs.inputs[controlId]) {
      await handleCreateControlInput(
        controlId,
        input.id,
        input.value ? input.value : -1
      );
    }
  };

  const handleCreateControlInput = async (controlDataId, inputId, value) => {
    const inputControlResponse = await createControlInputInDB(
      controlDataId,
      inputId,
      value
    );
    return inputControlResponse;
  };

  /** Updates all input_controls of a control that has been updated
   *  when the catalog was updated */
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

  const handleUpdateControlInput = async (id, input) => {
    let value = input.value;
    if (input.type === "NUMBER") {
      value = parseInt(input.value, 10);
    }
    await updateControlInputInDb(id, value);
  };

  /** Deletes all input_controls of a control that was deleted when
   * the catalog was updated */
  const deleteInputControlsForControl = async (controlId) => {
    const inputControls = await getInputControlsByControlIdFromDB(controlId);
    for (const inputControl of inputControls) {
      await handleDeleteControlInput(inputControl.control_id);
    }
  };

  const handleDeleteControlInput = async (id) => {
    const inputControlResponse = await deleteInputControlsByControlIdInDb(id);
    return inputControlResponse;
  };

  // -------------------------------- Adding and removing controls from the form -------------------------------- //
  const addControl = () => {
    dispatch(addEmptyControl());
  };

  const handleRemoveControl = (controlId) => {
    dispatch(removeControl({ id: controlId }));
    dispatch(removeInput({ index: controlId }));
    if (typeof controlId === "number") {
      setControlsToDelete((prev) => [...prev, controlId]);
    }
  };

  // -------------------------------------------- Calculate button -------------------------------------------- //
  const handleCalculateClick = async () => {
    try {
      const catalogId = selectedCatalog.id;
      const tpaData = await getTpaByCatalogIdFromTheDatabase(catalogId);
      if (!tpaData) throw new Error("Fallo al obtener el TPA");
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
      await createPoints(contractData);

      window.open(
        "http://localhost:5600/dashboard/script/dashboardLoader.js?dashboardURL=http:%2F%2Flocalhost:5300%2Fapi%2Fv4%2Fdashboards%2Ftpa-example-project%2Fmain&orgId=1",
        "_blank"
      );
    } catch (error) {
      console.error("Error realizando las peticiones:", error);
    }
  };

  // ---------------------------------------------------- JSX ---------------------------------------------------- //
  return (
    <div className="detail-panel">
      <Card className="shadow">
        <Card.Header style={{ backgroundColor: "#bf0a2e", color: "#ffffff" }}>
          <h2 className="mb-0">Catalog Details</h2>
        </Card.Header>
        <form onSubmit={handleSubmit}>
          <Card.Body>
            {/* Basic catalog information */}
            <Row className="mb-4">
              <Form.Group controlId="catalogName">
                <Form.Label className="fw-bold">Catalog name:</Form.Label>
                <Form.Control
                  maxLength={100}
                  onChange={handleNameChange}
                  required
                  type="text"
                  value={specificCatalog.name}
                  className="form-control-lg"
                />
              </Form.Group>
            </Row>
            <Row className="mb-4">
              <Col>
                <Form.Group controlId="catalogStartDate">
                  <Form.Label className="fw-bold">Start date:</Form.Label>
                  <Form.Control
                    type="date"
                    value={specificCatalog.startDate || ""}
                    onChange={handleStartDateChange}
                    className="form-control-lg"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="catalogEndDate">
                  <Form.Label className="fw-bold">End date:</Form.Label>
                  <Form.Control
                    type="date"
                    value={specificCatalog.endDate || ""}
                    onChange={handleEndDateChange}
                    className="form-control-lg"
                  />
                </Form.Group>
              </Col>
            </Row>

            <ControlForm handleRemoveControl={handleRemoveControl} />

            {/* Action buttons */}
            <Row className="mt-5">
              <Col xs={12} md={controls.length === 0 ? 3 : 4}>
                <Button
                  onClick={handleCalculateClick}
                  variant="primary"
                  size="lg"
                  className={
                    "d-flex align-items-center justify-content-center w-100 mb-2 mb-md-0"
                  }
                >
                  <i className="bi bi-calculator me-2"></i>
                  Calculate
                </Button>
              </Col>
              {controls.length === 0 && (
                <Col xs={12} md={3} className="mb-2 mb-md-0">
                  <Button
                    onClick={addControl}
                    variant="success"
                    size="lg"
                    className={
                      "d-flex align-items-center justify-content-center w-100 mb-2 mb-md-0"
                    }
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Add control
                  </Button>
                </Col>
              )}
              <Col
                xs={12}
                md={controls.length === 0 ? 3 : 4}
                className="mb-2 mb-md-0"
              >
                <Button
                  type="submit"
                  variant="warning"
                  size="lg"
                  className={
                    "d-flex align-items-center justify-content-center w-100 mb-2 mb-md-0"
                  }
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Update
                </Button>
              </Col>
              <Col
                xs={12}
                md={controls.length === 0 ? 3 : 4}
                className="mb-2 mb-md-0"
              >
                <Button
                  variant="danger"
                  size="lg"
                  onClick={handleDeleteClick}
                  className={
                    "d-flex align-items-center justify-content-center w-100 mb-2 mb-md-0"
                  }
                >
                  <i className="bi bi-trash me-2"></i>
                  Delete
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </form>
      </Card>
    </div>
  );
};

export default CatalogDetails;
