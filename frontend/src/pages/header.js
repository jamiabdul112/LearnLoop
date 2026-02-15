import React from 'react'
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom' // 1. Import useLocation
import '../css/header.css'
import { defaultImg } from '../constants/defaultImg'

function Header({ authUser }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOpen, setIsOpen] = useState(false);
  
  const location = useLocation(); // 2. Initialize location

  // 3. Automatically close menu when the route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className='header-fixed'>
      <div className='header-page' data-aos="fade-down">
        <img src='./images/app-logo.png' alt='logo'></img>
        
        {!isMobile ? (
          <nav className="nav-links desktop">
            <div className='nav-menuss'>
              <Link to="/">Discover</Link>
              <Link to="/trade-dashboard">Dashboard</Link>
              <Link to="/chat">Messages</Link>
              <Link to="/skill/create">Create Skill</Link>
                  
            </div>
            <Link to="/edit-profile" className='edit-profile-link'>
              <img src={authUser?.profileImg || defaultImg} alt='profile' className='header-profile-img'></img>
            </Link>
          </nav>
        ) : (
          <>
            {!isOpen ? (
              <button className="hamburger" onClick={() => setIsOpen(true)}>
                <div className="bar" />
                <div className="bar" />
                <div className="bar" />
              </button>
            ) : (
              <div className="mobile-menu-overlay">
                <button className="close-btn" onClick={() => setIsOpen(false)}>
                  ✕
                </button>
                <nav className="nav-links mobile">
                  <Link to="/">Discover</Link>
                  <Link to="/trade-dashboard">Dashboard</Link>
                  <Link to="/chat">Messages</Link>
                  <Link to="/skill/create">Create Skill</Link>
                  <Link to="/edit-profile">Edit Profile</Link>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Header;