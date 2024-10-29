import PropTypes from 'prop-types';

const ImageGallery = ({ 
    images = [], 
    onImageUpload, 
    onDeleteImage, 
    onDeleteNewImage, 
    title, 
    url, 
    newImagePreviews = [] ,
    isEditing 
}) => {
    return (
        <div className="image-gallery-container">
            <h2>{title}</h2>

            {images.length > 0 && (
                <div className="existing-image-gallery">
                    {isEditing && (
                        <h4>Existing Images:</h4>
                    )}
                    <div className="image-gallery">
                                    
                        {images.map((image, index) => (
                            <div key={index} className="image-container">
                                <img src={`${url}/images/${image}`} alt={`Image ${index + 1}`} />
                                {onDeleteImage && (
                                    <button type="button" onClick={() => onDeleteImage(index)} className="delete-button">
                                        x
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
        
            {isEditing && 
            <div>
           
                <label>
                    Upload New Images:
                    <input
                        className="file-upload"
                        type="file"
                        name="newImages"
                        accept="image/*"
                        multiple
                        onChange={onImageUpload}
                    />
                </label>

                {newImagePreviews.length > 0 && (
                    <div className="new-image-gallery">
                        <h4>New Images:</h4>
                        <div className="image-gallery">
                            {newImagePreviews.map((preview, index) => (
                                <div key={index} className="image-container">
                                    <img src={preview} alt={`New Image ${index + 1}`} />
                                    <button type="button" onClick={() => onDeleteNewImage(index)} className="delete-button">
                                        x
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            }
            
        </div>
    );
};

// Define prop types
ImageGallery.propTypes = {
    images: PropTypes.array.isRequired,
    onImageUpload: PropTypes.func,
    onDeleteImage: PropTypes.func,
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    newImagePreviews: PropTypes.array,
    onDeleteNewImage: PropTypes.func,
};

export default ImageGallery;
