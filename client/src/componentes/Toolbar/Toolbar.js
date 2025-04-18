import React from 'react';
import './Toolbar.css';
import logo from '../../assets/logo.png'; // Make sure the path is correct

const Toolbar = () => {
  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <img src={logo} alt="Learn With Tom Logo" className="toolbar-logo" />
        <div className="toolbar-divider" />
        <span className="toolbar-title">JavaScript is fun</span>
      </div>
      <div className="toolbar-right">
        {/* Optional future icons/buttons */}
      </div>
    </header>
  );
};

export default Toolbar;
