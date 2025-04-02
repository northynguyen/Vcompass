// Middleware xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Xử lý lỗi Multer
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }
  
  // Xử lý lỗi Cloudinary
  if (err.http_code) {
    return res.status(err.http_code).json({
      success: false,
      message: err.message,
      name: err.name
    });
  }
  
  // Lỗi khác
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
}); 