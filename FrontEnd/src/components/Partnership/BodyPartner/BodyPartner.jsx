import './BodyPartner.css';

const BodyPartner = () => {
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        const offset = 30; // Distance from the top
      
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset; 
          const offsetPosition = elementPosition - offset;
      
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      };

  return (
    <div className="body-partner">
      {/* Top Navigation */}
      <nav className="top-navigation">
        <button onClick={() => scrollToSection('an-tam')}>An tâm đăng chỗ nghỉ</button>
        <button onClick={() => scrollToSection('noi-bat')}>Nổi bật ngay từ đầu</button>
        <button onClick={() => scrollToSection('tiep-can')}>Tiếp cận nguồn khách</button>
        <button onClick={() => scrollToSection('chia-se')}>Chia sẻ từ các host</button>
        <button onClick={() => scrollToSection('giai-dap')}>Giải đáp thắc mắc</button>
      </nav>

      {/* An tâm đăng chỗ nghỉ Section */}
      <section id="an-tam" className="section">
        <h2>An tâm đăng chỗ nghỉ</h2>
        <ul>
          <li>Thanh toán cho hư hại</li>
          <li>Được thanh toán đều đặn và an toàn</li>
          <li>Khách đã được xác thực</li>
          <li>Chọn cách nhận đặt mong muốn</li>
          <li>Bảo vệ trước các khiếu nại trách nhiệm</li>
          <li>Hỗ trợ mạnh mẽ</li>
        </ul>
      </section>

      {/* Nổi bật ngay từ đầu Section */}
      <section id="noi-bat" className="section">
        <h2>Nổi bật ngay từ đầu</h2>
        <div className="features">
          <div className="feature">
            <img src="https://t-cf.bstatic.com/design-assets/assets/v3.125.0/illustrations-partner-thumbnails/Review.png" alt="Feature Icon 1" />
            <h3>Nhận đánh giá dành cho chỗ nghỉ</h3>
            <p>Chúng tôi nhập điểm đánh giá từ các nền tảng khác và hiển thị điểm trong trang chỗ nghỉ của Quý vị trên VCompass, nên Quý vị luôn có đánh giá của khách ngay từ ban đầu.</p>
          </div>
          <div className="feature">
            <img src="https://t-cf.bstatic.com/design-assets/assets/v3.125.0/illustrations-partner-thumbnails/Puzzle.png" alt="Feature Icon 2" />
            <h3>Nhập thông tin chỗ nghỉ</h3>
            <p>Dễ dàng nhập thông tin của chỗ nghỉ và đồng bộ lịch phòng trống với các nền tảng khác, thuận tiện cho việc đăng chỗ nghỉ và tránh tình trạng đơn đặt trùng lặp.</p>
          </div>
          <div className="feature">
            <img src="https://t-cf.bstatic.com/design-assets/assets/v3.125.0/illustrations-partner-thumbnails/Search.png" alt="Feature Icon 3" />
            <h3>Nổi bật trên thị trường</h3>
            <p> giúp chỗ nghỉ nổi bật trong kết quả tìm kiếm.</p>
          </div>
        </div>
      </section>

      {/* Tiếp cận nguồn khách toàn cầu Section */}
      <section id="tiep-can" className="section">
        <h2>Tiếp cận nguồn khách toàn cầu</h2>
        <div className="stats">
          <div className="stat">
            <strong>2/3</strong>
            <p>Khách hàng đặt lại</p>
          </div>
          <div className="stat">
            <strong>48%</strong>
            <p>Khách đặt từ nước ngoài</p>
          </div>
          <div className="stat">
            <strong>33%</strong>
            <p>Khách Genius cấp 2 hoặc 3</p>
          </div>
          <div className="stat">
            <strong>30%</strong>
            <p>Đặt trên thiết bị di động</p>
          </div>
        </div>
      </section>

      {/* Chia sẻ từ các host khác Section */}
      <section id="chia-se" className="section">
        <h2>Chia sẻ từ các host khác</h2>
        <div className="testimonials">
          <div className="testimonial">
            <p>“Tôi đã đăng trong 5 phút và không ngờ nhận được đơn hàng đầu tiên”</p>
            <strong>- Parley Rose</strong>
          </div>
          <div className="testimonial">
            <p>“Việc đăng thông tin rất dễ dàng, và tôi có thể kiếm tiền ngay lập tức”</p>
            <strong>- Martin Feliden</strong>
          </div>
          <div className="testimonial">
            <p>“Dịch vụ hỗ trợ của VCompass rất tuyệt vời và an toàn”</p>
            <strong>- Michael Al Alja</strong>
          </div>
        </div>
      </section>

      {/* Giải đáp những thắc mắc Section */}
      <section id="giai-dap" className="section">
        <h2>Giải đáp những thắc mắc</h2>
        <div className="faq">
          <details>
            <summary>Nếu khách làm hư hỏng chỗ nghỉ thì sao?</summary>
            <p>Chúng tôi đảm bảo bạn sẽ nhận được sự bảo vệ.</p>
          </details>
          <details>
            <summary>Khi nào chỗ nghỉ của tôi sẽ được online?</summary>
            <p>Sau khi bạn hoàn tất quá trình đăng ký.</p>
          </details>
        </div>
      </section>
    </div>
  );
};

export default BodyPartner;
