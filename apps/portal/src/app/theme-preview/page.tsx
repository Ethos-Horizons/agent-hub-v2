'use client';

import { designTokens } from '@/lib/design-tokens';

export default function ThemePreview() {
  return (
    <div className="min-h-screen bg-black text-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-cyan-400">Agent Hub Theme Preview</h1>
          <p className="text-xl text-zinc-400">Verifying theme alignment with Ethos Digital website</p>
        </div>

        {/* Logo & Brand */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold text-cyan-400">Brand Identity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-medium mb-4">Logo Placeholder</h3>
              <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-black">EH</span>
              </div>
            </div>
            <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-medium mb-4">Typography Scale</h3>
              <div className="space-y-2">
                <p className="text-6xl font-extrabold text-cyan-400">Heading 1</p>
                <p className="text-4xl font-bold text-cyan-400">Heading 2</p>
                <p className="text-2xl font-semibold text-cyan-400">Heading 3</p>
                <p className="text-xl font-medium text-cyan-400">Heading 4</p>
                <p className="text-lg text-slate-50">Body Large</p>
                <p className="text-base text-slate-50">Body Regular</p>
                <p className="text-sm text-zinc-400">Body Small</p>
              </div>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold text-cyan-400">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(designTokens.colors.primary).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div 
                  className="h-20 rounded-lg border border-zinc-800"
                  style={{ backgroundColor: value }}
                />
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-50">{key}</p>
                  <p className="text-xs text-zinc-400 font-mono">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Component Examples */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold text-cyan-400">Component Examples</h2>
          
          {/* Buttons */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-slate-50">Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-3 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-300 transition-colors">
                Primary Button
              </button>
              <button className="px-6 py-3 bg-zinc-800 text-slate-50 font-semibold rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-colors">
                Secondary Button
              </button>
              <button className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors">
                Destructive Button
              </button>
              <button className="px-6 py-3 bg-transparent text-cyan-400 font-semibold rounded-lg border border-cyan-400 hover:bg-cyan-400/10 transition-colors">
                Outline Button
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-slate-50">Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6 hover:border-cyan-400/50 transition-colors">
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">Feature Card</h4>
                <p className="text-zinc-400">This is a sample feature card with hover effects and proper spacing.</p>
              </div>
              <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6 hover:border-cyan-400/50 transition-colors">
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">Stats Card</h4>
                <p className="text-zinc-400">Display important metrics and statistics in an organized layout.</p>
              </div>
              <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6 hover:border-cyan-400/50 transition-colors">
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">Info Card</h4>
                <p className="text-zinc-400">Show additional information and context for users.</p>
              </div>
            </div>
          </div>

          {/* Form Elements */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-slate-50">Form Elements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-50 mb-2">Input Field</label>
                  <input 
                    type="text" 
                    placeholder="Enter text here..."
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-slate-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-50 mb-2">Select Dropdown</label>
                  <select className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent">
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-50 mb-2">Textarea</label>
                  <textarea 
                    placeholder="Enter longer text here..."
                    rows={4}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-slate-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="w-4 h-4 text-cyan-400 bg-zinc-800 border-zinc-700 rounded focus:ring-cyan-400" />
                    <span className="text-sm text-slate-50">Checkbox option</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="radio" className="w-4 h-4 text-cyan-400 bg-zinc-800 border-zinc-700 focus:ring-cyan-400" />
                    <span className="text-sm text-slate-50">Radio option</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Status Indicators */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold text-cyan-400">Status Indicators</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-4 h-4 bg-success rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-slate-50">Success</p>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-warning rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-slate-50">Warning</p>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-error rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-slate-50">Error</p>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-info rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-slate-50">Info</p>
            </div>
          </div>
        </section>

        {/* Animations */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold text-cyan-400">Animations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6 animate-fade-in">
              <h4 className="text-lg font-semibold text-cyan-400 mb-2">Fade In</h4>
              <p className="text-zinc-400">This card fades in on page load.</p>
            </div>
            <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6 animate-slide-up">
              <h4 className="text-lg font-semibold text-cyan-400 mb-2">Slide Up</h4>
              <p className="text-zinc-400">This card slides up from below.</p>
            </div>
            <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6 animate-scale-in">
              <h4 className="text-lg font-semibold text-cyan-400 mb-2">Scale In</h4>
              <p className="text-zinc-400">This card scales in smoothly.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-zinc-800">
          <p className="text-zinc-400">
            Theme verification complete. Agent Hub now matches the Ethos Digital website design system.
          </p>
        </div>
      </div>
    </div>
  );
}
