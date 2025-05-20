const Button = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="px-6 py-3 bg-secondary text-light rounded-lg shadow-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent"
  >
    {children}
  </button>
);
