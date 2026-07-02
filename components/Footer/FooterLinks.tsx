import { FOOTER_COLUMNS } from "@/lib/constants/footer-data";
import Link from "next/link";

const FooterLinks = () => {
    return (
        <div className="footer-links-grid">
            {FOOTER_COLUMNS.map((column) => (
                <div key={column.heading} className="footer-links-column">
                    <p className="footer-links-heading">{column.heading}</p>
                    <ul className="space-y-2.5 list-none mt-4">
                        {column.links.map((link) => (
                            <li key={link.label}>
                                <Link href={link.href} className="footer-link block py-0.5">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default FooterLinks;