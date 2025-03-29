import { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaHeart, FaPaperPlane, FaRegHeart, FaReply, FaTimes } from 'react-icons/fa';
import { StoreContext } from '../../../Context/StoreContext';
import axios from 'axios';
import './Comments.css';

const Comments = ({ videoId, commentsData = [], onCommentAdded }) => {
  const { url, token, user } = useContext(StoreContext);
  const [comments, setComments] = useState(commentsData);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [likedComments, setLikedComments] = useState([]);
  const [likedReplies, setLikedReplies] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  
  // Cập nhật comments khi commentsData thay đổi
  useEffect(() => {
    setComments(commentsData);
  }, [commentsData]);
  
  // Khởi tạo danh sách comment và reply đã like
  useEffect(() => {
    if (user && comments.length > 0) {
      // Lấy danh sách ID của các comment đã được like bởi user hiện tại
      const likedCommentsIds = comments
        .filter(comment => comment.likes && Array.isArray(comment.likes) && comment.likes.includes(user._id))
        .map(comment => comment._id);
      
      setLikedComments(likedCommentsIds);
      
      // Lấy danh sách ID của các reply đã được like bởi user hiện tại
      const likedRepliesIds = [];
      comments.forEach(comment => {
        if (comment.replies && Array.isArray(comment.replies)) {
          comment.replies.forEach(reply => {
            if (reply.likes && Array.isArray(reply.likes) && reply.likes.includes(user._id)) {
              likedRepliesIds.push(reply._id);
            }
          });
        }
      });
      
      setLikedReplies(likedRepliesIds);
    }
  }, [comments, user]);
  
  // Thêm bình luận mới
  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;
    
    try {
      setLoading(true);
      const response = await axios.post(
        `${url}/api/shortvideo/videos/${videoId}/comment`,
        { text: newComment },
        { headers: { token } }
      );
      
      if (response.data.success) {
        // Tạo đối tượng comment mới
        const newCommentObj = {
          _id: response.data.commentId,
          userId: {
            _id: user._id,
            name: user.name,
            avatar: user.avatar
          },
          text: newComment,
          createdAt: new Date().toISOString(),
          likes: [],
          replies: []
        };
        
        // Cập nhật state local
        setComments([newCommentObj, ...comments]);
        setNewComment('');
        
        // Gọi callback để cập nhật comments trong component cha
        if (onCommentAdded) {
          onCommentAdded(videoId, newCommentObj);
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý khi nhấn Enter để gửi bình luận
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (replyingTo) {
        handleAddReply();
      } else {
        handleAddComment();
      }
    }
  };
  
  // Xử lý like comment
  const handleLikeComment = async (commentId) => {
    if (!user) return;
    
    try {
      // Cập nhật UI ngay lập tức
      const isLiked = likedComments.includes(commentId);
      
      if (isLiked) {
        setLikedComments(likedComments.filter(id => id !== commentId));
        
        // Cập nhật state comments để giảm số lượng like
        setComments(comments.map(comment => {
          if (comment._id === commentId && comment.likes) {
            return {
              ...comment,
              likes: comment.likes.filter(id => id !== user._id)
            };
          }
          return comment;
        }));
      } else {
        setLikedComments([...likedComments, commentId]);
        
        // Cập nhật state comments để tăng số lượng like
        setComments(comments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              likes: [...(comment.likes || []), user._id]
            };
          }
          return comment;
        }));
      }
      
      // Gửi request đến server
      await axios.post(
        `${url}/api/shortvideo/videos/${videoId}/comment/${commentId}/like`,
        {},
        { headers: { token } }
      );
      
    } catch (error) {
      console.error('Error liking comment:', error);
      // Hoàn tác thay đổi UI nếu có lỗi
      const isLiked = likedComments.includes(commentId);
      
      if (isLiked) {
        setLikedComments(likedComments.filter(id => id !== commentId));
      } else {
        setLikedComments([...likedComments, commentId]);
      }
    }
  };
  
  // Xử lý trả lời comment
  const handleReplyClick = (commentId, userName) => {
    setReplyingTo({ commentId, userName });
    setReplyText('');
  };
  
  // Hủy trả lời
  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };
  
  // Thêm trả lời
  const handleAddReply = async () => {
    if (!replyText.trim() || !user) return;
    
    try {
      setLoading(true);
      const response = await axios.post(
        `${url}/api/shortvideo/videos/${videoId}/comment/${replyingTo.commentId}/reply`,
        { text: replyText },
        { headers: { token } }
      );
      
      if (response.data.success) {
        // Tạo đối tượng reply mới
        const newReply = {
          _id: response.data.replyId,
          userId: {
            _id: user._id,
            name: user.name,
            avatar: user.avatar
          },
          text: replyText,
          createdAt: new Date().toISOString(),
          likes: []
        };
        
        // Cập nhật state local
        const updatedComments = comments.map(comment => {
          if (comment._id === replyingTo.commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply]
            };
          }
          return comment;
        });
        
        setComments(updatedComments);
        setReplyText('');
        setReplyingTo(null);
        
        // Cập nhật comments trong component cha nếu cần
        if (onCommentAdded) {
          // Tìm comment đã cập nhật
          const updatedComment = updatedComments.find(c => c._id === replyingTo.commentId);
          if (updatedComment) {
            // Gọi callback để cập nhật comment trong component cha
            onCommentAdded(videoId, updatedComment, true);
          }
        }
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý like reply
  const handleLikeReply = async (commentId, replyId) => {
    if (!user) return;
    
    try {
      // Cập nhật UI ngay lập tức
      const isLiked = likedReplies.includes(replyId);
      
      if (isLiked) {
        setLikedReplies(likedReplies.filter(id => id !== replyId));
        
        // Cập nhật state comments để giảm số lượng like
        setComments(comments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: comment.replies.map(reply => {
                if (reply._id === replyId && reply.likes) {
                  return {
                    ...reply,
                    likes: reply.likes.filter(id => id !== user._id)
                  };
                }
                return reply;
              })
            };
          }
          return comment;
        }));
      } else {
        setLikedReplies([...likedReplies, replyId]);
        
        // Cập nhật state comments để tăng số lượng like
        setComments(comments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: comment.replies.map(reply => {
                if (reply._id === replyId) {
                  return {
                    ...reply,
                    likes: [...(reply.likes || []), user._id]
                  };
                }
                return reply;
              })
            };
          }
          return comment;
        }));
      }
      
      // Gửi request đến server
      await axios.post(
        `${url}/api/shortvideo/videos/${videoId}/comment/${commentId}/reply/${replyId}/like`,
        {},
        { headers: { token } }
      );

      
      
    } catch (error) {
      console.error('Error liking reply:', error);
      // Hoàn tác thay đổi UI nếu có lỗi
      const isLiked = likedReplies.includes(replyId);
      
      if (isLiked) {
        setLikedReplies(likedReplies.filter(id => id !== replyId));
      } else {
        setLikedReplies([...likedReplies, replyId]);
      }
    }
  };
  
  // Format thời gian bình luận
  const formatCommentTime = (timestamp) => {
    const commentDate = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - commentDate) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h`;
    } else if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)}d`;
    } else {
      return commentDate.toLocaleDateString();
    }
  };
  
  return (
    <div className="comments-content">
      {loading && comments.length === 0 ? (
        <div className="comments-loading">
          <div className="spinner"></div>
          <p>Đang xử lý...</p>
        </div>
      ) : (
        <>
          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="no-comments">
                <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment._id} className="comment-item">
                  <img 
                    src={comment.userId.avatar || "https://via.placeholder.com/40"} 
                    alt="User avatar" 
                    className="comment-avatar"
                  />
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-username">{comment.userId.name}</span>
                      <span className="comment-time">{formatCommentTime(comment.createdAt)}</span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                    <div className="comment-actions">
                      <button 
                        className={`like-button ${likedComments.includes(comment._id) ? 'liked' : ''}`}
                        onClick={() => handleLikeComment(comment._id)}
                      >
                        {likedComments.includes(comment._id) ? <FaHeart /> : <FaRegHeart />}
                        <span>{comment.likes?.length || 0}</span>
                      </button>
                      <button 
                        className="reply-button"
                        onClick={() => handleReplyClick(comment._id, comment.userId.name)}
                      >
                        <FaReply /> Trả lời
                      </button>
                    </div>
                    
                    {/* Hiển thị các trả lời */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="comment-replies">
                        {comment.replies.map(reply => (
                          <div key={reply._id} className="reply-item">
                            <img 
                              src={reply.userId.avatar || "https://via.placeholder.com/30"} 
                              alt="User avatar" 
                              className="reply-avatar"
                            />
                            <div className="reply-content">
                              <div className="reply-header">
                                <span className="reply-username">{reply.userId.name}</span>
                                <span className="reply-time">{formatCommentTime(reply.createdAt)}</span>
                              </div>
                              <p className="reply-text">{reply.text}</p>
                              <div className="reply-actions">
                                <button 
                                  className={`like-button ${likedReplies.includes(reply._id) ? 'liked' : ''}`}
                                  onClick={() => handleLikeReply(comment._id, reply._id)}
                                >
                                  {likedReplies.includes(reply._id) ? <FaHeart /> : <FaRegHeart />}
                                  <span>{reply.likes?.length || 0}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Form trả lời comment */}
          {replyingTo && (
            <div className="reply-input-container">
              <div className="replying-to">
                <span>Đang trả lời {replyingTo.userName}</span>
                <button className="cancel-reply" onClick={handleCancelReply}>
                  <FaTimes />
                </button>
              </div>
              <div className="reply-input-wrapper">
                <input
                  type="text"
                  placeholder="Thêm trả lời..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="reply-input"
                />
                <button 
                  className="send-reply-button"
                  onClick={handleAddReply}
                  disabled={!replyText.trim()}
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          )}
          
          {/* Form thêm comment mới */}
          {!replyingTo && (
            <div className="comment-input-container">
              <input
                type="text"
                placeholder="Thêm bình luận..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={handleKeyPress}
                className="comment-input"
              />
              <button 
                className="send-comment-button"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                <FaPaperPlane />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

Comments.propTypes = {
  videoId: PropTypes.string.isRequired,
  commentsData: PropTypes.array,
  onCommentAdded: PropTypes.func
};

export default Comments; 