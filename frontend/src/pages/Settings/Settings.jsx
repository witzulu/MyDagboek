import { useTheme } from '../../components/ThemeContext';

const Settings = () => {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <UserProfileCard />
          <PreferencesCard />
        </div>
        <div className="lg:col-span-2 space-y-8">
          <AdminSettings />
        </div>
      </div>
    </div>
  );
};

export default Settings;

const UserProfileCard = () => (
  <div className="card bg-base-100 shadow-xl">
    <div className="card-body">
      <h2 className="card-title">User Profile</h2>
      <div className="space-y-4">
        <div>
          <label className="label">
            <span className="label-text">Email Address</span>
          </label>
          <input
            type="email"
            defaultValue="user@example.com"
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">Password</span>
          </label>
          <button className="btn btn-secondary btn-sm">Change Password</button>
        </div>
      </div>
    </div>
  </div>
);

const PreferencesCard = () => {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Preferences</h2>
        <div>
          <label className="label">
            <span className="label-text">Theme</span>
          </label>
          <select
            onChange={(e) => setTheme(e.target.value)}
            value={theme}
            className="select select-bordered w-full"
          >
            {themes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

const AdminSettings = () => {
  const mockPendingUsers = [
    { fullName: 'New User 1', email: 'newuser1@example.com', registrationDate: '2025-10-20' },
    { fullName: 'New User 2', email: 'newuser2@example.com', registrationDate: '2025-10-19' },
  ];

  return (
    <div className="space-y-8">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Site Management</h2>
          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Site Name</span>
              </label>
              <input
                type="text"
                defaultValue="Dagboek"
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Site Logo</span>
              </label>
              <input type="file" className="file-input file-input-bordered file-input-primary w-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Pending Users</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Registration Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockPendingUsers.map(user => (
                  <tr key={user.email}>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.registrationDate}</td>
                    <td className="text-right space-x-2">
                      <button className="btn btn-success btn-sm">Approve</button>
                      <button className="btn btn-error btn-sm">Deny</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};