import fetch from 'node-fetch';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import userModel from '../models/user.js';
import partnerModel from '../models/partner.js';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
dotenv.config(); // Load environment variables from .env file

const generateRandomPassword = (length) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

// Hàm gửi email
const sendEmail = async (chuDe, noiDungText, noiDungHTML, emailNguoiNhan) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // dùng TLS (STARTTLS)
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_PASS,
    },
  });

  const mailOptions = {
    from: process.env.BREVO_SENDER,
    to: emailNguoiNhan,
    subject: chuDe,
    text: noiDungText,
    html: noiDungHTML,
  };

  console.log(`Đang gửi email đến: ${emailNguoiNhan}`);
  await transporter.sendMail(mailOptions);
};

const generateUserBookingEmailContent = (userName, bookingDetails) => `
<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
  <div style="background-color: #007bff; color: #fff; padding: 20px; text-align: center;">
    <h2 style="margin: 0;">🎉 Xác Nhận Đặt Phòng Thành Công!</h2>
  </div>
  <div style="padding: 20px;">
    <p>Xin chào <strong>${userName}</strong>,</p>
    <p>Chúc mừng bạn đã đặt phòng thành công. Dưới đây là chi tiết đặt phòng của bạn:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>🏨 Khách sạn:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${bookingDetails.accommodationName}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>🛏️ Phòng:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${bookingDetails.roomName}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>📅 Ngày nhận phòng:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${bookingDetails.checkInDate}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>📅 Ngày trả phòng:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${bookingDetails.checkOutDate}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>👨‍👩‍👧‍👦 Số khách:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${bookingDetails.numberOfGuests.adult} người lớn - ${bookingDetails.numberOfGuests.child} trẻ em</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>💰 Tổng tiền:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"> ${bookingDetails.totalAmount.toLocaleString('vi-VN', { useGrouping: true })} VND VND</td>
      </tr>
    </table>
    <p>Chúng tôi mong chờ phục vụ bạn!</p>
  </div>
  <div style="background-color: #f8f8f8; padding: 10px; text-align: center; font-size: 14px;">
    <p style="margin: 0;">Cảm ơn bạn đã sử dụng dịch vụ của VCompass.</p>
  </div>
</div>
`;


const generatePartnerBookingEmailContent = (customerName, accommodationName, bookingDetails) => `
<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
  <div style="background-color: #28a745; color: #fff; padding: 20px; text-align: center;">
    <h2 style="margin: 0;">🔔 Đặt Phòng Mới!</h2>
  </div>
  <div style="padding: 20px;">
    <p>Xin chào đối tác,</p>
    <p>Khách hàng <strong>${customerName}</strong> đã đặt phòng tại khách sạn <strong>${accommodationName}</strong>. Dưới đây là chi tiết:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>📅 Ngày nhận phòng:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${bookingDetails.checkInDate}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>📅 Ngày trả phòng:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${bookingDetails.checkOutDate}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>👨‍👩‍👧‍👦 Số khách:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${bookingDetails.numberOfGuests.adult} người lớn - ${bookingDetails.numberOfGuests.child} trẻ em</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>💰 Tổng tiền:</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"> ${bookingDetails.totalAmount.toLocaleString('vi-VN', { useGrouping: true })} VND VND</td>
      </tr>
    </table>
    <p>Cảm ơn bạn đã đồng hành cùng VCompass.</p>
  </div>
</div>
`;

const sendBookingEmails = async (user, partner, accommodation, bookingDetails) => {
  try {
    const userEmailHTML = generateUserBookingEmailContent(user.name, bookingDetails);
    const partnerEmailHTML = generatePartnerBookingEmailContent(user.name, accommodation.name, bookingDetails);

    await Promise.all([
      sendEmail(
        '🎉 Xác Nhận Đặt Phòng Từ VCompass',
        `Xin chào ${user.name},\n\nĐặt phòng của bạn đã được xác nhận:\n${JSON.stringify(bookingDetails, null, 2)}`,
        userEmailHTML,
        user.email
      ),
      sendEmail(
        '🔔 Đặt Phòng Mới Từ VCompass',
        `Khách hàng ${user.name} vừa đặt phòng tại khách sạn ${accommodation.name}:\n${JSON.stringify(bookingDetails, null, 2)}`,
        partnerEmailHTML,
        partner.email
      )
    ]);

    console.log("Emails sent successfully.");
  } catch (error) {
    console.error("Error sending booking emails:", error);
    throw new Error("Failed to send booking emails.");
  }
};


const generateUserCancelEmailContent = (userName, bookingDetails, cancellationReason) => `
<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
  <div style="background-color: #007bff; color: #fff; padding: 20px; text-align: center;">
    <h2 style="margin: 0;">🚫 Xác Nhận Hủy Đặt Phòng</h2>
  </div>
  <div style="padding: 20px;">
    <p>Xin chào <strong>${userName}</strong>,</p>
    <p>Chúng tôi rất tiếc khi biết bạn đã hủy đặt phòng. Dưới đây là thông tin chi tiết:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          <strong>🏨 Khách sạn:</strong>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${bookingDetails.accommodationName}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          <strong>🛏️ Phòng:</strong>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${bookingDetails.roomName}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          <strong>📅 Ngày nhận phòng:</strong>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${bookingDetails.checkInDate}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          <strong>📅 Ngày trả phòng:</strong>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${bookingDetails.checkOutDate}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          <strong>👨‍👩‍👧‍👦 Số khách:</strong>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${bookingDetails.numberOfGuests.adult} người lớn - ${bookingDetails.numberOfGuests.child} trẻ em</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          <strong>💰 Tổng tiền:</strong>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;"> ${bookingDetails.totalAmount.toLocaleString('vi-VN', { useGrouping: true })} VND VND</td>
      </tr>
    </table>
    <p><strong>🎯 Lý do hủy:</strong> ${cancellationReason}</p>
    <p style="text-align: center; margin-top: 20px;">
      <a href="http://localhost:5173/user-service/booking" style="background-color: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Xem chi tiết đặt phòng</a>
    </p>
  </div>
  <div style="background-color: #f8f8f8; padding: 10px; text-align: center; font-size: 14px; color: #555;">
    <p style="margin: 0;">Cảm ơn bạn đã sử dụng VCompass!</p>
    <p style="margin: 0;">Chúng tôi mong được phục vụ bạn trong tương lai.</p>
  </div>
</div>
`;

// Tạo nội dung email hủy đặt phòng cho partner
const generatePartnerCancelEmailContent = (customerName, bookingDetails, cancellationReason) => `
<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
  <div style="background-color: #dc3545; color: #fff; padding: 20px; text-align: center;">
    <h2 style="margin: 0;">❌ Khách Hủy Đặt Phòng</h2>
  </div>
  <div style="padding: 20px;">
    <p>Xin chào đối tác,</p>
    <p>Khách hàng <strong>${customerName}</strong> đã hủy đặt phòng tại khách sạn <strong>${bookingDetails.accommodationName}</strong>. Dưới đây là chi tiết:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          <strong>📅 Ngày nhận phòng:</strong>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${bookingDetails.checkInDate}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          <strong>📅 Ngày trả phòng:</strong>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${bookingDetails.checkOutDate}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          <strong>👨‍👩‍👧‍👦 Số khách:</strong>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${bookingDetails.numberOfGuests.adult} người lớn - ${bookingDetails.numberOfGuests.child} trẻ em</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          <strong>💰 Tổng tiền:</strong>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
            ${bookingDetails.totalAmount.toLocaleString('vi-VN', { useGrouping: true })} VND
        </td>

      </tr>
    </table>
    <p><strong>🎯 Lý do hủy:</strong> ${cancellationReason}</p>
    <p style="text-align: center; margin-top: 20px;">
      <a href="http://localhost:5173/user-service/booking" style="background-color: #dc3545; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Xem chi tiết đặt phòng</a>
    </p>
  </div>
  <div style="background-color: #f8f8f8; padding: 10px; text-align: center; font-size: 14px; color: #555;">
    <p style="margin: 0;">Cảm ơn bạn đã đồng hành cùng VCompass!</p>
    <p style="margin: 0;">Chúng tôi mong muốn tiếp tục hợp tác trong tương lai.</p>
  </div>
</div>
`;

export const sendCancelBookingEmails = async (user, partner, accommodation, bookingDetails, cancellationReason) => {
  try {
    // Gửi email cho user
    const userEmailContentHTML = generateUserCancelEmailContent(user.name, bookingDetails, cancellationReason);
    const userEmailContentText = `
        Xin chào ${user.name},

        Chúng tôi rất tiếc khi biết bạn đã hủy đặt phòng. Dưới đây là thông tin chi tiết:

        - Khách sạn: ${bookingDetails.accommodationName}
        - Phòng: ${bookingDetails.roomTypeName}
        - Ngày nhận phòng: ${bookingDetails.checkInDate}
        - Ngày trả phòng: ${bookingDetails.checkOutDate}
        - Số khách: ${bookingDetails.numberOfGuests.adult} người lớn - ${bookingDetails.numberOfGuests.child} trẻ em
        - Tổng tiền:  ${bookingDetails.totalAmount.toLocaleString('vi-VN', { useGrouping: true })} VND VND

        Lý do hủy: ${cancellationReason}

        Cảm ơn bạn đã sử dụng VCompass. Chúng tôi hy vọng được phục vụ bạn trong tương lai.
        `;

    await sendEmail(
      '🚫 Xác Nhận Hủy Đặt Phòng',
      userEmailContentText,
      userEmailContentHTML,
      user.email
    );

    // Gửi email cho partner
    const partnerEmailContentHTML = generatePartnerCancelEmailContent(user.name, bookingDetails, cancellationReason);
    const partnerEmailContentText = `
        Xin chào đối tác,

        Khách hàng ${user.name} đã hủy đặt phòng tại khách sạn ${accommodation.name}. Dưới đây là chi tiết:

        - Ngày nhận phòng: ${bookingDetails.checkInDate}
        - Ngày trả phòng: ${bookingDetails.checkOutDate}
        - Số khách: ${bookingDetails.numberOfGuests}
        - Tổng tiền: ${bookingDetails.totalAmount.toLocaleString('vi-VN', { useGrouping: true })} VND VND

        Lý do hủy: ${cancellationReason}

        Cảm ơn bạn đã đồng hành cùng VCompass. Chúng tôi mong muốn tiếp tục hợp tác trong tương lai.
        `;

    await sendEmail(
      '❌ Thông Báo Hủy Đặt Phòng',
      partnerEmailContentText,
      partnerEmailContentHTML,
      partner.email
    );

    console.log("Cancellation emails sent successfully.");
  } catch (error) {
    console.error("Error sending cancellation emails:", error.message);
    throw new Error("Failed to send cancellation emails.");
  }
};

const generatePasswordResetContent = (matKhauMoi) => {
  return `
<div style="font-family: Arial, sans-serif; color: #333;">
    <div style="background-color: #e74c3c; padding: 20px; border-radius: 10px; text-align: center;">
        <h2 style="color: #fff; font-size: 24px; margin: 0;">🔐 VCompass - Cập Nhật Mật Khẩu</h2>
        <p style="color: #fff; font-size: 18px; margin-top: 10px;">Mật khẩu mới của bạn đã được tạo thành công!</p>
    </div>
    <div style="margin: 20px 0; padding: 20px; border-radius: 10px; background-color: #f8f8f8;">
        <h3 style="color: #e74c3c; text-align: center; font-size: 20px;">Mật Khẩu Mới Của Bạn</h3>
        <p style="color: #555; font-size: 16px; text-align: center;">
            <strong>${matKhauMoi}</strong>
        </p>
        <p style="color: #555; font-size: 16px; text-align: center;">Vui lòng sử dụng mật khẩu này để đăng nhập và đổi mật khẩu nếu cần thiết.</p>
        <div style="text-align: center; margin-top: 20px;">
            <a href="http://localhost:5173/" style="display: inline-block; padding: 12px 24px; background-color: #e74c3c; color: #fff; text-decoration: none; font-size: 16px; border-radius: 5px;">Đăng Nhập</a>
        </div>
    </div>
    <footer style="margin-top: 20px; text-align: center; color: #777; font-size: 14px;">
        <p>Nếu bạn không yêu cầu đổi mật khẩu, vui lòng liên hệ với chúng tôi ngay lập tức qua email <a href="mailto:support@vcompass.com" style="color: #e74c3c; text-decoration: none;">hỗ trợ khách hàng</a>.</p>
        <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} VCompass. Mọi quyền được bảo lưu.</p>
    </footer>
</div>
  `;
};

// Hàm gửi email đặt lại mật khẩu
const sendPasswordReset = async (req, res) => {
  const chuDe = '🔐 Yêu Cầu Cập Nhật Mật Khẩu Từ VCompass';
  const email = req.body.email;
  const type = req.body.type; // 'user' hoặc 'partner'

  try {
    if (type === 'partner') {
      const doiTac = await partnerModel.findOne({ email: email });
      if (!doiTac) {
        return res.json({ success: false, message: 'Không tìm thấy tài khoản đối tác.' });
      }
      const matKhauMoi = generateRandomPassword(8);
      const salt = await bcrypt.genSalt(10);
      const hashMatKhau = await bcrypt.hash(matKhauMoi, salt);
      await partnerModel.findByIdAndUpdate(doiTac._id, { password: hashMatKhau });

      const noiDungHTML = generatePasswordResetContent(matKhauMoi);
      const noiDungText = `Mật khẩu mới của bạn là: ${matKhauMoi}. Vui lòng đăng nhập và đổi mật khẩu nếu cần.`;
      await sendEmail(chuDe, noiDungText, noiDungHTML, email);

      console.log(`Mật khẩu mới đã được gửi đến email ${email}`);
      res.json({ success: true, message: 'Email đặt lại mật khẩu đã được gửi thành công.' });
    } else if (type === 'user') {
      const nguoiDung = await userModel.findOne({ email: email });
      if (!nguoiDung) {
        return res.json({ success: false, message: 'Không tìm thấy tài khoản người dùng.' });
      }
      const matKhauMoi = generateRandomPassword(8);
      const salt = await bcrypt.genSalt(10);
      const hashMatKhau = await bcrypt.hash(matKhauMoi, salt);
      await userModel.findByIdAndUpdate(nguoiDung._id, { password: hashMatKhau });

      const noiDungHTML = generatePasswordResetContent(matKhauMoi);
      const noiDungText = `Mật khẩu mới của bạn là: ${matKhauMoi}. Vui lòng đăng nhập và đổi mật khẩu nếu cần.`;
      await sendEmail(chuDe, noiDungText, noiDungHTML, email);

      console.log(`Mật khẩu mới đã được gửi đến email ${email}`);
      res.json({ success: true, message: 'Email đặt lại mật khẩu đã được gửi thành công.' });
    }
  } catch (error) {
    console.error(`Gửi email thất bại đến ${email}:`, error);
    res.json({ success: false, message: 'Gửi email đặt lại mật khẩu thất bại.' });
  }
};

const sendEmailTripmate = async (req, res) => {
  const { emails, message, user, scheduleId } = req.body;

  // Kiểm tra đầu vào
  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ success: false, message: 'Danh sách email không hợp lệ.' });
  }

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, message: 'Nội dung email không hợp lệ.' });
  }

  if (!user || !user.name || !user.avatar) {
    return res.status(400).json({ success: false, message: 'Thông tin người dùng không hợp lệ.' });
  }

  try {
    const chuDe = `${user.name} invited you to join the trip plan on VCompass`;

    // Gửi email đến tất cả các địa chỉ trong mảng emails
    await Promise.all(
      emails.map(async (email) => {
        const createToken = (email) => {
          return jwt.sign({ email }, "secret_key", { expiresIn: "1h" });
        };
        // Tạo token hoặc hash từ email
        const token = createToken(email); // Sử dụng JWT hoặc hash

        // Tạo đường dẫn validate-email với token
        const validateEmailLink = `https://vcompass.onrender.com/schedule/validate-email?token=${token}&id=${scheduleId}`;

        // Tạo nội dung HTML cho email
        const noiDungHTML = `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #007bff; color: #fff; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">VCompass</h2>
            </div>
            <div style="padding: 20px;">
              <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <img src="${user.avatar}" alt="User Avatar" style="width: 50px; height: 50px; border-radius: 50%; margin-right: 10px;">
                <span style="font-size: 18px; font-weight: bold;">${user.name} invited you to join the trip plan on VCompass</span>
              </div>
              <p>${message}</p>
              <p>Let's plan the best trip ever!</p>
              <a href="${validateEmailLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; text-align: center;">Open trip plan</a>
            </div>
            <div style="background-color: #f8f8f8; padding: 10px; text-align: center; font-size: 14px;">
              <p style="margin: 0;">Cảm ơn bạn đã sử dụng dịch vụ của VCompass.</p>
            </div>
          </div>
        `;

        // Gửi email
        await sendEmail(chuDe, message, noiDungHTML, email);
      })
    );

    console.log("Emails sent successfully to:", emails);
    res.json({ success: true, message: 'Emails đã được gửi thành công.' });
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).json({ success: false, message: 'Gửi email thất bại.' });
  }
};

const sendEmailBlockStatus = async (req, res) => {
  const { email, reason, admin, isBlocked } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, message: 'Email không hợp lệ.' });
  }

  if (typeof isBlocked !== 'boolean') {
    return res.status(400).json({ success: false, message: 'Trạng thái chặn không hợp lệ.' });
  }

  if (!reason || typeof reason !== 'string') {
    return res.status(400).json({ success: false, message: 'Lý do không hợp lệ.' });
  }

  try {
    const subject = isBlocked
      ? 'VCompass: Tài khoản của bạn đã bị chặn'
      : 'VCompass: Tài khoản của bạn đã được khôi phục';

    const statusColor = isBlocked ? '#dc3545' : '#28a745';
    const statusTitle = isBlocked ? 'Tài khoản của bạn đã bị chặn' : 'Tài khoản của bạn đã được khôi phục';
    const reasonNote = isBlocked
      ? 'Chúng tôi rất tiếc phải thông báo rằng tài khoản của bạn đã bị chặn vì lý do sau:'
      : 'Tài khoản của bạn đã được mở khóa sau khi xem xét lý do sau:';
    const footerMessage = isBlocked
      ? 'Nếu bạn cho rằng đây là sự nhầm lẫn hoặc muốn khiếu nại, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.'
      : 'Cảm ơn bạn đã hợp tác. Hy vọng bạn sẽ tiếp tục đồng hành cùng VCompass.';

    const contentHTML = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <div style="background-color: ${statusColor}; color: #fff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">VCompass</h2>
        </div>
        <div style="padding: 20px;">
          <h3 style="color: ${statusColor};">${statusTitle}</h3>
          <p>${reasonNote}</p>
          <blockquote style="background-color: #f8d7da; padding: 10px; border-left: 5px solid ${statusColor}; margin: 20px 0;">${reason}</blockquote>
          <p>${footerMessage}</p>
          ${admin?.name && admin?.email
        ? `<p>Liên hệ quản trị viên: <strong>${admin.name}</strong> - <a href="mailto:${admin.email}">${admin.email}</a></p>`
        : ''
      }
        </div>
        <div style="background-color: #f8f8f8; padding: 10px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">Cảm ơn bạn đã sử dụng VCompass.</p>
        </div>
      </div>
    `;

    await sendEmail(subject, reason, contentHTML, email);

    console.log(`Block status email sent to: ${email}`);
    res.json({ success: true, message: 'Email thông báo đã được gửi.' });
  } catch (error) {
    console.error("Error sending block status email:", error);
    res.status(500).json({ success: false, message: 'Gửi email thất bại.' });
  }
};


export { sendPasswordReset, sendBookingEmails, sendEmailTripmate, sendEmailBlockStatus };