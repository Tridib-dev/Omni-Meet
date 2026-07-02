import FooterCTA from "./FooterCTA";
import FooterBrand from "./FooterBrand";
import FooterLinks from "./FooterLinks";
import FooterBottom from "./FooterBottom";

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="cta-wrapper">
                <FooterCTA />
            </div>

            <div className="footer-main-panel">
                <div className="grain-layer" aria-hidden="true" />

                <div className="footer-content">
                    {/* Top Links (without Company) */}
                    <div className="footer-links-section">
                        <FooterLinks />
                    </div>

                    {/* Centered Brand */}
                    <div className="footer-brand-center">
                        <FooterBrand />
                    </div>

                    <div className="footer-divider" aria-hidden="true" />
                    <FooterBottom />
                </div>
            </div>
        </footer>
    );
};

export default Footer;