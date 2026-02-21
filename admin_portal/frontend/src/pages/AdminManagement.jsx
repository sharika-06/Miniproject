import React, { useState } from 'react';
import { UserPlus, Search, Trash2, Edit } from 'lucide-react';

const AdminManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verifyingEmail, setVerifyingEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newAdmin, setNewAdmin] = useState({
        name: '',
        email: '',
        password: '',
        role: 'admin',
        phone: '',
        employeeCode: '',
        branchName: ''
    });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const fetchAdmins = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/admins');
            const data = await response.json();
            setAdmins(data);
        } catch (err) {
            console.error('Failed to fetch admins');
        }
    };

    React.useEffect(() => {
        fetchAdmins();
    }, []);

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch('http://localhost:5001/api/admins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAdmin)
            });

            const data = await response.json();

            if (response.ok) {
                setAdmins([...admins, data]);
                setShowAddModal(false);
                setNewAdmin({
                    name: '', email: '', password: '', role: 'admin',
                    phone: '', employeeCode: '', branchName: ''
                });
                setSuccessMsg(`Admin created! Verification Code: ${data.verificationCode}`);
            } else {
                setError(data.message || 'Failed to create admin');
            }
        } catch (err) {
            setError('Connection error');
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch('http://localhost:5001/api/admins/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: verifyingEmail, code: otpCode })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMsg(data.message);
                setShowVerifyModal(false);
                setOtpCode('');
                fetchAdmins(); // Refresh list to show 'active'
            } else {
                setError(data.message || 'Verification failed');
            }
        } catch (err) {
            setError('Connection error');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete admin "${name}"?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/api/admins/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                setAdmins(admins.filter(admin => admin.id !== id));
                setSuccessMsg('Admin deleted successfully');
            } else {
                setError(data.message || 'Failed to delete admin');
            }
        } catch (err) {
            setError('Connection error');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Admin Management</h1>
                    <p className="text-gray">View and manage platform administrators</p>
                </div>
                <button
                    className="btn-primary"
                    style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
                    onClick={() => setShowAddModal(true)}
                >
                    <UserPlus size={20} />
                    Create New Admin
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search admins by name or email..."
                        className="form-input"
                        style={{ paddingLeft: '40px', marginBottom: 0 }}
                    />
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: '500' }}>Name</th>
                            <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: '500' }}>Email</th>
                            <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: '500' }}>Role</th>
                            <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: '500' }}>Last Active</th>
                            <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: '500' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map((admin) => (
                            <tr key={admin.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '1rem', fontWeight: '500' }}>{admin.name}</td>
                                <td style={{ padding: '1rem' }}>{admin.email}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.75rem',
                                        background: admin.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                        color: admin.status === 'active' ? '#10b981' : '#f59e0b'
                                    }}>
                                        {admin.status?.toUpperCase() || 'PENDING'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {admin.status !== 'active' && (
                                            <button
                                                onClick={() => { setVerifyingEmail(admin.email); setShowVerifyModal(true); }}
                                                style={{ background: 'var(--primary-color)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}
                                            >
                                                Verify
                                            </button>
                                        )}
                                        <button style={{ background: 'transparent', color: '#94a3b8' }}><Edit size={18} /></button>
                                        <button
                                            onClick={() => handleDelete(admin.id, admin.name)}
                                            style={{ background: 'transparent', color: '#ef4444' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="glass-panel" style={{ width: '400px', padding: '2rem', background: '#1e293b' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Create New Admin</h2>
                        {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
                        <form onSubmit={handleAddAdmin}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newAdmin.name}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone Number</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newAdmin.phone}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Employee Code</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={newAdmin.employeeCode}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, employeeCode: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Branch Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={newAdmin.branchName}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, branchName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={newAdmin.email}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Role</label>
                                <select
                                    className="form-input"
                                    value={newAdmin.role}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="superadmin">Super Admin</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowAddModal(false)} className="btn-primary" style={{ background: 'transparent', color: '#94a3b8' }}>Cancel</button>
                                <button type="submit" className="btn-primary">Create Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showVerifyModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div className="glass-panel" style={{ width: '400px', padding: '2rem', background: '#1e293b' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Verify Admin</h2>
                        <p style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>Enter 6-digit code for <b>{verifyingEmail}</b></p>
                        {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
                        <form onSubmit={handleVerify}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="XXXXXX"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                maxLength={6}
                                style={{ fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.5rem' }}
                                required
                            />
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" onClick={() => setShowVerifyModal(false)} className="btn-primary" style={{ background: 'transparent', color: '#94a3b8' }}>Cancel</button>
                                <button type="submit" className="btn-primary">Verify & Enable</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {successMsg && (
                <div style={{
                    position: 'fixed', bottom: '2rem', right: '2rem',
                    background: '#10b981', color: 'white', padding: '1rem 2rem',
                    borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 2000, display: 'flex', gap: '1rem', alignItems: 'center'
                }}>
                    <span>{successMsg}</span>
                    <button onClick={() => setSuccessMsg('')} style={{ background: 'none', color: 'white', fontWeight: 'bold' }}>X</button>
                </div>
            )}
        </div>
    );
};

export default AdminManagement;
