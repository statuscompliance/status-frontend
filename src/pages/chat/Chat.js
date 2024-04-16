import {useState, useRef, useEffect} from "react";
import "../../static/css/chat.css";
import { useCookie } from '../../hooks/useCookie';
import { useOpenAI } from '../../hooks/useOpenAI';
import { useNode } from '../../hooks/useNode';
import sendLogo from "../../static/images/send.svg";
import { Modal } from 'react-bootstrap';
import edit from "../../static/images/edit.svg";
import goBack from "../../static/images/return.svg";
import deleteSvg from "../../static/images/delete.svg";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DeleteModal from "../../components/DeleteModal";


export default function Chat() {
  const [threadMessages, setThreadMessages] = useState([]);
  const existsCookie = useCookie('accessToken');
  const [errorAdded, setErrorAdded] = useState(false);
  const { threads, getThreadById, createThread, sendNewMessage, changeThreadName} = useOpenAI();
  const { isNodeRedDeployed, temporalMashup, deleteMashup } = useNode();
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const messagesContainerRef = useRef(null);
  const [interval, setInterval] = useState(1000);
  const errorMessage = "El texto es demasiado corto, por favor, inténtalo de nuevo.";
  const [animated, setAnimated] = useState(false);
  const [endpoint, setEndpoint] = useState('');
  const [hideChat, setHideChat] = useState(false);
  const [nameModal, setNameModal] = useState(false);
  const [currentMashup, setCurrentMashup] = useState('');
  const [threadToModify, setThreadToModify] = useState(null);
  const [threadName, setThreadName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const sendNewName = async () => {
    if (threadName !== '') {
      await changeThreadName(threadToModify, threadName);
    } else {
      console.error('Input element not found within the modal');
    }
    setNameModal(false);
    window.location.reload();
  };

  const closeNameModal = () => {
      setNameModal(false);
  };

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
  }

  const handleDelete = () => {
    deleteMashup(currentMashup);
    setShowDeleteModal(false);
  };

  const checkJSONResponse = (result) => {
    for (const msg of result) {
      if (msg.role=== "assistant" && msg.content.startsWith("```json")) {
        return true;
      }
    }
    return false;
  };


  useEffect(() => {
    let timer = 0;
    if(animated){
      timer = setTimeout(() => {
        setHideChat(true);
      }, 2000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [animated]);

  const handleSend = async (e) => {
    setInterval(2000);
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const messageText = e.target.value.trim();
      if (messageText !== '') {
        if(threadMessages.length === 0){
          const  { newThreadId, msgError }  = await createThread(messageText);
          if (msgError) {
            if (!errorAdded) { 
              setThreadMessages(threadMessages.concat([{ role: 'assistant', content: errorMessage, isError: true }]));
              setErrorAdded(true);
            }
          }else {
            setCurrentThreadId(newThreadId);
            await getThreadMessages(newThreadId);
          }
        } else {
          const reqStatus = await sendNewMessage(currentThreadId, messageText);
          if (reqStatus) {
            if (!errorAdded) {
              setThreadMessages(threadMessages.concat([{ role: 'assistant', content: errorMessage, isError: true }]));
              setErrorAdded(true);
            }
          } else {
            await getThreadMessages(currentThreadId);
          }
        }
        e.target.value = "";
      }
    }
  };

  const sendMessage = async () => {
    setInterval(2000);
    const textarea = document.querySelector(".textbox");
    const messageText = textarea.value;
    if (!messageText.trim() !== '') {
      if(threadMessages.length === 0){
        const { newThreadId, msgError } = await createThread(messageText);
          if (msgError) {
            if (!errorAdded) { 
              setThreadMessages(threadMessages.concat([{ role: 'assistant', content: errorMessage, isError: true }]));
              setErrorAdded(true); 
            }
          }else {
            setCurrentThreadId(newThreadId);
            await getThreadMessages(newThreadId);
          }
      } else {
        const reqStatus = await sendNewMessage(currentThreadId, messageText);
        if (reqStatus) {
          if (!errorAdded) { 
            setThreadMessages(threadMessages.concat([{ role: 'assistant', content: errorMessage, isError: true }]));
            setErrorAdded(true); 
          }
        } else {
          await getThreadMessages(currentThreadId);
        }
      }
      textarea.value = "";
    }
  };
  
  async function getThreadMessages(threadId) {
    setThreadMessages([{ role: "assistant", content: 'Cargando la respuesta...', isError: false }]);
    let retryInterval = interval;
    const maxRetryInterval = 30000;
    setTimeout(async function retry() {
      try {
        let response = await getThreadById(threadId);
        if (response.message === "Run not completed yet") {
          if (retryInterval < maxRetryInterval) {
            retryInterval *= 2;
            setThreadMessages([{ role: "assistant", content: `Generando respuesta, espere ${retryInterval / 1000} segundos...`, isError: false }]);
            setTimeout(retry, retryInterval);
          } else {
            setThreadMessages([{ role: "assistant", content: "Se alcanzó el tiempo máximo de espera. No se pudo completar el proceso.", isError: true }]);
          }
        } else {
          if (response && response.data && Array.isArray(response.data)) {
            let result = response.data.map((message) => {
              return {
                role: message.role,
                content: message.content[0].text.value,
              };
            }).reverse();
            if(checkJSONResponse(result)){
              const json = result[result.length-1].content;
              const mashup = await temporalMashup(json);
              setCurrentMashup(mashup);
              if(mashup !== ''){
                setEndpoint(`/#flow/${mashup}`);
                setAnimated(true);
              }else{
                setThreadMessages([{ role: "assistant", content: "El mashup que has solicitado ya existe o existe uno similar", isError: false }]);
              }
            }else {
            setThreadMessages(result);
            }
          } else {
            console.error("La respuesta no tiene el formato esperado:", response);
          }
        }
      } catch (error) {
        console.error("Error al obtener mensajes del hilo:", error);
        setThreadMessages([{ role: "assistant", content: "Error al obtener mensajes del hilo.", isError: true }]);
      }
    }, retryInterval);
  }

  const existThreads = (obj) => {
    if (Array.isArray(obj)) {
        return obj.some(element => existThreads(element));
    } else {
        return obj !== null && typeof obj === 'object' ? Object.keys(obj).length > 0 : Boolean(obj);
    };
  };

  return (
    <div className="chatBody">
      {showDeleteModal && (
                    <div className="modal">
                        <DeleteModal
                            show={showDeleteModal}
                            handleClose={handleDeleteModalClose}
                            handleDelete={handleDelete}
                        />
                    </div>
                )}
      {nameModal && (
                    <div className="nameModal">
                        <Modal onHide={() => setNameModal(false)} show={nameModal}>
                            <Modal.Header closeButton>
                                <Modal.Title>Cambiar el nombre del hilo</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                              <input type="text" id="threadName" value={threadName} onChange={(e) => setThreadName(e.target.value)} />
                            </Modal.Body>
                            <Modal.Footer>
                                <button onClick={closeNameModal}>Cancelar</button>
                                <button onClick={sendNewName}>Confirmar</button>
                            </Modal.Footer>
                        </Modal>
                    </div>
                )}
      {existsCookie?(
        <div>
          {animated && isNodeRedDeployed?(
            <div className={`editor ${animated ? 'visible':''}`}>
                <iframe src={`http://localhost:1880${endpoint}`} title="Editor" className="editorIframe"></iframe>
                <div className={`palette ${animated && hideChat ? 'show':''}`}>
                  <img src={deleteSvg} alt="delete" className="paletteButton" onClick={() => setShowDeleteModal(true)}/>
                  <img src={goBack} alt="goBack" className="paletteButton" onClick={() => window.location.href = '/chat'}/>
                </div>
            </div>
          ):(
            <div></div>
          )
          }
          <div className={`loader ${animated && !hideChat? '': 'hide'}`}></div>
          <div className={`chat ${animated && !hideChat? 'blur' : hideChat? 'hide' : '' }`}>
            <div className='historyContainer'>
              {existThreads(threads)?(
                <div className="history">
                  <p className="historyText">Historial</p>
                  <ul className="threadList">
                  {threads.map((thread, index) => (
                      <li className="bullet" key={index}>
                        <button className="threadButton" onClick={() => {
                            setInterval(0);
                            setErrorAdded(false);
                            setCurrentThreadId(thread.gpt_id);
                            getThreadMessages(thread.gpt_id);
                            }}>
                          {thread.name}
                        </button>
                        <img src={edit} alt="edit" className="editIcon" onClick={() => {
                          setNameModal(true);
                          setThreadToModify(thread.gpt_id);
                        }}/>
                      </li>
                    ))}
                  </ul>
                </div>
              ):(
                <div> 
                  <p className="historyText">No tienes ningún hilo en curso</p>
                </div>
              )}
            </div>
            <div className='chatLine'></div>
            <div className="chatContainer">
              <div className="messagesContainer" ref={messagesContainerRef}>
                  {threadMessages.map((message, index) => (
                    <div key={index} className={`message-${message.role} ${message.isError ? 'error-message' : ''}`}>
                      <span className={`span-${message.role}`}>
                        {message.role === "assistant" ? "Asistente" : "Tú"}
                      </span>
                      {message.role === "assistant" ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                      ) : (
                        <p className="messageContent">{message.content}</p>
                      )}
                    </div>
                  ))
                }
              </div>
              <div className="inputContainer">
                <textarea 
                  type="text" 
                  className="textbox" 
                  placeholder="Describa las acciones de su flujo o introduzca un JSON para describir un mashup"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSend(e);
                    }
                  }}
                  />
                <button className="sendButton" onClick={sendMessage}>
                  <img src={sendLogo} alt="send" className="sendIcon"/>
                </button>
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div className="chat2">
            <div className="signin-alert">
              <p>Inicia sesión para hacer uso del chat</p>
            </div>
          </div>
        )}
    </div>
  );
}