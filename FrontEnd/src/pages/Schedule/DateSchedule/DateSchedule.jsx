const handleActivityChange = (updatedActivities) => {
  setInforSchedule(prev => {
    const newSchedule = {
      ...prev,
      activities: updatedActivities
    };

    // Emit sự kiện để update real-time
    if (socket.current) {
      socket.current.emit('updateActivities', {
        scheduleId: inforSchedule._id,
        activities: updatedActivities
      });
    }

    return newSchedule;
  });
}; 