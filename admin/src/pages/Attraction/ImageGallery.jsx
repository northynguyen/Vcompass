import React from 'react';
import PropTypes from 'prop-types';

const ImageGallery = ({ images, onImageUpload, onDeleteImage, title }) => (
    <div>
        <h2>{title}</h2>
        {onImageUpload && <input type="file" multiple onChange={onImageUpload} className="file-upload" />}
        <div className="image-gallery">
            {images.map((image, index) => (
                <div key={index} className="image-container">
                    <img src={image} alt={`Image ${index + 1}`} />
                    {onDeleteImage && <button type="button" onClick={() => onDeleteImage(index)} className="delete-button">Xóa</button>}
                </div>
            ))}
        </div>
    </div>
);

ImageGallery.propTypes = {
    images: PropTypes.array.isRequired,
    onImageUpload: PropTypes.func,
    onDeleteImage: PropTypes.func,
    title: PropTypes.string.isRequired,
};

export default ImageGallery;
