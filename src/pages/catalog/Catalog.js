import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import CatalogList from "./CatalogList";
import CatalogDetails from "./CatalogDetails";
import { useInput } from "../../hooks/useInput";
import { useDispatch } from "react-redux";
import {
  setControls,
  clearControls,
} from "../../features/controls/controlSlice";
import { setInputs, clearInputs } from "../../features/inputs/inputSlice";

function Catalog() {
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const { getInputByIdFromDB } = useInput();
  const dispatch = useDispatch();

  // Function to fetch controls for a selected catalog
  const fetchSelectedControls = async (catalogId) => {
    try {
      dispatch(clearControls());
      dispatch(clearInputs());
      // Obtenemos los controles del catálogo seleccionado y los almacenamos en el estado
      const response = await fetch(
        `http://localhost:3001/api/catalogs/${catalogId}/controls`
      );

      if (response.ok) {
        const data = await response.json();
        dispatch(setControls(data));

        if (data.length === 0) {
          return;
        }

        // Use Promise.all to fetch input controls for all catalog controls in parallel
        // Obtenemos los input_controls asociados a cada control
        const inputControlPromises = data.map((control) =>
          fetch(
            `http://localhost:3001/api/controls/${control.id}/input_controls`
          ).then((response) =>
            response.ok
              ? response.json()
              : Promise.reject("Error fetching input controls")
          )
        );
        const inputControls = await Promise.all(inputControlPromises);

        // Recorremos los input_controls
        inputControls.forEach(async (inputData, index) => {
          const control = data[index];

          // Obtenemos los inputs y values
          const inputsWithValues = await Promise.all(
            inputData.map(async (input) => {
              const inputDetail = await getInputByIdFromDB(input.input_id);
              return {
                ...inputDetail,
                value:
                  inputDetail.type === "NUMBER"
                    ? parseInt(input.value, 10)
                    : input.value,
              };
            })
          );
          dispatch(
            setInputs({ controlId: control.id, inputs: inputsWithValues })
          );
        });
      } else {
        console.error("Error fetching catalog controls");
      }
    } catch (error) {
      console.error("Error making request:", error);
    }
  };

  // Fetch controls when selectedCatalog changes
  useEffect(() => {
    if (selectedCatalog) {
      fetchSelectedControls(selectedCatalog.id);
    }
  }, [selectedCatalog, dispatch]);

  // JSX representing the component's UI
  return (
    <Container fluid>
      <Row>
        {/* List of catalogs */}
        <Col md={3}>
          <CatalogList
            onCatalogSelect={(catalog) => {
              setSelectedCatalog(catalog);
            }}
          />
        </Col>
        {/* Rendering catalog details if a catalog is selected */}
        <Col md={9}>
          {selectedCatalog && (
            <CatalogDetails selectedCatalog={selectedCatalog} />
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Catalog;
