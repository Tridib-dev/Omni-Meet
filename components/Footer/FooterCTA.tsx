import Link from "next/link";
import { DottedMap } from "@/components/ui/dotted-map";

const FooterCTA = () => {
    return (
        <div className="footer-cta">
            <div className="footer-cta-content">
                <h2 className="footer-cta-heading">
                    Discover. Book. Attend.<br />
                    Events that move you forward.
                </h2>
                <p className="footer-cta-subtext">
                    Join thousands of developers finding and organizing amazing events worldwide.
                </p>
                
                {/* <Link href="/sign-up" className="footer-cta-btn">
                    Get Started →
                </Link> */}
            </div>

            <div className="footer-cta-map">
                <DottedMap 
                    width={680}
                    height={340}
                    dotColor="#e2e8f0"
                    markerColor="#06b6d4"
                    dotRadius={2.50}
                    markers={[
                        { lat: 37.77, lng: -122.42, size: 7, pulse: true },
                        { lat: 40.71, lng: -74.01, size: 7, pulse: true },
                        { lat: 51.51, lng: -0.13, size: 7, pulse: true },
                        { lat: 35.68, lng: 139.77, size: 8, pulse: true },
                        { lat: -33.87, lng: 151.21, size: 7.5, pulse: true },
                    ]}
                />
            </div>
        </div>
    );
};

export default FooterCTA;