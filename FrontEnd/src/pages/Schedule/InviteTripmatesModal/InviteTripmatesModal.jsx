import { useState, useRef,useContext } from "react";
import "./InviteTripmatesModal.css";
import { Tooltip } from "react-tooltip";
import axios from "axios";
import { StoreContext } from "../../../Context/StoreContext";
import { toast } from "react-toastify";

const InviteTripmatesModal = ({ isOpen, onClose , schedule, setInforSchedule}) => {
    const [permission, setPermission] = useState("edit");
    const [email, setEmail] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const tripLink = "https://wanderlog.com/plan/dhp...";
    const [emailTripmates, setEmailTripmates] = useState([]);
    const inputEmailRef = useRef(null);
    const [emailMessage, setEmailMessage] = useState("Choeck ut my trip plan on Wanderlog! We can collaborate in real time, have all our travel reservations in one place, and so much more. Let’s plan the best trip ever!   ");
    const {user,url} = useContext(StoreContext);
    const [isSending, setIsSending] = useState(false);
    const [idRemoveTripmate, setIdRemoveTripmate] = useState([]);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(tripLink);
        alert("Link copied!");
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setShowDropdown(validateEmail(e.target.value));
    };

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const removeEmail = (index) => {
        setEmailTripmates(emailTripmates.filter((_, i) => i !== index));
    };

    const addIcon = () => {
        if (inputEmailRef.current) {
            inputEmailRef.current.focus();
        }
    };
    
    const sendEmail = async () => {
        try {
            setIsSending(true);
          const response = await axios.post(`${url}/api/email/invite`, {
            emails: emailTripmates,
            message: emailMessage,
            user : user,
            scheduleId : schedule._id
          });
          
          if (response.data.success) {
            toast.success("Email sent successfully");
            emailTripmates.length = 0;
            setEmail("");
          } else {
            toast.error("Failed to send email");
          }
        } catch (error) {
          console.error("Error sending email:", error);
          toast.error("An error occurred while sending the email");
        }
        finally {
            setIsSending(false);
           
        }
      };

    const removeTripmate = async (id) => {
        if (user._id !== schedule.idUser) {
            alert(" Bạn không có quyền chỉnh sửa thông tin này");
            return;
        }
        setIdRemoveTripmate([...idRemoveTripmate, id]);
    };

    const undoRemoveTripmate = (id) => {
        setIdRemoveTripmate(idRemoveTripmate.filter((item) => item !== id));
    };

    const handleClose = () => {
        onClose(); // Gọi hàm đóng modal hoặc thực hiện hành động cần thiết
       
        setInforSchedule((prevSchedule) => ({
            ...prevSchedule,
            idInvitee: prevSchedule.idInvitee.filter(item => !idRemoveTripmate.includes(item._id))
        }));
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
                        ⚙ Manage tripmates
                    </button>
                </div>
                {permission === "edit" && (
                <div className="share-link">
                    <i className="fa fa-link"></i>
                    <input type="text" value={tripLink} readOnly />
                    <button onClick={copyToClipboard}>Copy link</button>
                </div>
                )}

                {permission === "edit" && (            
                    <div className="invite-tripmates-input">
                    <div className="input-container">
          
                        <i className="fa fa-envelope-o ico-input" aria-hidden="true"></i>
                        <input
                            type="email"
                            required
                            placeholder="Enter email address"
                            value={email}
                            onChange={handleEmailChange}
                            ref={inputEmailRef}
                        />

                        {showDropdown && (
                            <div className="dropdown" onClick={() => {setEmailTripmates([...emailTripmates, email]) , setEmail(""), setShowDropdown(false)}}>
                                <div className="dropdown-item">
                                    <i className="fa fa-envelope" aria-hidden="true"></i>
                                    <div className="dropdown-right">
                                        <span>Send an email</span>
                                        <small>to {email}</small>
                                    </div>

                                </div>
                            </div>
                        )}
                     </div>
                    {emailTripmates.length > 0 && (
                        <div className="email-tripmates-container">
                            <div className="border-top"></div>
                            <div className="email-tripmates">
                                <span className="title">
                                    Sending to
                                </span>
                                <div className="email-tripmates-list"> 
                                    {emailTripmates.map((email, index) => (
                                        <div key={index} className="email-tripmate">
                                            <span>{email}</span>
                                            <button onClick={() => removeEmail(index)}>✕</button>
                                        </div>
                                    ))}
                                    <button className="add-tripmate" onClick={() => (addIcon() )}>+</button>
                                </div>
                        </div>
                       
                        <div className="email-message">
                            <span className="email-message-title title">Message</span>
                            <textarea
                                className="email-message-textarea"
                                placeholder="Optional message"
                                defaultValue={emailMessage}
                                rows="3"
                                data-tooltip-id="input-tooltip"
                                onChange={(e) => setEmailMessage(e.target.value)}
                            >
                            </textarea>
                            <Tooltip id="input-tooltip" place="top" style={{ background :"gray",fontSize: "12px", zIndex: "999" }} content="Click để chỉnh sửa nội dung" />

                        </div>      
                        <div className="send-invite-container"> 
                            <button className={`send-invite ${isSending ? "sending" : ""}`} onClick={()=>(sendEmail())} disabled={isSending} >Send email</button>
                        </div>
                    </div>
                    
                    )}

                   
                    
                </div>
                )}

                {permission === "view" && (
                    <div className="tripmates-list-manage">
                        {schedule.idInvitee.map((invitee) => (
                            console.log(invitee),
                            <div className={"tripmate-item-manage" + (idRemoveTripmate.includes(invitee._id) ? " removed" : "") } key={invitee._id}>
                                <img src={invitee.avatar} alt="Tripmate" className="tripmate-image"/>
                                <div className="tripmate-info"> 
                                    <span>{invitee.name}</span>
                                    <small>{invitee.email}</small>
                                </div>
                               {idRemoveTripmate.includes(invitee._id) ? (
                                    <button className="undo" onClick={() => undoRemoveTripmate(invitee._id)}>Undo</button>
                                ) : (
                                    <button onClick={() => removeTripmate(invitee._id)}>✕</button>
                                )}
                                
                            </div>
                        ))}                                    
                    </div>
                )}

                <button className="close-btn" onClick={handleClose}>✕</button>
            </div>
        </div>
    );
};

export default InviteTripmatesModal;
