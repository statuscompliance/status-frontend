import { useState, useEffect } from "react";
import { statusApi } from "../api/statusApi";

export const useNode = () => {
  const [isNodeRedDeployed, setIsNodeRedDeployed] = useState(false);
  const [mashups, setMashups] = useState([]);
  const [nodeRedToken, setNodeRedToken] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const active = await checkStatus();
      if (active) {
        setIsNodeRedDeployed(true);
        getMashups();
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      await statusApi.get("http://localhost:1880");
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
      statusApi
        .post(
          "http://localhost:1880/auth/token",
          {
            client_id: "node-red-admin",
            grant_type: "password",
            scope: "*",
            username: username,
            password: password,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
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
    let nodeRed;
    try {
      await statusApi.get("http://localhost:1880");
      nodeRed = true;
    } catch (error) {
      nodeRed = false;
    }
    if (
      nodeRed &&
      document.cookie
        .split("; ")
        .find((row) => row.startsWith(`nodeRedAccessToken=`))
    ) {
      const accessToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("nodeRedAccessToken="))
        .split("nodeRedAccessToken=")[1]
        .trim();
      try {
        const response = await statusApi.get("http://localhost:1880/flows", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const filteredMashups = response.data.filter(
          (obj) => obj.type === "tab"
        );
        const parsedMashups = parseMashups(filteredMashups);
        setMashups(parsedMashups);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getFlows = async () => {
    let nodeRed;
    try {
      await statusApi.get("http://localhost:1880");
      nodeRed = true;
    } catch (error) {
      nodeRed = false;
    }

    if (
      nodeRed &&
      document.cookie
        .split("; ")
        .find((row) => row.startsWith(`nodeRedAccessToken=`))
    ) {
      const accessToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("nodeRedAccessToken="))
        .split("nodeRedAccessToken=")[1]
        .trim();

      try {
        const response = await statusApi.get("http://localhost:1880/flows", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const apiMashups = response.data.filter(
          (obj) => obj.url && obj.url.includes("/api")
        );

        const parsedMashups = parseMashups(apiMashups);
        return parsedMashups;
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getAllFlows = async () => {
    let nodeRed;
    try {
      await statusApi.get("http://localhost:1880");
      nodeRed = true;
    } catch (error) {
      nodeRed = false;
    }

    if (
      nodeRed &&
      document.cookie
        .split("; ")
        .find((row) => row.startsWith(`nodeRedAccessToken=`))
    ) {
      const accessToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("nodeRedAccessToken="))
        .split("nodeRedAccessToken=")[1]
        .trim();

      try {
        const response = await statusApi.get("http://localhost:1880/flows", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        return response;
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getMashupParameters = async (mashup) => {
    const parameters = [];
    const flows = await getAllFlows();
    let id = 1;

    const traverseComponents = (componentId) => {
      const component = flows.data.find((comp) => comp.id === componentId);

      if (component && component.params) {
        Object.keys(component.params).forEach((param, index) => {
          parameters.push({
            id: id++,
            name: param,
            type: component.params[param],
          });
        });
      }

      if (component && component.wires && component.wires.length > 0) {
        component.wires.forEach((wireGroup, wireIndex) => {
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
    const accessToken = await getCookie();
    if (accessToken !== "") {
      try {
        const response = await statusApi.post(
          "http://localhost:1880/flow",
          {
            label: name,
            nodes: [],
            configs: [],
            info: description,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error(error);
      }
    }
  };

  const deleteMashup = async (id) => {
    const accessToken = await getCookie();
    if (accessToken !== "") {
      try {
        await statusApi.delete(`http://localhost:1880/flow/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        getMashups();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const checkIfExist = async (accessToken, jsonString) => {
    try {
      const response = await statusApi.get("http://localhost:1880/flows", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data.includes(jsonString);
    } catch (error) {
      console.error(error);
    }
  };

  const temporalMashup = async (content) => {
    const accessToken = await getCookie();
    if (accessToken !== "") {
      try {
        const jsonString = content.replace(/^```json+|```$/g, "");
        const parsedNodes = JSON.parse(jsonString);
        const id = parsedNodes[0].id;
        const label = parsedNodes[0].label;
        const info = parsedNodes[0].info;
        parsedNodes.shift();
        const existsMashup = await checkIfExist(accessToken, jsonString);
        if (existsMashup) {
          return "";
        } else {
          try {
            const response = await statusApi.post(
              "http://localhost:1880/flow",
              {
                id: id,
                label: label,
                nodes: parsedNodes,
                configs: [],
                info: info,
              },
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
            getMashups();
            const mashupId = response.data.id;
            return mashupId ? mashupId : "";
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  };
  const getFlow = async (id) => {
    const accessToken = await getCookie();
    if (accessToken !== "") {
      try {
        const response = await statusApi.get(
          `http://localhost:1880/flow/${id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error(error);
      }
    }
  };

  const addFlowInfo = async (id, flow, info) => {
    const accessToken = await getCookie();
    if (accessToken !== "") {
      const label = flow.label;
      const nodes = flow.nodes;
      try {
        const response = await statusApi.put(
          `http://localhost:1880/flow/${id}`,
          {
            id: id,
            label: label,
            nodes: nodes,
            configs: [],
            info: info,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        getMashups();
        const mashupId = response.data.id;
        return mashupId ? mashupId : "";
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getFlowResponse = async (endpoint, parameters) => {
    const accessToken = await getCookie();
    if (accessToken !== "") {
      try {
        const response = await statusApi.get(
          `http://localhost:1880/${endpoint}`,
          parameters,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error(error);
      }
    }
  };

  const sendMashupRequest = async (mashupUrl, inputs) => {
    try {
      const basicAuth = btoa(`${process.env.USER_STATUS}:${process.env.PASS_STATUS}`);
      const headers = {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      };
  
      const resp = await statusApi.post(mashupUrl, {
        headers: headers,
        body: JSON.stringify(
          inputs.reduce((acc, input) => {
            acc[input.name] = input.value;
            return acc;
          }, {})
        ),
      });
  
      if (!resp.ok) {
        throw new Error("Error in the mashup request");
      }
  
      const data = await resp.json();
      console.log("Mashup response data:", data);
      return data;
    } catch (error) {
      console.error("Error making mashup request:", error);
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
