import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useGrafana } from "../../hooks/useGrafana";
import { Folder, LayoutDashboard, Loader, ChevronDown, ChevronRight } from 'lucide-react';
import "../../static/css/dashboards.css";

export default function Dashboards() {
  const [folders, setFolders] = useState([]);
  const [dashboards, setDashboards] = useState({});
  const [rootDashboards, setRootDashboards] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [loading, setLoading] = useState({});
  const { getFolders, getDashboardsByFolderUid } = useGrafana();

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const data = await getFolders();
        setFolders(data);
      } catch (error) {
        console.error('Error when obtaining folders:', error);
      }
    };
    
    const fetchRootDashboards = async () => {
      try {
        const data = await getDashboardsByFolderUid();
        setRootDashboards(data);
      } catch (error) {
        console.error('Error when obtaining root dashboards:', error);
      }
    };

    fetchFolders();
    fetchRootDashboards();
  }, []);

  const fetchDashboards = async (folderUid) => {
    setLoading(prev => ({ ...prev, [folderUid]: true }));
    try {
      const data = await getDashboardsByFolderUid(folderUid);
      setDashboards((prevDashboards) => ({
        ...prevDashboards,
        [folderUid]: data,
      }));
    } catch (error) {
      console.error('Error when obtaining dashboards:', error);
    } finally {
      setLoading(prev => ({ ...prev, [folderUid]: false }));
    }
  };

  const handleAccordionToggle = (itemId) => {
    setActiveItem(prevActiveItem => prevActiveItem === itemId ? null : itemId);
    if (itemId.startsWith('folder-')) {
      const folderUid = itemId.replace('folder-', '');
      if (!dashboards[folderUid] && !loading[folderUid]) {
        fetchDashboards(folderUid);
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Folders and Dashboards</h2>
      <div className="accordion custom-accordion" id="foldersAccordion">
        {folders.map((folder) => (
          <div className="card mb-2" key={`folder-${folder.id}`}>
            <div className="card-header" id={`heading-${folder.id}`}>
              <h2 className="mb-0">
                <button
                  className={`btn btn-link btn-block text-left d-flex align-items-center justify-content-between ${activeItem === `folder-${folder.uid}` ? 'active' : ''}`}
                  type="button"
                  onClick={() => handleAccordionToggle(`folder-${folder.uid}`)}
                  aria-expanded={activeItem === `folder-${folder.uid}`}
                  aria-controls={`collapse-${folder.id}`}
                >
                  <span className="d-flex align-items-center">
                    <Folder className="mr-2" size={20} />
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
              className={`collapse ${activeItem === `folder-${folder.uid}` ? 'show' : ''}`}
              aria-labelledby={`heading-${folder.id}`}
            >
              <div className="card-body">
                {loading[folder.uid] ? (
                  <div className="text-center">
                    <Loader className="animate-spin" size={24} />
                    <p>Loading dashboards...</p>
                  </div>
                ) : dashboards[folder.uid] ? (
                  dashboards[folder.uid].length > 0 ? (
                    <ul className="list-unstyled">
                      {dashboards[folder.uid].map((dashboard) => (
                        <li key={dashboard.id} className="dashboard-item">
                          <LayoutDashboard className="mr-2" size={16} />
                          {dashboard.title}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">No dashboards found in this folder.</p>
                  )
                ) : null}
              </div>
            </div>
          </div>
        ))}
        {rootDashboards.map((dashboard) => (
          <div className="card mb-2" key={`dashboard-${dashboard.id}`}>
            <div className="card-header">
              <h2 className="mb-0">
                <button className="btn btn-link btn-block text-left d-flex align-items-center">
                  <LayoutDashboard className="mr-2" size={20} />
                  {dashboard.title}
                </button>
              </h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}