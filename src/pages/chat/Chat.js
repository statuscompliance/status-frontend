import {useState, useRef, useEffect} from "react";
import "../../static/css/chat.css";
import { useCookie } from '../../hooks/useCookie';
import { useOpenAI } from '../../hooks/useOpenAI';
import { useNode } from '../../hooks/useNode';
import sendLogo from "../../static/images/send.svg";


export default function Chat() {
  const [threadMessages, setThreadMessages] = useState([]);
  const existsCookie = useCookie('accessToken');
  const [errorAdded, setErrorAdded] = useState(false);
  const { threads, getThreadById, createThread, sendNewMessage} = useOpenAI();
  const { isNodeRedDeployed, temporalMashup } = useNode();
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const messagesContainerRef = useRef(null);
  const [interval, setInterval] = useState(1000);
  const errorMessage = "El texto es demasiado corto, por favor, inténtalo de nuevo.";
  const [animated, setAnimated] = useState(false);
  const [endpoint, setEndpoint] = useState('');


  const checkJSONResponse = (result) => {
    for (let i = 0; i < result.length; i++) {
      if (result[i].role=== "assistant" && result[i].content.startsWith("```json")) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [threadMessages]);

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
          setThreadMessages([{ role: "assistant", content: "Cargando...", isError: false }]);
          await getThreadMessages(currentThreadId);
        }
      }
      textarea.value = "";
    }
  };
  
  async function getThreadMessages(threadId) {
    setThreadMessages([{ role: "assistant", content: 'Cargando...', isError: false }]);
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
              if(mashup !== ''){
                setEndpoint(`/#flow/${mashup}`);
                // setThreadMessages([{ role: "assistant", content: JSON.stringify(response), isError: false }]);
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

  return (
    <div className="chatBody">
      {existsCookie?(
        <div>
          {animated && isNodeRedDeployed?(
            <div className={`editor ${animated ? 'visible':''}`}>
                <iframe src={`http://localhost:1880${endpoint}`} title="Editor" className="editorIframe"></iframe>
            </div>
          ):(
            <div></div>
          )
          }
          <div className={`chat ${animated ? 'half-width':'full-width'}`}>
            <div className={`historyContainer ${animated ? 'hidden' : ''}`}>
              {threads.length>0?(
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
                          <p className="threadName">{thread.name}</p>
                        </button>
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
            <div className={`chatLine ${animated ? 'hidden' : ''}`}></div>
            <div className="chatContainer">
              <div className="messagesContainer" ref={messagesContainerRef}>
                  {threadMessages.map((message, index) => (
                    <div key={index} className={`message-${message.role} ${message.isError ? 'error-message' : ''}`}>
                      <span className={`span-${message.role}`}>
                        {message.role === "assistant" ? "Asistente" : "Tú"}
                      </span>
                      <p className="messageContent">{message.content}</p>
                    </div>
                  ))
                }
              </div>
              <div className="inputContainer">
                <textarea 
                  type="text" 
                  className="textbox" 
                  placeholder="Describa las acciones de su flujo"
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