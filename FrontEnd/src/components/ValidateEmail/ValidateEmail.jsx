import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { StoreContext } from "../../Context/StoreContext";
import axios from 'axios';

const ValidateEmail = () => {
  const [scheduleData, setScheduleData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user,url } = useContext(StoreContext);
  console.log(user);
  useEffect(() => {
    const validateToken = async () => {
      console.log("Validating token...");
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get('token');
      const scheduleId = queryParams.get('id');
      console.log(token);
      console.log(scheduleId);
      if (!token) {
        alert('Invalid token.');
        return;
      }

      let decoded;
      try {
        decoded = jwtDecode(token);
      } catch (error) {
        alert('Invalid token format.');
        return;
      }
      const user = JSON.parse(localStorage.getItem('user'));
      if (!decoded.email || decoded.email !== user.email) {

        alert( decoded.email + ' ' + user.email);
        return;
      }

      try {
        // Fetch schedule data
        const res = await axios.get(`${url}/api/schedule/${scheduleId}`);
        
        if (res.data.success) {
          const schedule = res.data.schedule;

          if (schedule.idInvitee.some(invitee => invitee._id.toString() === user._id.toString())) {
            console.log('You are already an invitee.');
            navigate(`/schedule-edit/${scheduleId}`);
            return;
          }

          // Cập nhật danh sách invitee
          const newSchedule = {
            ...schedule,
            idInvitee: [...schedule.idInvitee, user._id],
          };

          // Gửi request cập nhật
          const updateRes = await axios.put(`${url}/api/schedule/update/${scheduleId}`, newSchedule);

          if (updateRes.data.success ) {
            console.log('Invitee added successfully.');
            navigate(`/schedule-edit/${scheduleId}`);
          } else {
            console.alert('Failed to update schedule.');
          }
        } else {
            console.error(res);
        }
      } catch (error) {
        console.error(error);
      }
    };

    validateToken();
  }, [location, navigate, user]);

  return (
    <div className="validate-email" style={{ minHeight: '90vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <p>Validating your email...</p>
    </div>
  );
};

export default ValidateEmail;
