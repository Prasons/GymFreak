import React from "react";
import { Link, Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-light p-6">
        <h2 className="text-2xl font-bold mb-8 text-accent">Admin Panel</h2>
        <nav className="space-y-4">
          <Link to="/admin" className="hover:text-accent block">
            Dashboard
          </Link>
          <Link to="/admin/members" className="hover:text-accent block">
            Manage Members
          </Link>
          <Link to="/admin/trainers" className="hover:text-accent block">
            Manage Trainers
          </Link>
          <Link to="/admin/equipment" className="hover:text-accent block">
            Manage Equipment
          </Link>
          <Link to="/admin/classes" className="hover:text-accent block">
            Classes
          </Link>
          <Link to="/admin/payments" className="hover:text-accent block">
            Payments
          </Link>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 bg-primary text-light p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
