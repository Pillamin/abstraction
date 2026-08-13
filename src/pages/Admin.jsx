// src/pages/Admin.jsx
import AdminPanel from '../components/admin/AdminPanel';

export default function Admin({ problems, onProblemsChange }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <AdminPanel problems={problems} onProblemsChange={onProblemsChange} />
    </div>
  );
}
