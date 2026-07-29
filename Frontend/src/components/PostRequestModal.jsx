import React, { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function PostRequestModal({ onClose }) {
    const [formData, setFormData] = useState({
        patientName: '',
        bloodGroup: '',
        units: 1,
        hospital: '',
        city: '',
        phone: '',
        urgency: 'Medium'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        try {
            const res = await fetch("https://digital-blood-donation-network.onrender.com/api/requests/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    city: formData.hospital
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Request Broadcasted to Donors!");
                onClose();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error("Server error. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-red-600 p-6 text-white relative">
                    <button onClick={onClose} className="absolute right-6 top-6 hover:rotate-90 transition-transform">
                        <X className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white/20 p-2 rounded-full">
                            <span className="text-xl font-bold">+</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">Submit Request</h2>
                    </div>
                    <p className="text-red-100 text-sm">Broadcast to all nearby verified donors</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Patient Name</label>
                        <input
                            type="text"
                            placeholder="Enter patient full name"
                            className="w-full border-b-2 border-gray-100 py-3 focus:border-red-500 outline-none transition-colors"
                            required
                            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Required Group</label>
                            <select
                                className="w-full border-b-2 border-gray-100 py-3 focus:border-red-500 outline-none bg-transparent"
                                required
                                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                            >
                                <option value="">Select</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Number</label>
                            <input
                                type="text"
                                placeholder="03xx-xxxxxxx"
                                className="w-full border-b-2 border-gray-100 py-3 focus:border-red-500 outline-none"
                                required
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hospital & Area Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-0 top-4 w-5 h-5 text-gray-300" />
                            <input
                                type="text"
                                placeholder="e.g. Mayo Hospital, Lahore"
                                className="w-full border-b-2 border-gray-100 py-3 pl-8 focus:border-red-500 outline-none"
                                required
                                onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Units + Urgency —  fields */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Units Required</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                placeholder="e.g. 2"
                                className="w-full border-b-2 border-gray-100 py-3 focus:border-red-500 outline-none transition-colors"
                                value={formData.units}
                                required
                                onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Urgency Level</label>
                            <select
                                className="w-full border-b-2 border-gray-100 py-3 focus:border-red-500 outline-none bg-transparent"
                                value={formData.urgency}
                                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                            >
                                <option value="Low">🟢 Low</option>
                                <option value="Medium">🟡 Medium</option>
                                <option value="High">🔴 High — Donors ko notify karega</option>
                            </select>
                        </div>
                    </div>

                    {/* High urgency warning */}
                    {formData.urgency === 'High' && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600 font-semibold">
                            🚨 High urgency — matching donors and admins will be notified immediately!
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex items-center justify-between pt-4">
                        <button type="button" onClick={onClose} className="text-gray-500 font-semibold hover:text-gray-700">Cancel</button>
                        <button type="submit" className="bg-red-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all">
                            Submit Requirement
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
