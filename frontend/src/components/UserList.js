import React, { useEffect, useState } from 'react';
import { getAllUsers, deleteUser, toggleAdminStatus } from '../api/auth';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [adminFilter, setAdminFilter] = useState('all'); // all, admin, nonadmin
  const [actionLoading, setActionLoading] = useState(null); // userId for which action is loading

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      setUsers(res.data.users || []);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setActionLoading(userId);
    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch {
      alert('Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleAdmin = async (userId) => {
    setActionLoading(userId);
    try {
      const res = await toggleAdminStatus(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, is_admin: res.data.is_admin } : u));
    } catch {
      alert('Failed to update admin status');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter and search logic
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesAdmin =
      adminFilter === 'all' ||
      (adminFilter === 'admin' && user.is_admin) ||
      (adminFilter === 'nonadmin' && !user.is_admin);
    return matchesSearch && matchesAdmin;
  });

  if (loading) return <div>Loading users...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <h2 style={{ marginBottom: 20 }}>User Database</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', minWidth: 220 }}
        />
        <select
          value={adminFilter}
          onChange={e => setAdminFilter(e.target.value)}
          style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        >
          <option value="all">All Users</option>
          <option value="admin">Admins Only</option>
          <option value="nonadmin">Non-admins Only</option>
        </select>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#f6f8fa' }}>
            <th style={{ padding: 10, border: '1px solid #eee' }}>ID</th>
            <th style={{ padding: 10, border: '1px solid #eee' }}>Name</th>
            <th style={{ padding: 10, border: '1px solid #eee' }}>Email</th>
            <th style={{ padding: 10, border: '1px solid #eee' }}>Phone</th>
            <th style={{ padding: 10, border: '1px solid #eee' }}>Admin</th>
            <th style={{ padding: 10, border: '1px solid #eee' }}>Created At</th>
            <th style={{ padding: 10, border: '1px solid #eee' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <td style={{ padding: 10, border: '1px solid #eee' }}>{user.id}</td>
              <td style={{ padding: 10, border: '1px solid #eee' }}>{user.name}</td>
              <td style={{ padding: 10, border: '1px solid #eee' }}>{user.email}</td>
              <td style={{ padding: 10, border: '1px solid #eee' }}>{user.phone}</td>
              <td style={{ padding: 10, border: '1px solid #eee' }}>{user.is_admin ? 'Yes' : 'No'}</td>
              <td style={{ padding: 10, border: '1px solid #eee' }}>{user.created_at}</td>
              <td style={{ padding: 10, border: '1px solid #eee' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'flex-start' }}>
                  <button
                    onClick={() => handleToggleAdmin(user.id)}
                    disabled={actionLoading === user.id}
                    style={{ minWidth: 90, padding: '6px 0', borderRadius: 4, border: 'none', background: user.is_admin ? '#ffb347' : '#b3e283', color: '#222', fontWeight: 600, cursor: 'pointer', fontSize: 15, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                  >
                    {user.is_admin ? 'Demote' : 'Promote'}
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    disabled={actionLoading === user.id}
                    style={{ minWidth: 70, padding: '6px 0', borderRadius: 4, border: 'none', background: '#ff5e5b', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 15, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredUsers.length === 0 && <div style={{ marginTop: 24, color: '#888' }}>No users found.</div>}
    </div>
  );
};

export default UserList; 