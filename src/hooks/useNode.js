import { useState, useEffect } from "react";
import nodeRedClient from "../api/nodeRedClient";
import { useAuth } from "../hooks/useAuth";

export const useNode = () => {
  const [isNodeRedDeployed, setIsNodeRedDeployed] = useState(false);
  const [mashups, setMashups] = useState([]);
  const [nodeRedToken, setNodeRedToken] = useState(false);
  const { getAuthority } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const fetchedAuthority = await getAuthority();
      if (fetchedAuthority === "ADMIN") {
        const active = await checkStatus();
        if (active) {
          setIsNodeRedDeployed(true);
          getMashups();
        }
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAuthority]);

  const checkNodeRedDeployment = async () => {
    const nodeRed = await checkStatus();
    if (nodeRed) {
      setIsNodeRedDeployed(true);
    } else {
      setIsNodeRedDeployed(false);
    }
  };

  const nodeRedCookie = async () => {
    const cookie = await getCookie();
    if (cookie !== "") {
      setNodeRedToken(true);
    } else {
      setNodeRedToken(false);
    }
  };

  async function checkStatus() {
    try {
      await nodeRedClient.get("/");
      return true;
    } catch (error) {
      if (error.code === "ERR_NETWORK") {
        return false;
      } else {
        console.error(error.message);
        return false;
      }
    }
  }

  async function getCookie() {
    const nodeRed = checkStatus();
    if (
      nodeRed &&
      document.cookie
        .split("; ")
        .find((row) => row.startsWith(`nodeRedAccessToken=`))
    ) {
      return document.cookie
        .split("; ")
        .find((row) => row.startsWith("nodeRedAccessToken="))
        .split("nodeRedAccessToken=")[1]
        .trim();
    } else {
      return "";
    }
  }

  const signIn = async (username, password) => {
    checkNodeRedDeployment();
    if (isNodeRedDeployed) {
      nodeRedClient
        .post("/auth/token", {
          client_id: "node-red-admin",
          grant_type: "password",
          scope: "*",
          username,
          password,
        })
        .then((response) => {
          const now = new Date();
          const oneWeekLater = new Date(
            now.getTime() + response.data.expires_in * 1000
          );
          const accessExpires = oneWeekLater.toUTCString();
          document.cookie = `nodeRedAccessToken=${response.data.access_token}; expires=${accessExpires}`;
          setNodeRedToken(true);
        })
        .catch((error) => {
          console.error(error.message);
        });
    }
  };

  const getMashups = async () => {
    try {
      await nodeRedClient.get("/");
      const accessToken = getCookie("nodeRedAccessToken");

      if (accessToken) {
        const response = await nodeRedClient.get("/flows");
        const filteredMashups = response.data.filter(
          (obj) => obj.type === "tab"
        );
        const parsedMashups = parseMashups(filteredMashups);
        setMashups(parsedMashups);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getFlows = async () => {
    try {
      await nodeRedClient.get("/");
      const accessToken = getCookie("nodeRedAccessToken");

      if (accessToken) {
        const response = await nodeRedClient.get("/flows");
        const apiMashups = response.data.filter(
          (obj) => obj.url && obj.url.includes("/api")
        );
        const parsedMashups = parseMashups(apiMashups);
        return parsedMashups;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getAllFlows = async () => {
    try {
      await nodeRedClient.get("/");
      const accessToken = getCookie("nodeRedAccessToken");

      if (accessToken) {
        const response = await nodeRedClient.get("/flows");
        return response;
      }
    } catch (error) {
      console.error("Error fetching all flows:", error);
    }
  };

  const getMashupParameters = async (mashup) => {
    const parameters = [];
    const flows = await getAllFlows();
    let id = 1;

    const traverseComponents = (componentId) => {
      const component = flows.data.find((comp) => comp.id === componentId);

      if (component && component.params) {
        Object.keys(component.params).forEach((param) => {
          if (Object.prototype.hasOwnProperty.call(component.params, param)) {
            parameters.push({
              id: id++,
              name: param,
              type: component.params[param],
            });
          }
        });
      }

      if (component && component.wires && component.wires.length > 0) {
        component.wires.forEach((wireGroup) => {
          wireGroup.forEach((nextComponentId) => {
            traverseComponents(nextComponentId);
          });
        });
      }
    };

    if (mashup && mashup.id) {
      traverseComponents(mashup.id);
    }

    return parameters;
  };

  const getMashupById = (flows, id) => {
    return flows.find((flow) => flow.id === id);
  };

  function parseMashups(mashups) {
    for (const mashup of mashups) {
      const text = mashup.info;
      const detailsRegex1 = /\*\*Details\*\*/;
      const descriptionRegex1 = /\*\*Description\*\*/;
      const detailsRegex2 = /\*\*Details:\*\*/;
      const descriptionRegex2 = /\*\*Description:\*\*/;
      if (detailsRegex1.test(text) && descriptionRegex1.test(text)) {
        const textWithoutDesc = text.replace("**Description**", "");
        const matches = textWithoutDesc.split("**Details**");
        mashup.mashupDescription = matches[0].trim();
        mashup.mashupDetails = matches[1].trim();
      } else if (detailsRegex2.test(text) && descriptionRegex2.test(text)) {
        const textWithoutDesc = text.replace("**Description:**", "");
        const matches = textWithoutDesc.split("**Details:**");
        mashup.mashupDescription = matches[0].trim();
        mashup.mashupDetails = matches[1].trim();
      } else {
        mashup.mashupDescription = mashup.info;
        mashup.mashupDetails = mashup.info;
      }
    }
    return mashups;
  }

  const createInitialMashup = async (name, description) => {
    const accessToken = getCookie("nodeRedAccessToken");
    if (accessToken) {
      try {
        const response = await nodeRedClient.post("/flow", {
          label: name,
          nodes: [],
          configs: [],
          info: description,
        });
        return response.data;
      } catch (error) {
        console.error(error);
      }
    }
  };

  const deleteMashup = async (id) => {
    const accessToken = getCookie("nodeRedAccessToken");
    if (accessToken) {
      try {
        await nodeRedClient.delete(`/flow/${id}`);
        getMashups();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const checkIfExist = async (jsonString) => {
    try {
      const response = await nodeRedClient.get("/flows");
      return response.data.includes(jsonString);
    } catch (error) {
      console.error(error);
    }
  };

  const temporalMashup = async (content) => {
    const accessToken = getCookie("nodeRedAccessToken");
    if (accessToken) {
      try {
        const jsonString = content.replace(/^```json+|```$/g, "");
        const parsedNodes = JSON.parse(jsonString);
        const { id, label, info } = parsedNodes.shift();

        const existsMashup = await checkIfExist(jsonString);
        if (existsMashup) {
          return "";
        }

        try {
          const response = await nodeRedClient.post("/flow", {
            id,
            label,
            nodes: parsedNodes,
            configs: [],
            info,
          });

          getMashups();
          return response.data.id || "";
        } catch (error) {
          console.error("Error creating temporal mashup:", error);
          return "";
        }
      } catch (error) {
        console.error("Error processing content for temporal mashup:", error);
        return "";
      }
    }
  };

  const getFlow = async (id) => {
    const accessToken = getCookie("nodeRedAccessToken");
    if (accessToken) {
      try {
        const response = await nodeRedClient.get(`/flow/${id}`);
        return response.data;
      } catch (error) {
        console.error(error);
      }
    }
  };

  const addFlowInfo = async (id, flow, info) => {
    const accessToken = getCookie("nodeRedAccessToken");
    if (accessToken) {
      const { label, nodes } = flow;
      try {
        const response = await nodeRedClient.put(`/flow/${id}`, {
          id,
          label,
          nodes,
          configs: [],
          info,
        });
        getMashups();
        return response.data.id || "";
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getFlowResponse = async (endpoint, parameters) => {
    const accessToken = getCookie("nodeRedAccessToken");
    if (accessToken) {
      try {
        const response = await nodeRedClient.get(`/${endpoint}`, {
          params: parameters,
        });
        return response.data;
      } catch (error) {
        console.error(error);
      }
    }
  };

  const sendMashupRequest = async (mashupUrl, inputs) => {
    try {
      const USER_STATUS = process.env.REACT_APP_USER_STATUS;
      const PASS_STATUS = process.env.REACT_APP_PASS_STATUS;
      const basicAuth = btoa(`${USER_STATUS}:${PASS_STATUS}`);

      const customHeaders = {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      };

      const body = JSON.stringify(
        inputs.reduce((acc, input) => {
          acc[input.name] = input.value;
          return acc;
        }, {})
      );

      const response = await nodeRedClient.post(mashupUrl, body, {
        headers: customHeaders,
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      console.error("Error making mashup request:", error);
      return null;
    }
  };

  return {
    isNodeRedDeployed,
    mashups,
    nodeRedToken,
    checkNodeRedDeployment,
    createInitialMashup,
    signIn,
    deleteMashup,
    temporalMashup,
    getFlows,
    getMashupById,
    getFlow,
    getMashupParameters,
    addFlowInfo,
    getFlowResponse,
    nodeRedCookie,
    sendMashupRequest,
  };
};
