import React from 'react';
import { 
  MapPin, 
  ChevronRight, 
  Users, 
  Award
} from 'lucide-react';

export default function ResourceCard({ resource, onSelect }) {
  const requiredCerts = resource.required_certifications || [];
  
  const categoryBadges = {
    fabrication: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    equipment: 'bg-sky-50 text-sky-700 border-sky-200',
    space: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    testing_rig: 'bg-purple-50 text-purple-700 border-purple-200',
    computing: 'bg-amber-50 text-amber-700 border-amber-200'
  };

  const imageSrc = resource.images && resource.images.length > 0
    ? resource.images[0]
    : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800';

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all duration-200 flex flex-col overflow-hidden shadow-xs hover:shadow-md">
      
      {/* Thumbnail & Badges */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <img
          src={imageSrc}
          alt={resource.title}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border backdrop-blur-md bg-white/90 ${categoryBadges[resource.category] || 'text-slate-700 border-slate-200'}`}>
            {resource.category}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-slate-700 border border-slate-200">
            {resource.type}
          </span>
        </div>

        {/* Supervision Badge */}
        {resource.requires_supervision === 1 && (
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 backdrop-blur-md flex items-center gap-1">
              <Users className="w-2.5 h-2.5" />
              <span>Supervised</span>
            </span>
          </div>
        )}

        {/* Bottom image overlay pill */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-[11px] text-slate-800 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[200px] font-medium">
            <MapPin className="w-3 h-3 text-indigo-600 shrink-0" />
            <span className="truncate">{resource.institution}</span>
          </span>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            {resource.status === 'available' ? 'Available' : resource.status}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {resource.title}
          </h3>
          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>

          {/* Location detail */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            <span className="truncate">{resource.location}</span>
          </div>

          {/* Required Certifications */}
          <div className="mt-3">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5 flex items-center gap-1">
              <Award className="w-3 h-3 text-indigo-600" />
              <span>Required Safety Certifications:</span>
            </span>
            <div className="flex flex-wrap gap-1">
              {requiredCerts.length > 0 ? (
                requiredCerts.map((c, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[220px] font-medium"
                  >
                    {c}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-slate-500 italic">Open access (Basic Safety Only)</span>
              )}
            </div>
          </div>
        </div>

        {/* Pricing, Deposit & Booking CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-extrabold text-slate-900">
                ${resource.hourly_rate}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">/hr</span>
              {resource.deposit > 0 && (
                <span className="text-[10px] text-slate-500 ml-1.5 font-medium">
                  (${resource.deposit} dep)
                </span>
              )}
            </div>
            <p className="text-[10px] text-indigo-600 font-semibold">
              Min {resource.min_hours}h - Max {resource.max_hours}h
            </p>
          </div>

          <button
            onClick={() => onSelect(resource)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <span>Request Access</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
