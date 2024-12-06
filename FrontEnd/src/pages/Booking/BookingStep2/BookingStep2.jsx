import React, { useEffect, useState } from 'react';
import './BookingStep2.css';
import { useNavigate, useLocation } from 'react-router-dom';

const BookingStep2 = ({ dataSend, roomInfo, bookingInfo }) => {
  const navigate = useNavigate();
  const [sendData, setSendData] = useState(dataSend || {});
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === 'checkbox' ? checked : value;

    setSendData((prevData) => ({
      ...prevData,
      bookingInfo: { ...prevData.bookingInfo, [name]: updatedValue },
    }));

    // Clear error for the specific field when user starts typing
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['firstName', 'lastName', 'email', 'country', 'phoneNumber'];
    
    // Check required fields
    requiredFields.forEach((field) => {
      if (!sendData.bookingInfo?.[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    // Email format validation
    if (sendData.bookingInfo?.email && !/\S+@\S+\.\S+/.test(sendData.bookingInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      navigate('/booking-process/finalstep', { state: { step: 3, dataSend: sendData } });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    else {
      // Nếu có lỗi, focus vào phần đầu của form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="right-panel">
      <div className="section-box"> 
        <h2>Enter your details</h2>
        <p className="note">Almost done! Just fill in the <span className="required">*</span> required info</p>

        <form >
          <div className="form-group">
            <label>First name <span className="required">*</span></label>
            <input type="text" placeholder="First name" name="firstName" onChange={handleChange} />
            {errors.firstName && <span className="error">{errors.firstName}</span>}
          </div>
          <div className="form-group">
            <label>Last name <span className="required">*</span></label>
            <input type="text" placeholder="Last name" name="lastName" onChange={handleChange} />
            {errors.lastName && <span className="error">{errors.lastName}</span>}
          </div>
          <div className="form-group">
            <label>Email address <span className="required">*</span></label>
            <input type="email" placeholder="Email address" name="email" onChange={handleChange} />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Country/region <span className="required">*</span></label>
            <select name="country" onChange={handleChange}>
              <option value="">Select a country</option>
              <option value="Vietnam">Vietnam</option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
            </select>
            {errors.country && <span className="error">{errors.country}</span>}
          </div>
          <div className="form-group">
            <label>Phone number <span className="required">*</span></label>
            <input type="text" placeholder="Phone number" name="phoneNumber" onChange={handleChange} />
            {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
          </div>
        </form>
      </div>

      {/* Good to know section */}
      <div className="section-box good-to-know">
        <h2>Good to know:</h2>
        <ul>
          <li>No credit card needed</li>
          <li>Stay flexible: You can cancel for free at any time, so lock in this great price today.</li>
          <li>No payment is required to secure this booking. You'll pay during your stay.</li>
        </ul>
      </div>

      {/* Room Information Section */}
      <div className="section-box room-info">
        <h2>{roomInfo.nameRoomType || "Standard Double Room"}</h2>
        <p><strong>Free cancellation anytime</strong></p>
        <p>Guests: <strong>{roomInfo.numPeople?.adult || 1} adult</strong>, <strong>{roomInfo.numPeople?.child || 0} child</strong></p>
        <p>Exceptionally clean rooms - 8.5</p>
        <p>No smoking</p>
        <p>Room size: <strong>{roomInfo.roomSize || "N/A"} m²</strong></p>
        <p>Features: <strong>{roomInfo.amenities?.join(", ") || "N/A"}</strong></p>
      </div>

      {/* Genius Benefits Section */}
      <div className="section-box genius-benefits">
        <h2>Your Genius benefits</h2>
        <p><strong>10% discount</strong></p>
        <p>You're getting a 10% discount on the price of this option before taxes and charges are applied.</p>
      </div>

      {/* Special Requests Section */}
      <div className="form-group">
        <label>Special requests</label>
        <textarea name="specialRequests" placeholder="Please write your requests in English. (optional)" onChange={handleChange}></textarea>
      </div>

      {/* Arrival Time Section */}
      <div className="form-group">
        <label>Your arrival time</label>
        <select name="arrivalTime" onChange={handleChange}>
          <option>Please select</option>
          <option value="14:00">14:00</option>
          <option value="15:00">15:00</option>
          <option value="16:00">16:00</option>
        </select>
        <p className="note">Your room will be ready for check-in at 14:00</p>
      </div>

      <button className="button" type="submit" onClick={(e) => handleSubmit(e)}>
              Next: Final details
      </button>
    </div>
  );
};

export default BookingStep2;

// const BookingStep2 = ({ dataSend, roomInfo, bookingInfo }) => {
//   const navigate = useNavigate();
//   const [sendData, setSendData] = useState(dataSend || {}); // Initializing sendData with dataSend if provided

//   // Handles changes for form inputs, updates bookingInfo inside sendData
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     const updatedValue = type === 'checkbox' ? checked : value;

//     setSendData((prevData) => ({
//       ...prevData,
//       bookingInfo: { ...prevData.bookingInfo, [name]: updatedValue },
//     }));
//   };
  
//   const handleSubmit = (e) => {
//     e.preventDefault();
//       navigate('/booking-process/finalstep', { state: { step: 3, dataSend: sendData } });
//   };

//   return (
//     <div className="right-panel">
//       <div className="section-box"> 
//         <h2>Enter your details</h2>
//         <p className="note">Almost done! Just fill in the <span className="required">*</span> required info</p>

//         <form action="" onSubmit={handleSubmit} >
//           <div className="form-group">
//             <label>First name <span className="required">*</span></label>
//             <input type="text" placeholder="First name" name="firstName" onChange={handleChange} />
//           </div>
//           <div className="form-group">
//             <label>Last name <span className="required">*</span></label>
//             <input type="text" placeholder="Last name" name="lastName" onChange={handleChange} />
//           </div>
//           <div className="form-group">
//             <label>Email address <span className="required">*</span></label>
//             <input type="email" placeholder="Email address" name="email" onChange={handleChange} />
//           </div>
//           <div className="form-group">
//             <label>Country/region <span className="required">*</span></label>
//             <select name="country" onChange={handleChange}>
//               <option value="Vietnam">Vietnam</option>
//               <option value="US">United States</option>
//               <option value="UK">United Kingdom</option>
//             </select>
//           </div>
//           <div className="form-group">
//             <label>Phone number <span className="required">*</span></label>
//             <input type="text" placeholder="Phone number" name="phoneNumber" onChange={handleChange} />
//           </div>
//           <div className="checkbox-group">
//             <input type="checkbox" name="paperlessConfirmation" onChange={handleChange} />
//             <label>Yes, I’d like free paperless confirmation (recommended)</label>
//           </div>
//           <div className="radio-group">
//             <label>Who are you booking for? (optional)</label>
//             <div>
//               <input type="radio" name="bookingFor" value="mainGuest" onChange={handleChange} />
//               <label>I am the main guest</label>
//               <input type="radio" name="bookingFor" value="someoneElse" onChange={handleChange} />
//               <label>Booking is for someone else</label>
//             </div>
//           </div>
//           <div className="radio-group">
//             <label>Are you travelling for work? (optional)</label>
//             <div>
//               <input type="radio" name="travelForWork" value="yes" onChange={handleChange} />
//               <label>Yes</label>
//               <input type="radio" name="travelForWork" value="no" onChange={handleChange} />
//               <label>No</label>
//             </div>
//           </div>
//           <button className="button" type="submit" >
//               Next: Final details
//           </button>
//         </form>
//       </div>

//       {/* Good to know section */}
//       <div className="section-box good-to-know">
//         <h2>Good to know:</h2>
//         <ul>
//           <li>No credit card needed</li>
//           <li>Stay flexible: You can cancel for free at any time, so lock in this great price today.</li>
//           <li>No payment is required to secure this booking. You'll pay during your stay.</li>
//         </ul>
//       </div>

//       {/* Room Information Section */}
//       <div className="section-box room-info">
//         <h2>{roomInfo.nameRoomType || "Standard Double Room"}</h2>
//         <p><strong>Free cancellation anytime</strong></p>
//         <p>Guests: <strong>{roomInfo.numPeople?.adult || 1} adult</strong>, <strong>{roomInfo.numPeople?.child || 0} child</strong></p>
//         <p>Exceptionally clean rooms - 8.5</p>
//         <p>No smoking</p>
//         <p>Room size: <strong>{roomInfo.roomSize || "N/A"} m²</strong></p>
//         <p>Features: <strong>{roomInfo.amenities?.join(", ") || "N/A"}</strong></p>
//       </div>

//       {/* Genius Benefits Section */}
//       <div className="section-box genius-benefits">
//         <h2>Your Genius benefits</h2>
//         <p><strong>10% discount</strong></p>
//         <p>You're getting a 10% discount on the price of this option before taxes and charges are applied.</p>
//       </div>

//       {/* Special Requests Section */}
//       <div className="form-group">
//         <label>Special requests</label>
//         <textarea name="specialRequests" placeholder="Please write your requests in English. (optional)" onChange={handleChange}></textarea>
//       </div>

//       {/* Arrival Time Section */}
//       <div className="form-group">
//         <label>Your arrival time</label>
//         <select name="arrivalTime" onChange={handleChange}>
//           <option>Please select</option>
//           <option value="14:00">14:00</option>
//           <option value="15:00">15:00</option>
//           <option value="16:00">16:00</option>
//         </select>
//         <p className="note">Your room will be ready for check-in at 14:00</p>
//       </div>

//       <button className="button" type="submit" onSubmit={(e) => handleSubmit(e)}>
//               Next: Final details
//       </button>
//     </div>
//   );
// };

// export default BookingStep2;
