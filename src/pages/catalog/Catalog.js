import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import CatalogList from "./CatalogList";
import CatalogDetails from "./CatalogDetails";
import { useCatalogs } from "../../hooks/useCatalogs";
import { useInputControls } from "../../hooks/useInputControls";
import { useNode } from "../../hooks/useNode";
import { useDispatch } from "react-redux";
import {
  setControls,
  clearControls,
} from "../../features/controls/controlSlice";
import { setInputs, clearInputs } from "../../features/inputs/inputSlice";

function Catalog() {
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const { getCatalogControlsInDB } = useCatalogs();
  const { getInputControlsByControlIdFromTheDB } = useInputControls();
  const { nodeRedToken, isNodeRedDeployed, nodeRedCookie, getFlows, getMashupById, getMashupParameters } = useNode();
  const [flows, setFlows] = useState([]);

  useEffect(() => {
    if (isNodeRedDeployed) {
      nodeRedCookie();
    }
  }, [isNodeRedDeployed, nodeRedCookie]);

  useEffect(() => {
    const fetchFlows = async () => {
      const fetchedFlows = await getFlows();
      setFlows(fetchedFlows);
    };
    fetchFlows();
  }, []);

  const dispatch = useDispatch();

  // Function to fetch controls for a selected catalog
  const fetchSelectedControls = async (catalogId) => {
    try {
      dispatch(clearControls());
      dispatch(clearInputs());

      const data = await getCatalogControlsInDB(catalogId);

      if (data) {
        dispatch(setControls(data));

        if (data.length === 0) {
          return;
        }

        // Use Promise.all to fetch input controls for all catalog controls in parallel
        const inputControlPromises = data.map((control, index) =>
          getInputControlsByControlIdFromTheDB(control.id).then((response) =>
            response
              ? response
              : Promise.reject("Error fetching input controls")
          )
        );
        const inputControls = await Promise.all(inputControlPromises);

        inputControls.forEach(async (inputData, index) => {
          const control = data[index];

          const inputsWithValues = await Promise.all(
            inputData.map(async (input) => {
              const selectedMashup = getMashupById(flows, control.mashup_id);
              const mashupParameters = await getMashupParameters(selectedMashup);
              const parametersArray = Array.isArray(mashupParameters) ? mashupParameters : [];
              const inputDetail = parametersArray.find(param => param.id === input.input_id);
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
      {isNodeRedDeployed && nodeRedToken ? (
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
      ) : (
        <div className="alert">
          <div className="signin-alert">
            <p>
              Para acceder a esta sección debes iniciar sesión y tener
              desplegado Node-Red
            </p>
          </div>
        </div>
      )}
    </Container>
  );
}

export default Catalog;
