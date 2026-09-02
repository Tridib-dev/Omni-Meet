export default function Loading() {
    return (
        <section id="discover" className="discover-page discover-route-loading" aria-busy="true" aria-label="Loading discover results">
            <div className="discover-loading-hero">
                <div className="discover-loading-title" />
                <div className="discover-loading-copy" />
                <div className="discover-loading-toggle" />
            </div>
            <div className="discover-loading-search" />
            <div className="discover-loading-content" />
        </section>
    );
}
