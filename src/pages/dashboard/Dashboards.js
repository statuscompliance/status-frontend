import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useGrafana } from "../../hooks/useGrafana";
import {
  Folder,
  LayoutDashboard,
  Loader,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import "../../static/css/dashboards.css";

export default function Dashboards() {
  const [folders, setFolders] = useState([]);
  const [dashboards, setDashboards] = useState({});
  const [rootDashboards, setRootDashboards] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [loading, setLoading] = useState({});
  const [iframeUrl, setIframeUrl] = useState("");
  const [selectedDashboardUrl, setSelectedDashboardUrl] = useState("");
  const [selectedDashboardPanels, setSelectedDashboardPanels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { getFolders, getDashboardsByFolderUid, getDashboardMetrics } =
    useGrafana();
  const [selectedPanelId, setSelectedPanelId] = useState(null);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const data = await getFolders();
        setFolders(data);
      } catch (error) {
        console.error("Error when obtaining folders:", error);
      }
    };

    const fetchRootDashboards = async () => {
      try {
        const data = await getDashboardsByFolderUid();
        setRootDashboards(data);
      } catch (error) {
        console.error("Error when obtaining root dashboards:", error);
      }
    };

    fetchFolders();
    fetchRootDashboards();
  }, []);

  const fetchDashboards = async (folderUid) => {
    setLoading((prev) => ({ ...prev, [folderUid]: true }));
    try {
      const data = await getDashboardsByFolderUid(folderUid);
      setDashboards((prevDashboards) => ({
        ...prevDashboards,
        [folderUid]: data,
      }));
    } catch (error) {
      console.error("Error when obtaining dashboards:", error);
    } finally {
      setLoading((prev) => ({ ...prev, [folderUid]: false }));
    }
  };

  const handleAccordionToggle = (itemId) => {
    setActiveItem((prevActiveItem) =>
      prevActiveItem === itemId ? null : itemId
    );
    if (itemId.startsWith("folder-")) {
      const folderUid = itemId.replace("folder-", "");
      if (!dashboards[folderUid] && !loading[folderUid]) {
        fetchDashboards(folderUid);
      }
    }
  };

  const handleDashboardClick = async (dashboardUrl, uid) => {
    setSelectedDashboardUrl(dashboardUrl);
    setIframeUrl("");
    try {
      const panels = await getDashboardMetrics(uid);
      setSelectedDashboardPanels(panels);
    } catch (error) {
      console.error("Error when obtaining dashboard panels:", error);
      setSelectedDashboardPanels([]);
    }
  };

  const handlePanelClick = (panelId) => {
    setSelectedPanelId(panelId);
    setIframeUrl(`${selectedDashboardUrl}?kiosk=1&viewPanel=${panelId}`);
  };

  useEffect(() => {
    if (selectedDashboardPanels.length > 0) {
      const firstPanelId = selectedDashboardPanels[0].id;
      setSelectedPanelId(firstPanelId);
      setIframeUrl(`${selectedDashboardUrl}?kiosk=1&viewPanel=${firstPanelId}`);
    } else {
      setSelectedPanelId(null);
      setIframeUrl("");
    }
  }, [selectedDashboardPanels, selectedDashboardUrl]);

  const getFilteredDashboards = () => {
    const allDashboards = [
      ...rootDashboards,
      ...Object.values(dashboards).flat(),
    ];

    if (searchTerm.trim() === "") {
      return [];
    }

    return allDashboards.filter((dashboard) =>
      dashboard.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row justify-content-center">
        <div className="title-container">
          <h2 className="main-title">
            <Folder className="main-title-icon" size={28} />
            Metric Explorer
          </h2>
          <p className="subtitle">
            Browse your metrics results
          </p>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-md-4">
          <div className="mb-3">
            <div className="mb-3 search-container">
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search catalogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="clear-button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  &times;
                </button>
              )}
            </div>
          </div>
          {searchTerm ? (
            <ul className="filtered-results">
              {getFilteredDashboards().length > 0 ? (
                getFilteredDashboards().map((dashboard) => (
                  <li
                    key={dashboard.id}
                    className={`dashboard-item ${
                      selectedDashboardUrl ===
                      `http://localhost:3100${dashboard.url}`
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleDashboardClick(
                        `http://localhost:3100${dashboard.url}`,
                        dashboard.uid
                      )
                    }
                  >
                    <LayoutDashboard className="dashboard-icon" size={20} />
                    <span className="dashboard-title">{dashboard.title}</span>
                  </li>
                ))
              ) : (
                <p className="text-muted">No catalogs found</p>
              )}
            </ul>
          ) : (
            <div className="accordion custom-accordion" id="foldersAccordion">
              {folders.map((folder) => (
                <div className="card mb-2" key={`folder-${folder.id}`}>
                  <div className="card-header" id={`heading-${folder.id}`}>
                    <h2 className="mb-0">
                      <button
                        className={`btn btn-link btn-block text-left d-flex align-items-center justify-content-between ${
                          activeItem === `folder-${folder.uid}` ? "active" : ""
                        }`}
                        type="button"
                        onClick={() =>
                          handleAccordionToggle(`folder-${folder.uid}`)
                        }
                        aria-expanded={activeItem === `folder-${folder.uid}`}
                        aria-controls={`collapse-${folder.id}`}
                      >
                        <span className="d-flex align-items-center">
                          <Folder className="folder-icon" size={20} />
                          {folder.title}
                        </span>
                        {activeItem === `folder-${folder.uid}` ? (
                          <ChevronDown size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )}
                      </button>
                    </h2>
                  </div>
                  <div
                    id={`collapse-${folder.id}`}
                    className={`collapse ${
                      activeItem === `folder-${folder.uid}` ? "show" : ""
                    }`}
                    aria-labelledby={`heading-${folder.id}`}
                  >
                    <div className="card-body">
                      {loading[folder.uid] ? (
                        <div className="text-center">
                          <Loader className="animate-spin" size={24} />
                          <p>Loading catalogs...</p>
                        </div>
                      ) : dashboards[folder.uid] ? (
                        dashboards[folder.uid].length > 0 ? (
                          <ul className="list-unstyled">
                            {dashboards[folder.uid].map((dashboard) => (
                              <li
                                key={dashboard.id}
                                className={`dashboard-item ${
                                  selectedDashboardUrl ===
                                  `http://localhost:3100${dashboard.url}`
                                    ? "selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleDashboardClick(
                                    `http://localhost:3100${dashboard.url}`,
                                    dashboard.uid
                                  )
                                }
                              >
                                <LayoutDashboard
                                  className="dashboard-icon"
                                  size={16}
                                />
                                {dashboard.title}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted">
                            No catalogs found in this department.
                          </p>
                        )
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
              {rootDashboards.map((dashboard) => (
                <div
                  key={`dashboard-${dashboard.id}`}
                  className={`root-dashboard-item ${
                    selectedDashboardUrl ===
                    `http://localhost:3100${dashboard.url}`
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    handleDashboardClick(
                      `http://localhost:3100${dashboard.url}`,
                      dashboard.uid
                    )
                  }
                >
                  <LayoutDashboard className="root-dashboard-icon" size={20} />
                  <span className="dashboard-title">{dashboard.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="col-md-8">
          <div className="iframe-container">
            <div className="iframe-header">
              <h3 className="iframe-title">Catalog Preview</h3>
            </div>
            {selectedDashboardPanels.length > 0 ? (
              <div className="p-3">
                <h4>Catalog Metrics</h4>
                <select
                  className="form-select mb-3"
                  value={selectedPanelId || ""}
                  onChange={(e) => handlePanelClick(e.target.value)}
                >
                  {selectedDashboardPanels.map((panel) => (
                    <option key={panel.id} value={panel.id}>
                      {panel.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : selectedDashboardUrl ? (
              <div
                className="d-flex align-items-center justify-content-center bg-light fade-in"
                style={{ height: "600px" }}
              >
                <p className="text-muted">No metrics found for this catalog</p>
              </div>
            ) : (
              <div
                className="d-flex align-items-center justify-content-center bg-light"
                style={{ height: "600px" }}
              >
                <p className="text-muted">
                  Select a catalog to preview its metrics
                </p>
              </div>
            )}

            {iframeUrl && selectedDashboardPanels.length > 0 && (
              <iframe
                src={iframeUrl}
                width="100%"
                height="100%"
                title="Dashboard Iframe"
                className="border-0"
                style={{
                  minHeight: "600px",
                }}
              ></iframe>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
