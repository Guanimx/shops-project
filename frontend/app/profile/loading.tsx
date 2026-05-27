export default function Loading() {
  const fields = Array.from({ length: 7 }, (_, index) => index);

  return (
    <main className="profile-page profile-page-full">
      <section className="profile-shell profile-shell-full">
        <aside className="sidebar">
          <div className="side-header">
            <div className="profile-loading-logo skeleton" />
          </div>

          <nav className="side-nav" aria-label="Profile navigation loading">
            <div className="profile-loading-side-link skeleton" />
            <div className="profile-loading-side-link skeleton" />
          </nav>

          <div className="side-account">
            <div className="avatar skeleton" />
            <div className="profile-loading-side-name skeleton" />
          </div>

          <div className="profile-loading-logout skeleton" />
        </aside>

        <section className="profile-content pt-5">
          <div className="mobile-sidebar-toggle profile-loading-menu">
            <div className="profile-loading-menu-icon skeleton" />
            <div className="profile-loading-menu-text skeleton" />
          </div>

          <header className="profile-hero">
            <div className="avatar avatar-large skeleton" />
            <div className="profile-loading-title skeleton" />
            <div className="profile-loading-role skeleton" />
          </header>

          <div className="profile-form profile-form-full">
            <div className="profile-loading-heading skeleton" />
            {fields.slice(0, 4).map((field) => (
              <div className="profile-loading-field" key={field}>
                <div className="profile-loading-label skeleton" />
                <div className="profile-loading-input skeleton" />
              </div>
            ))}

            <div className="profile-loading-subheading skeleton" />
            {fields.slice(4).map((field) => (
              <div className="profile-loading-field" key={field}>
                <div className="profile-loading-label skeleton" />
                <div className="profile-loading-input skeleton" />
              </div>
            ))}

            <div className="form-actions">
              <div className="profile-loading-action skeleton" />
              <div className="profile-loading-action skeleton" />
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
