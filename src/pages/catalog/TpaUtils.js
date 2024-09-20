import tpaTemplate from "./tpa-template.json";

const toUpperSnakeCase = (name) => {
  return name.toUpperCase().replace(/\s+/g, "_");
};

const generateTPA = async (controls, catalogId, catalogData, getFlows, getMashupById, inputs, createTpaInDB) => {
  const tpa = JSON.parse(JSON.stringify(tpaTemplate));

  if (catalogData.startDate && catalogData.endDate) {
    tpa.context.validity.initial = catalogData.startDate;
    tpa.context.validity.end = catalogData.endDate;
  }

  for (const control of controls) {
    const countingMetricName = "NUMBER_OF_ELEMENTS_FOR_" + toUpperSnakeCase(control.name);
    const positiveElementsMetricName = "NUMBER_OF_POSITIVE_ELEMENTS_FOR_" + toUpperSnakeCase(control.name);
    const guaranteeName = "RATE_FOR_" + toUpperSnakeCase(control.name);
    const flows = await getFlows();
    const mashup = await getMashupById(flows, control.mashup_id);

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
  await saveTpa(tpaString, catalogId, createTpaInDB);
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
          [mashup.url.match(/\/api\/(.+)/)[1]]: {},
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
          period: control.period.toLowerCase()
        },
      },
    ],
  });
};

const saveTpa = async (tpaContent, catalogId, createTpaInDB) => {
  try {
    const response = await createTpaInDB(tpaContent, catalogId)

    if (response) {
      console.log("TPA guardado en el servidor");
    } else {
      console.error("Error al guardar el TPA:", response.statusText);
    }
  } catch (error) {
    console.error("Error al realizar la solicitud:", error);
  }
};

const deleteTpaByCatalogId = async (catalogId, deleteTpaByIdFromTheDatabase) => {
  try {
    const response = await deleteTpaByIdFromTheDatabase(catalogId);

    if (response) {
      console.log("TPA eliminado del servidor");
    } else {
      console.error("Error al eliminar el TPA:", response.statusText);
    }
  } catch (error) {
    console.error("Error al realizar la solicitud:", error);
  }
};

export { generateTPA, addMetricToTPA, addGuaranteeToTPA, saveTpa, deleteTpaByCatalogId };
