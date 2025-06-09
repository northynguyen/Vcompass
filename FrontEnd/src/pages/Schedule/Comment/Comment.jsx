import axios from 'axios';
import moment from 'moment';
import "moment/locale/vi";
import React, { useContext, useEffect, useState } from 'react';
import { FaCommentAlt, FaHeart, FaRegPaperPlane, FaShare } from 'react-icons/fa';
import { StoreContext } from '../../../Context/StoreContext';
import './Comment.css';
// Post actions for liking, commenting, and sharing
export const PostActions = ({ handleLike, likeCount, commentCount, replyCount, isLike, postUrl, handleShare }) => {
    //     const handleShare = (platform) => {
    //       const shareUrl = encodeURIComponent(postUrl); // URL to be shared
    //       console.log(shareUrl);
    //       let shareLink = '';

    //       switch (platform) {
    //         case 'facebook':
    //           shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
    //           break;
    //         case 'twitter':
    //           shareLink = `https://twitter.com/intent/tweet?url=${shareUrl}`;
    //           break;
    //         case 'whatsapp':
    //           shareLink = `https://wa.me/?text=${shareUrl}`;
    //           break;
    //         default:
    //           // Fallback to a general share URL (opens the browser's native share dialog)
    //           shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
    //           break;
    //       }

    //       window.open(shareLink, '_blank'); // Open the share link in a new tab
    //     };
    //    const shareUrl = encodeURIComponent(postUrl); // URL to be shared
    //       console.log(shareUrl);
    return (
        <div className="post-actions-container">
            {/* Like Action */}
            <div className="post-action like-action" onClick={handleLike}>
                <FaHeart className={`post-action-icon ${isLike ? 'liked' : ''}`} />
                <span>Yêu thích ({likeCount})</span>
            </div>

            {/* Comment Action */}
            <div className="post-action comment-action">
                <FaCommentAlt className="post-action-icon" />
                <span>Bình luận ({commentCount + replyCount})</span>
            </div>

            {/* Share Action */}
            <div className="post-action share-action" onClick={handleShare}>
                <FaShare className="post-action-icon" />
                <span>Chia sẻ</span>
                
            </div>
        </div>
    );
};
moment.locale("vi");
const formatDate = (timestamp) => {
    const now = moment();

    const time = moment(timestamp);
    if (now.diff(time, 'hours') < 24) {
        return time.fromNow();
    }
    return time.format('MMM DD, YYYY, HH:mm');
};

const Comment = ({ schedule, onLikeClick, onComment, setShowLogin, handleShare }) => {
    const { url, user, token } = useContext(StoreContext);
    const [comments, setComments] = useState(schedule?.comments || []);
    const [likes, setLikes] = useState(schedule?.likes || []);
    const [newComment, setNewComment] = useState('');

    const logActivity = async (actionType, content) => {
        try {
            await axios.post(
                `${url}/api/logs/create`,
                {
                    userId: user._id,
                    scheduleId: schedule._id,
                    actionType,
                    content
                },
                { headers: { token } }
            );
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    };

    useEffect(() => {
        // Load comments from server to update view after a reply
        const fetchComments = async () => {
            try {
                const response = await axios.get(`${url}/api/schedule/${schedule._id}`, {
                    headers: { token }
                });
                if (response.data.success) {
                    setComments(response.data.schedule.comments);
                    setLikes(response.data.schedule.likes);
                }
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        };
        fetchComments();
    }, [schedule._id, url, token]);

    const handleLike = async () => {
        if (!user) {
            setShowLogin(true);
            return;
        }
        try {
            const response = await axios.post(`${url}/api/schedule/user/updateLikeComment`, {
                scheduleId: schedule._id,
                userId: user._id,
                action: isLike() ? 'unlike' : 'like',
            }, { headers: { token } });
            if (response.data.success) {
                if (onLikeClick && !isLike()) {
                    onLikeClick()
                }
                if (isLike()) {
                    await logActivity('unlike', 'Đã bỏ thích lịch trình');
                } else {
                    await logActivity('like', 'Đã thích lịch trình');
                }
                console.log("data", response.data)
                setLikes(response.data.schedule.likes);
            } else {
                console.error("Error liking schedule:", response.data.message);
            }
        } catch (error) {
            console.error("Error liking schedule:", error);
        }
    };

    const handleNewCommentSubmit = async () => {
        if (!user) {
            setShowLogin(true);
            return;
        }
        if (!newComment.trim()) return;
        try {
            const response = await axios.post(`${url}/api/schedule/user/updateLikeComment`, {
                scheduleId: schedule._id,
                userId: user._id,
                action: 'comment',
                content: newComment,
            }, { headers: { token } });
            if (response.data.success) {
                if (onComment) {
                    onComment()
                }
                await logActivity('comment', `Đã bình luận: ${newComment}`);
                setComments(response.data.schedule.comments);
                setNewComment('');
            } else {
                console.error("Error submitting comment:", response.data.message);
            }
        } catch (error) {
            console.error("Error submitting comment:", error);
        }
    };

    const handleReplyCount = (comments) => {
        let count = 0;
        comments.forEach((comment) => {
            count += comment.replies.length;
        });
        return count;
    };

    // Check if the current user has liked the post
    const isLike = () => {
        if (!user) return false;
        return likes.some(like => like.idUser === user._id);
    };


    return (
        <>
            <PostActions handleLike={handleLike} likeCount={likes.length} commentCount={comments.length} replyCount={handleReplyCount(comments)} isLike={isLike()} postUrl={`http://localhost:5173//schedule-view/${schedule._id}`} handleShare={handleShare} />
            <div className="comment-large-container">
                {comments.map((comment) => (
                    <div key={comment._id} className="commentitem-container">
                        <CommentContent
                            comment={comment}
                            scheduleId={schedule._id}
                            token={token}
                            updateComments={setComments}
                            url={url}
                            user={user}
                            logActivity={logActivity}
                            setShowLogin={setShowLogin}
                        />
                    </div>
                ))}
            </div>
            <div className="comment-input-container">
                <input
                    type="text"
                    placeholder="Thêm bình luận..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="input-comment-field"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleNewCommentSubmit();
                        }
                    }}
                />
                <FaRegPaperPlane onClick={handleNewCommentSubmit} className="send-icon" />
            </div>
        </>
    );
};

const CommentContent = ({ comment, scheduleId, token, updateComments, url, user, logActivity, setShowLogin }) => {
    const [replyText, setReplyText] = useState('');
    const [activeReplyInputId, setActiveReplyInputId] = useState(null);
    const [showReplies, setShowReplies] = useState(false);

    const handleReplySubmit = async () => {
        if (!user) {
            setShowLogin(true);
            return;
        }
        if (!replyText.trim()) return;

        try {
            const response = await axios.post(
                `${url}/api/schedule/user/updateLikeComment`,
                {
                    scheduleId,
                    userId: user._id,
                    action: 'reply',
                    content: replyText,
                    commentId: activeReplyInputId, // <-- quan trọng
                },
                { headers: { token } }
            );

            if (response.data.success) {
                await logActivity('reply', `Đã trả lời bình luận: ${replyText}`);
                updateComments(response.data.schedule.comments);
                setReplyText('');
                setActiveReplyInputId(null);
            } else {
                console.error("Error submitting reply:", response.data.message);
            }
        } catch (error) {
            console.error("Error submitting reply:", error);
        }
    };

    return (
        <div className="comment-container">
            {/* Comment chính */}
            <div className="user-avatar">
                <img
                    src={
                        comment.avatar?.includes('http')
                            ? comment.avatar
                            : `${url}/images/${comment.avatar}` ||
                            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt="avatar"
                    className="avatar-image"
                />
            </div>

            <div className="comment-content">
                <div className="comment-line">
                    <div className="comment-text">
                        <span className="user-name">{comment.userName}</span>
                        <p>{comment.content}</p>
                    </div>
                </div>

                <div className="comment-actions">
                    <span>{formatDate(comment.createdAt)}</span>
                    <span
                        className="link"
                        onClick={() => setActiveReplyInputId(comment._id)}
                    >
                        Trả lời
                    </span>
                </div>

                {/* Input reply cho comment chính */}
                {activeReplyInputId === comment._id && (
                    <div className="reply-input-container">
                        <input
                            type="text"
                            placeholder="Trả lời..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleReplySubmit();
                            }}
                            className="input-comment-field"
                        />
                        <FaRegPaperPlane onClick={handleReplySubmit} className="send-icon" />
                    </div>
                )}

                {/* Xem/ẩn replies */}
                {comment.replies.length > 0 && (
                    <div className="view-replies-container">
                        <span
                            className="view-replies"
                            onClick={() => setShowReplies(!showReplies)}
                        >
                            {showReplies
                                ? 'Ẩn phản hồi'
                                : `Xem ${comment.replies.length} phản hồi`}
                        </span>
                    </div>
                )}

                {/* Danh sách reply */}
                {showReplies &&
                    comment.replies.map((reply) => (
                        <div key={reply._id} className="reply-container">
                            <div className="user-avatar">
                                <img
                                    src={
                                        reply.avatar?.includes('http')
                                            ? reply.avatar
                                            : `${url}/images/${reply.avatar}` ||
                                            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                                    }
                                    alt="avatar"
                                    className="avatar-image"
                                />
                            </div>

                            <div>
                                <div className="comment-line">
                                    <div className="reply-content">
                                        <span className="reply-user-name">{reply.userName}</span>
                                        <p className="reply-text">{reply.content}</p>
                                    </div>
                                </div>

                                <div className="comment-actions">
                                    <span>{formatDate(reply.createdAt)}</span>
                                    <span
                                        className="link"
                                        onClick={() => setActiveReplyInputId(reply._id)}
                                    >
                                        Trả lời
                                    </span>
                                </div>

                                {/* Input reply cho từng reply */}
                                {activeReplyInputId === reply._id && (
                                    <div className="reply-input-container">
                                        <input
                                            type="text"
                                            placeholder="Trả lời..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleReplySubmit();
                                            }}
                                            className="input-comment-field"
                                        />
                                        <FaRegPaperPlane onClick={handleReplySubmit} className="send-icon" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};


export default Comment;