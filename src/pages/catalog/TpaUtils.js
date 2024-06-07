import tpaTemplate from "./tpa-template.json";

const toUpperSnakeCase = (name) => {
  return name.toUpperCase().replace(/\s+/g, "_");
};

const generateTPA = async (controls, catalogId, getMashupByIdFromTheDB, inputs) => {
  const tpa = JSON.parse(JSON.stringify(tpaTemplate));

  for (const control of controls) {
    const countingMetricName =
      "NUMBER_OF_ELEMENTS_FOR_" + toUpperSnakeCase(control.name);
    const positiveElementsMetricName =
      "NUMBER_OF_POSITIVE_ELEMENTS_FOR_" + toUpperSnakeCase(control.name);
    const guaranteeName = "RATE_FOR_" + toUpperSnakeCase(control.name);
    const mashup = await getMashupByIdFromTheDB(control.mashup_id);

    let config = {};
    for (const input of inputs.inputs[control.id]) {
      config[input.name] = input.value;
    }
    let trueConfig = { ...config };
    trueConfig["Status"] = "true";

    addMetricToTPA(tpa, countingMetricName, mashup, config);
    addMetricToTPA(tpa, positiveElementsMetricName, mashup, trueConfig);
    addGuaranteeToTPA(
      tpa,
      guaranteeName,
      control,
      countingMetricName,
      positiveElementsMetricName,
      50
    );
  }

  const tpaString = JSON.stringify(tpa, null, 2);
  await saveTpa(tpaString, catalogId);
};

const addMetricToTPA = async (tpa, metricName, mashup, config) => {
  tpa.terms.metrics[metricName] = {
    collector: {
      infrastructurePath: "internal.collector.events",
      endpoint: "/api/v2/computations",
      type: "POST-GET-V1",
      config: {
        scopeManager:
          "http://host.docker.internal:5700/api/v1/scopes/development",
      },
    },
    measure: {
      computing: "actual",
      element: "number",
      event: {
        status: {
          [mashup.name]: {},
        },
      },
      config: config,
      scope: {
        project: {
          name: "Project",
          description: "Project",
          type: "string",
          default: "example-project",
        },
        class: {
          name: "Class",
          description: "Group some projects",
          type: "string",
          default: "example-class",
        },
      },
    },
  };
};

const addGuaranteeToTPA = async (
  tpa,
  guaranteeName,
  control,
  countingMetricName,
  positiveElementsMetricName,
  objective
) => {
  tpa.terms.guarantees.push({
    id: guaranteeName,
    notes: `#### Description\n\`\`\`\n${control.description}`,
    description: control.description,
    scope: {
      project: {
        name: "Project",
        description: "Project",
        type: "string",
        default: "example-project",
      },
      class: {
        name: "Class",
        description: "Group some projects",
        type: "string",
        default: "example-class",
      },
    },
    of: [
      {
        scope: {
          project: "example-project",
        },
        objective: `${positiveElementsMetricName}/${countingMetricName} * 100 > ${objective}`,
        with: {
          [countingMetricName]: {},
          [positiveElementsMetricName]: {},
        },
        window: {
          type: "static",
          period: control.period.toLowerCase(),
          initial: control.startDate,
          end: control.endDate,
        },
      },
    ],
  });
};

const saveTpa = async (tpaContent, catalogId) => {
  try {
    const response = await fetch("http://localhost:3001/api/catalogs/tpa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: tpaContent,
        catalog_id: catalogId,
      }),
    });

    if (response.ok) {
      console.log("TPA guardado en el servidor");
    } else {
      console.error("Error al guardar el TPA:", response.statusText);
    }
  } catch (error) {
    console.error("Error al realizar la solicitud:", error);
  }
};

const deleteTpaByCatalogId = async (catalogId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/catalogs/${catalogId}/tpa`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (response.ok) {
      console.log("TPA eliminado del servidor");
    } else {
      console.error("Error al eliminar el TPA:", response.statusText);
    }
  } catch (error) {
    console.error("Error al realizar la solicitud:", error);
  }
};

export { generateTPA, addMetricToTPA, addGuaranteeToTPA, saveTpa, deleteTpaByCatalogId };
