import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { UserPlus, Shield, Trash2, Crown } from 'lucide-react';

const Team = () => {
  const { projectId } = useParams();
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await api(`/projects/${projectId}/members`);
      data.sort((a, b) => {
        const roles = { owner: 0, admin: 1, member: 2 };
        return roles[a.role] - roles[b.role];
      });
      setMembers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch team members.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchMembers();
    }
  }, [projectId]);

  const userPermissionRole = (() => {
    if (currentUser?.role === 'system_admin') return 'owner';
    const member = members.find(m => m.user?._id === currentUser._id);
    return member ? member.role : null;
  })();

  const canManage = ['owner', 'admin'].includes(userPermissionRole);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!email) return alert('Please enter an email.');
    try {
      const updatedMembers = await api(`/projects/${projectId}/members`, {
        method: 'POST',
        body: { email, role: 'member' },
      });
      setMembers(updatedMembers);
      setEmail('');
    } catch (err) {
      alert(err.message || 'Failed to add member. The user may not exist or is already in the project.');
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      const updatedMembers = await api(`/projects/${projectId}/members/${memberId}`, {
        method: 'PUT',
        body: { role: newRole },
      });
      setMembers(updatedMembers);
    } catch (err) {
      alert(err.message || 'Failed to update role.');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this member from the project?')) {
      try {
        const updatedMembers = await api(`/projects/${projectId}/members/${memberId}`, {
          method: 'DELETE',
        });
        setMembers(updatedMembers);
      } catch (err) {
        alert(err.message || 'Failed to remove member.');
      }
    }
  };

  if (loading) return <div className="text-center p-8">Loading team members...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Project Team</h1>

      {canManage && (
        <div className="bg-background-alt p-6 rounded-lg border border-border mb-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center"><UserPlus className="mr-2 h-6 w-6"/>Invite New Member</h2>
          <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user's email to add them"
              className="flex-grow p-2 rounded-md border bg-transparent border-border focus:ring-2 focus:ring-primary"
              required
            />
            <button type="submit" className="btn btn-primary flex items-center justify-center">
              <UserPlus className="w-5 h-5 mr-2" /> Add Member
            </button>
          </form>
        </div>
      )}

      <div className="bg-background-alt rounded-lg border border-border shadow-sm">
        <div className="p-6">
            <h2 className="text-xl font-semibold">Current Members ({members.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-background">
              <tr>
                <th className="text-left font-semibold p-4">Name</th>
                <th className="text-left font-semibold p-4">Role</th>
                {canManage && <th className="text-left font-semibold p-4">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member, index) => (
                <tr key={member.user?._id || index}>
                  <td className="p-4">
                    <div className="font-medium">{member.user?.name || <span className="text-muted">Deleted User</span>}</div>
                    <div className="text-muted">{member.user?.email || 'N/A'}</div>
                  </td>
                  <td className="p-4 capitalize flex items-center">
                    {member.role === 'owner' && <Crown className="w-4 h-4 mr-2 text-yellow-500"/>}
                    {member.role === 'admin' && <Shield className="w-4 h-4 mr-2 text-indigo-500"/>}
                    {member.role}
                  </td>
                  {canManage && (
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.user._id, e.target.value)}
                          disabled={!member.user || member.role === 'owner' || member.user?._id === currentUser._id}
                          className="p-2 rounded-md border bg-transparent border-border disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                        </select>
                        <button
                          onClick={() => handleRemoveMember(member.user._id)}
                          disabled={!member.user || member.role === 'owner' || member.user?._id === currentUser._id}
                          className="btn btn-danger p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Remove member"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Team;
