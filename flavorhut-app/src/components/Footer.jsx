import React from 'react';

function Footer() {
  return (
    <footer className="bg-footer-bg text-white py-8 px-4">
      <div className="container mx-auto text-center">
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} FlavorHut. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;