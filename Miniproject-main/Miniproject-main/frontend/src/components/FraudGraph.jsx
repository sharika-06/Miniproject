import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from './ui/Card';

const data = [
    { name: 'Jan', fraud: 4, valid: 240 },
    { name: 'Feb', fraud: 3, valid: 139 },
    { name: 'Mar', fraud: 20, valid: 980 },
    { name: 'Apr', fraud: 27, valid: 390 },
    { name: 'May', fraud: 18, valid: 480 },
    { name: 'Jun', fraud: 23, valid: 380 },
    { name: 'Jul', fraud: 34, valid: 430 },
];

export default function FraudGraph() {
    return (
        <Card className="p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Fraud Detection Trends</h3>
                <p className="text-sm text-slate-500">Transaction monitoring overview</p>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorValid" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="valid" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorValid)" />
                        <Area type="monotone" dataKey="fraud" stroke="#ef4444" fillOpacity={1} fill="url(#colorFraud)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
