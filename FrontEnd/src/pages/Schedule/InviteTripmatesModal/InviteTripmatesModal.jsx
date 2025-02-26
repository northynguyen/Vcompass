import { useState } from "react";
import "./InviteTripmatesModal.css";
const  InviteTripmatesModal = ({ isOpen, onClose }) => {
  const [permission, setPermission] = useState("edit");
  const tripLink = "https://wanderlog.com/plan/dhp...";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tripLink);
    alert("Link copied!");
  };

  if (!isOpen) return null; 

  return (
    <div className="modal-overlay-invite-tripmates">
      <div className="modal">
        <h2 className="modal-title">Invite tripmates</h2>

        <div className="permission-toggle">
          <button
            className={permission === "edit" ? "active" : ""}
            onClick={() => setPermission("edit")}
          >
            Can edit
          </button>
          <button
            className={permission === "view" ? "active" : ""}
            onClick={() => setPermission("view")}
          >
            View only
          </button>
        </div>

        <div className="share-link">
            <i class="fa fa-link "></i>
          <input type="text" value={tripLink} readOnly />
          <button onClick={copyToClipboard}>Copy link</button>
        </div>

        <div className=" invite-tripmates">
            <i class="fa fa-envelope-o" aria-hidden="true"></i>
            <input type="email" placeholder="Enter email address" />
        </div>

        <button className="manage-tripmates">⚙ Manage tripmates</button>

        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
    </div>
  );
}

export default InviteTripmatesModal;