import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";
import EmojiPicker from "emoji-picker-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { AiOutlinePaperClip } from "react-icons/ai";
import { BsFillPatchQuestionFill } from "react-icons/bs";
import { GoDotFill } from "react-icons/go";
import { IoIosArrowBack, IoIosArrowForward, IoMdSend } from "react-icons/io";
import { MdOutlineInsertEmoticon, MdOutlineMessage } from "react-icons/md";
import { VscCopilot } from "react-icons/vsc";
import { useNavigate } from 'react-router-dom';
import io from "socket.io-client";
import logo from '../../assets/logo.png';
import logo_ai from '../../assets/logo_ai.png';
import { StoreContext } from "../../Context/StoreContext";
import "./ChatBox.css";

const ChatBox = ({ setCurrentConversation, currentConversation }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentTab, setCurrentTab] = useState("AI")
    const [message, setMessage] = useState("");
    const [conversations, setConversations] = useState([]);
    const [currentChattingUser, setCurrentChattingUser] = useState()
    const [currentAIConversation, setCurrentAIConversation] = useState()
    const { url, token, user } = useContext(StoreContext);
    const [unReadMessages, setUnReadMessages] = useState(0)
    const [showPicker, setShowPicker] = useState(false);
    const [hoveredMessage, setHoveredMessage] = useState(null);
    const hoverTimeoutRef = useRef(null);
    const emojiRef = useRef(null);
    const fileInputRef = useRef(null);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const currentAIConversationRef = useRef(currentAIConversation);
    const navigate = useNavigate();
    const chatAIId = "636861746169616969616969"

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({});
        }
    };
    const handleMouseEnter = (index) => {
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredMessage(index);
        }, 500); // 1 giây
    };
    const handleMouseLeave = () => {
        clearTimeout(hoverTimeoutRef.current);
        setHoveredMessage(null);
    };
    const onChangeTabClick = (tab) => {
        setCurrentTab(tab)
    }
    const handleEmojiClick = (emoji) => {
        setMessage((prev) => prev + emoji.emoji);
        setShowPicker(false);
    };
    const handleUserClick = (id) => {
        navigate(`/otherUserProfile/${id}`);
        window.location.reload()
    };
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert("Tệp tin phải nhỏ hơn 5MB.");
            return;
        }
        let fileUrl = null;
        if (file.type.startsWith("image/")) {
            fileUrl = await uploadImage(file);
            handleSendMessage(currentConversation._id, user._id, "", fileUrl, "image");
        } else if (file.type.startsWith("video/")) {
            fileUrl = await uploadVideo(file);
            handleSendMessage(currentConversation._id, user._id, "", fileUrl, "video");
        }

    };
    const uploadImage = async (imgFile) => {
        if (!imgFile) return null;
        const formData = new FormData();
        formData.append("image", imgFile);

        try {
            const response = await axios.post(`${url}/api/videos/upload-image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                return response.data.url;
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error("❌ Lỗi khi tải ảnh:", error);
            throw error;
        }
    };
    const uploadVideo = async (videoFile) => {
        if (!videoFile) return null;
        const formData = new FormData();
        formData.append("video", videoFile);
        try {
            const response = await axios.post(`${url}/api/videos/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (response.data.success) {
                return response.data.url;
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error("❌ Lỗi khi tải video:", error);
            throw error;
        }
    };
    useEffect(() => {
        if (!user?._id) return;
        console.log("Connecting to chat socket...");
        socketRef.current = io(url);
        const socket = socketRef.current;
        const fetchConversations = async () => {
            try {
                const res = await fetch(`${url}/api/conversations/${user._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!Array.isArray(data)) return;
                data.sort((a, b) => {
                    const lastMessageA = a.messages[a.messages.length - 1]?.createdAt || 0;
                    const lastMessageB = b.messages[b.messages.length - 1]?.createdAt || 0;
                    return new Date(lastMessageB) - new Date(lastMessageA);
                });
                setConversations(data);
                console.log("Conversations", data)
                await Promise.all(data.map((conv) => socket.emit("joinRoom", conv._id)));
            } catch (error) {
                console.error("Lỗi khi lấy danh sách conversations:", error);
            }
        };

        fetchConversations();

        socket.on(`${user._id}-newConversation`, (conv) => {
            console.log("📩 New conversation detected, joining:", conv._id);
            socket.emit("joinRoom", conv._id);
            setConversations(prev => [...prev, conv]);
        });
        socket.on("newMessage", (message) => {
            console.log("📩 Received message:", message);
            const currentAIConversation = currentAIConversationRef.current;
            console.log(currentAIConversation)
            if (currentAIConversation && message.conversationId === currentAIConversation._id) {
                setCurrentAIConversation((prev) => {
                    return { ...prev, messages: [...prev.messages, message] };
                });
            }
            else {
                setConversations((prev) => {
                    let updatedConversations = prev.map((conversation) =>
                        conversation._id === message.conversationId
                            ? {
                                ...conversation,
                                messages: [...conversation.messages, message],
                            }
                            : conversation
                    );
                    updatedConversations = updatedConversations.sort((a, b) => {
                        const lastMessageA = a.messages?.[a.messages.length - 1]?.createdAt || 0;
                        const lastMessageB = b.messages?.[b.messages.length - 1]?.createdAt || 0;
                        return new Date(lastMessageB) - new Date(lastMessageA);
                    });

                    return updatedConversations;
                });

                setCurrentConversation((prev) => {
                    if (!prev || prev._id !== message.conversationId) return prev;
                    return { ...prev, messages: [...prev.messages, message] };
                });
            }
        });
        return () => {
            socket.off("newMessage");
            socket.off(`${user._id}-newConversation`);
            socket.disconnect();
        };
    }, [user]);
    useEffect(() => {
        if (currentConversation) {
            scrollToBottom();
            console.log("scrollTo")
            if (!isOpen) {
                setIsOpen(true);
            }
            let chatUser = currentConversation.participantIds[0]
            if (user._id === currentConversation.participantIds[0]._id) {
                chatUser = currentConversation.participantIds[1]
            }
            setCurrentChattingUser(chatUser);
        }
    }, [currentConversation]);
    useEffect(() => {
        if (currentAIConversation) {
            currentAIConversationRef.current = currentAIConversation;
            scrollToBottom();
        }
    }, [currentAIConversation]);
    const handleSendMessage = async (conversationId, sender, message, media, mediaType) => {
        if (message.trim() === "" && !media) return;
        const senderId = sender || user._id;
        const content = message;
        try {
            const sendMessageRequest = await fetch(`${url}/api/conversations/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversationId, senderId, content, media, mediaType })
            });
            const response = await sendMessageRequest.json()
        } catch (error) {
            console.error("🚨 Lỗi khi xử lý cuộc trò chuyện:", error);
            return null;
        }
        setMessage("");
    };
    const countUnReadMessages = () => {
        return conversations.reduce((total, conversation) => {
            const unreadCount = conversation.messages?.filter(
                (msg) => !msg.isReaded && msg.senderId !== user._id
            ).length || 0;
            return total + unreadCount;
        }, 0);
    };
    const handleChatAIClick = async () => {
        const socket = socketRef.current;
        if (!socket) {
            console.error("❌ Socket chưa được khởi tạo!");
            return;
        }
        const senderId = user._id;
        const receiverId = "636861746169616969616969"
        try {
            const res = await fetch(`${url}/api/conversations/getConver/${senderId}/${receiverId}`, { method: "GET" });
            let data = await res.json();
            if (res.ok && data.conversation) {
                console.log("✅ Cuộc trò chuyện đã tồn tại:", data.conversation._id);
                setCurrentAIConversation(data.conversation)
                console.log("id", data.conversation._id)
                socket.emit("joinRoom", data.conversation._id);
                setIsAIJoin(true)
                console.log("📡 Đã gửi yêu cầu tham gia phòng:", data.conversation._id);
                return data.conversation._id;
            }
            const createRes = await fetch(`${url}/api/conversations/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ senderId, receiverId })
            });
            const createData = await createRes.json();

            if (createRes.ok && createData.conversation) {
                console.log("🆕 Cuộc trò chuyện mới với AI đã tạo:", createData.conversation._id);
                setCurrentAIConversation(createData.conversation)
                scrollToBottom();
                return createData.conversation._id;
            } else {
                console.error("❌ Lỗi khi tạo cuộc trò chuyện:", createData.message);
                return null;
            }
        } catch (error) {
            console.error("🚨 Lỗi khi xử lý cuộc trò chuyện:", error);
            return null;
        }
    }
    const markAsReaded = async (conversationId, userId) => {
        try {
            await fetch(`${url}/api/conversations/mark-as-read`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversationId, userId }),
            });
            setConversations((prevConversations) =>
                prevConversations.map((conv) =>
                    conv._id === conversationId
                        ? {
                            ...conv,
                            messages: conv.messages.map((msg) =>
                                msg.senderId !== userId ? { ...msg, isReaded: true } : msg
                            ),
                        }
                        : conv
                )
            );
            console.log("đã đọc")
        } catch (error) {
            console.error("🚨 Lỗi khi đánh dấu đã đọc:", error);
            return null;
        }
    }
    const handleChatAI = async (message) => {
        handleSendMessage(currentAIConversation._id, user._id, message, "", "text")
        if (message.trim() === "" && !media) return;
        try {
            const sendMessageRequest = await fetch(`${url}/api/ai/chatAi`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message })
            });
            const response = await sendMessageRequest.json()
            if (response) {
                handleSendMessage(currentAIConversation._id, "636861746169616969616969", response.reply, "", "text")
            }

            console.log(response)
        } catch (error) {
            console.error("🚨 Lỗi khi xử lý cuộc trò chuyện:", error);
            return null;
        }
    };
    useEffect(() => {
        setUnReadMessages(countUnReadMessages)
    }, [conversations]);
    if (!token) return;
    return (
        <div className="chat-container">
            {/* Nút mở/đóng chat */}
            <div className="chat-open-icon">
                {unReadMessages > 0 && !isOpen &&
                    <div className="unread-message-container">
                        <p className="number-unread-message">{unReadMessages}</p>
                    </div>}
                <div className={`chat-label ${isOpen ? "rotate" : ""}`} onClick={() => setIsOpen(!isOpen)}>
                    <i className="fab fa-facebook-messenger chat-messenger-icon" />
                    <i className="fas fa-times chat-close-icon" />
                </div>
            </div>

            {/* Hộp thoại chat */}
            <div className={`chat-wrapper ${isOpen ? "open" : "closed"}`}>
                {!currentConversation && !currentAIConversation &&
                    <div className="chat-frame-container">
                        <div className="chat-frame">
                            {currentTab === "AI" &&
                                <div className="chat-ai-section">
                                    <div className="chat-ai-header">
                                        <div className="chat-logo-container">
                                            <img src={logo} className="chat-logo-image"></img>
                                        </div>
                                        <div className="chat-head-text">Hi {user.name} 👋 </div>
                                        <div className="chat-desc-container" onClick={() => handleChatAIClick()}>
                                            <div className="chat-desc-left">
                                                <p className="chat-desc-title">Đặt câu hỏi</p>
                                                <p className="chat-desc-text">AI - Trợ lý ảo sẵn sàng giúp bạn</p>
                                            </div>
                                            <BsFillPatchQuestionFill className="chat-ai-icon" />
                                        </div>
                                        <br />
                                    </div>
                                </div>}
                            {currentTab === "USER" &&
                                <div className="chat-user">
                                    <div className="chat-user-title">
                                        <p className="chat-user-title-text">Tin nhắn</p>
                                    </div>
                                    <div className="chat-user-list">
                                        {conversations?.map(conversation => {
                                            return <ChatUserItem
                                                key={conversation._id}
                                                conversation={conversation}
                                                setCurrentConversation={setCurrentConversation}
                                                setCurrentChattingUser={setCurrentChattingUser}
                                                setConversations={setConversations}
                                            />;
                                        })}
                                    </div>

                                </div>
                            }
                        </div>
                        <div className="chat-tab-container">
                            <div className={`chat-tabs ${currentTab === "AI" ? "tab-message-active" : ""}`} onClick={() => onChangeTabClick("AI")}>
                                <VscCopilot className="chat-tabs-icon" />
                                <p className="chat-tabs-text">Chat với Ai</p>
                            </div>
                            <div className={`chat-tabs ${currentTab === "USER" ? "tab-message-active" : ""}`} onClick={() => onChangeTabClick("USER")}>
                                <MdOutlineMessage className="chat-tabs-icon" />
                                <p className="chat-tabs-text">Tin nhắn</p>
                            </div>
                        </div>
                    </div>
                }
                {currentConversation &&
                    <div className="chat-frame-container slide-in">
                        <div className="chat-user">
                            <div className="chatting-user-title">
                                <div className="chat-user-back-icon" onClick={() => setCurrentConversation(null)}>
                                    <IoIosArrowBack />
                                </div>
                                {currentChattingUser &&
                                    <div className="chat-user-left">
                                        <img src={currentChattingUser.avatar && currentChattingUser.avatar.includes("http") ? currentChattingUser.avatar : currentChattingUser.avatar ? `${url}/images/${currentChattingUser.avatar}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                            alt="Avatar" className="chatting-user-avatar" />
                                        <a className="chatting-user-name" >{currentChattingUser.name}</a>
                                    </div>
                                }
                            </div>
                            <div className="chat-message-container">
                                {currentChattingUser &&
                                    <div className="ai-introduce-container">
                                        <img src={currentChattingUser.avatar && currentChattingUser.avatar.includes("http") ? currentChattingUser.avatar : currentChattingUser.avatar ? `${url}/images/${currentChattingUser.avatar}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                            alt="Avatar" className="chat-ai-avatar" />
                                        <a className="chatting-ai-name" >{currentChattingUser.name}</a>
                                        <div className="view-profile-container" onClick={() => { handleUserClick(currentChattingUser._id) }}>
                                            <p className="view-profile-button">Xem trang cá nhân</p>
                                        </div>
                                    </div>
                                }
                                <div className="message-container">
                                    {currentConversation.messages?.map((msg, index) => (
                                        <div className={`message-wrapper ${msg.senderId === user._id ? "me" : ""} `} key={index}
                                            onMouseEnter={() => handleMouseEnter(index)}
                                            onMouseLeave={handleMouseLeave}>
                                            {msg.media ? (
                                                msg.mediaType === "image" ? (
                                                    <img src={msg.media} alt="sent-img" className={`sent-image ${msg.senderId === user._id ? "me" : ""} `} />
                                                ) : (
                                                    <video
                                                        key={index}
                                                        className={`sent-video ${msg.senderId === user._id ? "me" : ""} `}
                                                        src={msg.media}
                                                        controls>
                                                        Your browser does not support the video tag.
                                                    </video>
                                                )
                                            ) : (
                                                <div key={index} className={`message ${msg.senderId === user._id ? "me" : ""} `}>
                                                    <p className="message-text">{msg.content}</p>
                                                </div>
                                            )}
                                            {hoveredMessage === index && (
                                                <div className="message-timestamp">
                                                    {new Date(msg.createdAt).toLocaleString()} {/* Hiển thị thời gian */}
                                                </div>
                                            )}
                                        </div>

                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            {/* Chat Control */}
                            <div className="chat-control-button">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/png, image/jpeg, image/jpg, video/mp4, video/webm, video/ogg"
                                    onChange={handleFileUpload}
                                    hidden
                                />
                                {!message && (
                                    <button className="file-button" onClick={() => fileInputRef.current.click()}>
                                        <AiOutlinePaperClip size={22} />
                                    </button>
                                )}
                                <button className="file-button" onClick={() => setShowPicker((prev) => !prev)}>
                                    <MdOutlineInsertEmoticon size={22} />
                                </button>
                                {showPicker && (
                                    <div ref={emojiRef} style={{ position: "absolute", bottom: "40px", left: "0" }}>
                                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                                    </div>
                                )}
                                <input
                                    type="text"
                                    placeholder="Nhập tin nhắn..."
                                    value={message}
                                    onClick={() => markAsReaded(currentConversation._id, user._id)}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage(currentConversation._id, user._id, message, "", "text")}
                                    className="chat-input"
                                />
                                <button className="send-button" onClick={() => handleSendMessage(currentConversation._id, user._id, message, "", "text")}>
                                    <IoMdSend size={22} />
                                </button>
                            </div>
                        </div>
                    </div>
                }
                {currentAIConversation &&
                    <div className="chat-frame-container slide-in">
                        <div className="chat-user">
                            <div className="chatting-user-title">
                                <div className="chat-user-back-icon" onClick={() => setCurrentAIConversation(null)}>
                                    <IoIosArrowBack />
                                </div>
                                <div className="chat-user-left">
                                    <img src={logo_ai} alt="Avatar" className="chatting-user-avatar" />
                                    <div className="ai-name-container">
                                        <a className="chatting-user-name">VCompass AI</a>
                                        <p className="ai-name-des">Trợ lý hữu ích của bạn</p>
                                    </div>
                                </div>
                            </div>
                            <div className="chat-message-container">
                                <div className="ai-introduce-container">
                                    <img src={logo_ai} alt="Avatar" className="chat-ai-avatar" />
                                    <a className="chatting-ai-name" >VCompass AI</a>
                                    <p className="ai-name-des">Hỏi bất cứ vấn đề gì bạn muốn</p>
                                </div>
                                <div className="message-container">
                                    {currentAIConversation?.messages?.map((msg, index) => (
                                        <div key={index} className={`message ${msg.senderId === user._id ? "me" : ""} `}>
                                            <p className="message-text">{msg.content}</p>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            {/* Chat Control */}
                            <div className="chat-control-button">
                                <input
                                    type="text"
                                    placeholder="Nhập tin nhắn..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleChatAI(message)}
                                    className="chat-input"
                                />
                                <button className="send-button" onClick={() => handleChatAI(message)}>
                                    <IoMdSend size={22} />
                                </button>
                            </div>
                        </div>
                    </div>
                }

            </div>
        </div>
    );
};

export default ChatBox;

const ChatUserItem = ({ conversation, setCurrentConversation, setCurrentChattingUser, setConversations }) => {
    const { url, user } = useContext(StoreContext);
    const [unReadMessages, setUnReadMessages] = useState(0)
    const [lastMessage, setLastMessage] = useState({})
    dayjs.extend(relativeTime);
    dayjs.locale("vi");
    let chatUser = conversation.participantIds[0]
    if (user._id === conversation.participantIds[0]._id) {
        chatUser = conversation.participantIds[1]
    }
    const getRelativeTime = (timestamp) => {
        return dayjs(timestamp).fromNow();
    };
    const markAsReaded = async (conversationId, userId) => {
        try {
            await fetch(`${url}/api/conversations/mark-as-read`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversationId, userId }),
            });
        } catch (error) {
            console.error("🚨 Lỗi khi đánh dấu đã đọc:", error);
            return null;
        }

    }
    const onConversationClick = () => {
        markAsReaded(conversation._id, user._id);
        setCurrentConversation(conversation);
        setCurrentChattingUser(chatUser);
        setConversations((prevConversations) =>
            prevConversations.map((conv) =>
                conv._id === conversation._id
                    ? {
                        ...conv,
                        messages: conv.messages.map((msg) =>
                            msg.senderId !== user._id ? { ...msg, isReaded: true } : msg
                        ),
                    }
                    : conv
            )
        );
    };

    const countUnReadMessages = () => {
        if (!conversation || !conversation.messages) return 0;
        return conversation.messages.filter(
            (msg) => !msg.isReaded && msg.senderId !== user._id
        ).length;
    };
    useEffect(() => {
        setUnReadMessages(countUnReadMessages)
        setLastMessage(conversation?.messages[conversation?.messages.length - 1])
    }, [conversation]);

    return (
        <div className="chat-user-info" onClick={() => onConversationClick()}>
            <div className="chat-user-left">
                <img src={chatUser.avatar && chatUser.avatar.includes("http") ? chatUser.avatar : chatUser.avatar ? `${url}/images/${chatUser.avatar}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    alt="Avatar" className="chat-user-avatar" />
                <div className="chat-user-info-wrap">
                    <div className="chat-user-header">
                        <a className="chat-user-name" >{chatUser.name}</a>
                        <p className="chat-user-time">{getRelativeTime(lastMessage?.createdAt)}</p>
                    </div>
                    <p className={`chat-user-message ${unReadMessages > 0 ? "un-read" : ""}`}>
                        {lastMessage?.senderId === user._id ? "Bạn: " : ""}
                        {lastMessage?.content}
                    </p>

                </div>
            </div>
            {unReadMessages > 0 && <GoDotFill className="chat-un-read-icon" />}
            <IoIosArrowForward className="chat-user-icon" />
        </div>
    )
}
