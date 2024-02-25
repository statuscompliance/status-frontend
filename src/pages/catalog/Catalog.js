import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import CatalogList from './CatalogList';
import CatalogDetails from './CatalogDetails';

function Catalog({ onCatalogSelect }) {
    const [selectedCatalog, setSelectedCatalog] = useState(null);
    const [catalogControls, setCatalogControls] = useState([]);

    // Function to fetch controls for a specific catalog
    const fetchCatalogControls = async (catalogId) => {
        try {
            const response = await fetch(`http://localhost:3001/api/catalogControls/${catalogId}`);
            if (response.ok) {
                const data = await response.json();
                setCatalogControls(data);
            } else {
                console.error('Error fetching catalog controls');
            }
        } catch (error) {
            console.error('Error making request:', error);
        }
    };

    // Fetch controls when selectedCatalog changes
    useEffect(() => {
        if (selectedCatalog) {
            fetchCatalogControls(selectedCatalog.id);
        }
    }, [selectedCatalog]);

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
                        <CatalogDetails selectedCatalog={selectedCatalog} catalogControls={catalogControls} />
                    )}
                </Col>
            </Row>
        </Container>
    );
}

export default Catalog;
