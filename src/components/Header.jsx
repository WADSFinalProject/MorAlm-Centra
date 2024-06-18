import React, { useState, useRef, useEffect } from 'react';
import MoralmLogo from '../assets/MoralmLogo.png';
import UserLogo from '../assets/UserLogo2.png';
import CartIcon from '../assets/ShopCartLogo.png';
import DropdownIcon from '../assets/dropdown.png';
import LogoutIcon from '../assets/logout.png'; // Import the logout icon
import CartPopup from './CartPopup';
import './Header.css'; // Import the CSS file

const Header = ({ toggleCart }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <nav className="topNav">
      <div className="navLeft">
        <img src={MoralmLogo} alt="Moralm Logo" className="logoImg" />
      </div>
      <div className="gradientBar">
        <div className="segment1"></div>
        <div className="segment2"></div>
        <div className="segment3"></div>
        <div className="segment4"></div>
      </div>
      <div className="navRight">
        <img src={CartIcon} alt="Cart Icon" className="cartIcon" onClick={toggleCart} />
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <img src={UserLogo} alt="User Avatar" className="userAvatar" />
          <img src={DropdownIcon} alt="Dropdown Icon" className="dropdownIcon" onClick={() => setIsDropdownOpen(!isDropdownOpen)} />
          {isDropdownOpen && (
            <div className="dropdown" ref={dropdownRef}>
              <div className="dropdownItem">
                Profile
              </div>
              <div className="separator"></div>
              <div className="dropdownItem" style={{ color: 'red' }} onClick={() => alert('Logged out')}>
                Logout
                <img src={LogoutIcon} alt="Logout Icon" className="dropdownItemIcon" />
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
