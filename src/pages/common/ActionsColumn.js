import React from "react";
import infoIcon from "../../static/images/info.svg";
import editIcon from "../../static/images/edit.svg";
import deleteIcon from "../../static/images/delete.svg";

const ActionsColumn = ({
  rowData,
  onView = () => {},
  onEdit = () => {},
  onDelete = () => {},
  showView = () => true,
  showEdit = () => true,
  showDelete = () => true,
  customActions = [],
}) => {
  const defaultActions = [
    {
      label: "View",
      icon: infoIcon,
      onClick: onView,
      visible: showView,
    },
    {
      label: "Edit",
      icon: editIcon,
      onClick: onEdit,
      visible: showEdit,
    },
    {
      label: "Delete",
      icon: deleteIcon,
      onClick: onDelete,
      visible: showDelete,
    },
  ];

  const actions = [...defaultActions, ...customActions];

  return (
    <div className="actions">
      {actions.map(
        (action, index) =>
          action.visible(rowData) && (
            <button
              key={index}
              className="actionButton"
              onClick={() => action.onClick(rowData)}
            >
              <img alt={action.label} className="actionImg" src={action.icon} />
            </button>
          )
      )}
    </div>
  );
};

export default ActionsColumn;
