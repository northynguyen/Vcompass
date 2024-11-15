import axios from 'axios';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { FaCommentAlt, FaHeart, FaRegPaperPlane, FaShare } from 'react-icons/fa';
import { StoreContext } from '../../../Context/StoreContext';
import './Comment.css';

// Post actions for liking, commenting, and sharing
export const PostActions = ({ handleLike, likeCount, commentCount, replyCount, isLike, postUrl }) => {
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
            <div className="post-action share-action">
                <FaShare className="post-action-icon" />
                <span>Chia sẻ</span>
                <div className="share-dropdown">
                    <button onClick={() => handleShare('facebook')}>Facebook</button>
                    <button onClick={() => handleShare('twitter')}>Twitter</button>
                    <button onClick={() => handleShare('whatsapp')}>WhatsApp</button>
                    <button onClick={() => handleShare('linkedin')}>LinkedIn</button>
                </div>
            </div>
        </div>
    );
};

const formatDate = (timestamp) => {
    const now = moment();
    const time = moment(timestamp);
    if (now.diff(time, 'hours') < 24) {
        return time.fromNow();
    }
    return time.format('MMM DD, YYYY, HH:mm');
};

const Comment = ({ schedule }) => {
    const { url, user, token } = useContext(StoreContext);
    const [comments, setComments] = useState(schedule?.comments || []);
    const [likes, setLikes] = useState(schedule?.likes || []);
    const [newComment, setNewComment] = useState('');

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
        try {
            const response = await axios.post(`${url}/api/schedule/user/updateLikeComment`, {
                scheduleId: schedule._id,
                userId: user._id,
                action: isLike() ? 'unlike' : 'like',
            }, { headers: { token } });
            if (response.data.success) {
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
        if (!newComment.trim()) return;
        try {
            const response = await axios.post(`${url}/api/schedule/user/updateLikeComment`, {
                scheduleId: schedule._id,
                userId: user._id,
                action: 'comment',
                content: newComment,
            }, { headers: { token } });
            if (response.data.success) {
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
        return likes.some(like => like.idUser === user._id);
    };


    return (
        <>
            <PostActions handleLike={handleLike} likeCount={likes.length} commentCount={comments.length} replyCount={handleReplyCount(comments)} isLike={isLike()} postUrl={`http://localhost:5173//schedule-view/${schedule._id}`} />
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
                />
                <FaRegPaperPlane onClick={handleNewCommentSubmit} className="send-icon" />
            </div>
        </>
    );
};

const CommentContent = ({ comment, scheduleId, token, updateComments, url, user }) => {
    const [replyText, setReplyText] = useState('');
    const [showReplies, setShowReplies] = useState(false);
    const [replyInputVisible, setReplyInputVisible] = useState(false);
    const handleReplySubmit = async () => {
        if (!replyText.trim()) return;
        try {
            const response = await axios.post(`${url}/api/schedule/user/updateLikeComment`, {
                scheduleId,
                userId: user._id,
                action: 'reply',
                content: replyText,
                commentId: comment._id,
            }, { headers: { token } });
            if (response.data.success) {
                updateComments(response.data.schedule.comments);
                setReplyText('');
                setReplyInputVisible(false);
            } else {
                console.error("Error submitting reply:", response.data.message);
            }
        } catch (error) {
            console.error("Error submitting reply:", error);
        }
    };


    return (
        <div className="comment-container">
            <div className="user-avatar">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDLxQhCB-aYA9ieFW-Rkd0TMKzG6FNflehVA&s" alt="avatar" className="avatar-image" />
            </div>
            <div className="comment-content">
                <div className="comment-text">
                    <span className="user-name">{comment.userName}</span>
                    <p>{comment.content}</p>
                </div>
                <div className="comment-actions">
                    <span>{formatDate(comment.createdAt)}</span>
                    <span className="link" onClick={() => setReplyInputVisible(!replyInputVisible)}>Reply</span>
                </div>

                {comment.replies.length > 0 && (
                    <div className="view-replies-container">
                        <span className="view-replies" onClick={() => setShowReplies(!showReplies)}>
                            {showReplies ? 'Hide replies' : `View ${comment.replies.length} replies`}
                        </span>
                    </div>
                )}

                {showReplies && comment.replies.map((reply) => (
                    <div key={reply._id} className="reply-container">
                        <div className="user-avatar">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDLxQhCB-aYA9ieFW-Rkd0TMKzG6FNflehVA&s" alt="avatar" className="avatar-image" />
                        </div>
                        <div>
                            <div className="reply-content">
                                <span className="reply-user-name">{reply.userName}</span>
                                <p className="reply-text">{reply.content}</p>
                            </div>
                            <div className="comment-actions">
                                <span>{formatDate(reply.createdAt)}</span>
                                <span className="link" onClick={() => setReplyInputVisible(!replyInputVisible)}>Reply</span>
                            </div>
                        </div>
                    </div>
                ))}

                {replyInputVisible && (
                    <div className="reply-input-container">
                        <input
                            type="text"
                            placeholder="Viết câu trả lời..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="input-comment-field"
                        />
                        <FaRegPaperPlane onClick={handleReplySubmit} className="send-icon" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Comment;