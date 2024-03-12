import { useState, useEffect } from "react";
import { statusApi } from "../api/statusApi";

export const useTokens = () => {
    const [isLoggedInGH, setIsLoggedInGH] = useState(false); 
    const [isLoggedInTrello, setIsLoggedInTrello] = useState(false);
    const [gitUsername, setGitUsername] = useState('');
    const [showTrelloModal, setShowTrelloModal] = useState(false);
    const [trelloUsername, setTrelloUsername] = useState(''); 
    const trelloToken = localStorage.getItem('trelloToken');
    const ghToken = localStorage.getItem('ghToken');
    
    useEffect(() => {
          const getGhUsername = async () =>{
            try {
              const response = await statusApi.get('https://api.github.com/user', {
                headers:    {
                    Authorization: `token ${ghToken}`
                }
                });
                setGitUsername(response.data.login);
            } catch (error) {
              console.error('Error fetching GitHub username:', error);
            }
        };

        if (ghToken && trelloToken) {
          getGhUsername();
          getTrelloUsername();
          setIsLoggedInGH(true);
          setIsLoggedInTrello(true);
        }else if (ghToken) {
          getGhUsername();
          setIsLoggedInGH(true);
        } else if (trelloToken) {
          getTrelloUsername();
          setIsLoggedInTrello(true);
        }
    }, [ghToken, trelloToken]);

    

    const getTrelloUsername = async () =>{
        const token = localStorage.getItem('trelloToken');
        if (token) {
          statusApi.get(`https://api.trello.com/1/members/me?key=7ec49a17fcf64731824ed5914f182f81&token=${token}`)
            .then(response => {
              setTrelloUsername(response.data.username);
            })
            .catch(error => {
              console.error('Error fetching Trello username:', error);
            });
        }
    };
      
    const handleTrelloTokenSubmit = async (token) => {
      console.log('token', token);
        if (token) {
            localStorage.setItem('trelloToken', token);
            setIsLoggedInTrello(true);
            setShowTrelloModal(false);
            getTrelloUsername();
        }
    };

    const openTrelloAuthorization= async () => {
        window.open(`https://trello.com/1/authorize?expiration=1day&name=Status&scope=read,write&response_type=token&key=7ec49a17fcf64731824ed5914f182f81`, '_blank');
        setShowTrelloModal(true);
    };
    
    const closeTrelloModal = async () => {
        setShowTrelloModal(false);
    };
    
return {isLoggedInGH, isLoggedInTrello, gitUsername, trelloUsername, showTrelloModal, openTrelloAuthorization, closeTrelloModal, handleTrelloTokenSubmit};
};

    

