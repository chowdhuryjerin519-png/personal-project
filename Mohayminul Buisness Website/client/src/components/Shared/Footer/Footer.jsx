const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">
              Web Developer BD
            </h2>
            <p className="text-gray-400 leading-6">
              Your trusted online shopping destination. Find quality products at
              the best prices and enjoy a simple shopping experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>

            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="/" className="hover:text-yellow-400 transition">
                  Home
                </a>
              </li>

              <li>
                <a
                  href="/products"
                  className="hover:text-yellow-400 transition"
                >
                  Products
                </a>
              </li>

              <li>
                <a
                  href="/dashboard"
                  className="hover:text-yellow-400 transition"
                >
                  Dashboard
                </a>
              </li>

              <li>
                <a href="/login" className="hover:text-yellow-400 transition">
                  Login
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>

            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="#" className="hover:text-yellow-400 transition">
                  Contact Us
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-yellow-400 transition">
                  Privacy Policy
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-yellow-400 transition">
                  Terms & Conditions
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-yellow-400 transition">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>

            <div className="space-y-3 text-gray-400">
              <p>Email: support@easybuy.com</p>
              <p>Phone: +880 1234-567890</p>
              <p>Dhaka, Bangladesh</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Web Developer BD. All rights reserved.
          </p>

          <div className="flex gap-5 text-gray-400">
            <a href="#" className="hover:text-yellow-400 transition">
              Facebook
            </a>

            <a href="#" className="hover:text-yellow-400 transition">
              Instagram
            </a>

            <a href="#" className="hover:text-yellow-400 transition">
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
