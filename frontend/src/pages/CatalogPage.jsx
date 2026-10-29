import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Cpu, 
  Layers, 
  Microscope, 
  Boxes, 
  Building2
} from 'lucide-react';
import { api, getActiveUser } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import LifecycleStepper from '../components/LifecycleStepper';

const CATEGORIES = [
  { id: 'all', label: 'All Resources', icon: Boxes },
  { id: 'fabrication', label: 'Fabrication & CNC', icon: Cpu },
  { id: 'equipment', label: 'Scientific Equipment', icon: Microscope },
  { id: 'space', label: 'Cleanrooms & Studios', icon: Building2 },
  { id: 'testing_rig', label: 'Robotics & Flight Arena', icon: Layers }
];

export default function CatalogPage({ onSelectResource, onOpenListModal, refreshCount = 0 }) {
  const currentUser = getActiveUser();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [nlQuery, setNlQuery] = useState('');
  const [aiMatches, setAiMatches] = useState(null);

  useEffect(() => {
    loadResources();
  }, [selectedCategory, refreshCount]);

  const loadResources = async () => {
    try {
      const filters = {};
      if (selectedCategory !== 'all') filters.category = selectedCategory;
      const data = await api.getResources(filters);
      setResources(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAiMatchSearch = async (e) => {
    e.preventDefault();
    if (!nlQuery.trim()) {
      setAiMatches(null);
      return;
    }

    try {
      const res = await api.aiMatch(nlQuery);
      setAiMatches(res.matches);
    } catch (err) {
      console.error('AI match error:', err);
    }
  };

  const clearAiSearch = () => {
    setNlQuery('');
    setAiMatches(null);
  };

  const displayedResources = aiMatches 
    ? aiMatches.map(m => m.resource)
    : resources.filter(r => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.institution.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q)
        );
      });

  return (
    <div className="space-y-6">
      
      {/* 10-Step Lifecycle Header Guide */}
      <LifecycleStepper currentStep={2} />

      {/* Hero & Smart AI Matcher Search Header */}
      <div className="relative rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Resource Discovery &amp; Eligibility Matcher</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Unlock Underused Institutional Spaces, Equipment &amp; Tools
          </h1>
          
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Safely share specialized facilities, 4-axis CNC mills, cleanrooms, and high-speed photonics with verified institutional trust, fair allocation, and automated safety governance.
          </p>

          {/* AI Natural Language Query Bar */}
          <form onSubmit={handleAiMatchSearch} className="mt-5">
            <div className="relative flex items-center">
              <Sparkles className="absolute left-4 w-5 h-5 text-indigo-600 shrink-0" />
              <input
                type="text"
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                placeholder="Describe what you need (e.g. 'Need 4-axis CNC mill to machine titanium parts' or 'Confocal live-cell imaging')..."
                className="w-full pl-12 pr-28 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600 shadow-xs"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>AI Match</span>
              </button>
            </div>
            
            {/* Quick Prompt chips */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px] text-slate-500 font-medium">
              <span className="font-semibold text-slate-700">Try prompts:</span>
              <button
                type="button"
                onClick={() => setNlQuery('Machining titanium alloy brackets on 4-axis CNC')}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
              >
                4-Axis CNC Titanium
              </button>
              <button
                type="button"
                onClick={() => setNlQuery('Sub-nanometer scanning electron microscope for wafer analysis')}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
              >
                FEI SEM Nanotech
              </button>
              <button
                type="button"
                onClick={() => setNlQuery('High speed camera 25000 fps for fluid cavitation study')}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
              >
                High-Speed Optics
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* AI Match Results Banner */}
      {aiMatches && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                AI Match Complete: {aiMatches.length} resources ranked for &ldquo;{nlQuery}&rdquo;
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Evaluated technical specifications, equipment tolerances, and user safety certifications.
              </p>
            </div>
          </div>
          <button
            onClick={clearAiSearch}
            className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-semibold cursor-pointer"
          >
            Clear AI Filter
          </button>
        </div>
      )}

      {/* Filter and Category Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${
                  active
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Text Filter Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search equipment..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
          />
        </div>

      </div>

      {/* Resource Grid */}
      {displayedResources.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-slate-200 bg-white shadow-xs">
          <Cpu className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No resources match your query</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search filters or clear your prompt.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedResources.map((res) => {
            const aiInfo = aiMatches?.find(m => m.resource.id === res.id);
            return (
              <div key={res.id} className="relative flex flex-col">
                {aiInfo && (
                  <div className="mb-2 p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-900 flex items-center justify-between font-medium">
                    <span className="font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      {aiInfo.matchScore}% Synergy Match
                    </span>
                    <span className="text-[10px] text-slate-600">
                      {aiInfo.isFullyEligible ? 'Eligible' : 'Missing Prereq'}
                    </span>
                  </div>
                )}
                <ResourceCard
                  resource={res}
                  onSelect={onSelectResource}
                />
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
