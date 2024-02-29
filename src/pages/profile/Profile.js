import {React, useEffect, useState} from 'react';
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBCardText,
  MDBCardBody,
  MDBCardImage,
  MDBBtn,
  MDBBreadcrumb,
  MDBBreadcrumbItem
} from 'mdb-react-ui-kit';
import githubLogoBlack from '../../static/images/github-logo.svg';
import trelloLogo from '../../static/images/trello-logo.svg';
import '../../static/css/profile.css';

const clientId ="72548f03fe112aedfd33";

export default function Profile() {
    const [isLoggedInGH, setIsLoggedInGH] = useState(false); 
    const [isLoggedInTrello, setIsLoggedInTrello] = useState(false);
    const [username, setUsername] = useState('');
    const accessToken = localStorage.getItem('accessToken');
    const [showTrelloModal, setShowTrelloModal] = useState(false);
    const trelloToken = localStorage.getItem('trelloToken');
    const [trelloUsername, setTrelloUsername] = useState('');

    useEffect(() => {
        if (accessToken && trelloToken) {
          getGhUsername();
          getTrelloUsername();
          setIsLoggedInGH(true);
          setIsLoggedInTrello(true);
        }else if (accessToken) {
          getGhUsername();
          setIsLoggedInGH(true);
        } else if (trelloToken) {
          getTrelloUsername();
          setIsLoggedInTrello(true);
        }
    }, []);

    function getGhUsername() {
        fetch('https://api.github.com/user', {
          headers: {
            Authorization: `token ${accessToken}`
          }
        })
        .then(response => response.json())
        .then(data => setUsername(data.login))
        .catch(error => console.error('Error fetching GitHub username:', error));
    }

    function getTrelloUsername() {
        const token = localStorage.getItem('trelloToken');
        if (token) {
            fetch(`https://api.trello.com/1/members/me?key=7ec49a17fcf64731824ed5914f182f81&token=${token}`, {
                method: 'GET'
            })
            .then(response => response.json())
            .then(data => setTrelloUsername(data.username))
            .catch(error => console.error('Error fetching Trello username:', error));
        }
    }

    function loginWithGithub() {
        window.location.assign(`https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user`);
    }
    
    function handleTrelloTokenSubmit(token) {
        if (token) {
            localStorage.setItem('trelloToken', token);
            setIsLoggedInTrello(true);
            setShowTrelloModal(false);
            getTrelloUsername();
        }
    }
    function openTrelloAuthorization() {
        window.open(`https://trello.com/1/authorize?expiration=1day&name=Status&scope=read,write&response_type=token&key=7ec49a17fcf64731824ed5914f182f81`, '_blank');
        setShowTrelloModal(true);
    }

  return (
    <section style={{ backgroundColor: '#ffffff' }}>
      <MDBContainer className="py-5">
        <MDBRow>
          <MDBCol>
            <MDBBreadcrumb className="bg-light rounded-3 p-3 mb-4">
              <MDBBreadcrumbItem>
                <a href='/'>STATUS</a>
              </MDBBreadcrumbItem>
              <MDBBreadcrumbItem active>User Profile</MDBBreadcrumbItem>
            </MDBBreadcrumb>
          </MDBCol>
        </MDBRow>

        <MDBRow>
          <MDBCol lg="4">
            <MDBCard className="mb-4">
              <MDBCardBody className="text-center">
                <MDBCardImage
                  src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp"
                  alt="avatar"
                  className="rounded-circle"
                  style={{ width: '150px' }}
                  fluid />
                <p className="text-muted mb-1">Full Stack Developer</p>
                <p className="text-muted mb-4">Bay Area, San Francisco, CA</p>
                <div className="d-flex justify-content-center mb-2">
                  <MDBBtn>Follow</MDBBtn>
                  <MDBBtn outline className="ms-1">Message</MDBBtn>
                </div>
              </MDBCardBody>
            </MDBCard>

          </MDBCol>
          <MDBCol lg="8">
            <MDBCard className="mb-4">
              <MDBCardBody>
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Full Name</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">Johnatan Smith</MDBCardText>
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Email</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">example@example.com</MDBCardText>
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Phone</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">(097) 234-5678</MDBCardText>
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Mobile</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">(098) 765-4321</MDBCardText>
                  </MDBCol>
                </MDBRow>
                <hr />
                <MDBRow>
                  <MDBCol sm="3">
                    <MDBCardText>Address</MDBCardText>
                  </MDBCol>
                  <MDBCol sm="9">
                    <MDBCardText className="text-muted">Bay Area, San Francisco, CA</MDBCardText>
                  </MDBCol>
                </MDBRow>
              </MDBCardBody>
            </MDBCard>

            <MDBRow>
              <MDBCol md="6">
                <MDBCard className="mb-4 mb-md-0">
                  <MDBCardBody>
                    {isLoggedInGH ? (
                      <MDBCardText className="mb-4 text-center welcome">Logged in Github as {username}!!</MDBCardText>
                    ) : (
                        <div>
                            <MDBCardText className="mb-4 text-center github-login" onClick={loginWithGithub}>
                                <p>Connect your GitHub account </p>
                                <span>
                                    <img src={githubLogoBlack} alt="Logo" className="gh-logo-black-svg" />
                                </span>
                            </MDBCardText>
                        </div>
                    )}
                  </MDBCardBody>
                </MDBCard>
              </MDBCol>

              <MDBCol md="6">
                <MDBCard className="mb-4 mb-md-0">
                  <MDBCardBody>
                  {isLoggedInTrello ? (
                      <MDBCardText className="mb-4 text-center welcome">Logged in Trello as {trelloUsername}!!</MDBCardText>
                    ) : (
                        <div>
                            <MDBCardText className="mb-4 text-center trello-login" onClick={openTrelloAuthorization}>
                                <p>Connect your Trello account</p>
                                <span>
                                    <img src={trelloLogo} alt="trelloLogo" className="trello-logo-svg" />
                                </span>
                            </MDBCardText>
                        </div>
                    )}
                  </MDBCardBody>
                </MDBCard>
              </MDBCol>
            </MDBRow>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
      {showTrelloModal && (
          <div className="modal" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000}}>
              <div className="modal-dialog" style={{margin: '150px auto', maxWidth: '500px'}}>
                  <div className="modal-content">
                      <div className="modal-header">
                          <h5 className="modal-title">Enter Trello Token</h5>
                          <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowTrelloModal(false)}></button>
                      </div>
                      <div className="modal-body">
                          <input type="text" className="form-control" placeholder="Enter your Trello token" value={trelloToken} onChange={(e) => localStorage.setItem("trelloToken",e.target.value)} />
                      </div>
                      <div className="modal-footer">
                          <button type="button" className="btn btn-primary" onClick={() => handleTrelloTokenSubmit(trelloToken)}>Submit</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </section>
  );
}
