import React from 'react';
import { Plus, Calendar, Send, BarChart3, Instagram, Linkedin } from 'lucide-react';

const AnalyticsSection = () => {
  return (
    <section className="min-h-screen bg-[#121212] text-white py-20 px-6 font-sans relative overflow-hidden">
      
      
      <div className="max-w-6xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-widest text-gray-400 mb-8">
          <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[8px]">3</span>
          Advanced Analytics
        </div>
        
        <h2 className="text-5xl md:text-6xl font-serif mb-6">Dive Into the Details</h2>
        <p className="max-w-2xl mx-auto text-gray-400 leading-relaxed text-sm md:text-base">
          Manage all your social accounts from a single dashboard. Track engagement, 
          compare performance across platforms, and optimize your content strategy 
          with deep insights and analytics.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        
        <div className="bg-[#1c1c1c] border border-white/5 rounded-[2rem] p-8 flex flex-col">
          <h3 className="text-xl mb-4 font-medium">Unified Dashboard</h3>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            Connect all your social media profiles and manage posts, messages, and insights from one clean, easy-to-use interface.
          </p>
          <div className="mt-auto bg-[#121212] rounded-xl p-4 border border-white/5 shadow-2xl">
            <div className="flex gap-1 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500/50" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
              <div className="w-2 h-2 rounded-full bg-green-500/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1c1c1c] p-3 rounded-lg border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase">Followers</p>
                <p className="text-lg font-bold">24.5K</p>
                <p className="text-[10px] text-green-500">+12%</p>
              </div>
              <div className="bg-[#1c1c1c] p-3 rounded-lg border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase">Engagement</p>
                <p className="text-lg font-bold">8.2%</p>
                <p className="text-[10px] text-green-500">+5%</p>
              </div>
            </div>
            
            <svg className="w-full h-12 mt-4 text-blue-500" viewBox="0 0 100 20">
              <path d="M0 15 Q 25 10, 50 15 T 100 5" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        </div>

        
        <div className="bg-[#1c1c1c] border border-white/5 rounded-[2rem] p-8 flex flex-col">
          <h3 className="text-xl mb-4 font-medium">Cross-Platform Insights</h3>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            View detailed analytics across Instagram, TikTok, LinkedIn, and more. See what&aspo; working and where to focus your energy.
          </p>
          <div className="mt-auto space-y-4">
            {[
              { label: 'Instagram', val: '70%', color: 'bg-gradient-to-r from-orange-400 to-pink-500', icon: <Instagram size={14}/> },
              { label: 'TikTok', val: '90%', color: 'bg-gradient-to-r from-cyan-400 to-pink-500', icon: <span className="text-[10px] font-bold">T</span> },
              { label: 'LinkedIn', val: '40%', color: 'bg-blue-600', icon: <Linkedin size={14}/> }
            ].map((platform, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  {platform.icon}
                </div>
                <div className="flex-1">
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${platform.color}`} style={{ width: platform.val }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        
        <div className="bg-[#1c1c1c] border border-white/5 rounded-[2rem] p-8 flex flex-col">
          <h3 className="text-xl mb-4 font-medium">Social Media Management</h3>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            Streamline your entire social media workflow â€” from content creation and scheduling to publishing and performance tracking.
          </p>
          <div className="mt-auto">
            <div className="flex justify-between items-center mb-6">
              {[
                { icon: <Plus size={16}/>, color: 'bg-blue-500' },
                { icon: <Calendar size={16}/>, color: 'bg-orange-500' },
                { icon: <Send size={16}/>, color: 'bg-emerald-500' },
                { icon: <BarChart3 size={16}/>, color: 'bg-purple-500' }
              ].map((item, i) => (
                <React.Fragment key={i}>
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shadow-lg`}>
                    {item.icon}
                  </div>
                  {i < 3 && <div className="h-px flex-1 bg-white/10 mx-2" />}
                </React.Fragment>
              ))}
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-[#121212] border border-white/5 flex items-center justify-center">
                  {i % 2 === 0 && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AnalyticsSection;
