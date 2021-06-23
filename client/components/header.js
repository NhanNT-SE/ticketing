import Link from "next/link";
function Header({ currentUser }) {
  const links = [
    !currentUser && { label: "Sign In", href: "/auth/sign-in" },
    currentUser && { label: "Sign Out", href: "/auth/sign-out" },
    !currentUser && { label: "Sign Up", href: "/auth/sign-up" },
  ]
    .filter((linkConfig) => linkConfig)
    .map(({ label, href }) => {
      {
        return (
          <li key={href} className="nav-item">
            <Link href={href}>
              <a className="nav-link"> {label}</a>
            </Link>
          </li>
        );
      }
    });
  return (
    <nav className="navbar navbar-light bg-light">
      <Link href="/">
        <a className="navbar-brand">GitTix</a>
      </Link>
      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">{links}</ul>
      </div>
    </nav>
  );
}
export default Header;
