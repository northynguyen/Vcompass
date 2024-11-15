import { useState } from 'react';
import './Footer.css';
import vietnam_flag from '../../assets/vietnam-flag.svg';
import usa_flag from '../../assets/usa-flag.svg';
import facebook_icon from '../../assets/facebook.svg';
import instagram_icon from '../../assets/instagram.svg';
import twitter_icon from '../../assets/twitter.svg';
import google_icon from '../../assets/google-plus.svg';

function Footer() {
    const [isFlagOpen, setIsFlagOpen] = useState(false); // Trạng thái điều khiển dropdown mở/đóng
    const [selectedFlagOption, setSelectedFlagOption] = useState({
        img: usa_flag,
        label: 'English',
    });
    const optionsFlag = [
        { img: vietnam_flag, label: 'Việt Nam' },
        { img: usa_flag, label: 'English' },
        // Thêm các lựa chọn khác nếu cần
    ];


    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false); // Trạng thái điều khiển dropdown mở/đóng
    const [selectedCurrencyOption, setSelectedCurrencyOption] = useState({
        label: 'U.S. Dollar ($)',
    });
    const optionsCurrency = [
        { label: 'V.N. Đồng (VNĐ)' },
        { label: 'U.S. Dollar ($)' }
        // Thêm các lựa chọn khác nếu cần
    ];

    const handleOptionFlagClick = (option) => {
        setSelectedFlagOption(option);
        setIsFlagOpen(false); // Đóng dropdown khi chọn một lựa chọn
    };
    const handleOptionCurrencyClick = (option) => {
        setSelectedCurrencyOption(option);
        setIsCurrencyOpen(false); // Đóng dropdown khi chọn một lựa chọn
    };


    return (
        <div className="footer">
            <div className="footer-container">
                <div className="footer-columns">
                    <div className="footer-column">
                        <p className="footer-header">Language</p>
                        <div className="custom-select">
                            <div
                                className={`selected-option ${isFlagOpen ? 'open' : ''}`}
                                onClick={() => setIsFlagOpen(!isFlagOpen)}
                            >
                                <img src={selectedFlagOption.img} alt={selectedFlagOption.label} className="footer-img" />
                                <p className='footer-title'>{selectedFlagOption.label}</p>
                            </div>
                            {isFlagOpen && (
                                <div className="options">
                                    {optionsFlag.map((optionFlag, index) => (
                                        <div
                                            key={index}
                                            className="option"
                                            onClick={() => handleOptionFlagClick(optionFlag)}
                                        >
                                            <img src={optionFlag.img} alt={optionFlag.label} className="footer-img" />
                                            <p className='footer-title'>{optionFlag.label}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="footer-header">Currency</p>
                        <div className="custom-select">
                            <div
                                className={`selected-option ${isCurrencyOpen ? 'open' : ''}`}
                                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}>
                                <p className='footer-title'>{selectedCurrencyOption.label}</p>
                            </div>
                            {isCurrencyOpen && (
                                <div className="options">
                                    {optionsCurrency.map((optionCurrency, index) => (
                                        <div
                                            key={index}
                                            className="option"
                                            onClick={() => handleOptionCurrencyClick(optionCurrency)}>
                                            <p className='footer-title'>{optionCurrency.label}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="footer-column">
                        <p className="footer-header">Company</p>
                        <a href="#" className="footer-title">Home</a>
                        <a href="#" className="footer-title">About us</a>
                        <a href="#" className="footer-title">Booking</a>
                        <a href="#" className="footer-title">PartnerShip</a>
                    </div>
                    <div className="footer-column">
                        <p className="footer-header">Help</p>
                        <a href="#" className="footer-title">Contact Us</a>
                        <a href="#" className="footer-title">FAQS</a>
                        <a href="#" className="footer-title">Terms and conditions</a>
                        <a href="#" className="footer-title">Privacy policy</a>
                        <a href="#" className="footer-title">Sitemap</a>
                    </div>
                    <div className="footer-column">
                        <p className="footer-header">Payment methods possible</p>
                        <div className='footer-payment'>
                            <div className='footer-payment-img'></div>
                            <div className='footer-payment-img'></div>
                            <div className='footer-payment-img'></div>
                            <div className='footer-payment-img'></div>
                            <div className='footer-payment-img'></div>
                            <div className='footer-payment-img'></div>
                            <div className='footer-payment-img'></div>
                            <div className='footer-payment-img'></div>
                            <div className='footer-payment-img'></div>
                            <div className='footer-payment-img'></div>
                        </div>
                        <p className="footer-header">Company</p>
                        <p className="footer-title">Become a Partner for Us</p>
                    </div>
                </div>

            </div>
            <div className="footer-bottom">
                <p className='footer-title'>Copyright 2023. All rights reserved.</p>
                <div>
                    <a href="#" >
                        <img className='footer-logo' src={facebook_icon} alt="Facebook icon" />
                    </a>
                    <a href="#">
                        <img className='footer-logo' src={instagram_icon} alt="Instagram icon" />
                    </a>
                    <a href="#" >
                        <img className='footer-logo' src={twitter_icon} alt="Twitter icon" />
                    </a>
                    <a href="#" >
                        <img className='footer-logo' src={google_icon} alt="Google icon" />
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Footer;
