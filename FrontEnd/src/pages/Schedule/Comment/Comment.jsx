import React from 'react';
import "./Comment.css";

import { FaCommentAlt, FaHeart, FaRegPaperPlane, FaShare } from 'react-icons/fa';

export const PostActions = () => {
    return (
        <div className="post-actions-container">
            <div className="post-action like-action">
                <FaHeart className="post-action-icon" />
                <span>Yêu thích</span>
            </div>
            <div className="post-action comment-action">
                <FaCommentAlt className="post-action-icon" />
                <span>Bình luận</span>
            </div>
            <div className="post-action share-action">
                <FaShare className="post-action-icon" />
                <span>Chia sẻ</span>
            </div>
        </div>
    );
};
const Comment = () => {
    return (
        <>
            <PostActions />
            <div className="comment-large-container">
                <CommentContent />
                <CommentContent />
                <CommentInput />
            </div>
        </>
    );
};

const CommentContent = () => {
    return (
        <div className="comment-container">
            <div className="user-avatar">
                {/* Avatar Images */}
                <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDLxQhCB-aYA9ieFW-Rkd0TMKzG6FNflehVA&s" // replace with the avatar image path
                    alt="avatar1"
                    className="avatar-image"
                />
            </div>
            <div className="comment-content">
                <div className="comment-text">
                    <span className="user-name">Monkey D Luffy</span>
                    <p>Lịch trình tuyệt vời lắm, đã thử và thành công</p>
                </div>
                <div className="comment-actions">
                    <span>15 giờ trước</span>
                    <span className="link">Reply</span>
                </div>
            </div>
        </div>
    );
}

export const CommentInput = () => {
    return (
        <div className="comment-input-container">
            <img
                src="https://scontent.fsgn14-1.fna.fbcdn.net/v/t39.30808-1/464155622_1188059512260875_297674526356158310_n.jpg?stp=dst-jpg_s200x200&_nc_cat=106&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=a9yVdGwCyZAQ7kNvgGsY2Kk&_nc_zt=24&_nc_ht=scontent.fsgn14-1.fna&_nc_gid=AwSeMzuls3EsmM-dPVyK2Lz&oh=00_AYBt5tIfIRK5133SMilzInm_T_6MKs1dx9GaaX1YeErIFQ&oe=67338000" // Replace with the user's avatar path
                alt="User Avatar"
                className="user-avatar"
            />
            <input
                type="text"
                placeholder="Bình luận dưới tên Công Thiện"
                className="input-field"
            />
            <FaRegPaperPlane className="send-icon" />
        </div>
    );
};
export default Comment