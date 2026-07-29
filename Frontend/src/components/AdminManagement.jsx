import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Trash2, Users, Mail, Lock, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminManagement() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [admins, setAdmins] = useState([]);

    // Fetch Admins Logic
    const fetchAdmins = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('https://digital-blood-donation-network.onrender.com/api/auth/all-admins', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setAdmins(res.data.data);
        } catch (err) {
            console.error("Fetch error", err);
        }
    };

    useEffect(() => { fetchAdmins(); }, []);

    // Delete Admin Logic
    const handleDelete = async (adminId) => {
        if (!window.confirm("Are you sure you want to delete this admin?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`https://digital-blood-donation-network.onrender.com/api/auth/delete-admin/${adminId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchAdmins();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        }
    };

    // Create Admin Logic
    const handleCreateAdmin = async (e) => {
        e.preventDefault();

        // Regex for password (8+ chars & 1 special char)
        const passwordRegex = /^(?=.*[!@#$%^&*])(?=.{8,})/;

        if (!email.toLowerCase().includes('admin')) return toast.error("Email must contain 'admin'!");
        if (!passwordRegex.test(password)) return toast.error("Need 8+ chars & 1 special char!");

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('https://digital-blood-donation-network.onrender.com/api/auth/create-admin',
                { name, email, password }, // Phone removed from payload
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                toast.success(res.data.message);
                setName(''); setEmail(''); setPassword('');
                fetchAdmins();
            }
        } catch (err) {
            const backendMsg = err.response?.data?.message || "Error adding admin";
            toast.error(backendMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto py-10 px-4">
            {/* ADD ADMIN FORM */}
            <div className="p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-red-100 p-3 rounded-2xl text-red-600"><UserPlus size={24} /></div>
                    <h2 className="text-2xl font-black text-gray-900">Add New Admin</h2>
                </div>
                <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <UserIcon className="absolute left-4 top-4 text-gray-400" size={20} />
                        <input type="text" placeholder="Full Name" required className="w-full pl-12 pr-4 py-3 border-2 border-gray-100 rounded-2xl outline-none focus:border-red-500 bg-gray-50/50" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-4 top-4 text-gray-400" size={20} />
                        <input type="email" placeholder="Email" required className="w-full pl-12 pr-4 py-3 border-2 border-gray-100 rounded-2xl outline-none focus:border-red-500 bg-gray-50/50" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="relative md:col-span-2">
                        <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
                        <input type="password" placeholder="Password" required className="w-full pl-12 pr-4 py-3 border-2 border-gray-100 rounded-2xl outline-none focus:border-red-500 bg-gray-50/50" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <button type="submit" disabled={loading} className="md:col-span-2 bg-red-600 text-white font-black py-4 rounded-2xl hover:bg-red-700 shadow-lg flex items-center justify-center gap-2 transition-all">
                        {loading ? "SAVING..." : "AUTHORIZE & CREATE ADMIN"}
                    </button>
                </form>
            </div>

            {/* ADMINS LIST */}
            <div className="p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-slate-100 p-3 rounded-2xl text-slate-600"><Users size={24} /></div>
                    <h2 className="text-2xl font-black text-gray-900">Existing Admins ({admins.length})</h2>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-gray-50">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px]">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {admins.map((admin) => (
                                <tr key={admin._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-700">{admin.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{admin.email}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => handleDelete(admin._id)} className="text-red-300 hover:text-red-600 transition-colors">
                                            <Trash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
