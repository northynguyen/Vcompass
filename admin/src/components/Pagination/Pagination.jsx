import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
    const pageNumbers = [];
    
    // Create array of page numbers to display
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    // Calculate start and end item numbers
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="pagination-container">
            <div className="pagination-info">
                Hiển thị {startItem}-{endItem} trong số {totalItems} địa điểm
            </div>
            
            <div className="pagination-controls">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-button"
                >
                    Trước
                </button>

                {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => onPageChange(number)}
                        className={`pagination-button ${currentPage === number ? 'active' : ''}`}
                    >
                        {number}
                    </button>
                ))}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                >
                    Sau
                </button>
            </div>
        </div>
    );
};

export default Pagination; 