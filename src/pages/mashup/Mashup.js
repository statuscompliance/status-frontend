import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import MashupList from './MashupList'
import MashupDetails from './MashupDetails'

function Mashup({ onMashupSelect }) {
    const [selectedMashup, setSelectedMashup] = useState(null);

    // JSX representing the component's UI
    return (
        <Container fluid>
            <Row>
                {/* List of mashups */}
                <Col md={3}>
                    <MashupList
                        onMashupSelect={(mashup) => {
                            setSelectedMashup(mashup);
                        }}
                    />
                </Col>
                {/* Rendering mashup details if a mashup is selected */}
                <Col md={9}>
                    {selectedMashup && (
                        <MashupDetails key={selectedMashup.id} selectedMashup={selectedMashup} />
                    )}
                </Col>
            </Row>
        </Container>
    );
}

export default Mashup;
