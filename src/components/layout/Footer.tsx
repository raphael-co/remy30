export default function Footer() {
  return (
    <footer className="footer">
      <div>© {new Date().getFullYear()} Atelier</div>
      <div className="links">
        <a href="#">Mentions</a>
        <a href="#">CGV</a>
        <a href="#">Confidentialité</a>
      </div>

      <style jsx>{`
        .footer {
          margin-top: 18px;
          border: 1px solid var(--border);
          background: rgba(255, 250, 242, 0.60);
          backdrop-filter: blur(10px);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 12px 14px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: var(--muted);
          font-size: 13px;
        }
        .links {
          display: flex;
          gap: 12px;
        }
        .links a {
          text-decoration: none;
          padding: 6px 8px;
          border-radius: 12px;
          border: 1px solid transparent;
        }
        .links a:hover {
          border-color: var(--border);
          background: rgba(243, 231, 214, 0.75);
          color: var(--text);
        }
      `}</style>
    </footer>
  );
}
