'use client';

const FooterBottom = () => {
    const year = new Date().getFullYear();

    return (
        <div className="footer-bottom">
            {/* Copyright */}
            <p className="footer-copyright">
                © {year} DevEvent. All rights reserved.
            </p>

            {/* Company Links - Horizontal, Slightly Left for Balance */}
            <div className="company-links-bottom">
                <a href="/about">About Us</a>
                <a href="/blog">Blog</a>
                <a href="/careers">Careers</a>
                <a href="/press">Press Kit</a>
                <a href="/contact">Contact Us</a>
            </div>

            {/* Right Side - Language + Made with Love (Single Line) */}
            <div className="footer-bottom-right">
                <div className="language-selector">
                    🌐 English <span className="text-xs">▼</span>
                </div>
                <p className="footer-made-with">
                    Made with{" "}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#59deca" aria-label="love" role="img">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>{" "}
                    for the dev community
                </p>
            </div>
        </div>
    );
};

export default FooterBottom;