export const setupScheduleSocket = (io) => {
  // Lưu trữ vị trí chuột của người dùng
  const userCursors = new Map();
  // Lưu trữ thời gian hoạt động cuối cùng của người dùng
  const userLastActive = new Map();

  io.on('connection', (socket) => {
    socket.on('joinSchedule', ({ scheduleId, user }) => {
      socket.join(`schedule:${scheduleId}`);
      // Khởi tạo cursor cho user mới
      userCursors.set(socket.id, {
        userId: user._id,
        name: user.name,
        avatar: user.avatar,
        x: 0,
        y: 0,
        lastActive: Date.now()
      });
      
      // Gửi danh sách cursors hiện tại cho user mới
      const cursors = Array.from(userCursors.values());
      socket.emit('cursorList', cursors);
      
      // Thông báo cho các user khác về user mới
      socket.to(`schedule:${scheduleId}`).emit('userJoined', {
        userId: user._id,
        name: user.name,
        avatar: user.avatar
      });
    });

    // Cập nhật vị trí chuột
    socket.on('cursorMove', ({ scheduleId, x, y }) => {
      const userCursor = userCursors.get(socket.id);
      if (userCursor) {
        userCursor.x = x;
        userCursor.y = y;
        userCursor.lastActive = Date.now();
        userLastActive.set(socket.id, Date.now());
        
        socket.to(`schedule:${scheduleId}`).emit('cursorUpdate', {
          userId: userCursor.userId,
          name: userCursor.name,
          avatar: userCursor.avatar,
          x,
          y
        });
      }
    });

    // Xử lý khi có thay đổi về activities
    socket.on('updateActivities', (data) => {
      const { scheduleId, activities } = data;
      socket.to(`schedule:${scheduleId}`).emit('activitiesUpdated', activities);
    });

    // Xử lý khi có thay đổi về thông tin schedule
    socket.on('updateScheduleInfo', (data) => {
      const { scheduleId, scheduleInfo } = data;
      socket.to(`schedule:${scheduleId}`).emit('scheduleInfoUpdated', scheduleInfo);
    });

    // Xử lý khi có thay đổi về chi phí
    socket.on('updateExpenses', (data) => {
      const { scheduleId, expenses } = data;
      socket.to(`schedule:${scheduleId}`).emit('expensesUpdated', expenses);
    });

    socket.on('leaveSchedule', (scheduleId) => {
      const userCursor = userCursors.get(socket.id);
      if (userCursor) {
        socket.to(`schedule:${scheduleId}`).emit('userLeft', userCursor.userId);
        userCursors.delete(socket.id);
        userLastActive.delete(socket.id);
      }
      socket.leave(`schedule:${scheduleId}`);
    });

    socket.on('disconnect', () => {
      const userCursor = userCursors.get(socket.id);
      if (userCursor) {
        io.emit('userLeft', userCursor.userId);
        userCursors.delete(socket.id);
        userLastActive.delete(socket.id);
      }
    });
  });

  // Kiểm tra người dùng không hoạt động mỗi 5 giây
  setInterval(() => {
    const now = Date.now();
    userLastActive.forEach((lastActive, socketId) => {
      if (now - lastActive > 5000) { // 5 giây không hoạt động
        const userCursor = userCursors.get(socketId);
        if (userCursor) {
          io.emit('userInactive', userCursor.userId);
        }
      }
    });
  }, 5000);
}; 